import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Periods() {
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [periodNumber, setPeriodNumber] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const loadPeriods = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/periods')
      setPeriods(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load periods from the server.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPeriods() }, [])

  const resetForm = () => {
    setEditingId(null)
    setPeriodNumber('')
    setStartTime('')
    setEndTime('')
    setShowForm(false)
    setActionError('')
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setPeriodNumber(String(p.periodNumber ?? ''))
    setStartTime((p.startTime || '').slice(0, 5))
    setEndTime((p.endTime || '').slice(0, 5))
    setShowForm(true)
    setActionError('')
  }

  const savePeriod = async () => {
    if (!startTime || !endTime) return
    setActionError('')

    const payload = {
      periodNumber: Number(periodNumber) || periods.length + 1,
      startTime,
      endTime,
    }

    try {
      if (editingId) {
        const res = await api.put(`/periods/${editingId}`, payload)
        setPeriods(periods.map(p => (p.id === editingId ? res.data : p)))
      } else {
        const res = await api.post('/periods', payload)
        setPeriods([...periods, res.data])
      }
      resetForm()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not save period.'))
    }
  }

  const deletePeriod = async (id) => {
    if (!window.confirm('Delete this period?')) return
    setActionError('')
    try {
      await api.delete(`/periods/${id}`)
      setPeriods(periods.filter(p => p.id !== id))
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete period.'))
    }
  }

  return (
    <Layout title="Periods">
      <div className="card">
        <div className="page-header">
          <h3>Class Periods Schedule</h3>
          <button className="btn" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : 'Add Period'}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {actionError && <div className="error-alert">{actionError}</div>}

        {showForm && (
          <div className="add-form">
            <h4>{editingId ? 'Edit Period' : 'New Period'}</h4>
            <input
              placeholder={`Period number (e.g. ${periods.length + 1})`}
              type="number"
              min="1"
              value={periodNumber}
              onChange={(e) => setPeriodNumber(e.target.value)}
            />
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            <button className="btn" onClick={savePeriod}>{editingId ? 'Update' : 'Save'}</button>
          </div>
        )}

        {loading ? (
          <Loading text="Loading periods..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Period No.</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.id}>
                  <td>Period {p.periodNumber}</td>
                  <td>{(p.startTime || '').slice(0, 5)}</td>
                  <td>{(p.endTime || '').slice(0, 5)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn secondary" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn danger" onClick={() => deletePeriod(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
