import { useEffect, useRef, useState } from 'react'
import { projects } from './data/projects.js'
import { assetUrl } from './assetUrl.js'
import ProjectPanel from './ProjectPanel.jsx'
import VolleyballGame from './VolleyballGame.jsx'
import './App.css'

const CORNER_SIZE = 128
const CORNER_INSET = 20
const CORNER_GAP = 10
const CLOSE_MS = 420
/** Leave room for the top-left Close control so grouped stickers stay on-screen. */
const CLOSE_CLEARANCE = 110

function settledCornerSize(count) {
  const gaps = Math.max(0, count - 1) * CORNER_GAP
  const available = window.innerWidth - CORNER_INSET - CLOSE_CLEARANCE - gaps
  const maxEach = Math.floor(available / Math.max(count, 1))
  return Math.max(56, Math.min(CORNER_SIZE, maxEach))
}

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
  const [phoneShakeId, setPhoneShakeId] = useState(null)
  const [phoneReveal, setPhoneReveal] = useState(null)
  const markerRefs = useRef({})
  const closeTimer = useRef(null)
  const phoneShakeTimer = useRef(null)
  const phoneInputRef = useRef(null)

  const active = projects.find((project) => project.id === activeId) ?? null
  const isOpen = Boolean(activeId) || volleyballOpen
  const isContactOpen = Boolean(active?.contact)
  const activeGroupIds = new Set(getGroupProjects(activeId || '').map((project) => project.id))

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
      if (phoneShakeTimer.current) clearTimeout(phoneShakeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!phoneReveal) return undefined
    phoneInputRef.current?.focus()
    phoneInputRef.current?.select()

    function onKeyDown(event) {
      if (event.key === 'Escape') setPhoneReveal(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phoneReveal])

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

  function startPhoneShake(id) {
    setPhoneShakeId(id)
    if (phoneShakeTimer.current) clearTimeout(phoneShakeTimer.current)
    phoneShakeTimer.current = setTimeout(() => {
      setPhoneShakeId((current) => (current === id ? null : current))
      phoneShakeTimer.current = null
    }, 650)
  }

  function revealPhone(project) {
    setPhoneReveal({
      id: project.id,
      number: project.phoneNumber,
      x: project.x,
      y: project.y,
      size: project.size,
    })
    if (phoneShakeId === project.id) {
      setPhoneShakeId(null)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => startPhoneShake(project.id))
      })
      return
    }
    startPhoneShake(project.id)
  }

  function openProject(clickedId) {
    setPhoneReveal(null)
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }

    const contentId = resolveContentId(clickedId)
    const group = getGroupProjects(contentId)
    const size = settledCornerSize(group.length)

    const flights = group.map((project) => {
      const el = markerRefs.current[project.id]
      const rect = el?.getBoundingClientRect()
      return {
        id: project.id,
        icon: project.icon,
        sticker: Boolean(project.sticker),
        size,
        from: rect
          ? {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }
          : {
              top: CORNER_INSET,
              left: window.innerWidth - CORNER_INSET - size,
              width: size,
              height: size,
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
      onClick={() => setPhoneReveal(null)}
    >
      <div className="stage" aria-hidden={isOpen}>
        <img
          className="portrait"
          src={assetUrl('/me.png')}
          alt="Allan Hadzimahovic"
          width={360}
          height={360}
        />
      </div>

      {projects.map((project) => {
        const isActive = activeGroupIds.has(project.id)
        const sticker = Boolean(project.sticker)
        const tilt = project.rotate ?? 0
        const label = project.markerTitle || project.title
        const externalUrl = project.externalUrl
        const isVolleyball = project.miniGame === 'volleyball'
        const isPhone = Boolean(project.phoneNumber)
        const skipPanel = Boolean(externalUrl || isVolleyball || isPhone)
        return (
          <button
            key={project.id}
            type="button"
            className={`project-marker${sticker ? ' is-sticker' : ''}${isActive ? ' is-active' : ''}${phoneShakeId === project.id ? ' is-shaking' : ''}`}
            title={
              externalUrl
                ? `${label} (opens in new tab)`
                : isVolleyball
                  ? `${label} mini-game`
                  : isPhone
                    ? `${label} number`
                    : label
            }
            aria-label={
              externalUrl
                ? `Open ${label} profile`
                : isVolleyball
                  ? `Play ${label} mini-game`
                  : isPhone
                    ? `Show ${label} number`
                    : `Open ${label}`
            }
            aria-expanded={skipPanel ? undefined : isActive}
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
            onClick={(event) => {
              event.stopPropagation()
              if (externalUrl) {
                setPhoneReveal(null)
                window.open(externalUrl, '_blank', 'noopener,noreferrer')
                return
              }
              if (isVolleyball) {
                setPhoneReveal(null)
                setVolleyballOpen(true)
                return
              }
              if (isPhone) {
                revealPhone(project)
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
        const size = flight.size ?? CORNER_SIZE
        const style = !flySettled
          ? {
              top: flight.from.top,
              left: flight.from.left,
              width: flight.from.width,
              height: flight.from.height,
            }
          : {
              top: CORNER_INSET,
              left: `calc(100vw - ${CORNER_INSET + size + index * (size + CORNER_GAP)}px)`,
              width: size,
              height: size,
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

      {phoneReveal ? (
        <div
          className="phone-reveal"
          style={{
            top: `${phoneReveal.y}%`,
            '--phone-x': `${phoneReveal.x}%`,
            '--sticker-size': `${phoneReveal.size}px`,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <label htmlFor="phone-reveal-number">Give me a call</label>
          <input
            id="phone-reveal-number"
            ref={phoneInputRef}
            type="text"
            readOnly
            value={phoneReveal.number}
            aria-label="Give me a call"
            onFocus={(event) => event.target.select()}
          />
        </div>
      ) : null}

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
