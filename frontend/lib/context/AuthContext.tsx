'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { CustomerData } from '@/lib/services/auth.service'
import { fetchProfile } from '@/lib/services/auth.service'

type AuthContextValue = {
  customer: CustomerData | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  setAuth: (token: string, customer: CustomerData) => void
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

function getStoredCustomer(): CustomerData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth_customer')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

function storeCustomer(customer: CustomerData | null) {
  if (typeof window === 'undefined') return
  if (customer) {
    localStorage.setItem('auth_customer', JSON.stringify(customer))
  } else {
    localStorage.removeItem('auth_customer')
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getStoredToken)
  const [customer, setCustomerState] = useState<CustomerData | null>(getStoredCustomer)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!token) return
    try {
      const profile = await fetchProfile()
      setCustomerState(profile)
      storeCustomer(profile)
    } catch {
      setTokenState(null)
      setCustomerState(null)
      storeToken(null)
      storeCustomer(null)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      refreshProfile().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [token, refreshProfile])

  const setAuth = useCallback((newToken: string, newCustomer: CustomerData) => {
    setTokenState(newToken)
    setCustomerState(newCustomer)
    storeToken(newToken)
    storeCustomer(newCustomer)
  }, [])

  const logout = useCallback(() => {
    setTokenState(null)
    setCustomerState(null)
    storeToken(null)
    storeCustomer(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      customer,
      token,
      isLoading,
      isAuthenticated: !!token && !!customer,
      setAuth,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
