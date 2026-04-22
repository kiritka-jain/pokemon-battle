/**
 * Makes flat white / near-white backgrounds transparent for sprites in public/pokemon/.
 *
 * Uses a flood fill from the image border on "near-white" pixels only, so interior
 * whites (eyes, bellies) usually stay opaque as long as they do not touch the canvas edge.
 *
 * Env:
 *   POKEMON_BG_THRESHOLD — min R,G,B to treat as background (default 242). Lower if a halo
 *   remains; raise if sprite details on the border vanish.
 *
 * Run from pokepath: `npm run pokemon:transparent`
 *
 * Alternative (no Node): install ImageMagick and use ../scripts/pokemon-transparent-pngs.sh
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const POKEMON_DIR = path.join(__dirname, '..', 'public', 'pokemon')
const T = Number(process.env.POKEMON_BG_THRESHOLD ?? 242)

function isNearWhite(r, g, b) {
  return r >= T && g >= T && b >= T
}

/**
 * @param {Buffer} data
 * @param {number} w
 * @param {number} h
 */
function floodTransparentFromEdges(data, w, h) {
  const out = Buffer.from(data)
  const visited = new Uint8Array(w * h)
  /** @type {number[]} */
  const q = []

  const idx = (x, y) => (y * w + x) * 4
  const key = (x, y) => y * w + x

  function trySeed(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return
    const k = key(x, y)
    if (visited[k]) return
    const i = idx(x, y)
    if (!isNearWhite(data[i], data[i + 1], data[i + 2])) return
    visited[k] = 1
    q.push(k)
  }

  for (let x = 0; x < w; x++) {
    trySeed(x, 0)
    trySeed(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    trySeed(0, y)
    trySeed(w - 1, y)
  }

  let qi = 0
  while (qi < q.length) {
    const k = q[qi++]
    const x = k % w
    const y = Math.floor(k / w)
    const i = idx(x, y)
    out[i + 3] = 0

    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ]
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
      const nk = key(nx, ny)
      if (visited[nk]) continue
      const ni = idx(nx, ny)
      if (!isNearWhite(data[ni], data[ni + 1], data[ni + 2])) continue
      visited[nk] = 1
      q.push(nk)
    }
  }

  return out
}

async function processFile(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  if (info.channels !== 4) {
    throw new Error(`Expected RGBA, got ${info.channels} channels for ${filePath}`)
  }

  const out = floodTransparentFromEdges(data, w, h)
  const tmp = `${filePath}.tmp.png`

  await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toFile(tmp)
  await fs.rename(tmp, filePath)
}

async function main() {
  let entries
  try {
    entries = await fs.readdir(POKEMON_DIR)
  } catch (e) {
    console.error('Missing directory:', POKEMON_DIR, e)
    process.exit(1)
  }

  const pngs = entries.filter((e) => e.endsWith('.png'))
  if (pngs.length === 0) {
    console.log('No PNG files in', POKEMON_DIR)
    return
  }

  console.log(`Threshold POKEMON_BG_THRESHOLD=${T} (near-white from edges -> transparent)`)

  for (const name of pngs.sort()) {
    const fp = path.join(POKEMON_DIR, name)
    process.stdout.write(`${name} ... `)
    try {
      await processFile(fp)
      console.log('ok')
    } catch (err) {
      console.log('failed')
      console.error(err)
      process.exitCode = 1
    }
  }
}

await main()
