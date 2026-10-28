import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const MENUS = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/teachers', label: 'Teachers' },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/parents', label: 'Parents' },
    { to: '/admin/classes', label: 'Classes' },
    { to: '/admin/subjects', label: 'Subjects' },
    { to: '/admin/rooms', label: 'Rooms' },
    { to: '/admin/periods', label: 'Periods' },
    { to: '/admin/timetable', label: 'Published Timetable' },
    { to: '/admin/generate', label: 'Generate Timetable' },
    { to: '/admin/conflicts', label: 'Conflicts' },
    { to: '/admin/reports', label: 'Reports' },
  ],
  TEACHER: [
    { to: '/teacher', label: 'Dashboard', end: true },
    { to: '/teacher/timetable', label: 'My Timetable' },
  ],
  STUDENT: [
    { to: '/student', label: 'Dashboard', end: true },
    { to: '/student/timetable', label: 'My Timetable' },
  ],
  PARENT: [
    { to: '/parent', label: 'Dashboard', end: true },
    { to: '/parent/timetable', label: "Child's Timetable" },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menu = MENUS[user.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="sidebar">
      <div className="brand">
        School Timetable
        <br />
        Management System
      </div>
      <nav>
        {menu.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {item.label}
          </NavLink>
        ))}
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  )
}
