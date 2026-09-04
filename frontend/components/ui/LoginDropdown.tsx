'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { User, X } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext'
import { loginCustomer, forgotPassword, resetPassword as resetPasswordApi } from '@/lib/api/auth'

type LoginMode = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'
type MessageState = { text: string; type: 'success' | 'error' }

export default function LoginDropdown() {
  const router = useRouter()
  const { session, refresh } = useAuth()
  const isAuthenticated = !!session
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<LoginMode>('login')
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [message, setMessage] = useState<MessageState | null>(null)
  const [loading, setLoading] = useState(false)

  function resetForgotFields() {
    setOtp('')
    setNewPassword('')
    setConfirmNewPassword('')
    setMessage(null)
  }

  function closeDropdown() {
    setOpen(false)
    setMode('login')
    setMessage(null)
  }

  async function handleLogin() {
    const email = contact.includes('@') ? contact : ''
    const mobile = !email ? contact : ''

    if (!email && !mobile) {
      setMessage({ text: 'Enter your email or mobile number.', type: 'error' })
      return
    }

    if (!password) {
      setMessage({ text: 'Enter your password.', type: 'error' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await loginCustomer({ contact: email || mobile, password })
      await refresh()
      closeDropdown()
      router.push('/account')
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Login failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function sendForgotOtp() {
    const email = forgotEmail.trim()
    if (!email) {
      setMessage({ text: 'Enter registered email to continue.', type: 'error' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const result = await forgotPassword(email)
      setMessage({ text: result.message, type: 'success' })
      setMode('forgot-reset')
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Failed to send OTP', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function resetPasswordAction() {
    const email = forgotEmail.trim()
    const nextOtp = otp.trim()
    if (!newPassword || newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters.', type: 'error' })
      return
    }
    if (newPassword !== confirmNewPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const result = await resetPasswordApi(nextOtp, email, newPassword)
      setMessage({ text: result.message, type: 'success' })
      setContact(email)
      setPassword('')
      setMode('login')
      resetForgotFields()
      setMessage({ text: 'Password reset successfully. Please sign in.', type: 'success' })
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Reset failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit() {
    if (mode === 'login') { void handleLogin(); return }
    if (mode === 'forgot-email') { void sendForgotOtp(); return }
    if (mode === 'forgot-reset') { void resetPasswordAction(); return }
  }

  const titleByMode: Record<LoginMode, string> = {
    login: 'Welcome Back',
    'forgot-email': 'Forgot Password',
    'forgot-otp': 'Verify OTP',
    'forgot-reset': 'Reset Password',
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={`action-item group flex flex-col items-center gap-1 rounded-lg border-none bg-transparent px-1.5 xl:px-2 py-1 transition-all duration-300 hover:scale-105 active:scale-95 no-underline`}
        onClick={() => {
          if (isAuthenticated) {
            router.push('/account')
            return
          }
          setOpen(current => !current)
          setMode('login')
          setMessage(null)
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <User
          size={24}
          color="var(--burgundy)"
          strokeWidth={1.6}
          className={`transition-colors duration-300 ${open ? 'fill-[#9c1a21]' : 'fill-transparent group-hover:fill-[#9c1a21] group-active:fill-[#9c1a21]'}`}
        />
        <span className="text-[10.5px] xl:text-[11.5px] tracking-wide whitespace-nowrap hidden md:block" style={{ color: 'var(--muted)', fontWeight: 500 }}>
          Account
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg p-5"
          style={{
            background: 'white',
            border: '1px solid var(--ivory-dark)',
            boxShadow: '0 12px 40px rgba(107,26,42,0.14)',
          }}
        >
          <form
            onSubmit={event => {
              event.preventDefault()
              handleSubmit()
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy)', fontWeight: 700 }}>
                {titleByMode[mode]}
              </h3>
              <button
                type="button"
                onClick={closeDropdown}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--gold-pale)]"
                style={{ color: 'var(--burgundy)', border: '1px solid var(--ivory-dark)' }}
                aria-label="Close login"
              >
                <X size={16} />
              </button>
            </div>

            {mode === 'login' ? (
              <>
                <label className="mb-1 block text-xs tracking-wide" style={{ color: 'var(--muted)', fontWeight: 500 }}>
                  Mobile / Email
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={event => setContact(event.target.value)}
                  placeholder="+91 or email address"
                  autoComplete="email"
                  className="mb-3 w-full rounded text-sm outline-none"
                  style={{
                    padding: '9px 12px',
                    border: '1.5px solid var(--ivory-dark)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />

                <label className="mb-1 block text-xs tracking-wide" style={{ color: 'var(--muted)', fontWeight: 500 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="mb-2 w-full rounded text-sm outline-none"
                  style={{
                    padding: '9px 12px',
                    border: '1.5px solid var(--ivory-dark)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />

                <div className="mb-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(contact.includes('@') ? contact : '')
                      setMode('forgot-email')
                      setMessage(null)
                    }}
                    className="text-xs font-semibold underline-offset-4 hover:underline"
                    style={{ color: 'var(--burgundy)' }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mb-3 w-full rounded py-2.5 text-sm font-semibold text-gold disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: 'var(--burgundy)', border: 'none', cursor: 'pointer', letterSpacing: '0.3px' }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </>
            ) : null}

            {mode === 'forgot-email' ? (
              <>
                <p className="mb-3 text-xs leading-5" style={{ color: 'var(--muted)' }}>
                  Enter your registered email. We will send an OTP to reset your password.
                </p>
                <label className="mb-1 block text-xs tracking-wide" style={{ color: 'var(--muted)', fontWeight: 500 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={event => setForgotEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="mb-3 w-full rounded text-sm outline-none"
                  style={{
                    padding: '9px 12px',
                    border: '1.5px solid var(--ivory-dark)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mb-3 w-full rounded py-2.5 text-sm font-semibold text-gold disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: 'var(--burgundy)', border: 'none', cursor: 'pointer', letterSpacing: '0.3px' }}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </>
            ) : null}

            {mode === 'forgot-otp' ? (
              <>
                <p className="mb-3 text-xs leading-5" style={{ color: 'var(--muted)' }}>
                  OTP sent to <span className="font-semibold text-[var(--burgundy)]">{forgotEmail}</span>. Enter it below to verify.
                </p>
                <label className="mb-1 block text-xs tracking-wide" style={{ color: 'var(--muted)', fontWeight: 500 }}>
                  OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={event => setOtp(event.target.value)}
                  placeholder="6-digit OTP"
                  className="mb-3 w-full rounded text-sm outline-none"
                  style={{
                    padding: '9px 12px',
                    border: '1.5px solid var(--ivory-dark)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mb-3 w-full rounded py-2.5 text-sm font-semibold text-gold disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: 'var(--burgundy)', border: 'none', cursor: 'pointer', letterSpacing: '0.3px' }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => void sendForgotOtp()}
                  disabled={loading}
                  className="mb-3 w-full rounded border py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ borderColor: 'var(--ivory-dark)', color: 'var(--burgundy)' }}
                >
                  Resend OTP
                </button>
              </>
            ) : null}

            {mode === 'forgot-reset' ? (
              <>
                <label className="mb-1 block text-xs tracking-wide" style={{ color: 'var(--muted)', fontWeight: 500 }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={event => setNewPassword(event.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                  className="mb-3 w-full rounded text-sm outline-none"
                  style={{
                    padding: '9px 12px',
                    border: '1.5px solid var(--ivory-dark)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
                <label className="mb-1 block text-xs tracking-wide" style={{ color: 'var(--muted)', fontWeight: 500 }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={event => setConfirmNewPassword(event.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="mb-3 w-full rounded text-sm outline-none"
                  style={{
                    padding: '9px 12px',
                    border: '1.5px solid var(--ivory-dark)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mb-3 w-full rounded py-2.5 text-sm font-semibold text-gold disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: 'var(--burgundy)', border: 'none', cursor: 'pointer', letterSpacing: '0.3px' }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            ) : null}

            {mode !== 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  resetForgotFields()
                }}
                className="mb-3 w-full rounded border py-2.5 text-sm font-semibold"
                style={{ borderColor: 'var(--ivory-dark)', color: 'var(--burgundy)' }}
              >
                Back to Sign In
              </button>
            ) : null}

            {message ? (
              <p
                className="mb-3 rounded px-3 py-2 text-center text-xs font-medium"
                style={{
                  background: message.type === 'success' ? '#F1F7EA' : '#FDF6F5',
                  color: message.type === 'success' ? '#4E7D2A' : 'var(--burgundy)',
                }}
              >
                {message.text}
              </p>
            ) : null}

            <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
              New here?{' '}
              <Link href="/register" onClick={closeDropdown} style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>
                Create Account
              </Link>{' '}
              ·{' '}
              <Link href="/checkout" onClick={closeDropdown} style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>
                Guest Checkout
              </Link>
            </p>
          </form>
        </div>
      ) : null}
    </div>
  )
}
