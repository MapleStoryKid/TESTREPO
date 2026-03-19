export default function PopulationTable({ prefectures, years, population, groupByPref, groupColors }) {
  const fmt = v => v == null || Number.isNaN(v) ? '-' : (Math.abs(v) >= 1000 ? v.toLocaleString() : v)
  return (
    <div style={{ overflow: 'auto' }}>
      <table className="popTable">
        <thead>
          <tr>
            <th className="corner">西暦 / 都県</th>
            {prefectures.map(pref => <th key={pref} className="prefHead">{pref}</th>)}
          </tr>
        </thead>
        <tbody>
          {years.map(year => (
            <tr key={year}>
              <th className="year">{year}</th>
              {prefectures.map(pref => {
                const g = groupByPref?.[pref]
                const bg = g != null ? groupColors[g % groupColors.length] : undefined
                return (
                  <td key={`${pref}-${year}`} className="cell"
                    style={bg ? { background: bg, color: '#111', fontWeight: 600 } : undefined}>
                    {fmt(population[pref]?.[year])}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
