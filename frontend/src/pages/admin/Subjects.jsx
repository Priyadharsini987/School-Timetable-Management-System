import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [periodsPerWeek, setPeriodsPerWeek] = useState('5')

  const loadSubjects = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/subjects')
      setSubjects(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load subjects from the server.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSubjects() }, [])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setCode('')
    setPeriodsPerWeek('5')
    setShowForm(false)
    setActionError('')
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setName(s.name || '')
    setCode(s.code || '')
    setPeriodsPerWeek(String(s.periodsPerWeek ?? 5))
    setShowForm(true)
    setActionError('')
  }

  const saveSubject = async () => {
    if (!name || !code) return
    setActionError('')

    const payload = {
      name,
      code,
      periodsPerWeek: Number(periodsPerWeek) || 5,
    }

    try {
      if (editingId) {
        const res = await api.put(`/subjects/${editingId}`, payload)
        setSubjects(subjects.map(s => (s.id === editingId ? res.data : s)))
      } else {
        const res = await api.post('/subjects', payload)
        setSubjects([...subjects, res.data])
      }
      resetForm()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not save subject.'))
    }
  }

  const deleteSubject = async (id) => {
    if (!window.confirm('Delete this subject?')) return
    setActionError('')
    try {
      await api.delete(`/subjects/${id}`)
      setSubjects(subjects.filter(s => s.id !== id))
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete subject.'))
    }
  }

  return (
    <Layout title="Subjects">
      <div className="card">
        <div className="page-header">
          <h3>Course Subjects</h3>
          <button className="btn" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : 'Add Subject'}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {actionError && <div className="error-alert">{actionError}</div>}

        {showForm && (
          <div className="add-form">
            <h4>{editingId ? 'Edit Subject' : 'New Subject'}</h4>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Code (e.g. MATH101)" value={code} onChange={(e) => setCode(e.target.value)} />
            <input
              placeholder="Periods per week"
              type="number"
              min="1"
              value={periodsPerWeek}
              onChange={(e) => setPeriodsPerWeek(e.target.value)}
            />
            <button className="btn" onClick={saveSubject}>{editingId ? 'Update' : 'Save'}</button>
          </div>
        )}

        {loading ? (
          <Loading text="Loading subjects..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Periods/Week</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.code}</td>
                  <td>{s.periodsPerWeek}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn secondary" onClick={() => startEdit(s)}>Edit</button>
                      <button className="btn danger" onClick={() => deleteSubject(s.id)}>Delete</button>
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
