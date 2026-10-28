import Layout from '../../components/Layout.jsx'
import TimetableGrid from '../../components/TimetableGrid.jsx'
import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../api/axios.js'

const ALL_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export default function GenerateTimetable() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [workingDays, setWorkingDays] = useState(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'])
  const [periodsPerDay, setPeriodsPerDay] = useState('6')

  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [publishMessage, setPublishMessage] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await api.get('/classes')
        setClasses(res.data)
        if (res.data.length > 0) setSelectedClass(String(res.data[0].id))
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load classes from the server.'))
      }
    }
    loadClasses()
  }, [])

  const toggleDay = (day) => {
    setWorkingDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const handleGenerate = async () => {
    if (!selectedClass) return
    setLoading(true)
    setError('')
    setPublishMessage('')
    setResult(null)
    try {
      const res = await api.post('/timetable/generate', {
        classId: Number(selectedClass),
        workingDays,
        periodsPerDay: Number(periodsPerDay) || 6,
      })
      setResult(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Timetable generation failed.'))
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!selectedClass) return
    setPublishing(true)
    setError('')
    setPublishMessage('')
    try {
      const res = await api.post(`/timetable/publish/${selectedClass}`)
      setPublishMessage(res.data.message || 'Timetable published successfully.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not publish the timetable.'))
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Layout title="Generate Timetable">
      <div className="card">
        <h3>Automatic Timetable Generation</h3>
        <p style={{ margin: '15px 0' }}>
          Choose a class and working days, then generate a draft timetable. Review it, then publish when ready.
        </p>

        {error && <div className="error-alert">{error}</div>}
        {publishMessage && <div className="add-form" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>{publishMessage}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '420px' }}>
          <div>
            <label style={{ fontWeight: 'bold', marginRight: 10 }}>Class:</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.className}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Working days:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {ALL_DAYS.map(day => (
                <label key={day} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input type="checkbox" checked={workingDays.includes(day)} onChange={() => toggleDay(day)} />
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', marginRight: 10 }}>Periods per day:</label>
            <input
              type="number"
              min="1"
              value={periodsPerDay}
              onChange={(e) => setPeriodsPerDay(e.target.value)}
              style={{ padding: '6px', width: '80px' }}
            />
          </div>
        </div>

        <button className="btn primary" onClick={handleGenerate} disabled={loading || !selectedClass} style={{ marginTop: 20 }}>
          {loading ? 'Generating...' : 'Start Generation'}
        </button>

        {result && (
          <div style={{ marginTop: '30px' }}>
            {result.unscheduledSubjects?.length > 0 && (
              <div className="error-alert">
                Could not schedule: {result.unscheduledSubjects.join(', ')}
              </div>
            )}
            {result.conflicts?.length > 0 && (
              <div className="error-alert">
                {result.conflicts.length} conflict(s) detected — see the Conflicts page for details.
              </div>
            )}

            <TimetableGrid entries={result.entries} />

            <button className="btn success" onClick={handlePublish} disabled={publishing} style={{ marginTop: 15 }}>
              {publishing ? 'Publishing...' : 'Publish This Timetable'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
