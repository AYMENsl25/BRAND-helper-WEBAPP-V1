/*
Without AuthContext:
  Every page checks localStorage separately

  Dashboard.jsx:  const token = localStorage.getItem('token')
  Lab.jsx:        const token = localStorage.getItem('token')
  ProjectDetail:  const token = localStorage.getItem('token')
  
  Repeated code everywhere ❌
  Hard to manage ❌

With AuthContext:
  ONE place manages the auth state
  Every page just uses: const { user } = useAuth()
  Clean and professional ✅
*/


import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const res = await client.get('/auth/me')
      setUser(res.data)
    } catch (err) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

const login = (token) => {
  localStorage.setItem('token', token)
  setLoading(true)
  fetchUser()
}

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}