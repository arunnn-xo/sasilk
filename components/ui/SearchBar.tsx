'use client'

import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { searchSuggestions, organicSareeSubcats } from '@/lib/data'

export default function SearchBar() {
  const [focused, setFocused] = useState(false)
  const [query, setQuery]     = useState('')

  const chips = organicSareeSubcats.slice(0, 5)
  const filtered = query
    ? searchSuggestions.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.code.toLowerCase().includes(query.toLowerCase())
      )
    : searchSuggestions

  return (
    <div className="relative w-full max-w-3xl">
      {/* Animated gradient border wrapper */}
      <div className="creative-border w-full relative">
        <div className="flex items-center w-full bg-[#FDFBF7] rounded-[47px] overflow-hidden pr-1 pl-4">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            placeholder="Porul code allathu peyarai thedavum..."
            className="w-full bg-transparent py-2.5 outline-none text-sm text-[#2C241B]"
          />

          {/* Creative animated search button */}
          <button className="creative-search-btn" style={{ width: 36, height: 36, margin: '2px' }}>
            <Search className="search-icon-svg w-5 h-5" strokeWidth={2.5} />
            <Sparkles className="sparkle-icon w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {focused && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl p-3"
          style={{
            background: 'white',
            border: '1px solid var(--ivory-dark)',
            boxShadow: '0 8px 32px rgba(107,26,42,0.12)',
          }}
        >
          {/* Collection chips */}
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)', fontWeight: 500 }}>
            Shop by Collections
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {chips.map(chip => (
              <button
                key={chip}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  border: '1px solid var(--ivory-dark)',
                  color: 'var(--burgundy)',
                  background: 'var(--ivory)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  const t = e.currentTarget
                  t.style.background = 'var(--burgundy)'
                  t.style.color = 'white'
                }}
                onMouseLeave={e => {
                  const t = e.currentTarget
                  t.style.background = 'var(--ivory)'
                  t.style.color = 'var(--burgundy)'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Product results */}
          <div className="flex flex-col">
            {filtered.map((p, i) => (
              <div
                key={p.code}
                className="flex items-center gap-3 py-2 cursor-pointer"
                style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--ivory-dark)' : 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'var(--ivory-dark)' }}
                >
                  {p.emoji}
                </div>
                <span className="flex-1 text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                  {p.code} · {p.name}
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--burgundy)' }}>
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
