import { useEffect, useState } from 'react'

export default function CodeViewer({ title, url, language = 'text' }) {
  const [source, setSource] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load ${url}`)
        return res.text()
      })
      .then((text) => {
        if (!cancelled) {
          setSource(text)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSource(null)
          setError(err.message || 'Failed to load code')
        }
      })

    return () => {
      cancelled = true
    }
  }, [url])

  const loading = source === null && error === null

  return (
    <div className="project-panel__section">
      <h2>Code</h2>
      <div className="code-viewer">
        <div className="code-viewer__header">
          <span className="code-viewer__filename">{title}</span>
          <a className="code-viewer__download" href={url} download={title}>
            Download
          </a>
        </div>
        <div className="code-viewer__scroll" tabIndex={0} aria-label={`${title} source code`}>
          {loading ? <p className="code-viewer__status">Loading…</p> : null}
          {error ? <p className="code-viewer__status is-error">{error}</p> : null}
          {source !== null ? (
            <pre>
              <code className={`language-${language}`}>{source}</code>
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  )
}
