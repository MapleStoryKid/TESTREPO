export function findBestGrouping(scores, prefectures, maxGroups = 3) {
  const n = scores.length
  if (n === 0) return { totalScore: 0, groups: [], groupByPref: {} }
  const k = Math.min(maxGroups, n)
  const groupBy = new Array(n).fill(0)
  let best = { score: -Infinity, arr: null }

  const score = () => {
    let s = 0
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
      if (groupBy[i] === groupBy[j]) s += scores[i][j]
    return s
  }
  const dfs = (i, used) => {
    if (i === n) {
      const s = score()
      if (s > best.score) best = { score: s, arr: [...groupBy] }
      return
    }
    for (let g = 0; g < used; g++) { groupBy[i] = g; dfs(i + 1, used) }
    if (used < k) { groupBy[i] = used; dfs(i + 1, used + 1) }
  }
  dfs(1, 1)

  const groups = Array.from({ length: k }, () => [])
  best.arr.forEach((g, i) => groups[g].push(prefectures[i]))
  const used = groups.filter(gg => gg.length > 0)
  const groupByPref = {}
  used.forEach((gg, i) => gg.forEach(p => groupByPref[p] = i))
  return { totalScore: best.score, groups: used, groupByPref }
}
