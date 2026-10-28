import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

function titleCase(s) {
  if (!s) return ''
  return s.charAt(0) + s.slice(1).toLowerCase()
}

export default function ChildTimetable() {
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTimetable = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/timetable/my/parent')
        setTimetable(res.data)
      } catch (err) {
        setError(getErrorMessage(err, "Could not load your child's timetable."))
      } finally {
        setLoading(false)
      }
    }
    loadTimetable()
  }, [])

  const className = timetable[0]?.schoolClass?.className

  return (
    <Layout title="Child Timetable">
      <div className="card">
        <h3>{className ? `Class ${className} — Weekly Timetable` : "My Child's Weekly Timetable"}</h3>
        {error && <div className="error-alert">{error}</div>}
        {loading ? (
          <Loading text="Loading timetable..." />
        ) : timetable.length === 0 ? (
          <p style={{ marginTop: 15, color: '#666' }}>No published timetable entries found yet.</p>
        ) : (
          <table style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Period</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map(t => (
                <tr key={t.id}>
                  <td>{titleCase(t.day)}</td>
                  <td>Period {t.period?.periodNumber}</td>
                  <td>{t.subject?.name}</td>
                  <td>{t.teacher?.name}</td>
                  <td>{t.room?.roomNumber ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
