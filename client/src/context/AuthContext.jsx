import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [token, setToken]     = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(false)

  const login = async (identifier, password, role) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { identifier, password, role })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const role = user?.role
      if (role === 'student') {
        const { data } = await api.get('/students/me')
        const updated = { ...data.student, role }
        localStorage.setItem('user', JSON.stringify(updated))
        setUser(updated)
      } else if (role === 'teacher') {
        const { data } = await api.get('/teachers/me')
        const updated = { ...data.teacher, role }
        localStorage.setItem('user', JSON.stringify(updated))
        setUser(updated)
      }
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
