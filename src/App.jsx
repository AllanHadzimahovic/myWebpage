import { useEffect, useRef, useState } from 'react'
import { projects } from './data/projects.js'
import { assetUrl } from './assetUrl.js'
import ProjectPanel from './ProjectPanel.jsx'
import VolleyballGame from './VolleyballGame.jsx'
import './App.css'

const CORNER_SIZE = 64
const CORNER_INSET = 20
const CORNER_GAP = 10
const CLOSE_MS = 420

function resolveContentId(id) {
  const project = projects.find((item) => item.id === id)
  return project?.linkTo || id
}

function getGroupProjects(contentId) {
  const content = projects.find((item) => item.id === contentId)
  if (!content) return []
  if (!content.groupId) return [content]
  return projects.filter(
    (item) => item.groupId === content.groupId || item.id === contentId || item.linkTo === contentId,
  )
}

function App() {
  const [activeId, setActiveId] = useState(null)
  const [flyGroup, setFlyGroup] = useState([])
  const [flySettled, setFlySettled] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [volleyballOpen, setVolleyballOpen] = useState(false)
  const markerRefs = useRef({})
  const closeTimer = useRef(null)

  const active = projects.find((project) => project.id === activeId) ?? null
  const isOpen = Boolean(activeId) || volleyballOpen
  const isContactOpen = Boolean(active?.contact)
  const activeGroupIds = new Set(getGroupProjects(activeId || '').map((project) => project.id))

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      if (volleyballOpen) {
        setVolleyballOpen(false)
        return
      }
      closeProject()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, volleyballOpen])

  function openProject(clickedId) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }

    const contentId = resolveContentId(clickedId)
    const group = getGroupProjects(contentId)

    const flights = group.map((project) => {
      const el = markerRefs.current[project.id]
      const rect = el?.getBoundingClientRect()
      return {
        id: project.id,
        icon: project.icon,
        sticker: Boolean(project.sticker),
        from: rect
          ? {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }
          : {
              top: CORNER_INSET,
              left: window.innerWidth - CORNER_INSET - CORNER_SIZE,
              width: CORNER_SIZE,
              height: CORNER_SIZE,
            },
      }
    })

    setFlyGroup(flights)
    setActiveId(contentId)
    setFlySettled(false)
    setPanelOpen(false)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlySettled(true)
        setPanelOpen(true)
      })
    })
  }

  function closeProject() {
    setPanelOpen(false)
    setFlySettled(false)

    closeTimer.current = setTimeout(() => {
      setActiveId(null)
      setFlyGroup([])
      closeTimer.current = null
    }, CLOSE_MS)
  }

  return (
    <main
      className={`landing${volleyballOpen ? ' is-volleyball' : isContactOpen ? ' is-contact' : isOpen ? ' is-dimmed' : ''}`}
      aria-label="Portfolio landing"
    >
      <div className="stage" aria-hidden={isOpen}>
        <img
          className="portrait"
          src={assetUrl('/me.jpg')}
          alt="Allan Hadzimahovic"
          width={320}
          height={320}
        />
      </div>

      {projects.map((project) => {
        const isActive = activeGroupIds.has(project.id)
        const sticker = Boolean(project.sticker)
        const tilt = project.rotate ?? 0
        const label = project.markerTitle || project.title
        const externalUrl = project.externalUrl
        const isVolleyball = project.miniGame === 'volleyball'
        return (
          <button
            key={project.id}
            type="button"
            className={`project-marker${sticker ? ' is-sticker' : ''}${isActive ? ' is-active' : ''}`}
            title={
              externalUrl
                ? `${label} (opens in new tab)`
                : isVolleyball
                  ? `${label} mini-game`
                  : label
            }
            aria-label={
              externalUrl
                ? `Open ${label} profile`
                : isVolleyball
                  ? `Play ${label} mini-game`
                  : `Open ${label}`
            }
            aria-expanded={externalUrl || isVolleyball ? undefined : isActive}
            disabled={isOpen && !isActive && !externalUrl}
            ref={(node) => {
              markerRefs.current[project.id] = node
            }}
            style={{
              left: `${project.x}%`,
              top: `${project.y}%`,
              width: project.size,
              height: project.size,
              '--tilt': `${tilt}deg`,
            }}
            onClick={() => {
              if (externalUrl) {
                window.open(externalUrl, '_blank', 'noopener,noreferrer')
                return
              }
              if (isVolleyball) {
                setVolleyballOpen(true)
                return
              }
              openProject(project.id)
            }}
          >
            <img src={assetUrl(project.icon)} alt="" width={project.size} height={project.size} />
          </button>
        )
      })}

      {flyGroup.map((flight, index) => {
        const style = !flySettled
          ? {
              top: flight.from.top,
              left: flight.from.left,
              width: flight.from.width,
              height: flight.from.height,
            }
          : {
              top: CORNER_INSET,
              left: `calc(100vw - ${CORNER_INSET + CORNER_SIZE + index * (CORNER_SIZE + CORNER_GAP)}px)`,
              width: CORNER_SIZE,
              height: CORNER_SIZE,
            }

        return (
          <div
            key={flight.id}
            className={`flying-icon${flight.sticker ? ' is-sticker' : ''}${flySettled ? ' is-settled' : ''}`}
            style={style}
            aria-hidden="true"
          >
            <img src={assetUrl(flight.icon)} alt="" />
          </div>
        )
      })}

      <ProjectPanel project={active} open={panelOpen} onClose={closeProject} />

      {volleyballOpen && (
        <VolleyballGame
          onClose={() => setVolleyballOpen(false)}
          ballSrc={assetUrl('/projects/project-2.png')}
        />
      )}
    </main>
  )
}

export default App
