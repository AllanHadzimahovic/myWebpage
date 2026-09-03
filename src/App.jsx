import { useEffect, useRef, useState } from 'react'
import { projects } from './data/projects.js'
import { assetUrl } from './assetUrl.js'
import ProjectPanel from './ProjectPanel.jsx'
import VolleyballGame from './VolleyballGame.jsx'
import NameIntro from './NameIntro.jsx'
import UsageMeter from './UsageMeter.jsx'
import { readLowPower, useLowPower } from './lowPower.jsx'
import './App.css'

const CORNER_SIZE = 128
const CORNER_INSET = 20
const CORNER_GAP = 10
const CLOSE_MS = 1040
/** Leave room for the top-left Close control so grouped stickers stay on-screen. */
const CLOSE_CLEARANCE = 110
const POWER_SIZE_DESKTOP = 88
const POWER_SIZE_MOBILE = 72
const POWER_INSET = 16
const POWER_GAP = 12
const POSITIONS_KEY = 'sticker-positions'
const DRAG_THRESHOLD_PX = 8

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function loadSavedPositions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(POSITIONS_KEY) || '')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed
  } catch {
    return {}
  }
}

function savePositions(positions) {
  try {
    localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions))
  } catch {
    // private mode / blocked storage
  }
}

function powerStickerSize() {
  return window.innerWidth <= 640 ? POWER_SIZE_MOBILE : POWER_SIZE_DESKTOP
}

function powerReserve() {
  return POWER_INSET + powerStickerSize() + POWER_GAP
}

