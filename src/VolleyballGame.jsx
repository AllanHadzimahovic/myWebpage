import { useCallback, useEffect, useRef, useState } from 'react'
import './VolleyballGame.css'

const COUNTDOWN_MS = 1000
const BALL_SIZE = 72
const HITBOX_SIZE = BALL_SIZE * 2
const CROSS_MS = 2200
/** Slow fall while waiting for a hit (no bounce). */
const FALL_SPEED = 12 // % of viewport height per second
const NET_X = 50
const MISS_BELOW_Y = 108
const HOLD_Y = 48

function sideLaneX(side) {
  return side === 'left' ? 22 : 78
}

function sideFromX(x) {
  return x < NET_X ? 'left' : 'right'
}

export default function VolleyballGame({ onClose, ballSrc }) {
  const [phase, setPhase] = useState('countdown') // countdown | falling | crossing | missed
  const [count, setCount] = useState(3)
  const [score, setScore] = useState(0)
  const [ball, setBall] = useState({ x: 22, y: HOLD_Y, visible: true })
  const [hint, setHint] = useState(true)
  const [canHit, setCanHit] = useState(false)

  const phaseRef = useRef('countdown')
  const scoreRef = useRef(0)
  const ballRef = useRef({ x: 22, y: HOLD_Y })
  const canHitRef = useRef(false)
  const targetSideRef = useRef('left')
  const rafRef = useRef(0)
  const timersRef = useRef([])
  const apiRef = useRef({
    startFall: () => {},
    startCross: () => {},
  })

  const clearMotion = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id))
    timersRef.current = []
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  const setHitEnabled = useCallback((enabled) => {
    canHitRef.current = enabled
    setCanHit(enabled)
  }, [])

  const endMiss = useCallback(() => {
    clearMotion()
    setHitEnabled(false)
    phaseRef.current = 'missed'
    setPhase('missed')
    setBall((prev) => {
      const next = { ...prev, y: Math.max(prev.y, MISS_BELOW_Y) }
      ballRef.current = next
      return next
    })
  }, [clearMotion, setHitEnabled])

  /** Ball sits on a side and only falls — no bounce. Hittable immediately. */
  const startFall = useCallback(
    (side, fromY = HOLD_Y) => {
      clearMotion()
      const x = sideLaneX(side)
      targetSideRef.current = side
      phaseRef.current = 'falling'
      setPhase('falling')
      setHitEnabled(true)

      let y = Math.min(Math.max(fromY, 20), 90)
      const pos0 = { x, y, visible: true }
      ballRef.current = pos0
      setBall(pos0)

      let last = performance.now()
      const tick = (now) => {
        if (phaseRef.current !== 'falling') return
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        y += FALL_SPEED * (1 + scoreRef.current * 0.04) * dt
        const pos = { x, y, visible: true }
        ballRef.current = pos
        setBall(pos)
        if (y >= MISS_BELOW_Y) {
          endMiss()
          return
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [clearMotion, endMiss, setHitEnabled],
  )

  /**
   * Pass toward a side. Not hittable until the ball clears the net
   * (enters that side's half) — then immediately hittable, no bounce.
   */
  const startCross = useCallback(
    (toSide) => {
      clearMotion()
      setHitEnabled(false)
      phaseRef.current = 'crossing'
      setPhase('crossing')
      targetSideRef.current = toSide

      const fromX = ballRef.current.x
      const fromY = ballRef.current.y
      const toX = sideLaneX(toSide)
      const toY = HOLD_Y
      const startedAt = performance.now()
      const peakY = Math.min(fromY, toY) - 14
      let unlocked = false

      const tick = (now) => {
        if (phaseRef.current !== 'crossing') return

        const t = Math.min(1, (now - startedAt) / CROSS_MS)
        const x = fromX + (toX - fromX) * t
        const y = fromY + (toY - fromY) * t - (fromY - peakY) * Math.sin(Math.PI * t)
        const pos = { x, y, visible: true }
        ballRef.current = pos
        setBall(pos)

        // Unlock the instant the ball is past the net onto the destination side
        const pastNet =
          toSide === 'right' ? x >= NET_X : x <= NET_X
        if (pastNet && !unlocked) {
          unlocked = true
          setHitEnabled(true)
        }

        if (t >= 1) {
          // Arrived — keep falling on that side (still hittable, still no bounce)
          startFall(toSide, y)
          return
        }
        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    },
    [clearMotion, setHitEnabled, startFall],
  )

  apiRef.current = { startFall, startCross }

  const handleBallHit = useCallback(() => {
    if (!canHitRef.current) return
    if (phaseRef.current !== 'falling' && phaseRef.current !== 'crossing') return

    setHitEnabled(false)
    setHint(false)

    const nextScore = scoreRef.current + 1
    scoreRef.current = nextScore
    setScore(nextScore)

    // Always send toward the opposite half of the net from where the ball is now
    const toSide = sideFromX(ballRef.current.x) === 'left' ? 'right' : 'left'
    apiRef.current.startCross(toSide)
  }, [setHitEnabled])

  const runCountdown = useCallback(() => {
    clearMotion()
    setHitEnabled(false)
    scoreRef.current = 0
    setScore(0)
    setHint(true)
    phaseRef.current = 'countdown'
    setPhase('countdown')
    setCount(3)
    const pos = { x: sideLaneX('left'), y: HOLD_Y, visible: true }
    ballRef.current = pos
    setBall(pos)

    let n = 3
    const step = () => {
      const id = setTimeout(() => {
        n -= 1
        if (n > 0) {
          setCount(n)
          step()
        } else {
          setCount(0)
          apiRef.current.startFall('left', HOLD_Y)
        }
      }, COUNTDOWN_MS)
      timersRef.current.push(id)
    }
    step()
  }, [clearMotion, setHitEnabled])

  useEffect(() => {
    runCountdown()
    return clearMotion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="vb-overlay" role="dialog" aria-modal="true" aria-label="Volleyball mini-game">
      <button type="button" className="vb-close" onClick={onClose} aria-label="Close volleyball game">
        ×
      </button>

      <div className="vb-score" aria-live="polite">
        Rally <strong>{score}</strong>
      </div>

      {hint && phase !== 'missed' && (
        <p className="vb-hint">Tap as soon as the ball crosses the net</p>
      )}

      <div className="vb-net is-in" aria-hidden="true">
        <span className="vb-net__post vb-net__post--left" />
        <span className="vb-net__mesh" />
        <span className="vb-net__post vb-net__post--right" />
      </div>

      {phase === 'countdown' && count > 0 && (
        <div className="vb-countdown" key={count} aria-live="assertive">
          {count}
        </div>
      )}

      {ball.visible && phase !== 'missed' && (
        <button
          type="button"
          className={`vb-ball${canHit ? ' is-live' : ''}`}
          style={{
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            width: HITBOX_SIZE,
            height: HITBOX_SIZE,
            pointerEvents: 'auto',
            cursor: canHit ? 'pointer' : 'default',
          }}
          onPointerDown={(event) => {
            if (!canHitRef.current) return
            event.preventDefault()
            handleBallHit()
          }}
          aria-label="Volleyball — tap after it crosses the net"
        >
          <img
            src={ballSrc}
            alt=""
            draggable={false}
            style={{ width: BALL_SIZE, height: BALL_SIZE }}
          />
        </button>
      )}

      {phase === 'missed' && (
        <div className="vb-miss">
          <p className="vb-miss__title">Miss!</p>
          <p className="vb-miss__score">
            Rally: <strong>{score}</strong>
          </p>
          <p className="vb-miss__note">
            I love all kind of sports - especially volleyball, badminton and tennis
          </p>
          <div className="vb-miss__actions">
            <button type="button" className="vb-btn vb-btn--primary" onClick={runCountdown}>
              Try again
            </button>
            <button type="button" className="vb-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
