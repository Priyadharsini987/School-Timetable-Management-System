import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar({ title }) {
  const { user } = useAuth()
  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div>
        <strong>{user?.name}</strong>{' '}
        <span style={{ color: '#64748b', fontSize: 13 }}>({user?.role})</span>
      </div>
    </div>
  )
}
