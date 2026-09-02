/**
 * Prefix local public/ paths with Vite's base (e.g. /myWebpage/ on GitHub Pages).
 * Leaves absolute http(s)/data/blob URLs unchanged.
 */
export function assetUrl(path) {
  if (!path) return path
  if (/^(https?:|data:|blob:)/i.test(path)) return path

  const base = import.meta.env.BASE_URL || '/'
  const raw = String(path).replace(/^\//, '')
  const q = raw.indexOf('?')
  const hash = raw.indexOf('#')
  let cut = raw.length
  if (q >= 0) cut = Math.min(cut, q)
  if (hash >= 0) cut = Math.min(cut, hash)
  const pathname = raw.slice(0, cut)
  const suffix = raw.slice(cut)
  return `${base}${pathname}${suffix}`
}
