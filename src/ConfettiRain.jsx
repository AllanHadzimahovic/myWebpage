import { useEffect, useRef } from 'react'

const CONFETTI_MS = 7000

const COLORS = [
  '#ffd166',
  '#ef476f',
  '#06d6a0',
  '#118ab2',
  '#f78c6b',
  '#ffffff',
  '#ffbe0b',
  '#8338ec',
  '#e63946',
  '#4cc9f0',
]

function spawnPiece(width) {
  const streamer = Math.random() < 0.28
  return {
    x: Math.random() * width,
    y: -8 - Math.random() * 36,
    w: streamer ? 3 + Math.random() * 4 : 5 + Math.random() * 8,
    h: streamer ? 12 + Math.random() * 16 : 5 + Math.random() * 8,
    vx: (Math.random() - 0.5) * 2.4,
    vy: 2.4 + Math.random() * 3.6,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.2,
    color: COLORS[(Math.random() * COLORS.length) | 0],
  }
}

/**
 * Full-viewport confetti rain. `burstId` increments to start (or restart) a 7s burst.
 */
export default function ConfettiRain({ burstId, durationMs = CONFETTI_MS }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!burstId) return undefined
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pieces = []
    const start = performance.now()
    const spawnUntil = start + durationMs
    let raf = 0
    let last = start

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    function frame(now) {
      const w = window.innerWidth
      const h = window.innerHeight
      const dt = Math.min(32, now - last) / 16.67
      last = now
      const raining = now < spawnUntil

      if (raining && pieces.length < (reduceMotion ? 80 : 220)) {
        const n = reduceMotion ? 2 : 5
        for (let i = 0; i < n; i += 1) {
          pieces.push(spawnPiece(w))
        }
      }

      ctx.clearRect(0, 0, w, h)
      for (let i = pieces.length - 1; i >= 0; i -= 1) {
        const p = pieces[i]
        p.vy += 0.045 * dt
        p.x += (p.vx + Math.sin((now + p.y) * 0.004) * 0.6) * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt

        if (p.y > h + 24) {
          pieces.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (raining || pieces.length) {
        raf = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, w, h)
      }
    }

    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [burstId, durationMs])

  if (!burstId) return null

  return <canvas ref={canvasRef} className="confetti-layer" aria-hidden="true" />
}
