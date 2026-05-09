'use client'

import { useState } from 'react'
import { User } from 'lucide-react'

export default function LoginDropdown() {
  const [open, setOpen]     = useState(false)
  const [step, setStep]     = useState<'login' | 'otp'>('login')
  const [contact, setContact] = useState('')

  return (
    <div className="relative">
      <button
        className={`action-item group flex flex-col items-center gap-1 px-2 md:px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 border-none cursor-pointer ${open ? 'bg-transparent' : 'bg-transparent'}`}
        onClick={() => setOpen(o => !o)}
      >
        <User size={22} color="var(--burgundy)" strokeWidth={1.6} className={`transition-colors duration-300 ${open ? 'fill-[#6b1a2a]' : 'fill-transparent group-hover:fill-[#6b1a2a] group-active:fill-[#6b1a2a]'}`} />
        <span className="text-[10px] tracking-wide" style={{ color: 'var(--muted)', fontWeight: 500 }}>Account</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-72 rounded-lg p-5 z-50"
          style={{
            background: 'white',
            border: '1px solid var(--ivory-dark)',
            boxShadow: '0 12px 40px rgba(107,26,42,0.14)',
          }}
        >
          {step === 'login' ? (
            <>
              <h3
                className="text-lg mb-4"
                style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy)', fontWeight: 700 }}
              >
                Welcome Back
              </h3>

              <label className="block text-xs tracking-wide mb-1" style={{ color: 'var(--muted)', fontWeight: 500 }}>
                Mobile / Email
              </label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="+91 or email address"
                className="w-full rounded text-sm outline-none mb-3"
                style={{
                  padding: '9px 12px',
                  border: '1.5px solid var(--ivory-dark)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />

              <label className="block text-xs tracking-wide mb-1" style={{ color: 'var(--muted)', fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full rounded text-sm outline-none mb-3"
                style={{
                  padding: '9px 12px',
                  border: '1.5px solid var(--ivory-dark)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />

              <button
                className="w-full py-2.5 text-sm font-semibold rounded text-white mb-2"
                style={{ background: 'var(--burgundy)', border: 'none', cursor: 'pointer', letterSpacing: '0.3px' }}
              >
                Sign In
              </button>

              <div className="flex items-center gap-2 my-2">
                <hr style={{ flex: 1, borderColor: 'var(--ivory-dark)' }} />
                <span className="text-xs" style={{ color: 'var(--muted)' }}>OR</span>
                <hr style={{ flex: 1, borderColor: 'var(--ivory-dark)' }} />
              </div>

              <button
                className="w-full py-2 text-xs font-semibold rounded"
                style={{
                  background: 'var(--gold-pale)',
                  border: '1.5px solid var(--gold)',
                  color: 'var(--burgundy)',
                  cursor: 'pointer',
                }}
                onClick={() => setStep('otp')}
              >
                🔐 Login with OTP
              </button>

              <p className="text-center text-xs mt-3" style={{ color: 'var(--muted)' }}>
                New here?{' '}
                <a href="/register" style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>
                  Create Account
                </a>{' '}
                ·{' '}
                <a href="/checkout" style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>
                  Guest Checkout
                </a>
              </p>
            </>
          ) : (
            <>
              <button
                className="text-xs mb-3"
                style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setStep('login')}
              >
                ← Back
              </button>
              <h3
                className="text-lg mb-2"
                style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy)', fontWeight: 700 }}
              >
                OTP Login
              </h3>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                Enter your mobile number — we'll send you a one-time password.
              </p>
              <input
                type="text"
                placeholder="+91 Mobile Number"
                className="w-full rounded text-sm outline-none mb-3"
                style={{
                  padding: '9px 12px',
                  border: '1.5px solid var(--ivory-dark)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
              <button
                className="w-full py-2.5 text-sm font-semibold rounded text-white"
                style={{ background: 'var(--burgundy)', border: 'none', cursor: 'pointer' }}
              >
                Send OTP
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
