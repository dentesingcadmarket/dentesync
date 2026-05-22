export type RGB = { r: number; g: number; b: number }

const cache = new Map<string, RGB>()
const pending = new Map<string, Promise<RGB>>()

const FALLBACK: RGB = { r: 90, g: 110, b: 130 }

function quantize(value: number, step = 24): number {
  return Math.round(value / step) * step
}

function isInteresting({ r, g, b }: RGB): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max < 28) return false
  if (min > 232) return false
  if (max - min < 14) return false
  return true
}

export function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case rn:
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60
      break
    case gn:
      h = ((bn - rn) / d + 2) * 60
      break
    case bn:
      h = ((rn - gn) / d + 4) * 60
      break
  }
  return { h, s, l }
}

export function rgbString({ r, g, b }: RGB, alpha = 1): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export async function extractDominantColor(src: string): Promise<RGB> {
  if (typeof window === 'undefined') return FALLBACK
  const cached = cache.get(src)
  if (cached) return cached
  const inFlight = pending.get(src)
  if (inFlight) return inFlight

  const promise = new Promise<RGB>(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.referrerPolicy = 'no-referrer'
    img.decoding = 'async'

    img.onload = () => {
      try {
        const size = 16
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          cache.set(src, FALLBACK)
          resolve(FALLBACK)
          return
        }
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)

        const buckets = new Map<string, { color: RGB; count: number; score: number }>()
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3]
          if (alpha < 200) continue
          const rgb: RGB = { r: data[i], g: data[i + 1], b: data[i + 2] }
          if (!isInteresting(rgb)) continue
          const key = `${quantize(rgb.r)},${quantize(rgb.g)},${quantize(rgb.b)}`
          const { s, l } = rgbToHsl(rgb)
          const vivid = s * (1 - Math.abs(l - 0.55))
          const existing = buckets.get(key)
          if (existing) {
            existing.count += 1
            existing.score += 1 + vivid * 2
          } else {
            buckets.set(key, { color: rgb, count: 1, score: 1 + vivid * 2 })
          }
        }

        let winnerColor: RGB | null = null
        let winnerScore = -Infinity
        buckets.forEach(b => {
          if (b.score > winnerScore) {
            winnerScore = b.score
            winnerColor = b.color
          }
        })

        const result: RGB = winnerColor ?? FALLBACK
        cache.set(src, result)
        resolve(result)
      } catch {
        cache.set(src, FALLBACK)
        resolve(FALLBACK)
      } finally {
        pending.delete(src)
      }
    }

    img.onerror = () => {
      cache.set(src, FALLBACK)
      pending.delete(src)
      resolve(FALLBACK)
    }

    img.src = src
  })

  pending.set(src, promise)
  return promise
}
