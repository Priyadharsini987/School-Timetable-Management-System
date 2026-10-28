import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Loading from '../../components/Loading.jsx'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../../api/axios.js'

const STAT_CONFIG = [
  { key: 'classes', label: 'Classes', link: '/admin/classes', icon: '🏫', endpoint: '/classes' },
  { key: 'teachers', label: 'Teachers', link: '/admin/teachers', icon: '👩‍🏫', endpoint: '/teachers' },
  { key: 'students', label: 'Students', link: '/admin/students', icon: '👨‍🎓', endpoint: '/students' },
  { key: 'rooms', label: 'Rooms', link: '/admin/rooms', icon: '🚪', endpoint: '/rooms' },
  { key: 'subjects', label: 'Subjects', link: '/admin/subjects', icon: '📚', endpoint: '/subjects' },
  { key: 'parents', label: 'Parents', link: '/admin/parents', icon: '👪', endpoint: '/parents' },
]

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCounts = async () => {
      setLoading(true)
      setError('')
      try {
        const results = await Promise.allSettled(STAT_CONFIG.map(s => api.get(s.endpoint)))
        const next = {}
        STAT_CONFIG.forEach((s, i) => {
          const res = results[i]
          next[s.key] = res.status === 'fulfilled' && Array.isArray(res.value?.data) ? res.value.data.length : 0
        })
        setCounts(next)
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load dashboard data from the server.'))
        setCounts({})
      } finally {
        setLoading(false)
      }
    }
    loadCounts()
  }, [])

  return (
    <Layout title="Admin Dashboard">
      {error && <div className="error-alert">{error}</div>}
      {loading ? (
        <Loading text="Loading dashboard..." />
      ) : (
        <div className="stat-grid">
          {STAT_CONFIG.map((s) => (
            <Link key={s.key} to={s.link} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card stat-card" style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{s.icon}</div>
                <h3>{s.label}</h3>
                <div className="value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {counts?.[s.key] ?? 0}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}
