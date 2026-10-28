import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'

import Login from '../pages/Login.jsx'

import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import Teachers from '../pages/admin/Teachers.jsx'
import Students from '../pages/admin/Students.jsx'
import Parents from '../pages/admin/Parents.jsx'
import Classes from '../pages/admin/Classes.jsx'
import Subjects from '../pages/admin/Subjects.jsx'
import Rooms from '../pages/admin/Rooms.jsx'
import Periods from '../pages/admin/Periods.jsx'
import Timetable from '../pages/admin/Timetable.jsx'
import GenerateTimetable from '../pages/admin/GenerateTimetable.jsx'
import Conflicts from '../pages/admin/Conflicts.jsx'
import Reports from '../pages/admin/Reports.jsx'

import TeacherDashboard from '../pages/teacher/TeacherDashboard.jsx'
import TeacherTimetable from '../pages/teacher/TeacherTimetable.jsx'

import StudentDashboard from '../pages/student/StudentDashboard.jsx'
import StudentTimetable from '../pages/student/StudentTimetable.jsx'

import ParentDashboard from '../pages/parent/ParentDashboard.jsx'
import ChildTimetable from '../pages/parent/ChildTimetable.jsx'

const HOME_BY_ROLE = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/parent',
}

export default function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={HOME_BY_ROLE[user.role]} replace /> : <Login />}
      />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['ADMIN']}><Teachers /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><Students /></ProtectedRoute>} />
      <Route path="/admin/parents" element={<ProtectedRoute allowedRoles={['ADMIN']}><Parents /></ProtectedRoute>} />
      <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['ADMIN']}><Classes /></ProtectedRoute>} />
      <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['ADMIN']}><Subjects /></ProtectedRoute>} />
      <Route path="/admin/rooms" element={<ProtectedRoute allowedRoles={['ADMIN']}><Rooms /></ProtectedRoute>} />
      <Route path="/admin/periods" element={<ProtectedRoute allowedRoles={['ADMIN']}><Periods /></ProtectedRoute>} />
      <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={['ADMIN']}><Timetable /></ProtectedRoute>} />
      <Route path="/admin/generate" element={<ProtectedRoute allowedRoles={['ADMIN']}><GenerateTimetable /></ProtectedRoute>} />
      <Route path="/admin/conflicts" element={<ProtectedRoute allowedRoles={['ADMIN']}><Conflicts /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><Reports /></ProtectedRoute>} />

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/timetable" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherTimetable /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentTimetable /></ProtectedRoute>} />

      {/* Parent */}
      <Route path="/parent" element={<ProtectedRoute allowedRoles={['PARENT']}><ParentDashboard /></ProtectedRoute>} />
      <Route path="/parent/timetable" element={<ProtectedRoute allowedRoles={['PARENT']}><ChildTimetable /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={user ? HOME_BY_ROLE[user.role] : '/login'} replace />} />
    </Routes>
  )
}
