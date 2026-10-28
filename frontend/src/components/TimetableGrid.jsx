function titleCase(s) {
  if (!s) return ''
  return s.charAt(0) + s.slice(1).toLowerCase()
}

export default function TimetableGrid({ entries = [] }) {
  const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

  const daysPresent = Array.from(new Set(entries.map(e => e.day)))
  const days = DAY_ORDER.filter(d => daysPresent.includes(d))
  const finalDays = days.length ? days : DAY_ORDER.slice(0, 5)

  const periodsPresent = Array.from(
    new Map(
      entries
        .filter(e => e.period)
        .map(e => [e.period.periodNumber, e.period])
    ).values()
  ).sort((a, b) => a.periodNumber - b.periodNumber)

  const finalPeriods = periodsPresent.length ? periodsPresent : [1, 2, 3, 4].map(n => ({ periodNumber: n }))

  const findEntry = (day, periodNumber) =>
    entries.find(e => e.day === day && e.period?.periodNumber === periodNumber)

  return (
    <div className="timetable-wrapper">
      <table className="timetable-grid">
        <thead>
          <tr>
            <th>Period</th>
            {finalDays.map(day => <th key={day}>{titleCase(day)}</th>)}
          </tr>
        </thead>
        <tbody>
          {finalPeriods.map(period => (
            <tr key={period.periodNumber}>
              <td>
                <strong>Period {period.periodNumber}</strong>
                {period.startTime && (
                  <>
                    <br />
                    <small>{period.startTime?.slice(0, 5)} - {period.endTime?.slice(0, 5)}</small>
                  </>
                )}
              </td>
              {finalDays.map(day => {
                const entry = findEntry(day, period.periodNumber)
                return (
                  <td key={day}>
                    {entry ? (
                      <>
                        <strong>{entry.subject?.name}</strong><br />
                        <small>{entry.teacher?.name}</small><br />
                        <small>Room: {entry.room?.roomNumber ?? '—'}</small>
                      </>
                    ) : '-'}
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
