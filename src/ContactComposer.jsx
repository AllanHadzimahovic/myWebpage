import { useMemo, useState } from 'react'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

const CHANNEL_COPY = {
  email: {
    heading: 'Contact me',
    action: 'Send',
    hint: 'Send Allan a message — it goes straight to his inbox.',
  },
  linkedin: {
    heading: 'Write on LinkedIn',
    action: 'Open LinkedIn',
    hint: 'Copies your message and opens Allan’s LinkedIn profile so you can paste it into a LinkedIn message.',
  },
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
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
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim() || ''

  const configured = useMemo(() => {
    if (!contact || !channel) return false
    if (channel === 'email') return Boolean(contact.to) && Boolean(accessKey)
    if (channel === 'linkedin') return Boolean(contact.profileUrl)
    return false
  }, [contact, channel, accessKey])

  if (!copy) return null

  async function submitEmail() {
    const payload = {
      access_key: accessKey,
      subject: name.trim()
        ? `Portfolio message from ${name.trim()}`
        : 'Portfolio message',
      from_name: name.trim() || 'Portfolio visitor',
      email: fromEmail.trim(),
      phone: phone.trim() || undefined,
      message: message.trim(),
      to: contact.to,
      botcheck: honeypot,
    }

    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.success === false) {
      throw new Error(result.message || 'Could not send your message.')
    }
  }

  async function onSubmit(event) {
    event.preventDefault()
    setStatus(null)

    const trimmedMessage = message.trim()
    const trimmedEmail = fromEmail.trim()

    if (channel === 'email') {
      if (!trimmedMessage) {
        setStatus({ type: 'error', text: 'Please write a message.' })
        return
      }
      if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
        setStatus({ type: 'error', text: 'Please enter a valid email so Allan can reply.' })
        return
      }
      if (!consent) {
        setStatus({
          type: 'error',
          text: 'Please confirm you consent to your details being used to reply.',
        })
        return
      }
      if (honeypot) {
        setStatus({ type: 'ok', text: 'Thanks — your message was sent.' })
        return
      }
      if (!configured) {
        setStatus({
          type: 'error',
          text: 'Email form is not configured yet (missing Web3Forms access key).',
        })
        return
      }
    } else if (!trimmedMessage) {
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
      if (channel === 'email') {
        await submitEmail()
        setName('')
        setFromEmail('')
        setPhone('')
        setMessage('')
        setConsent(false)
        setStatus({
          type: 'ok',
          text: 'Thanks — your message was sent to Allan.',
        })
      } else if (channel === 'linkedin') {
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
      }
    } catch (error) {
      setStatus({
        type: 'error',
        text: error?.message || 'Something went wrong sending your message. Please try again.',
      })
    } finally {
      setBusy(false)
    }
  }

  if (channel === 'email') {
    return (
      <div className="contact-composer contact-composer--email">
        <form className="contact-composer__form" onSubmit={onSubmit} noValidate>
          <label className="contact-composer__field">
            <span>
              Message <abbr title="required">*</abbr>
            </span>
            <textarea
              name="message"
              rows={8}
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your message here…"
            />
          </label>

          <label className="contact-composer__field">
            <span>
              Your email <abbr title="required">*</abbr>
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={fromEmail}
              onChange={(event) => setFromEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </label>

          <label className="contact-composer__field">
            <span>Your name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional"
            />
          </label>

          <label className="contact-composer__field">
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Optional"
            />
          </label>

          {/* Honeypot — leave empty; bots often fill it */}
          <label className="contact-composer__hp" aria-hidden="true">
            <span>Company</span>
            <input
              type="text"
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </label>

          <label className="contact-composer__consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              I consent to my name, email, phone, and message being stored and used solely so Allan
              can reply to this enquiry.
            </span>
          </label>

          <div className="contact-composer__actions">
            <button
              type="submit"
              className="contact-composer__submit contact-composer__submit--primary"
              disabled={busy}
            >
              {busy ? 'Sending…' : copy.action}
            </button>
          </div>
        </form>

        {status ? (
          <p className={`contact-composer__status is-${status.type}`} role="status">
            {status.text}
          </p>
        ) : null}

        {!accessKey ? (
          <p className="contact-composer__status is-error" role="status">
            Form delivery is not set up yet. Add a Web3Forms access key to enable sending.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="contact-composer">
      <h2>{copy.heading}</h2>
      <p className="contact-composer__hint">{copy.hint}</p>

      {!configured ? (
        <p className="contact-composer__status is-error" role="status">
          Contact details for this channel are not set yet.
        </p>
      ) : null}

      <form className="contact-composer__form" onSubmit={onSubmit} noValidate>
        <label className="contact-composer__field">
          <span>Your name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="contact-composer__field">
          <span>Your email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={fromEmail}
            onChange={(event) => setFromEmail(event.target.value)}
            placeholder="So Allan can reply"
          />
        </label>

        <label className="contact-composer__field">
          <span>Message</span>
          <textarea
            name="message"
            rows={7}
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write your message here…"
          />
        </label>

        <div className="contact-composer__actions">
          <button type="submit" className="contact-composer__submit" disabled={busy || !configured}>
            {busy ? 'Opening…' : copy.action}
          </button>
          {channel === 'linkedin' && contact?.profileUrl ? (
            <a className="contact-composer__alt" href={contact.profileUrl} target="_blank" rel="noreferrer">
              View LinkedIn profile
            </a>
          ) : null}
        </div>
      </form>

      {status ? (
        <p className={`contact-composer__status is-${status.type}`} role="status">
          {status.text}
        </p>
      ) : null}
    </div>
  )
}
