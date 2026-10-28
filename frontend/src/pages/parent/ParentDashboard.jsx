import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios.js'

export default function ParentDashboard() {
  const { user } = useAuth()
  const [className, setClassName] = useState(null)

  useEffect(() => {
    api.get('/timetable/my/parent')
      .then(res => setClassName(res.data[0]?.schoolClass?.className ?? null))
      .catch(() => setClassName(null))
  }, [])

  return (
    <Layout title="Parent Dashboard">
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>Welcome, {user?.name || 'Parent'}</h2>
        <p>{className ? `Your child is enrolled in Class ${className}.` : "Your child's class timetable will appear once available."}</p>
      </div>

      <div className="grid">
        <Link to="/parent/timetable" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card stat-card" style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📅</div>
            <h3>View Child's Timetable</h3>
          </div>
        </Link>
      </div>
    </Layout>
  )
}
