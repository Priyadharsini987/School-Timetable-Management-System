import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [password, setPassword] = useState('')
  const [subjectIds, setSubjectIds] = useState([])

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [teachersRes, subjectsRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/subjects'),
      ])
      setTeachers(teachersRes.data)
      setSubjects(subjectsRes.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load teachers from the server.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setEmail('')
    setPhone('')
    setDepartment('')
    setPassword('')
    setSubjectIds([])
    setShowForm(false)
    setActionError('')
  }

  const startEdit = (t) => {
    setEditingId(t.id)
    setName(t.name || '')
    setEmail(t.email || '')
    setPhone(t.phone || '')
    setDepartment(t.department || '')
    setPassword('')
    setSubjectIds((t.subjects || []).map(s => String(s.id)))
    setShowForm(true)
    setActionError('')
  }

  const toggleSubject = (id) => {
    const idStr = String(id)
    setSubjectIds(prev => prev.includes(idStr) ? prev.filter(s => s !== idStr) : [...prev, idStr])
  }

  const saveTeacher = async () => {
    if (!name || !email) return
    setActionError('')

    const payload = {
      name,
      email,
      phone,
      department,
      subjectIds: subjectIds.map(Number),
    }
    if (!editingId) payload.password = password || undefined

    try {
      if (editingId) {
        const res = await api.put(`/teachers/${editingId}`, payload)
        setTeachers(teachers.map(t => (t.id === editingId ? res.data : t)))
      } else {
        const res = await api.post('/teachers', payload)
        setTeachers([...teachers, res.data])
      }
      resetForm()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not save teacher.'))
    }
  }

  const deleteTeacher = async (id) => {
    if (!window.confirm('Delete this teacher?')) return
    setActionError('')
    try {
      await api.delete(`/teachers/${id}`)
      setTeachers(teachers.filter(t => t.id !== id))
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete teacher.'))
    }
  }

  return (
    <Layout title="Teachers">
      <div className="card">
        <div className="page-header">
          <h3>Teaching Staff</h3>
          <button className="btn" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : 'Add Teacher'}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {actionError && <div className="error-alert">{actionError}</div>}

        {showForm && (
          <div className="add-form">
            <h4>{editingId ? 'Edit Teacher' : 'New Teacher'}</h4>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            {!editingId && (
              <input
                placeholder="Password (optional, default Teacher@123)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
            <div>
              <label style={{ fontSize: 13, color: '#64748b' }}>Subjects taught:</label>
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
            <button className="btn" onClick={saveTeacher}>{editingId ? 'Update' : 'Save'}</button>
          </div>
        )}

        {loading ? (
          <Loading text="Loading teachers..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Subjects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.phone ?? '—'}</td>
                  <td>{t.department ?? '—'}</td>
                  <td>{(t.subjects || []).map(s => s.name).join(', ') || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn secondary" onClick={() => startEdit(t)}>Edit</button>
                      <button className="btn danger" onClick={() => deleteTeacher(t.id)}>Delete</button>
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
