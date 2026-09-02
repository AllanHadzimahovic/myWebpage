import ProjectGallery from './ProjectGallery.jsx'
import CodeViewer from './CodeViewer.jsx'
import ModelViewer from './ModelViewer.jsx'
import UnityPlayer from './UnityPlayer.jsx'
import WebEmbed from './WebEmbed.jsx'
import ContactComposer from './ContactComposer.jsx'
import { assetUrl } from './assetUrl.js'

function fileNameFromUrl(url) {
  try {
    const path = url.split('?')[0]
    return decodeURIComponent(path.split('/').pop() || 'download')
  } catch {
    return 'download'
  }
}

export default function ProjectPanel({ project, open, onClose }) {
  if (!project) return null

  const downloads = [
    ...(project.files ?? []),
    ...(project.pdfs ?? []).map((pdf) => ({
      title: pdf.title,
      url: pdf.url,
      filename: pdf.filename || fileNameFromUrl(pdf.url),
    })),
  ]
  // Dedupe by url while preserving order
  const seen = new Set()
  const uniqueDownloads = downloads.filter((file) => {
    if (!file?.url || seen.has(file.url)) return false
    seen.add(file.url)
    return true
  })
  const resolvedDownloads = uniqueDownloads.map((file) => ({
    ...file,
    href: assetUrl(file.url),
  }))

  const isContact = Boolean(project.contact)

  return (
    <section
      className={`project-panel${open ? ' is-open' : ''}${isContact ? ' project-panel--contact' : ''}`}
      aria-hidden={!open}
      aria-labelledby="project-panel-title"
    >
      <div className="project-panel__inner">
        <button type="button" className="project-panel__close" onClick={onClose} aria-label="Close project">
          Close
        </button>

        <header className={`project-panel__header${project.contact ? ' project-panel__header--contact' : ''}`}>
          {project.contact ? null : <p className="project-panel__eyebrow">Project</p>}
          <h1 id="project-panel-title">{project.title}</h1>
          {project.summary ? <p className="project-panel__summary">{project.summary}</p> : null}
        </header>

        {project.contact ? (
          <div className="project-panel__section project-panel__section--contact">
            <ContactComposer key={`${project.id}-contact`} contact={project.contact} />
          </div>
        ) : null}

        {project.description ? (
          <div className="project-panel__section">
            <h2>About</h2>
            <p className="project-panel__body">{project.description}</p>
          </div>
        ) : null}

        {project.languageStickers?.length ? (
          <div className="project-panel__section">
            <h2>Languages</h2>
            <ul className="language-sticker-grid">
              {project.languageStickers.map((lang) => (
                <li key={lang.title} className="language-sticker-grid__item">
                  <img src={assetUrl(lang.src)} alt="" className="language-sticker-grid__icon" />
                  <span className="language-sticker-grid__label">{lang.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {project.model3d ? (
          <div className="project-panel__section">
            <h2>3D model</h2>
            <ModelViewer
              key={`${project.id}-model`}
              title={project.model3d.title || `${project.title} assembly`}
              src={assetUrl(project.model3d.src)}
              allowUpload={project.model3d.allowUpload !== false}
              note={project.model3d.note}
            />
          </div>
        ) : null}

        {project.unityWebGL ? (
          <div className="project-panel__section">
            <h2>Play</h2>
            <UnityPlayer
              key={`${project.id}-unity`}
              title={project.unityWebGL.title || project.title}
              src={assetUrl(project.unityWebGL.src)}
              note={project.unityWebGL.note}
            />
          </div>
        ) : null}

        {project.webEmbed ? (
          <div className="project-panel__section">
            <h2>{project.webEmbed.heading || 'Try it'}</h2>
            <WebEmbed
              key={`${project.id}-embed`}
              title={project.webEmbed.title || project.title}
              src={assetUrl(project.webEmbed.src)}
              note={project.webEmbed.note}
              status={project.webEmbed.status}
            />
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

        {Array.isArray(project.gallery) ? (
          <ProjectGallery
            key={`${project.id}-gallery`}
            images={project.gallery}
            title={project.title}
            heading={project.galleryHeading || 'Gallery'}
            fit={project.galleryFit}
          />
        ) : null}

        {project.gallerySecondary?.length ? (
          <ProjectGallery
            key={`${project.id}-gallery-secondary`}
            images={project.gallerySecondary}
            title={project.title}
            heading={project.gallerySecondaryHeading || 'Partners'}
            fit={project.gallerySecondaryFit}
          />
        ) : null}

        {project.galleries?.map((gallery, i) =>
          gallery?.images?.length ? (
            <ProjectGallery
              key={`${project.id}-gallery-extra-${gallery.heading || i}`}
              images={gallery.images}
              title={project.title}
              heading={gallery.heading || 'Gallery'}
              fit={gallery.fit}
            />
          ) : null,
        )}

        {project.pdfs?.some((pdf) => pdf.embed) ? (
          <div className="project-panel__section">
            <h2>Documents</h2>
            {project.pdfs
              .filter((pdf) => pdf.embed)
              .map((pdf) => (
                <div className="project-panel__pdf" key={`embed-${pdf.url}`}>
                  <iframe src={`${assetUrl(pdf.url)}#view=FitH`} title={pdf.title} loading="lazy" />
                </div>
              ))}
          </div>
        ) : null}

        {project.code?.length
          ? project.code.map((snippet) => (
              <CodeViewer
                key={`${snippet.title}-${snippet.url}`}
                title={snippet.title}
                url={assetUrl(snippet.url)}
                language={snippet.language || 'cpp'}
              />
            ))
          : null}

        {resolvedDownloads.length ? (
          <div className="project-panel__section">
            <h2>Downloads</h2>
            <ul className="project-panel__list">
              {resolvedDownloads.map((file) => (
                <li key={`${file.title}-${file.url}`}>
                  <a href={file.href} download={file.filename || fileNameFromUrl(file.url)}>
                    {file.title}
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
