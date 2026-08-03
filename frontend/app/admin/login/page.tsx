'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/context/AdminAuthContext'
import { Store } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1e1e2f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#c9a96e]/20 mb-4">
            <Store className="h-7 w-7 text-[#c9a96e]" />
          </div>
          <h1 className="text-2xl font-bold text-gold">Soil Goddess Admin</h1>
          <p className="text-gold text-sm mt-1">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-burgundy/5 rounded-xl p-6 space-y-4 backdrop-blur-sm border border-gold/10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gold mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@soilgoddess.com"
              required
              className="w-full px-3 py-2.5 bg-burgundy/10 border border-gold/10 rounded-lg text-gold text-sm placeholder:text-gold focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gold mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-3 py-2.5 bg-burgundy/10 border border-gold/10 rounded-lg text-gold text-sm placeholder:text-gold focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#c9a96e] hover:bg-[#ba9a5e] text-[#1e1e2f] font-semibold rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-gold">
          Default: admin@soilgoddess.com / SoilGoddess@2026
        </p>
      </div>
    </div>
  )
}
