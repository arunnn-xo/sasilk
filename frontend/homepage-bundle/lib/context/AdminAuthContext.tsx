'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { adminLogin, adminLogout, fetchAdminProfile, type AdminData } from '@/lib/services/admin.service'

type AdminAuthContextType = {
  admin: AdminData | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    if (stored) {
      setToken(stored)
      fetchAdminProfile()
        .then(res => setAdmin(res.admin))
        .catch(() => {
          localStorage.removeItem('admin_token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminLogin(email, password)
    localStorage.setItem('admin_token', 'logged-in')
    setAdmin(res.admin)
    setToken('logged-in')
  }, [])

  const logout = useCallback(async () => {
    try { await adminLogout() } catch { /* ignore */ }
    localStorage.removeItem('admin_token')
    setAdmin(null)
    setToken(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, token, isLoading, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
