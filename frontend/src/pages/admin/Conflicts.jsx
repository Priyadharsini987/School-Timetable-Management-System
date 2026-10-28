import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Conflicts() {
  const [status, setStatus] = useState('DRAFT')
  const [conflicts, setConflicts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadConflicts = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/timetable/conflicts', { params: { status } })
        setConflicts(res.data)
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load conflicts from the server.'))
      } finally {
        setLoading(false)
      }
    }
    loadConflicts()
  }, [status])

  return (
    <Layout title="Timetable Conflicts">
      <div className="card">
        <div className="page-header">
          <h3>Current Conflicts</h3>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '6px', borderRadius: '4px' }}>
            <option value="DRAFT">Draft timetable</option>
            <option value="PUBLISHED">Published timetable</option>
          </select>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {loading ? (
          <Loading text="Checking for conflicts..." />
        ) : conflicts.length === 0 ? (
          <p>No conflicts detected in the {status.toLowerCase()} timetable!</p>
        ) : (
          <ul style={{ paddingLeft: '20px' }}>
            {conflicts.map((c, idx) => (
              <li key={idx} style={{ color: 'red', marginBottom: '10px' }}>
                <strong>{c.type}:</strong> {c.details}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
