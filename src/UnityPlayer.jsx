import { useCallback, useEffect, useRef, useState } from 'react'
import { LowPowerMediaNote, useLowPower } from './lowPower.jsx'

/**
 * Lazy-loads a Unity WebGL build in an iframe.
 * Expects a Unity WebGL export at `src` (e.g. /games/unity/index.html).
 */
export default function UnityPlayer({ title = 'Unity game', src, note }) {
  const { lowPower } = useLowPower()
  const [started, setStarted] = useState(false)
  const [available, setAvailable] = useState(null) // null = checking, true/false
  const [fullscreen, setFullscreen] = useState(false)
  const iframeRef = useRef(null)

  const nudgeUnity = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const ping = () => {
      try {
        iframe.contentWindow?.postMessage({ type: 'unity-fit' }, '*')
        iframe.contentWindow?.focus()
        iframe.contentWindow?.document?.getElementById('unity-canvas')?.focus()
      } catch {
        // Cross-origin would throw; same-origin Unity build does not.
      }
    }

    requestAnimationFrame(() => requestAnimationFrame(ping))
    window.setTimeout(ping, 50)
    window.setTimeout(ping, 200)
  }, [])

  useEffect(() => {
    let cancelled = false
    setAvailable(null)
    setStarted(false)

    if (lowPower) {
      return undefined
    }

    if (!src) {
      setAvailable(false)
      return undefined
    }

    // GET + sniff: Vite SPA fallback returns 200 for missing paths, so HEAD is not enough.
    fetch(src)
      .then(async (res) => {
        if (!res.ok) return false
        const html = await res.text()
        return (
          html.includes('createUnityInstance') ||
          html.includes('UnityLoader') ||
          html.includes('unity-canvas')
        )
      })
      .then((ok) => {
        if (!cancelled) setAvailable(Boolean(ok))
      })
      .catch(() => {
        if (!cancelled) setAvailable(false)
      })

    return () => {
      cancelled = true
    }
  }, [src, lowPower])

  useEffect(() => {
    if (!fullscreen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  useEffect(() => {
    if (!started) return undefined
    nudgeUnity()
  }, [fullscreen, started, nudgeUnity])

  const start = useCallback(() => {
    if (available) setStarted(true)
  }, [available])

  if (lowPower) {
    return (
      <LowPowerMediaNote href={src} hrefLabel="Open game page">
        Unity WebGL is paused in low-power mode so the GPU can idle.
      </LowPowerMediaNote>
    )
  }

  if (available === false) {
    return (
      <div className="unity-player">
        <div className="unity-player__missing">
          <p>
            <strong>WebGL build not found.</strong>
          </p>
          <p>
            Export a Unity WebGL build and copy its contents into{' '}
            <code>public/games/unity/</code> so that{' '}
            <code>{src || '/games/unity/index.html'}</code> exists.
          </p>
          {note ? <p className="unity-player__note">{note}</p> : null}
        </div>
      </div>
    )
  }

  return (
    <div className={`unity-player${fullscreen ? ' is-fullscreen' : ''}`}>
      <div className="unity-player__toolbar">
        <div>
          <p className="unity-player__title">{title}</p>
          <p className="unity-player__status">
            {available === null
              ? 'Checking for WebGL build…'
              : started
                ? 'Game loaded — click the canvas if controls feel unresponsive.'
                : 'Click Play to load the game (large download).'}
          </p>
        </div>
        <div className="unity-player__actions">
          {started ? (
            <button
              type="button"
              className="unity-player__btn"
              onClick={() => setFullscreen((v) => !v)}
            >
              {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </button>
          ) : null}
          {started ? (
            <a className="unity-player__btn unity-player__btn--ghost" href={src} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          ) : null}
        </div>
      </div>

      <div className="unity-player__frame">
        {!started ? (
          <button
            type="button"
            className="unity-player__play"
            onClick={start}
            disabled={available !== true}
          >
            <span className="unity-player__play-icon" aria-hidden="true">
              ▶
            </span>
            <span>Play game</span>
          </button>
        ) : (
          <iframe
            ref={iframeRef}
            src={src}
            title={title}
            allow="fullscreen; gamepad; autoplay"
            allowFullScreen
            onLoad={nudgeUnity}
          />
        )}
      </div>

      {note ? <p className="unity-player__note">{note}</p> : null}
    </div>
  )
}
