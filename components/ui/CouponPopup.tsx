'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function CouponPopup() {
  const [visible, setVisible]   = useState(false)
  const [email, setEmail]       = useState('')
  const [copied, setCopied]     = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('sas_popup_seen')
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  const close = () => {
    setVisible(false)
    sessionStorage.setItem('sas_popup_seen', '1')
  }

  const copyCode = () => {
    navigator.clipboard.writeText('SAS15OFF').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', animation: 'fadeIn .3s ease' }}
      onClick={e => { if (e.target === e.currentTarget) close() }}
    >
      <div
        className="popup-anim rounded-xl overflow-hidden"
        style={{ width: 440, maxWidth: '90vw', background: 'white' }}
      >
        {/* Header */}
        <div
          className="relative px-8 pt-9 pb-7 text-center"
          style={{ background: 'var(--burgundy)' }}
        >
          <button
            onClick={close}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white' }}
          >
            <X size={16} />
          </button>
          <h2
            className="text-2xl font-semibold text-white mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Wait! Before you leave…
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Get <strong>15% OFF</strong> your very first order
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-7 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Click the code to copy</p>

          <button
            onClick={copyCode}
            className="inline-block my-4 px-8 py-3.5 text-2xl font-extrabold tracking-[4px] rounded-md transition-all"
            style={{
              background: copied ? 'var(--gold-pale)' : 'var(--ivory-dark)',
              border: `2px ${copied ? 'solid' : 'dashed'} var(--gold)`,
              color: 'var(--burgundy)',
              cursor: 'pointer',
              letterSpacing: 4,
            }}
          >
            {copied ? '✓ COPIED!' : 'SAS15OFF'}
          </button>

          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
            Use above code at checkout · First-time customers only
          </p>

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email to receive offers & updates"
            className="w-full rounded text-sm outline-none mb-2.5"
            style={{
              padding: '10px 14px',
              border: '1.5px solid var(--ivory-dark)',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />

          <button
            onClick={close}
            className="w-full py-3 text-sm font-semibold rounded text-white"
            style={{ background: 'var(--burgundy)', border: 'none', cursor: 'pointer' }}
          >
            Claim My Discount →
          </button>

          <button
            onClick={close}
            className="mt-3 text-xs"
            style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  )
}
