import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import TimetableGrid from '../../components/TimetableGrid.jsx'
import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Timetable() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [entries, setEntries] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingTimetable, setLoadingTimetable] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true)
      setError('')
      try {
        const res = await api.get('/classes')
        setClasses(res.data)
        if (res.data.length > 0) setSelectedClass(String(res.data[0].id))
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load classes from the server.'))
      } finally {
        setLoadingClasses(false)
      }
    }
    loadClasses()
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    const loadTimetable = async () => {
      setLoadingTimetable(true)
      setError('')
      try {
        const res = await api.get(`/timetable/class/${selectedClass}`, { params: { status: 'PUBLISHED' } })
        setEntries(res.data)
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load the timetable for this class.'))
      } finally {
        setLoadingTimetable(false)
      }
    }
    loadTimetable()
  }, [selectedClass])

  const currentClassName = classes.find(c => String(c.id) === selectedClass)?.className

  return (
    <Layout title="View Generated Timetable">
      <div className="card" style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Class to View:</label>
        {loadingClasses ? (
          <span>Loading classes...</span>
        ) : (
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Published Timetable for Class {currentClassName ?? '—'}</h3>
          {entries.length > 0 && (
            <button
              style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
              onClick={async () => {
                if (!window.confirm('Are you sure you want to delete the published timetable for this class?')) return
                try {
                  await api.delete(`/timetable/class/${selectedClass}`)
                  setEntries([])
                  alert('Published timetable deleted successfully.')
                } catch (err) {
                  alert(getErrorMessage(err, 'Failed to delete timetable'))
                }
              }}
            >
              Delete Published Timetable
            </button>
          )}
        </div>
        {loadingTimetable ? (
          <Loading text="Loading timetable..." />
        ) : entries.length > 0 ? (
          <TimetableGrid entries={entries} />
        ) : (
          <p style={{ marginTop: '15px', color: '#666' }}>
            No published timetable entries for this class yet. Generate and publish one from "Generate Timetable".
          </p>
        )}
      </div>
    </Layout>
  )
}
