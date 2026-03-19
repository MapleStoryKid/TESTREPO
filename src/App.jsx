import { useMemo, useState } from 'react'
import './App.css'
import PopulationTable from './components/PopulationTable'
import { PREFECTURES, PREF_CODES, SAMPLE_POP } from './data'
import { findBestGrouping } from './lib/grouping'
import { parseFriendshipCsv } from './lib/friendship'
import { fetchPopulationFromEst } from './lib/estat'

const COLORS = ['#4e79a7', '#f28e2b', '#e15759']

export default function App() {
  const [population, setPopulation] = useState(SAMPLE_POP)
  const [msg, setMsg] = useState('')
  const [appId, setAppId] = useState(() => localStorage.getItem('estat_appId') ?? '17f4edb5e3683b1e186402e0b69bd7837dbc99e5')
  const [statsDataId, setStatsDataId] = useState('')
  const [scores, setScores] = useState(null)
  const [csvName, setCsvName] = useState('')

  const years = useMemo(() => {
    const y = new Set()
    PREFECTURES.forEach(pref => Object.keys(population[pref] || {}).forEach(yr => y.add(+yr)))
    return [...y].sort((a, b) => b - a)
  }, [population])

  const grouping = useMemo(() => {
    if (!scores) return null
    try { return findBestGrouping(scores, PREFECTURES, 3) } catch { return null }
  }, [scores])

  const fetchEst = async () => {
    setMsg('取得中...')
    localStorage.setItem('estat_appId', appId)
    try {
      const { populationMatrix, raw } = await fetchPopulationFromEst({
        appId, statsDataId, cdArea: Object.values(PREF_CODES),
      })
      if (populationMatrix) { setPopulation(populationMatrix); setMsg('ライブ取得成功') }
      else { setMsg('ライブ取得に失敗'); console.log('e-stat raw:', raw) }
    } catch (e) { setMsg(`エラー: ${e?.message ?? e}`) }
  }

  const onCsv = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setCsvName(f.name)
    try {
      const { scores: s } = parseFriendshipCsv(await f.text(), PREFECTURES)
      setScores(s)
    } catch (e) { setMsg(`CSVエラー: ${e.message}`) }
  }

  return (
    <div className="app">
      <header className="appHeader">
        <h1>e-Stat（首都圏の総人口）× 友好度グルーピング</h1>
        <p className="sub">友好度CSVの最適グループ化（最大3グループ）に基づき、人口表を色分けします。</p>
      </header>

      <main className="layout">
        <section className="card">
          <h2>1. e-Stat から人口取得</h2>
          <p className="muted">appId と statsDataId を入力してライブ取得</p>
          <div className="grid2">
            <label className="field">
              <span>e-Stat appId</span>
              <input value={appId} onChange={e => setAppId(e.target.value)} placeholder="XXXX" />
            </label>
            <label className="field">
              <span>statsDataId</span>
              <input value={statsDataId} onChange={e => setStatsDataId(e.target.value)} placeholder="例: 0000000000" />
            </label>
          </div>
          <div className="row">
            <button onClick={fetchEst} disabled={!appId || !statsDataId}>ライブ取得</button>
            <button onClick={() => { setPopulation(SAMPLE_POP); setMsg('サンプルに戻しました') }}>サンプルに戻す</button>
          </div>
          {msg && <div className="status">{msg}</div>}
        </section>

        <section className="card">
          <h2>2. 友好度CSV → 最適グループ化</h2>
          <p className="muted">x,都県1,都県2,... 形式のCSV</p>
          <label className="fileBtn">
            CSVを選択
            <input type="file" accept=".csv,text/csv" onChange={onCsv} />
          </label>
          {csvName && <div className="status">選択: {csvName}</div>}
          {grouping ? (
            <div className="legend">
              <h3>最大友好度合計: {grouping.totalScore}</h3>
              <div className="groupList">
                {grouping.groups.map((g, i) => (
                  <div key={i} className="groupChip">
                    <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>グループ{i + 1}: {g.join('、')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="muted">CSVを読み込むと表が色分けされます</div>}
        </section>

        <section className="card wide">
          <h2>3. 人口表（色分け）</h2>
          <PopulationTable
            prefectures={PREFECTURES}
            years={years}
            population={population}
            groupByPref={grouping?.groupByPref ?? null}
            groupColors={COLORS}
          />
        </section>
      </main>
    </div>
  )
}
