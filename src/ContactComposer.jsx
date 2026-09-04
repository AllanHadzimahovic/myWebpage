import { useMemo, useState } from 'react'
import { assetUrl } from './assetUrl.js'
import PokemonTextBox from './PokemonTextBox.jsx'

const CHANNEL_COPY = {
  email: {
    heading: 'Contact me',
    action: 'Send me an email here',
  },
  linkedin: {
    heading: 'Write on LinkedIn',
    action: 'Open LinkedIn',
    hint: 'Copies your message and opens Allan’s LinkedIn profile so you can paste it into a LinkedIn message.',
  },
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.left = '-9999px'
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(area)
  return ok
}

export default function ContactComposer({ contact }) {
  const channel = contact?.channel
  const copy = CHANNEL_COPY[channel]
  const [name, setName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const configured = useMemo(() => {
    if (!contact || !channel) return false
    if (channel === 'email') return Boolean(contact.to)
    if (channel === 'linkedin') return Boolean(contact.profileUrl)
    return false
  }, [contact, channel])

  if (!copy) return null

  if (channel === 'email') {
    if (!contact?.to) return null
    const sticker = contact.sticker || '/projects/email-at.png'
    const label = contact.label || copy.action
    return (
      <a className="contact-mailto" href={`mailto:${contact.to}`}>
        <img
          className="contact-mailto__sticker"
          src={assetUrl(sticker)}
          alt=""
          width={220}
          height={220}
        />
        <span className="contact-mailto__label">{label}</span>
      </a>
    )
  }

  async function onSubmit(event) {
    event.preventDefault()
    setStatus(null)

    const trimmedMessage = message.trim()
    if (!trimmedMessage) {
      setStatus({ type: 'error', text: 'Please write a short message first.' })
      return
    }

    if (!configured) {
      setStatus({
        type: 'error',
        text: 'This contact channel is not configured yet. Please try another way to reach Allan.',
      })
      return
    }

    setBusy(true)
    try {
      const lines = []
      if (name.trim()) lines.push(`Hi, I’m ${name.trim()}.`)
      if (fromEmail.trim()) lines.push(`Email: ${fromEmail.trim()}`)
      if (lines.length) lines.push('')
      lines.push(trimmedMessage)
      const payload = lines.join('\n')
      const copied = await copyText(payload)
      window.open(contact.profileUrl, '_blank', 'noopener,noreferrer')
      setStatus({
        type: 'ok',
        text: copied
          ? 'Message copied. LinkedIn opened — paste it into a new message to Allan.'
          : 'LinkedIn opened. Copy your message from the form and paste it into a LinkedIn message.',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        text: error?.message || 'Something went wrong. Please try again.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="contact-composer">
      <h2>{copy.heading}</h2>
      {copy.hint ? <PokemonTextBox text={copy.hint} label={copy.heading} /> : null}

      {!configured ? (
        <PokemonTextBox
          text="Contact details for this channel are not set yet."
          label="Contact status"
          compact
        />
      ) : null}

      <form className="contact-composer__form" onSubmit={onSubmit} noValidate>
        <label className="contact-composer__field">
          <span>Your name</span>
          <PokemonTextBox
            editable
            compact
            inputType="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={setName}
            placeholder="Optional"
            label="Your name"
          />
        </label>

        <label className="contact-composer__field">
          <span>Your email</span>
          <PokemonTextBox
            editable
            compact
            inputType="email"
            name="email"
            autoComplete="email"
            value={fromEmail}
            onChange={setFromEmail}
            placeholder="So Allan can reply"
            label="Your email"
          />
        </label>

        <label className="contact-composer__field">
          <span>Message</span>
          <PokemonTextBox
            editable
            inputType="textarea"
            name="message"
            required
            value={message}
            onChange={setMessage}
            placeholder="Write your message here…"
            label="Message"
          />
        </label>

        <div className="contact-composer__actions">
          <button type="submit" className="contact-composer__submit" disabled={busy || !configured}>
            {busy ? 'Opening…' : copy.action}
          </button>
          {contact?.profileUrl ? (
            <a className="contact-composer__alt" href={contact.profileUrl} target="_blank" rel="noreferrer">
              View LinkedIn profile
            </a>
          ) : null}
        </div>
      </form>

      {status ? (
        <PokemonTextBox text={status.text} label="Contact status" compact />
      ) : null}
    </div>
  )
}
