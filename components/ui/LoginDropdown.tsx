'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { User, X } from 'lucide-react'
import { apiFetch } from '@/lib/api'

type LoginMode = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'
type MessageState = {
  text: string
  type: 'success' | 'error'
}

async function readApiMessage(response: Response) {
  const data = (await response.json().catch(() => null)) as { message?: string } | null
  return data?.message || (response.ok ? 'Done successfully' : 'Something went wrong')
}

const ACCOUNT_READY_KEY = 'soil_goddess_account_ready'

export default function LoginDropdown() {
  const router = useRouter()
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

  function goToAccount() {
    window.localStorage.setItem(ACCOUNT_READY_KEY, 'true')
    closeDropdown()
    router.push('/account')
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
      const response = await apiFetch('/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const apiMessage = await readApiMessage(response)

      setMessage({ text: apiMessage, type: response.ok ? 'success' : 'error' })
      if (response.ok) setMode('forgot-otp')
    } catch {
      setMessage({ text: 'Backend connection failed. Please check API URL and server status.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    const email = forgotEmail.trim()
    const nextOtp = otp.trim()

    if (!email || !nextOtp) {
      setMessage({ text: 'Enter email and OTP to verify.', type: 'error' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await apiFetch('/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: nextOtp }),
      })
      const apiMessage = await readApiMessage(response)

      setMessage({ text: apiMessage, type: response.ok ? 'success' : 'error' })
      if (response.ok) setMode('forgot-reset')
    } catch {
      setMessage({ text: 'Backend connection failed. Please check API URL and server status.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword() {
    const email = forgotEmail.trim()
    const nextOtp = otp.trim()

    if (!newPassword || newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters.', type: 'error' })
      return
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ text: 'New password and confirm password do not match.', type: 'error' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await apiFetch('/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: nextOtp, newPassword }),
      })
      const apiMessage = await readApiMessage(response)

      setMessage({ text: apiMessage, type: response.ok ? 'success' : 'error' })

      if (response.ok) {
        setContact(email)
        setPassword('')
        setMode('login')
        resetForgotFields()
        setMessage({ text: 'Password reset successfully. Please sign in.', type: 'success' })
      }
    } catch {
      setMessage({ text: 'Backend connection failed. Please check API URL and server status.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit() {
    if (mode === 'login') {
      goToAccount()
      return
    }

    if (mode === 'forgot-email') void sendForgotOtp()
    if (mode === 'forgot-otp') void verifyOtp()
    if (mode === 'forgot-reset') void resetPassword()
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
        className={`action-item group flex flex-col items-center gap-1 rounded-lg border-none bg-transparent px-2 py-2 transition-all duration-300 hover:scale-105 active:scale-95 md:px-3 ${open ? 'bg-transparent' : 'bg-transparent'}`}
        onClick={() => {
          if (window.localStorage.getItem(ACCOUNT_READY_KEY) === 'true') {
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
          size={22}
          color="var(--burgundy)"
          strokeWidth={1.6}
          className={`transition-colors duration-300 ${open ? 'fill-[#6b1a2a]' : 'fill-transparent group-hover:fill-[#6b1a2a] group-active:fill-[#6b1a2a]'}`}
        />
        <span className="text-[10px] tracking-wide" style={{ color: 'var(--muted)', fontWeight: 500 }}>
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
                  className="mb-3 w-full rounded py-2.5 text-sm font-semibold text-white"
                  style={{ background: 'var(--burgundy)', border: 'none', cursor: 'pointer', letterSpacing: '0.3px' }}
                >
                  Sign In
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
                  className="mb-3 w-full rounded py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
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
                  className="mb-3 w-full rounded py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
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
                  className="mb-3 w-full rounded py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
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
