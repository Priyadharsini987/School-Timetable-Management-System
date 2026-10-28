import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import api, { getErrorMessage } from '../../api/axios.js'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [roomNumber, setRoomNumber] = useState('')
  const [capacity, setCapacity] = useState('')
  const [type, setType] = useState('CLASSROOM')

  const loadRooms = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/rooms')
      setRooms(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load rooms from the server.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRooms() }, [])

  const resetForm = () => {
    setEditingId(null)
    setRoomNumber('')
    setCapacity('')
    setType('CLASSROOM')
    setShowForm(false)
    setActionError('')
  }

  const startEdit = (r) => {
    setEditingId(r.id)
    setRoomNumber(r.roomNumber || '')
    setCapacity(String(r.capacity ?? ''))
    setType(r.type || 'CLASSROOM')
    setShowForm(true)
    setActionError('')
  }

  const saveRoom = async () => {
    if (!roomNumber) return
    setActionError('')

    const payload = {
      roomNumber,
      capacity: Number(capacity) || 30,
      type,
    }

    try {
      if (editingId) {
        const res = await api.put(`/rooms/${editingId}`, payload)
        setRooms(rooms.map(r => (r.id === editingId ? res.data : r)))
      } else {
        const res = await api.post('/rooms', payload)
        setRooms([...rooms, res.data])
      }
      resetForm()
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not save room.'))
    }
  }

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return
    setActionError('')
    try {
      await api.delete(`/rooms/${id}`)
      setRooms(rooms.filter(r => r.id !== id))
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete room.'))
    }
  }

  return (
    <Layout title="Rooms">
      <div className="card">
        <div className="page-header">
          <h3>Campus Rooms</h3>
          <button className="btn" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : 'Add Room'}
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {actionError && <div className="error-alert">{actionError}</div>}

        {showForm && (
          <div className="add-form">
            <h4>{editingId ? 'Edit Room' : 'New Room'}</h4>
            <input placeholder="Room number (e.g. 101)" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
            <input placeholder="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="CLASSROOM">Classroom</option>
              <option value="LAB">Lab</option>
              <option value="HALL">Hall</option>
              <option value="LIBRARY">Library</option>
            </select>
            <button className="btn" onClick={saveRoom}>{editingId ? 'Update' : 'Save'}</button>
          </div>
        )}

        {loading ? (
          <Loading text="Loading rooms..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Capacity</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.roomNumber}</td>
                  <td>{r.capacity}</td>
                  <td>{r.type}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn secondary" onClick={() => startEdit(r)}>Edit</button>
                      <button className="btn danger" onClick={() => deleteRoom(r.id)}>Delete</button>
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
