import { useState } from 'react'
import { profile } from '../data/profile'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="contact" className="section section--contact">
      <h2>Contact</h2>
      <p className="lede lede--compact">
        Want to talk about a role, a project, or something weird and interesting?
      </p>

      <div className="contact__panel">
        <a className="button button--primary" href={`mailto:${profile.email}`}>
          Email me
        </a>
        <button type="button" className="button button--ghost" onClick={copyEmail}>
          {copied ? 'Copied!' : 'Copy email'}
        </button>
        <p className="contact__email">{profile.email}</p>

        <ul className="contact__links">
          {profile.links.github ? (
            <li>
              <a href={profile.links.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
          ) : (
            <li className="muted">GitHub link coming soon</li>
          )}
          {profile.links.linkedin ? (
            <li>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
          ) : (
            <li className="muted">LinkedIn link coming soon</li>
          )}
        </ul>
      </div>
    </section>
  )
}
