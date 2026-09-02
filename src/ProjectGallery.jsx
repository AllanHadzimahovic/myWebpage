import { useEffect, useState } from 'react'

function isYoutubeItem(item) {
  return item?.type === 'youtube' || Boolean(item?.youtubeId)
}

function slideKey(item, i) {
  if (isYoutubeItem(item)) return `youtube-${item.youtubeId || i}`
  return item.src || `slide-${i}`
}

export default function ProjectGallery({ images, title, heading = 'Gallery', fit }) {
  const [index, setIndex] = useState(0)
  const total = images?.length ?? 0
  const safeIndex = total ? Math.min(index, total - 1) : 0

  useEffect(() => {
    if (total < 2) return undefined
    function onKeyDown(event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setIndex((i) => (i - 1 + total) % total)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setIndex((i) => (i + 1) % total)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [total])

  if (!total) return null

  const current = images[safeIndex]
  const showingVideo = isYoutubeItem(current)
  const go = (next) => {
    setIndex((i) => (i + next + total) % total)
  }

  const frameClass = [
    'project-gallery__frame',
    showingVideo ? 'project-gallery__frame--video' : '',
    // Portrait fit is for tall images only — keep YouTube at 16:9
    !showingVideo && fit === 'portrait' ? 'project-gallery__frame--portrait' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="project-panel__section">
      <h2>{heading}</h2>
      <div
        className="project-gallery"
        aria-roledescription="carousel"
        aria-label={`${title} ${heading}`}
      >
        <div className={frameClass}>
          {showingVideo ? (
            <iframe
              key={current.youtubeId}
              className="project-gallery__video"
              src={`https://www.youtube.com/embed/${current.youtubeId}`}
              title={current.alt || `${title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <img
              key={current.src}
              src={current.src}
              alt={current.alt || `${title} photo ${safeIndex + 1} of ${total}`}
              className="project-gallery__image"
            />
          )}
        </div>

        <div className="project-gallery__controls">
          <button type="button" className="project-gallery__nav" onClick={() => go(-1)} aria-label="Previous slide">
            ‹
          </button>
          <p className="project-gallery__count" aria-live="polite">
            {safeIndex + 1} / {total}
          </p>
          <button type="button" className="project-gallery__nav" onClick={() => go(1)} aria-label="Next slide">
            ›
          </button>
        </div>

        {total > 1 ? (
          <div className="project-gallery__dots" role="tablist" aria-label="Gallery slides">
            {images.map((item, i) => (
              <button
                key={slideKey(item, i)}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                aria-label={
                  isYoutubeItem(item) ? `Show video ${i + 1}` : `Show photo ${i + 1}`
                }
                className={`project-gallery__dot${i === safeIndex ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
