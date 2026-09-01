import { useEffect, useRef, useState } from 'react'
import { projects } from './data/projects.js'
import ProjectPanel from './ProjectPanel.jsx'
import './App.css'

const CORNER_SIZE = 64
const CORNER_INSET = 20
const CLOSE_MS = 420

function App() {
  const [activeId, setActiveId] = useState(null)
  const [flyFrom, setFlyFrom] = useState(null)
  const [flySettled, setFlySettled] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const markerRefs = useRef({})
  const closeTimer = useRef(null)

  const active = projects.find((project) => project.id === activeId) ?? null
  const isOpen = Boolean(activeId)

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') closeProject()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  function openProject(id) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }

    const el = markerRefs.current[id]
    if (el) {
      const rect = el.getBoundingClientRect()
      setFlyFrom({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
    }

    setActiveId(id)
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
      setFlyFrom(null)
      closeTimer.current = null
    }, CLOSE_MS)
  }

  const flyStyle =
    flyFrom && !flySettled
      ? {
          top: flyFrom.top,
          left: flyFrom.left,
          width: flyFrom.width,
          height: flyFrom.height,
        }
      : flyFrom && flySettled
        ? {
            top: CORNER_INSET,
            left: `calc(100vw - ${CORNER_INSET + CORNER_SIZE}px)`,
            width: CORNER_SIZE,
            height: CORNER_SIZE,
          }
        : undefined

  return (
    <main className={`landing${isOpen ? ' is-dimmed' : ''}`}>
      <div className="stage" aria-label="Portfolio landing" aria-hidden={isOpen}>
        <img
          className="portrait"
          src="/me.jpg"
          alt="Portrait placeholder"
          width={320}
          height={320}
        />

        {projects.map((project) => {
          const isActive = project.id === activeId
          return (
            <button
              key={project.id}
              type="button"
              className={`project-marker${isActive ? ' is-active' : ''}`}
              title={project.title}
              aria-label={`Open ${project.title}`}
              aria-expanded={isActive}
              disabled={isOpen && !isActive}
              ref={(node) => {
                markerRefs.current[project.id] = node
              }}
              style={{
                left: `${project.x}%`,
                top: `${project.y}%`,
                width: project.size,
                height: project.size,
              }}
              onClick={() => openProject(project.id)}
            >
              <img src={project.icon} alt="" width={project.size} height={project.size} />
            </button>
          )
        })}
      </div>

      {active && flyFrom ? (
        <div
          className={`flying-icon${flySettled ? ' is-settled' : ''}`}
          style={flyStyle}
          aria-hidden="true"
        >
          <img src={active.icon} alt="" />
        </div>
      ) : null}

      <ProjectPanel project={active} open={panelOpen} onClose={closeProject} />
    </main>
  )
}

export default App
