import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [grade, setGrade] = useState('')
  const [section, setSection] = useState('')
  const [subjectIds, setSubjectIds] = useState([])

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects'),
      ])
      setClasses(classesRes.data)
      setSubjects(subjectsRes.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load classes from the server.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const resetForm = () => {
    setEditingId(null)
    setGrade('')
    setSection('')
    setSubjectIds([])
    setShowForm(false)
    setActionError('')
  }

  const startEdit = (c) => {
    setEditingId(c.id)
    setGrade(c.grade || '')
    setSection(c.section || '')
    setSubjectIds((c.subjects || []).map(s => String(s.id)))
    setShowForm(true)
    setActionError('')
  }

  const toggleSubject = (id) => {
    const idStr = String(id)
    setSubjectIds(prev => prev.includes(idStr) ? prev.filter(s => s !== idStr) : [...prev, idStr])
  }

  const saveClass = async () => {
    if (!grade || !section) return
    setActionError('')

    const payload = {
      className: `${grade}-${section}`,
      grade,
      section,
      subjectIds: subjectIds.map(Number),
    }

    try {
      if (editingId) {
        const res = await api.put(`/classes/${editingId}`, payload)
        setClasses(classes.map(c => (c.id === editingId ? res.data : c)))
      } else {
        const res = await api.post('/classes', payload)
        setClasses([...classes, res.data])
      }
      resetForm()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not save class.'))
    }
  }

  const deleteClass = async (id) => {
    if (!window.confirm('Delete this class?')) return
    setActionError('')
    try {
      await api.delete(`/classes/${id}`)
      setClasses(classes.filter(c => c.id !== id))
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete class.'))
    }
  }

  return (
    <Layout title="Classes">
      <div className="card">
        <div className="page-header">
          <h3>Current Classes</h3>
          <button className="btn" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : 'Add Class'}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {actionError && <div className="error-alert">{actionError}</div>}

        {showForm && (
          <div className="add-form">
            <h4>{editingId ? 'Edit Class' : 'New Class'}</h4>
            <input placeholder="Grade (e.g. 10)" value={grade} onChange={(e) => setGrade(e.target.value)} />
            <input placeholder="Section (e.g. A)" value={section} onChange={(e) => setSection(e.target.value)} />
            <div>
              <label style={{ fontSize: 13, color: '#64748b' }}>Subjects for this class:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {subjects.map(s => (
                  <label key={s.id} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="checkbox"
                      checked={subjectIds.includes(String(s.id))}
                      onChange={() => toggleSubject(s.id)}
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
            <button className="btn" onClick={saveClass}>{editingId ? 'Update' : 'Save'}</button>
          </div>
        )}

        {loading ? (
          <Loading text="Loading classes..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Grade</th>
                <th>Section</th>
                <th>Subjects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <td>{c.className}</td>
                  <td>{c.grade}</td>
                  <td>{c.section}</td>
                  <td>{(c.subjects || []).map(s => s.name).join(', ') || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn secondary" onClick={() => startEdit(c)}>Edit</button>
                      <button className="btn danger" onClick={() => deleteClass(c.id)}>Delete</button>
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
