import { useEffect, useRef, useState } from 'react'

function toFiles(files, title, url, language) {
  if (files?.length) return files
  if (title && url) return [{ title, url, language }]
  return []
}

function CodeFile({ title, url, language = 'text' }) {
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
    <div className="code-viewer__scroll" tabIndex={0} aria-label={`${title} source code`}>
      {loading ? <p className="code-viewer__status">Loading…</p> : null}
      {error ? <p className="code-viewer__status is-error">{error}</p> : null}
      {source !== null ? (
        <pre>
          <code className={`language-${language}`}>{source}</code>
        </pre>
      ) : null}
    </div>
  )
}

export default function CodeViewer({ files, title, url, language = 'text', repo }) {
  const items = toFiles(files, title, url, language)
  const total = items.length
  const [index, setIndex] = useState(0)
  const listRef = useRef(null)
  const safeIndex = total ? Math.min(index, total - 1) : 0
  const current = items[safeIndex]
  const split = total > 1

  useEffect(() => {
    const list = listRef.current
    const active = list?.querySelector('.is-active')
    if (!list || !active) return
    const listBox = list.getBoundingClientRect()
    const activeBox = active.getBoundingClientRect()
    if (activeBox.top < listBox.top) list.scrollTop -= listBox.top - activeBox.top
    else if (activeBox.bottom > listBox.bottom) list.scrollTop += activeBox.bottom - listBox.bottom
  }, [safeIndex])

  if (!total) return null

  return (
    <div className="project-panel__section">
      <h2>Code</h2>
      <div
        className={`code-viewer${split ? ' code-viewer--split' : ''}`}
        aria-label={split ? `Source files, ${current.title}` : current.title}
      >
        <div className="code-viewer__header">
          <span className="code-viewer__filename">{current.title}</span>
          {repo?.url ? (
            <a
              className="code-viewer__repo"
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              aria-label={repo.title || 'Open GitHub repository'}
            >
              <img src={repo.icon} alt="" className="code-viewer__repo-icon" />
            </a>
          ) : (
            <a className="code-viewer__download" href={current.url} download={current.title}>
              Download
            </a>
          )}
        </div>

        {split ? (
          <nav className="code-viewer__files" aria-label="Source files" ref={listRef}>
            {items.map((item, i) => (
              <button
                key={`${item.title}-${item.url}`}
                type="button"
                className={`code-viewer__file${i === safeIndex ? ' is-active' : ''}`}
                aria-current={i === safeIndex ? 'true' : undefined}
                title={item.title}
                onClick={() => setIndex(i)}
              >
                {item.title}
              </button>
            ))}
          </nav>
        ) : null}

        <CodeFile
          key={current.url}
          title={current.title}
          url={current.url}
          language={current.language || language}
        />
      </div>
    </div>
  )
}
