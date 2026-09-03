import { useEffect, useState } from 'react'

/** Sustainable Web Design Model v4 — operational + embodied energy intensity. */
const KWH_PER_GB = 0.055 + 0.059 + 0.08 + 0.012 + 0.013 + 0.081
const G_CO2_PER_KWH = 494

function formatBytes(bytes, digits = 1) {
  if (!Number.isFinite(bytes) || bytes < 0) return null
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(digits)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(digits)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatBattery(level, charging) {
  if (level == null) return null
  const pct = `${Math.round(level * 100)}%`
  if (charging === true) return `${pct} charging`
  if (charging === false) return `${pct} on battery`
  return pct
}

function formatEnergy(kwh) {
  if (!Number.isFinite(kwh) || kwh <= 0) return null
  const wh = kwh * 1000
  if (wh >= 1) return `${wh.toFixed(2)} Wh`
  if (wh >= 0.01) return `${wh.toFixed(2)} Wh`
  return `${(wh * 1000).toFixed(1)} mWh`
}

function formatCo2(grams) {
  if (!Number.isFinite(grams) || grams <= 0) return null
  if (grams >= 1) return `${grams.toFixed(2)} g CO₂e`
  if (grams >= 0.01) return `${grams.toFixed(2)} g CO₂e`
  return `${(grams * 1000).toFixed(1)} mg CO₂e`
}

function readHeap() {
  const mem = performance.memory
  if (!mem) return { used: null, allocated: null, limit: null }
  return {
    used: mem.usedJSHeapSize ?? null,
    allocated: mem.totalJSHeapSize ?? null,
    limit: mem.jsHeapSizeLimit ?? null,
  }
}

function readTransferBytes() {
  let total = 0
  try {
    const nav = performance.getEntriesByType('navigation')[0]
    if (nav?.transferSize) total += nav.transferSize
    for (const entry of performance.getEntriesByType('resource')) {
      total += entry.transferSize || 0
    }
  } catch {
    return 0
  }
  return total
}

function Row({ label, value }) {
  return (
    <p>
      <span className="usage-meter__label">{label}</span>
      <span className="usage-meter__value">{value ?? 'n/a'}</span>
    </p>
  )
}

export default function UsageMeter() {
  const [expanded, setExpanded] = useState(false)
  const [snap, setSnap] = useState({
    heapUsed: null,
    heapAlloc: null,
    heapLimit: null,
    deviceRam: null,
    cores: null,
    cpu: null,
    heat: null,
    battery: null,
    transfer: null,
    energy: null,
    co2: null,
  })

  useEffect(() => {
    let cancelled = false
    let battery = null
    let cpu = null
    let heat = null
    let observer = null
    let perfObserver = null
    let timer = null

    function tick() {
      if (cancelled) return
      const heap = readHeap()
      const transfer = readTransferBytes()
      const gb = transfer / (1024 * 1024 * 1024)
      const kwh = gb * KWH_PER_GB
      const grams = kwh * G_CO2_PER_KWH
      setSnap({
        heapUsed: formatBytes(heap.used),
        heapAlloc: formatBytes(heap.allocated),
        heapLimit: formatBytes(heap.limit, 2),
        deviceRam: navigator.deviceMemory ? `~${navigator.deviceMemory} GB` : null,
        cores: navigator.hardwareConcurrency || null,
        cpu,
        heat,
        battery: formatBattery(battery?.level, battery?.charging),
        transfer: formatBytes(transfer) ?? '0 B',
        energy: formatEnergy(kwh),
        co2: formatCo2(grams),
      })
    }

    async function setup() {
      if (typeof navigator.getBattery === 'function') {
        try {
          battery = await navigator.getBattery()
        } catch {
          battery = null
        }
      }

      if (typeof PressureObserver === 'function') {
        try {
          observer = new PressureObserver((records) => {
            for (const record of records) {
              if (record.source === 'thermals') heat = record.state ?? null
              else cpu = record.state ?? null
            }
          })
          const sources = PressureObserver.knownSources ?? ['cpu', 'thermals']
          for (const source of sources) {
            try {
              await observer.observe(source, { sampleInterval: 1000 })
            } catch {
              // source not supported on this OS / browser
            }
          }
        } catch {
          observer = null
        }
      }

      if (typeof PerformanceObserver === 'function') {
        try {
          perfObserver = new PerformanceObserver(() => tick())
          perfObserver.observe({ type: 'resource', buffered: true })
          perfObserver.observe({ type: 'navigation', buffered: true })
        } catch {
          perfObserver = null
        }
      }

      if (cancelled) return
      tick()
      timer = setInterval(tick, 1000)
    }

    setup()
    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
      observer?.disconnect?.()
      perfObserver?.disconnect?.()
    }
  }, [])

  const heapLine =
    snap.heapUsed && snap.heapAlloc ? `${snap.heapUsed} / ${snap.heapAlloc}` : snap.heapUsed

  return (
    <div
      className={`usage-meter${expanded ? ' is-expanded' : ''}`}
      role="status"
      aria-live="polite"
      title="This tab only. Browsers do not share live system watts or used RAM. Heap is Chrome JS memory. Device RAM is a bucketed capacity, not current use. Est. energy/CO₂e is Sustainable Web Design Model v4 from bytes transferred this visit — not charger draw."
      onClick={(event) => event.stopPropagation()}
    >
      <div className="usage-meter__bar">
        <Row label="Heap" value={expanded ? heapLine : snap.heapUsed} />
        <button
          type="button"
          className="usage-meter__toggle"
          aria-expanded={expanded}
          aria-controls="usage-meter-details"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {expanded ? (
        <div id="usage-meter-details" className="usage-meter__details">
          <section className="usage-meter__group">
            <h3>Memory</h3>
            <Row label="Limit" value={snap.heapLimit} />
            <Row label="Device" value={snap.deviceRam} />
          </section>
          <section className="usage-meter__group">
            <h3>CPU</h3>
            <Row label="Cores" value={snap.cores != null ? String(snap.cores) : null} />
            <Row label="Load" value={snap.cpu} />
            <Row label="Heat" value={snap.heat} />
          </section>
          <section className="usage-meter__group">
            <h3>Energy</h3>
            <Row label="Battery" value={snap.battery} />
            <Row label="Net" value={snap.transfer} />
            <Row
              label="Est."
              value={snap.energy && snap.co2 ? `${snap.energy} · ${snap.co2}` : snap.energy || snap.co2}
            />
          </section>
        </div>
      ) : null}
    </div>
  )
}
