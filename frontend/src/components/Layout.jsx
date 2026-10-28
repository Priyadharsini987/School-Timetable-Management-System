import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

export default function Layout({ title, children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} />
        {children}
      </div>
    </div>
  )
}
