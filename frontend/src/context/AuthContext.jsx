import { createContext, useContext, useState } from 'react'
import api, { getErrorMessage } from '../api/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

 
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, name, email: userEmail, role } = res.data
      const userData = { name, email: userEmail, role }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Invalid email or password'))
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
