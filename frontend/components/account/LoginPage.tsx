'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, Eye, EyeOff, LogIn, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { loginCustomer } from '@/lib/api/auth'
import { useAuth } from '@/components/auth/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [returnTo, setReturnTo] = useState('/account')
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const r = params.get('returnTo')
    if (r) setReturnTo(r)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!contact.trim()) {
      setError('Enter your email or mobile number.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }

    setSubmitting(true)
    try {
      await loginCustomer({ contact: contact.trim(), password })
      setToast('Signed in successfully')
      await refresh()
      window.setTimeout(() => router.push(returnTo), 800)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 antialiased">
      {/* Background Image with Soil Goddess Luxury Silk Gradient */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/auth_luxury_bg.jpg" 
          alt="Soil Goddess Luxury Background" 
          className="h-full w-full object-cover object-center filter brightness-[0.95]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
      </div>

      {/* Centered Sign In Container */}
      <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/30 bg-white/95 p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-lg sm:p-10 md:p-12">
        <div className="mb-8 text-center">
          <p className="font-montserrat text-[11px] font-bold uppercase tracking-[0.25em] text-[#6B1A2A]">Welcome Back</p>
          <h1 className="font-playfair mt-1 text-3xl sm:text-4xl font-semibold tracking-wide text-gray-900">Sign In</h1>
          <p className="font-sans mt-2 text-sm text-gray-600 font-medium">Access your Soil Goddess account & orders.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700" htmlFor="login-contact">
              Email or Mobile <span className="text-[#A34336]">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="login-contact"
                type="text"
                value={contact}
                onChange={event => setContact(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#6B1A2A] focus:bg-white focus:ring-1 focus:ring-[#6B1A2A]"
                placeholder="Email or +91 mobile number"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700" htmlFor="login-password">
                Password <span className="text-[#A34336]">*</span>
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-[#6B1A2A] hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pl-10 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#6B1A2A] focus:bg-white focus:ring-1 focus:ring-[#6B1A2A]"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B1A2A]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#6B1A2A] py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md transition hover:bg-[#521220] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="absolute inset-0 z-0 origin-left scale-x-0 bg-[#3b0b15] transition-transform duration-500 group-hover:scale-x-100" />
            <span className="relative z-10 flex items-center gap-2">
              {submitting ? 'Signing In...' : 'Sign In'}
              <Sparkles className="h-4 w-4" />
            </span>
          </button>

          {error ? <p className="text-center text-xs font-medium text-[#A34336]">{error}</p> : null}
        </form>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-200/80 pt-5 text-xs text-gray-600 sm:flex-row">
          <Link href="/register" className="font-semibold text-[#6B1A2A] hover:underline">
            New here? Create an account
          </Link>
          <Link href="/cart" className="font-medium text-gray-500 hover:text-gray-800">
            Continue as guest
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-3 rounded-full bg-gray-900/90 backdrop-blur-md px-6 py-3 text-white shadow-2xl transition-all duration-300 ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 pointer-events-none opacity-0'}`}>
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        <span className="text-sm font-medium tracking-wide">{toast}</span>
      </div>
    </main>
  )
}
