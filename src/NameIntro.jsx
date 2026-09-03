import { useEffect, useMemo, useRef, useState } from 'react'
import './NameIntro.css'

const LETTER_W = 5
const LETTER_H = 5
const LETTER_GAP = 1
const STEP_MS = 48
const START_DELAY_MS = 280
const HOLD_MS = 560
const LEAVE_MS = 720
const LETTER_PAUSE = 3
const HOT_TAIL = 3

/** Stroke order (col, row) so the red cursor writes each glyph. */
const GLYPHS = {
  A: [
    [0, 4],
    [0, 3],
    [0, 2],
    [0, 1],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
    [1, 2],
    [2, 2],
    [3, 2],
  ],
  L: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4],
  ],
  N: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [4, 3],
    [4, 2],
    [4, 1],
    [4, 0],
  ],
}

const WORD = ['A', 'L', 'L', 'A', 'N']

function buildPath(letters) {
  const steps = []
  letters.forEach((letter, index) => {
    const glyph = GLYPHS[letter]
    const ox = index * (LETTER_W + LETTER_GAP)
    const first = glyph[0]
    const pauses = index === 0 ? 1 : LETTER_PAUSE
    for (let i = 0; i < pauses; i += 1) {
      steps.push({ type: 'move', x: first[0] + ox, y: first[1] })
    }
    glyph.forEach(([x, y]) => {
      steps.push({ type: 'draw', x: x + ox, y })
    })
  })
  return steps
}

const PATH = buildPath(WORD)
const GRID_W = WORD.length * LETTER_W + (WORD.length - 1) * LETTER_GAP

export default function NameIntro({ onReveal, onDone }) {
  const [tick, setTick] = useState(-1)
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(false)
  const skipRef = useRef(false)
  const leaveTimer = useRef(null)
  const onDoneRef = useRef(onDone)
  const onRevealRef = useRef(onReveal)
  onDoneRef.current = onDone
  onRevealRef.current = onReveal

  const painted = useMemo(() => {
    const cells = []
    PATH.forEach((step, index) => {
      if (step.type !== 'draw' || index > tick) return
      cells.push({ ...step, index, hot: index > tick - HOT_TAIL })
    })
    return cells
  }, [tick])

  const cursorStep = tick >= 0 && tick < PATH.length ? PATH[tick] : null
  const showCursor = Boolean(cursorStep) && !leaving

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    skipRef.current = true
    setLeaving(true)
    onRevealRef.current?.()
    leaveTimer.current = setTimeout(() => {
      onDoneRef.current?.()
    }, LEAVE_MS)
  }

  function skip() {
    if (doneRef.current) return
    skipRef.current = true
    setTick(PATH.length - 1)
    finish()
  }

  useEffect(() => {
    let stepIndex = -1
    let startTimer = null
    let interval = null
    let holdTimer = null

    startTimer = setTimeout(() => {
      if (skipRef.current) return
      interval = setInterval(() => {
        if (skipRef.current) {
          clearInterval(interval)
          interval = null
          return
        }
        stepIndex += 1
        if (stepIndex >= PATH.length) {
          clearInterval(interval)
          interval = null
          setTick(PATH.length - 1)
          holdTimer = setTimeout(() => {
            if (!skipRef.current) finish()
          }, HOLD_MS)
          return
        }
        setTick(stepIndex)
      }, STEP_MS)
    }, START_DELAY_MS)

    function onKeyDown(event) {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        skip()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      clearTimeout(startTimer)
      if (interval) clearInterval(interval)
      if (holdTimer) clearTimeout(holdTimer)
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    }
    // Intro is a one-shot mount animation; skip/finish close over stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`name-intro${leaving ? ' is-leaving' : ''}`}
      role="dialog"
      aria-label="Intro: writing Allan"
      aria-modal="true"
      style={{
        '--cols': GRID_W,
        '--rows': LETTER_H,
      }}
      onClick={skip}
    >
      <p className="name-intro__sr">Allan</p>
      <div className="name-intro__word" aria-hidden="true">
        {painted.map((cell) => (
          <span
            key={`${cell.x}-${cell.y}`}
            className={`name-intro__cell${cell.hot ? ' is-hot' : ''}`}
            style={{
              gridColumn: cell.x + 1,
              gridRow: cell.y + 1,
            }}
          />
        ))}
        {showCursor ? (
          <span
            className="name-intro__cursor"
            style={{
              '--cx': cursorStep.x,
              '--cy': cursorStep.y,
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
