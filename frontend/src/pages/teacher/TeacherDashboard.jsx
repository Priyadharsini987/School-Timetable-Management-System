import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios.js'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [periodCount, setPeriodCount] = useState(null)

  useEffect(() => {
    api.get('/timetable/my/teacher')
      .then(res => setPeriodCount(res.data.length))
      .catch(() => setPeriodCount(null))
  }, [])

  return (
    <Layout title="Teacher Dashboard">
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>Welcome, {user?.name || 'Teacher'}</h2>
        <p>
          {periodCount === null
            ? 'Loading your schedule...'
            : `You have ${periodCount} period${periodCount === 1 ? '' : 's'} scheduled this week.`}
        </p>
      </div>

      <div className="grid">
        <Link to="/teacher/timetable" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card stat-card" style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📅</div>
            <h3>My Timetable</h3>
          </div>
        </Link>
      </div>
    </Layout>
  )
}