function settledCornerSize(count) {
  const gaps = Math.max(0, count - 1) * CORNER_GAP
  const available = window.innerWidth - CORNER_INSET - CLOSE_CLEARANCE - powerReserve() - gaps
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
  const { lowPower, toggleLowPower } = useLowPower()
  const [introOpen, setIntroOpen] = useState(() => !readLowPower())
  const [introPlaying, setIntroPlaying] = useState(introOpen)
  const [activeId, setActiveId] = useState(null)
  const [flyGroup, setFlyGroup] = useState([])
  const [flySettled, setFlySettled] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [volleyballOpen, setVolleyballOpen] = useState(false)
  const [phoneShakeId, setPhoneShakeId] = useState(null)
  const [phoneReveal, setPhoneReveal] = useState(null)
  const [lowPowerNotice, setLowPowerNotice] = useState(false)
  const [positions, setPositions] = useState(loadSavedPositions)
  const [draggingId, setDraggingId] = useState(null)
  const markerRefs = useRef({})
  const landingRef = useRef(null)
  const dragRef = useRef(null)
  const positionsRef = useRef(positions)
  const closeTimer = useRef(null)
  const phoneShakeTimer = useRef(null)
  const phoneInputRef = useRef(null)
  positionsRef.current = positions

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

  function posOf(project) {
    const saved = positions[project.id]
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
      return { x: saved.x, y: saved.y }
    }
    return { x: project.x, y: project.y }
  }

  function startMarkerDrag(project, event) {
    if (event.button != null && event.button !== 0) return
    if (introPlaying && !lowPower) return
    const landing = landingRef.current
    if (!landing) return
    const rect = landing.getBoundingClientRect()
    if (rect.width < 2 || rect.height < 2) return
    const current = posOf(project)
    dragRef.current = {
      id: project.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: current.x,
      originY: current.y,
      landingWidth: rect.width,
      landingHeight: rect.height,
      moved: false,
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // pointer capture is best-effort
    }
  }

  function moveMarkerDrag(event) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
      drag.moved = true
      setDraggingId(drag.id)
      setPhoneReveal(null)
      setPhoneShakeId(null)
    }
    event.preventDefault()
    const x = clamp(drag.originX + (dx / drag.landingWidth) * 100, 5, 95)
    const y = clamp(drag.originY + (dy / drag.landingHeight) * 100, 5, 95)
    setPositions((prev) => ({ ...prev, [drag.id]: { x, y } }))
  }

  function endMarkerDrag(event) {
    const drag = dragRef.current
    if (!drag || (event && drag.pointerId !== event.pointerId)) return
    if (drag.moved) savePositions(positionsRef.current)
    setDraggingId(null)
  }

  function startPhoneShake(id) {
    setPhoneShakeId(id)
    if (phoneShakeTimer.current) clearTimeout(phoneShakeTimer.current)
    phoneShakeTimer.current = setTimeout(() => {
      setPhoneShakeId((current) => (current === id ? null : current))
      phoneShakeTimer.current = null
    }, 650)
  }

  function revealPhone(project) {
    const pos = posOf(project)
    setPhoneReveal({
      id: project.id,
      number: project.phoneNumber,
      x: pos.x,
      y: pos.y,
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
    const visibleGroup = group.filter((project) => !project.hideMarker)

    if (!visibleGroup.length) {
      setFlyGroup([])
      setActiveId(contentId)
      setFlySettled(true)
      setPanelOpen(true)
      return
    }

    const size = settledCornerSize(visibleGroup.length)

    const flights = visibleGroup.map((project) => {
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
      ref={landingRef}
      className={`landing${introPlaying && !lowPower ? ' is-intro' : ''}${volleyballOpen ? ' is-volleyball' : isContactOpen ? ' is-contact' : isOpen ? ' is-dimmed' : ''}`}
      aria-label="Portfolio landing"
      onClick={() => setPhoneReveal(null)}
    >
      {introOpen && !lowPower ? (
        <NameIntro
          onReveal={() => setIntroPlaying(false)}
          onDone={() => setIntroOpen(false)}
        />
      ) : null}
      <button
        type="button"
        className={`power-sticker${lowPower ? ' is-on' : ''}`}
        aria-pressed={lowPower}
        aria-label={
          lowPower
            ? 'Low-power mode on. Click to restore full rendering.'
            : 'Turn on low-power rendering'
        }
        title={lowPower ? 'Low-power mode on' : 'Low-power mode'}
        onClick={(event) => {
          event.stopPropagation()
          if (lowPower) {
            toggleLowPower()
            setLowPowerNotice(false)
            return
          }
          toggleLowPower()
          setLowPowerNotice(true)
          setIntroOpen(false)
          setIntroPlaying(false)
        }}
      >
        <img
          className="power-sticker__icon"
          src={assetUrl('/projects/sun.png')}
          alt=""
          width={POWER_SIZE_DESKTOP}
          height={POWER_SIZE_DESKTOP}
        />
      </button>

      <UsageMeter />

      {lowPowerNotice ? (
        <div
          className="power-notice"
          role="status"
          onClick={(event) => event.stopPropagation()}
        >
          <p>Low-power mode enabled - you are now browsing more sustainably</p>
          <button
            type="button"
            className="power-notice__close"
            aria-label="Close low-power notice"
            onClick={() => setLowPowerNotice(false)}
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="stage" aria-hidden={isOpen}>
        <button
          type="button"
          className="portrait"
          aria-label="Open About Me, Allan Hadzimahovic"
          aria-expanded={activeId === 'about-me'}
          disabled={isOpen}
          onClick={(event) => {
            event.stopPropagation()
            openProject('about-me')
          }}
        >
          <img src={assetUrl('/me.png')} alt="" width={360} height={360} />
        </button>
      </div>

      {projects.map((project) => {
        if (project.hideMarker) return null
        const isActive = activeGroupIds.has(project.id)
        const sticker = Boolean(project.sticker)
        const tilt = project.rotate ?? 0
        const label = project.markerTitle || project.title
        const externalUrl = project.externalUrl
        const isVolleyball = project.miniGame === 'volleyball'
        const isPhone = Boolean(project.phoneNumber)
        const skipPanel = Boolean(externalUrl || isVolleyball || isPhone)
        const pos = posOf(project)
        const isDragging = draggingId === project.id
        return (
          <button
            key={project.id}
            type="button"
            className={`project-marker${sticker ? ' is-sticker' : ''}${isActive ? ' is-active' : ''}${phoneShakeId === project.id ? ' is-shaking' : ''}${isDragging ? ' is-dragging' : ''}`}
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
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: project.size,
              height: project.size,
              '--tilt': `${tilt}deg`,
            }}
            onPointerDown={(event) => startMarkerDrag(project, event)}
            onPointerMove={moveMarkerDrag}
            onPointerUp={endMarkerDrag}
            onPointerCancel={endMarkerDrag}
            onLostPointerCapture={endMarkerDrag}
            onDragStart={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation()
              if (dragRef.current?.moved && dragRef.current.id === project.id) {
                dragRef.current = null
                return
              }
              dragRef.current = null
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
              left: `calc(100vw - ${powerReserve() + size + index * (size + CORNER_GAP)}px)`,
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
