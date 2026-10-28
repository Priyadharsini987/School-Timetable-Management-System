import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios.js'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [className, setClassName] = useState(null)

  useEffect(() => {
    api.get('/timetable/my/student')
      .then(res => setClassName(res.data[0]?.schoolClass?.className ?? null))
      .catch(() => setClassName(null))
  }, [])

  return (
    <Layout title="Student Dashboard">
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>Welcome, {user?.name || 'Student'}</h2>
        <p>{className ? `You are in Class ${className}.` : 'Your class timetable will appear once available.'}</p>
      </div>

      <div className="grid">
        <Link to="/student/timetable" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card stat-card" style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📅</div>
            <h3>My Timetable</h3>
          </div>
        </Link>
      </div>
    </Layout>
  )
}
