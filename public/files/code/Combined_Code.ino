#include <AccelStepper.h>
#include <Keypad.h>
#include <Servo.h>

// ----------------- Servo (Z) and Electromagnet -----------------
Servo servo;
const uint8_t SERVO_PIN      = A0;
const uint8_t ELECTROMAG_PIN = A1;
const uint8_t HALL_PIN       = A2;

const int MIN_POS = 30;
const int MAX_POS = 120;
const int STEP    = 1;
const unsigned long STEP_MS = 10;

const int HALL_ACTIVE_STATE = LOW;

enum State { LOWERING, RELEASING, LIFTING };
State state = LOWERING;

int pos = MAX_POS;

// In PICK mode avoid "instant pick" if hall is already active at the top.
// Start unarmed, then arm once hall go inactive during the descent.
bool armed = false;
unsigned long lastStepMs = 0;

bool magnetOn = false;                 // OFF->next actuation is PICK, ON->next actuation is PLACE
unsigned long releaseStartMs = 0;
const unsigned long RELEASE_DWELL_MS = 250;

const unsigned long PICK_TIMEOUT_MS  = 6000;  // max time allowed for a pick actuation
const unsigned long PLACE_TIMEOUT_MS = 6000;  //
unsigned long actuationStartMs = 0;
// ----------------- Steppers (X and Y) -----------------
AccelStepper stepperY(AccelStepper::DRIVER, 5, 4); // STEP, DIR
AccelStepper stepperX(AccelStepper::DRIVER, 2, 3); // STEP, DIR

// CALIBRATE THESE
const long STEPS_PER_SQUARE_X = 220;  // steps to move 1 column
const long STEPS_PER_SQUARE_Y = 220;  // steps to move 1 row
// ----------------- Keypad -----------------
const byte ROWS = 4;
const byte COLS = 4;

char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

byte colPins[COLS] = {8, 9, 7, 6};
byte rowPins[ROWS] = {12, 13, 11, 10};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// ----------------- Input state -----------------
char buf[3] = {0, 0, 0}; // two digits + null
byte idx = 0;

// Sequence control
bool moveRequested = false;
bool actuating = false;

void clearInput() {
  idx = 0;
  buf[0] = buf[1] = buf[2] = 0;
  Serial.println("Cleared input");
}

bool hallActive() {
  return digitalRead(HALL_PIN) == HALL_ACTIVE_STATE;
}

void setMagnet(bool on) {
  digitalWrite(ELECTROMAG_PIN, on ? HIGH : LOW);
  magnetOn = on;
}

void startActuation() {
  // Reset servo/motion state for this actuation
  state = LOWERING;

  // Start NOT armed | Arm once the hall is seen inactive during descent.
  armed = false;

  lastStepMs = 0;

  // Always start from up
  pos = MAX_POS;
  servo.write(pos);

  actuating = true;
  actuationStartMs = millis();

  if (!magnetOn) Serial.println("Arrived -> PICK (magnet will turn ON when hall triggers)");
  else           Serial.println("Arrived -> PLACE (magnet will turn OFF at bottom)");
}

void stopActuation(const __FlashStringHelper* reason) {
  actuating = false;
  moveRequested = false;
  state = LOWERING;
  Serial.println(reason);
}

