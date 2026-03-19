import { PREF_CODES } from '../data'

const pick = (o, ...keys) => { for (const k of keys) if (o?.[k] !== undefined) return o[k] }
const toYear = (t) => { const m = String(t).match(/(\d{4})/); return m ? +m[1] : undefined }
const toPref = (cd) => Object.entries(PREF_CODES).find(([, c]) => c === String(cd).trim().slice(-2).padStart(2, '0'))?.[0]
const toNum = (v) => { if (v == null || String(v).trim() === '') return; const n = Number(String(v).replace(/,/g, '')); return Number.isNaN(n) ? undefined : n }

function collect(obj, out = [], seen = new Set(), depth = 0) {
  if (depth > 25 || !obj || typeof obj !== 'object' || seen.has(obj)) return out
  seen.add(obj)
  for (const node of (Array.isArray(obj) ? obj : [obj])) {
    if (!node || typeof node !== 'object') continue
    const a = pick(node, 'cdArea', 'CD_AREA', 'cdAreaCode', 'CD_AREA_CODE', '@area')
    const t = pick(node, 'time', 'TIME', 'year', 'YEAR', 'timeValue', '@time')
    const val = pick(node, 'value', 'VALUE', 'dataValue', 'val', '@value')
    const n = toNum(val)
    if (a != null && t != null && n != null) out.push({ cdArea: String(a), time: String(t), value: n })
    for (const v of Object.values(node)) collect(v, out, seen, depth + 1)
  }
  return out
}

export async function fetchPopulationFromEst({ appId, statsDataId, cdArea }) {
  const res = await fetch('https://api.e-stat.go.jp/rest/3.0/app/getStatsData', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId, statsDataId, metaGetFlg: 'Y', cdAreaL: cdArea.join(',') }),
  })
  const raw = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text()
  if (!res.ok) throw new Error(`e-Stat API HTTP ${res.status}`)
  const points = collect(raw)
  const matrix = {}
  for (const p of points) {
    const pref = toPref(p.cdArea)
    const year = toYear(p.time)
    if (pref && year) (matrix[pref] ??= {})[year] = p.value
  }
  return { populationMatrix: Object.keys(matrix).length ? matrix : null, raw }
}
