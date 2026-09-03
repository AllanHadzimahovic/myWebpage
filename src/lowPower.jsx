import { createContext, useContext, useEffect, useState } from 'react'

export const STORAGE_KEY = 'low-power'

export function readLowPower() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function persistLowPower(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  } catch {
    // private mode / blocked storage
  }
}

export function applyLowPowerClass(on) {
  document.documentElement.classList.toggle('low-power', on)
}

const LowPowerContext = createContext({
  lowPower: false,
  setLowPower: () => {},
  toggleLowPower: () => {},
})

export function LowPowerProvider({ children }) {
  const [lowPower, setLowPowerState] = useState(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('low-power')) {
      return true
    }
    return readLowPower()
  })

  useEffect(() => {
    applyLowPowerClass(lowPower)
    persistLowPower(lowPower)
  }, [lowPower])

  const setLowPower = (on) => setLowPowerState(Boolean(on))
  const toggleLowPower = () => setLowPowerState((value) => !value)

  return (
    <LowPowerContext.Provider value={{ lowPower, setLowPower, toggleLowPower }}>
      {children}
    </LowPowerContext.Provider>
  )
}

export function useLowPower() {
  return useContext(LowPowerContext)
}

export function LowPowerMediaNote({ children, href, hrefLabel = 'Open separately' }) {
  return (
    <div className="low-power-media">
      <p>{children}</p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer">
          {hrefLabel}
        </a>
      ) : null}
    </div>
  )
}
