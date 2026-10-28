import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Students() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [password, setPassword] = useState('')
  const [classId, setClassId] = useState('')
  const [parentId, setParentId] = useState('')

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [studentsRes, classesRes, parentsRes] = await Promise.all([
        api.get('/students'),
        api.get('/classes'),
        api.get('/parents'),
      ])
      setStudents(studentsRes.data)
      setClasses(classesRes.data)
      setParents(parentsRes.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load students from the server.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setEmail('')
    setRollNo('')
    setPassword('')
    setClassId('')
    setParentId('')
    setShowForm(false)
    setActionError('')
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setName(s.name || '')
    setEmail(s.email || '')
    setRollNo(s.rollNo || '')
    setPassword('')
    setClassId(s.schoolClass?.id ? String(s.schoolClass.id) : '')
    setParentId(s.parent?.id ? String(s.parent.id) : '')
    setShowForm(true)
    setActionError('')
  }

  const saveStudent = async () => {
    if (!name || !rollNo || !email) return
    setActionError('')

    const payload = {
      name,
      rollNo,
      email,
      classId: classId ? Number(classId) : null,
      parentId: parentId ? Number(parentId) : null,
    }
    if (!editingId) payload.password = password || undefined

    try {
      if (editingId) {
        const res = await api.put(`/students/${editingId}`, payload)
        setStudents(students.map(s => (s.id === editingId ? res.data : s)))
      } else {
        const res = await api.post('/students', payload)
        setStudents([...students, res.data])
      }
      resetForm()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not save student.'))
    }
  }

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return
    setActionError('')
    try {
      await api.delete(`/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete student.'))
    }
  }

  return (
    <Layout title="Students">
      <div className="card">
        <div className="page-header">
          <h3>Current Students</h3>
          <button className="btn" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : 'Add Student'}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {actionError && <div className="error-alert">{actionError}</div>}

        {showForm && (
          <div className="add-form">
            <h4>{editingId ? 'Edit Student' : 'New Student'}</h4>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Roll No" value={rollNo} onChange={(e) => setRollNo(e.target.value)} />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {!editingId && (
              <input
                placeholder="Password (optional, default Student@123)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
            <select value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Select class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.className}</option>
              ))}
            </select>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">Select parent (optional)</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button className="btn" onClick={saveStudent}>{editingId ? 'Update' : 'Save'}</button>
          </div>
        )}

        {loading ? (
          <Loading text="Loading students..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Parent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.rollNo}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.schoolClass?.className ?? '—'}</td>
                  <td>{s.parent?.name ?? '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn secondary" onClick={() => startEdit(s)}>Edit</button>
                      <button className="btn danger" onClick={() => deleteStudent(s.id)}>Delete</button>
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
