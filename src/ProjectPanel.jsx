export default function ProjectPanel({ project, open, onClose }) {
  if (!project) return null

  return (
    <section
      className={`project-panel${open ? ' is-open' : ''}`}
      aria-hidden={!open}
      aria-labelledby="project-panel-title"
    >
      <div className="project-panel__inner">
        <button type="button" className="project-panel__close" onClick={onClose} aria-label="Close project">
          Close
        </button>

        <header className="project-panel__header">
          <p className="project-panel__eyebrow">Project</p>
          <h1 id="project-panel-title">{project.title}</h1>
          {project.summary ? <p className="project-panel__summary">{project.summary}</p> : null}
        </header>

        {project.description ? (
          <div className="project-panel__section">
            <h2>About</h2>
            <p className="project-panel__body">{project.description}</p>
          </div>
        ) : null}

        {project.youtubeId ? (
          <div className="project-panel__section">
            <h2>Video</h2>
            <div className="project-panel__video">
              <iframe
                src={`https://www.youtube.com/embed/${project.youtubeId}`}
                title={`${project.title} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        ) : null}

        {project.pdfs?.length ? (
          <div className="project-panel__section">
            <h2>Documents</h2>
            <ul className="project-panel__list">
              {project.pdfs.map((pdf) => (
                <li key={`${pdf.title}-${pdf.url}`}>
                  <a href={pdf.url} target="_blank" rel="noreferrer">
                    {pdf.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {project.links?.length ? (
          <div className="project-panel__section">
            <h2>Links</h2>
            <ul className="project-panel__list">
              {project.links.map((link) => (
                <li key={`${link.title}-${link.url}`}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
