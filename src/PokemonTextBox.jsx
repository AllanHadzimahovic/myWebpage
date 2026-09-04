import { useEffect, useRef, useState } from 'react'
import { assetUrl } from './assetUrl.js'

const CHAR_MS = 28
const FRAME = '/projects/pokemon-textbox.png'

function tickMs(length) {
  if (length <= 80) return CHAR_MS
  return Math.max(6, Math.min(CHAR_MS, 2200 / length))
}

export default function PokemonTextBox({
  text = '',
  label,
  editable = false,
  value,
  onChange,
  placeholder,
  name,
  inputType = 'textarea',
  required = false,
  autoComplete,
  compact = false,
  id,
  doneContent,
}) {
  const lowPower =
    typeof document !== 'undefined' && document.documentElement.classList.contains('low-power')
  const full = editable ? String(value ?? '') : text || ''
  const [shown, setShown] = useState(full)
  const [done, setDone] = useState(true)
  const skipRef = useRef(false)

  useEffect(() => {
    if (editable) return undefined
    skipRef.current = false
    if (!full || lowPower) {
      setShown(full)
      setDone(true)
      return undefined
    }
    setShown('')
    setDone(false)
    let i = 0
    const step = tickMs(full.length)
    const tick = setInterval(() => {
      if (skipRef.current) {
        setShown(full)
        setDone(true)
        clearInterval(tick)
        return
      }
      i += 1
      setShown(full.slice(0, i))
      if (i >= full.length) {
        setDone(true)
        clearInterval(tick)
      }
    }, step)
    return () => clearInterval(tick)
  }, [editable, full, lowPower])

  const frameStyle = { '--poke-frame': `url(${assetUrl(FRAME)})` }
  const className = `poke-box${compact ? ' is-compact' : ''}${!editable && done && full ? ' is-done' : ''}`

  if (editable) {
    const shared = {
      id,
      name,
      className: 'poke-box__input',
      value: value ?? '',
      placeholder,
      required,
      autoComplete,
      'aria-label': label,
      onChange: (event) => onChange?.(event.target.value),
    }
    return (
      <div className={className} style={frameStyle}>
        {inputType === 'textarea' ? (
          <textarea {...shared} rows={compact ? 2 : 6} />
        ) : (
          <input {...shared} type={inputType} />
        )}
      </div>
    )
  }

  function skip() {
    skipRef.current = true
    setShown(full)
    setDone(true)
  }

  return (
    <div
      className={className}
      style={frameStyle}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={skip}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          skip()
        }
      }}
    >
      {done && doneContent ? (
        <div className="poke-box__rich">{doneContent}</div>
      ) : (
        <span className="poke-box__text">{shown}</span>
      )}
      {done && full ? <span className="poke-box__arrow" aria-hidden="true" /> : null}
    </div>
  )
}
