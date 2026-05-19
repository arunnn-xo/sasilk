'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { User, X } from 'lucide-react'

export default function LoginDropdown() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')

  function goToAccount() {
    setOpen(false)
    router.push('/account')
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={`action-item group flex flex-col items-center gap-1 rounded-lg border-none bg-transparent px-2 py-2 transition-all duration-300 hover:scale-105 active:scale-95 md:px-3 ${open ? 'bg-transparent' : 'bg-transparent'}`}
        onClick={() => setOpen(current => !current)}
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
              goToAccount()
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy)', fontWeight: 700 }}>
                Welcome Back
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--gold-pale)]"
                style={{ color: 'var(--burgundy)', border: '1px solid var(--ivory-dark)' }}
                aria-label="Close login"
              >
                <X size={16} />
              </button>
            </div>

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
              className="mb-3 w-full rounded text-sm outline-none"
              style={{
                padding: '9px 12px',
                border: '1.5px solid var(--ivory-dark)',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />

            <button
              type="submit"
              className="mb-3 w-full rounded py-2.5 text-sm font-semibold text-white"
              style={{ background: 'var(--burgundy)', border: 'none', cursor: 'pointer', letterSpacing: '0.3px' }}
            >
              Sign In
            </button>

            <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
              New here?{' '}
              <Link href="/register" onClick={() => setOpen(false)} style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>
                Create Account
              </Link>{' '}
              ·{' '}
              <Link href="/checkout" onClick={() => setOpen(false)} style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>
                Guest Checkout
              </Link>
            </p>
          </form>
        </div>
      ) : null}
    </div>
  )
}
