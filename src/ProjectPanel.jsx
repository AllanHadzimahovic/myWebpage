import { useEffect, useState } from 'react'
import ProjectGallery from './ProjectGallery.jsx'
import CodeViewer from './CodeViewer.jsx'
import ModelViewer from './ModelViewer.jsx'
import UnityPlayer from './UnityPlayer.jsx'
import WebEmbed from './WebEmbed.jsx'
import ContactComposer from './ContactComposer.jsx'
import { assetUrl } from './assetUrl.js'
import { LowPowerMediaNote, useLowPower } from './lowPower.jsx'

function languageGroupsOf(project) {
  if (project.languageGroups?.length) return project.languageGroups
  if (project.languageStickers?.length) {
    return [
      {
        heading: project.languageStickersHeading || 'Languages & apps',
        items: project.languageStickers,
        credit: project.languageStickersCredit,
      },
    ]
  }
  return []
}

function LanguageGrid({ items, openVisual, onOpen }) {
  return (
    <ul className="language-sticker-grid">
      {items.map((lang, i) => (
        <li key={lang.id || `${lang.src}-${lang.title || i}`} className="language-sticker-grid__item">
          <button
            type="button"
            className="language-sticker-grid__button"
            onClick={() => onOpen(lang)}
            aria-haspopup="dialog"
            aria-expanded={openVisual?.src === lang.src && openVisual?.title === lang.title}
            aria-label={lang.title || 'Open note'}
          >
            <img src={assetUrl(lang.src)} alt="" className="language-sticker-grid__icon" />
          </button>
        </li>
      ))}
    </ul>
  )
}

function fileNameFromUrl(url) {
  try {
    const path = url.split('?')[0]
    return decodeURIComponent(path.split('/').pop() || 'download')
  } catch {
    return 'download'
  }
}

export default function ProjectPanel({ project, open, onClose }) {
  const { lowPower } = useLowPower()
  const [openVisual, setOpenVisual] = useState(null)

  useEffect(() => {
    setOpenVisual(null)
  }, [project?.id, open])

  useEffect(() => {
    if (!openVisual) return undefined
    function onKey(event) {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpenVisual(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openVisual])

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
          {project.contact || project.hideMarker ? null : (
            <p className="project-panel__eyebrow">Project</p>
          )}
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

        {languageGroupsOf(project).map((group) =>
          group.items?.length ? (
            <div className="project-panel__section" key={group.heading}>
              <h2>{group.heading}</h2>
              <LanguageGrid items={group.items} openVisual={openVisual} onOpen={setOpenVisual} />
              {group.credit ? <p className="language-sticker-grid__credit">{group.credit}</p> : null}
            </div>
          ) : null,
        )}

        {openVisual ? (
          <div
            className="language-note"
            role="presentation"
            onClick={() => setOpenVisual(null)}
          >
            <div
              className="language-note__box"
              role="dialog"
              aria-modal="true"
              aria-labelledby="language-note-title"
              onClick={(event) => event.stopPropagation()}
            >
              <label htmlFor="language-note-text" id="language-note-title">
                {openVisual.title || 'Note'}
              </label>
              <textarea
                id="language-note-text"
                className="language-note__field"
                readOnly
                value={openVisual.text || ''}
                rows={8}
              />
              <button
                type="button"
                className="language-note__close"
                onClick={() => setOpenVisual(null)}
              >
                Close
              </button>
            </div>
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
            {lowPower ? (
              <LowPowerMediaNote
                href={`https://www.youtube.com/watch?v=${project.youtubeId}`}
                hrefLabel="Open on YouTube"
              >
                Video embeds are paused in low-power mode.
              </LowPowerMediaNote>
            ) : (
              <div className="project-panel__video">
                <iframe
                  src={`https://www.youtube.com/embed/${project.youtubeId}`}
                  title={`${project.title} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
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

        {project.favorites?.length ? (
          <div className="project-panel__section">
            <h2>Favorites</h2>
            <div className="favorites-box">
              {project.favorites.map((list) => (
                <section key={list.title} className="favorites-box__list">
                  <h3>{list.title}</h3>
                  {list.items?.length ? (
                    <ul>
                      {list.items.map((item, i) => {
                        const label = typeof item === 'string' ? item : item.title
                        const href = typeof item === 'string' ? null : item.url
                        return (
                          <li key={`${list.title}-${label}-${i}`}>
                            {href ? (
                              <a href={href} target="_blank" rel="noreferrer">
                                {label || href}
                              </a>
                            ) : (
                              label
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="favorites-box__empty">Add items here</p>
                  )}
                </section>
              ))}
            </div>
          </div>
        ) : null}

        {project.stills?.length ? (
          <div className="project-panel__section project-panel__section--stills">
            <div
              className={`project-stills${project.stills.length === 2 ? ' project-stills--pair' : ''}`}
            >
              {project.stills.map((image, i) => (
                <figure className="project-stills__frame" key={image.src || i}>
                  <img
                    src={assetUrl(image.src)}
                    alt={image.alt || `${project.title} photo ${i + 1}`}
                  />
                </figure>
              ))}
            </div>
          </div>
        ) : null}

        {project.pdfs?.some((pdf) => pdf.embed) ? (
          <div className="project-panel__section">
            <h2>Documents</h2>
            {project.pdfs
              .filter((pdf) => pdf.embed)
              .map((pdf) =>
                lowPower ? (
                  <LowPowerMediaNote
                    key={`embed-${pdf.url}`}
                    href={assetUrl(pdf.url)}
                    hrefLabel={pdf.title}
                  >
                    PDF embeds are paused in low-power mode — open the file instead.
                  </LowPowerMediaNote>
                ) : (
                  <div className="project-panel__pdf" key={`embed-${pdf.url}`}>
                    <iframe src={`${assetUrl(pdf.url)}#view=FitH`} title={pdf.title} loading="lazy" />
                  </div>
                ),
              )}
          </div>
        ) : null}

        {project.code?.length ? (
          <CodeViewer
            key={`${project.id}-code`}
            files={project.code.map((snippet) => ({
              title: snippet.title,
              url: assetUrl(snippet.url),
              language: snippet.language || 'cpp',
            }))}
            repo={
              project.codeRepo?.url
                ? {
                    title: project.codeRepo.title || `Open ${project.title} on GitHub`,
                    url: project.codeRepo.url,
                    icon: assetUrl(project.codeRepo.icon || '/projects/project-15.png'),
                  }
                : null
            }
          />
        ) : null}

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