void runActuation() {
  unsigned long now = millis();

  // Safety timeout so we never hang forever
  if (!magnetOn) { // PICK mode
    if (now - actuationStartMs > PICK_TIMEOUT_MS) {
      stopActuation(F("Actuation timeout (PICK)"));
      return;
    }
  } else {         // PLACE mode
    if (now - actuationStartMs > PLACE_TIMEOUT_MS) {
      stopActuation(F("Actuation timeout (PLACE)"));
      return;
    }
  }

  switch (state) {
    case LOWERING: {
      // Step servo down
      if (now - lastStepMs >= STEP_MS) {
        lastStepMs = now;
        pos -= STEP;
        if (pos < MIN_POS) pos = MIN_POS;
        servo.write(pos);
      }

      // -------- PICK mode (magnet currently OFF) --------
      if (!magnetOn) {
        bool hall = hallActive();

        // Arm once hall is NOT active (this prevents instant trigger if hall is active at the top)
        if (!hall) armed = true;

        // When hall triggers (and we are armed), turn magnet ON and start lifting
        if (hall && armed) {
          armed = false;
          setMagnet(true);   // magnet ON and STAYS ON until next actuation (place)
          state = LIFTING;
          break;
        }

        // If we hit bottom and never got a hall trigger, abort pick and lift anyway (magnet stays OFF)
        if (pos <= MIN_POS) {
          Serial.println("Pick failed (no hall). Lifting without magnet.");
          state = LIFTING;
        }
      }
      // -------- PLACE mode (magnet currently ON) --------
      else { // When fully lowered, turn magnet OFF to release
        if (pos <= MIN_POS) {
          setMagnet(false);              // magnet OFF (release)
          releaseStartMs = now;
          state = RELEASING;             // small pause before lifting
        }
      }
      break;
    }

    case RELEASING: {
      // Let the piece actually drop before lifting
      if (now - releaseStartMs >= RELEASE_DWELL_MS) {
        state = LIFTING;
      }
      break;
    }

    case LIFTING: {
      // Step servo up
      if (now - lastStepMs >= STEP_MS) {
        lastStepMs = now;
        pos += STEP;
        if (pos > MAX_POS) pos = MAX_POS;
        servo.write(pos);
      }

      // Finish actuation once back at the top
      if (pos >= MAX_POS) {
        actuating = false;
        moveRequested = false;
        state = LOWERING;
        Serial.println("Actuation done");
      }
      break;
    }
  }
}
///////////////////////////////////   Setup   /////////////////////////////////////////////////////////
void setup() {
  Serial.begin(9600);
  Serial.println("Chess XY move: enter RC (e.g. 12), press # to go. * clears.");

  stepperX.setMaxSpeed(1500);
  stepperX.setAcceleration(800);

  stepperY.setMaxSpeed(1500);
  stepperY.setAcceleration(800);

  // Start at home (row1,col1)
  stepperX.setCurrentPosition(0);
  stepperY.setCurrentPosition(0);

  // Servo
  servo.attach(SERVO_PIN);
  servo.write(pos);

  // ElectroMagnet
  pinMode(ELECTROMAG_PIN, OUTPUT);
  setMagnet(false);

  // Hall sensor
  pinMode(HALL_PIN, INPUT_PULLUP);
}

void loop() {
  // Always keep steppers running
  stepperX.run();
  stepperY.run();

  // If requested a move and arrived, start actuation once
  if (moveRequested && !actuating &&
      stepperX.distanceToGo() == 0 && stepperY.distanceToGo() == 0) {
    startActuation();
  }

  // Run servo/magnet state machine
  if (actuating) {
    runActuation();
  }

  // keypad
  char k = keypad.getKey();
  if (!k) return;

  Serial.print("Key: ");
  Serial.println(k);

  if (k == '*') {
    clearInput();
    return;
  }

  if (k >= '0' && k <= '9') {
    if (idx < 2) {
      buf[idx++] = k;
      buf[idx] = '\0'; // keep it printable as a C-string
      Serial.print("Input: ");
      Serial.println(buf);
    }
    return;
  }

  if (k == '#') {
    if (idx != 2) {
      Serial.println("Need 2 digits (RC). Example: 12");
      clearInput();
      return;
    }

    int row = buf[0] - '0';
    int col = buf[1] - '0';
    clearInput();

    if (row < 1 || row > 8 || col < 1 || col > 8) {
      Serial.println("Row/Col must be 1..8");
      return;
    }

    long x = (col - 1) * STEPS_PER_SQUARE_X;
    long y = (row - 1) * STEPS_PER_SQUARE_Y;

    stepperX.moveTo(x);
    stepperY.moveTo(y);

    moveRequested = true;

    // Used for debugging and outputting to us what is registered input
    Serial.print("Go to ");
    Serial.print(row);
    Serial.print(",");
    Serial.print(col);
    Serial.print(" -> X=");
    Serial.print(x);
    Serial.print(" Y=");
    Serial.println(y);
  }
}
