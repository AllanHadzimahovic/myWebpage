import { useEffect, useState } from 'react'
import { LowPowerMediaNote, useLowPower } from './lowPower.jsx'
import PokemonTextBox from './PokemonTextBox.jsx'

/**
 * Embeds an external web app in an iframe, with fullscreen + open-in-new-tab.
 * Sites that send X-Frame-Options / CSP frame-ancestors may refuse to load;
 * the "Open in new tab" link is always available as a fallback.
 */
export default function WebEmbed({
  title = 'Live demo',
  src,
  note,
  status = 'Interactive demo — use fullscreen if the frame feels tight.',
}) {
  const { lowPower } = useLowPower()
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!fullscreen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  if (!src) return null

  if (lowPower) {
    return (
      <LowPowerMediaNote href={src} hrefLabel="Open in a new tab">
        Embedded apps are paused in low-power mode.
      </LowPowerMediaNote>
    )
  }

  return (
    <div className={`web-embed${fullscreen ? ' is-fullscreen' : ''}`}>
      <div className="web-embed__toolbar">
        <div>
          <p className="web-embed__title">{title}</p>
          {status ? <PokemonTextBox text={status} label={`${title} status`} compact /> : null}
        </div>
        <div className="web-embed__actions">
          <button
            type="button"
            className="web-embed__btn"
            onClick={() => setFullscreen((v) => !v)}
          >
            {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
          <a className="web-embed__btn web-embed__btn--ghost" href={src} target="_blank" rel="noreferrer">
            Open in new tab
          </a>
        </div>
      </div>

      <div className="web-embed__frame">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="fullscreen; clipboard-write"
          allowFullScreen
        />
      </div>

      {note ? <PokemonTextBox text={note} label={`${title} note`} /> : null}
    </div>
  )
}
