import { PREFECTURES } from '../data'

const norm = s => String(s ?? '').trim().replace(/\uFEFF/g, '')
const num = c => {
  if (c == null || norm(c) === '' || /^[-−—]$/.test(norm(c))) return undefined
  const n = Number(norm(c).replace(/−/g, '-'))
  return Number.isNaN(n) ? undefined : n
}

export function parseFriendshipCsv(text, prefs = PREFECTURES) {
  const rows = text.split(/\r?\n/).filter(Boolean).map(r => r.split(','))
  if (rows.length < 2) throw new Error('友好度CSVの行数が足りません')
  const header = rows[0].map(norm)
  const colOf = {}
  prefs.forEach(p => {
    const idx = header.indexOf(p)
    if (idx < 0) throw new Error(`友好度CSVに ${p} 列がありません`)
    colOf[p] = idx
  })
  const n = prefs.length
  const raw = prefs.map(() => prefs.map(() => undefined))
  prefs.forEach((p, i) => {
    const row = rows.find(r => norm(r[0]) === p)
    if (!row) return
    prefs.forEach((q, j) => { raw[i][j] = num(row[colOf[q]]) })
  })
  const scores = prefs.map(() => prefs.map(() => 0))
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      scores[i][j] = scores[j][i] = raw[i][j] ?? raw[j][i] ?? 0
  return { prefectures: prefs, scores }
}
