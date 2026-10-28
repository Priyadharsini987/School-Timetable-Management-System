import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

function titleCase(s) {
  if (!s) return ''
  return s.charAt(0) + s.slice(1).toLowerCase()
}

export default function TeacherTimetable() {
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTimetable = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/timetable/my/teacher')
        setTimetable(res.data)
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load your timetable.'))
      } finally {
        setLoading(false)
      }
    }
    loadTimetable()
  }, [])

  return (
    <Layout title="My Timetable">
      <div className="card">
        <h3>My Weekly Schedule</h3>
        {error && <div className="error-alert">{error}</div>}
        {loading ? (
          <Loading text="Loading your timetable..." />
        ) : timetable.length === 0 ? (
          <p style={{ marginTop: 15, color: '#666' }}>No published timetable entries found for you yet.</p>
        ) : (
          <table style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Period</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map(t => (
                <tr key={t.id}>
                  <td>{titleCase(t.day)}</td>
                  <td>Period {t.period?.periodNumber}</td>
                  <td>{t.schoolClass?.className}</td>
                  <td>{t.subject?.name}</td>
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
