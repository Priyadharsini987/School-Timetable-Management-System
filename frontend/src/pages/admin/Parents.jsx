import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Parents() {
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const loadParents = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/parents')
      setParents(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load parents from the server.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadParents() }, [])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setShowForm(false)
    setActionError('')
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setName(p.name || '')
    setEmail(p.email || '')
    setPhone(p.phone || '')
    setPassword('')
    setShowForm(true)
    setActionError('')
  }

  const saveParent = async () => {
    if (!name || !email) return
    setActionError('')

    const payload = { name, email, phone }
    if (!editingId) payload.password = password || undefined

    try {
      if (editingId) {
        const res = await api.put(`/parents/${editingId}`, payload)
        setParents(parents.map(p => (p.id === editingId ? res.data : p)))
      } else {
        const res = await api.post('/parents', payload)
        setParents([...parents, res.data])
      }
      resetForm()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not save parent.'))
    }
  }

  const deleteParent = async (id) => {
    if (!window.confirm('Delete this parent?')) return
    setActionError('')
    try {
      await api.delete(`/parents/${id}`)
      setParents(parents.filter(p => p.id !== id))
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete parent.'))
    }
  }

  return (
    <Layout title="Parents">
      <div className="card">
        <div className="page-header">
          <h3>Registered Parents</h3>
          <button className="btn" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : 'Add Parent'}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {actionError && <div className="error-alert">{actionError}</div>}

        {showForm && (
          <div className="add-form">
            <h4>{editingId ? 'Edit Parent' : 'New Parent'}</h4>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {!editingId && (
              <input
                placeholder="Password (optional, default Parent@123)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
            <button className="btn" onClick={saveParent}>{editingId ? 'Update' : 'Save'}</button>
          </div>
        )}

        {loading ? (
          <Loading text="Loading parents..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parents.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone ?? '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn secondary" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn danger" onClick={() => deleteParent(p.id)}>Delete</button>
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
