'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles } from 'lucide-react'
import { searchSuggestions, organicSareeSubcats } from '@/lib/data'

const placeholders = [
  'Search by color - E.g. red color sarees...',
  'Search by Occasions - Marriage, bridal...',
  'Search by item code (e.g. SAS-KS-0324)...',
  'Search Saree Types - Kanchipuram, Mysore...',
  'Search relevant product names...'
]

export default function SearchBar() {
  const router = useRouter()
  const [focused, setFocused] = useState(false)
  const [query, setQuery]     = useState('')
  const [placeholderText, setPlaceholderText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(100)

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % placeholders.length
      const fullText = placeholders[i]

      if (isDeleting) {
        setPlaceholderText(fullText.substring(0, placeholderText.length - 1))
        setTypingSpeed(30) // fast delete
      } else {
        setPlaceholderText(fullText.substring(0, placeholderText.length + 1))
        setTypingSpeed(70) // normal type
      }

      if (!isDeleting && placeholderText === fullText) {
        // Wait at the end of typing
        setTimeout(() => setIsDeleting(true), 2000)
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
        setTypingSpeed(400) // pause before typing next
      }
    }

    const timer = setTimeout(handleType, typingSpeed)
    return () => clearTimeout(timer)
  }, [placeholderText, isDeleting, loopNum, typingSpeed])

  const chips = organicSareeSubcats.slice(0, 5)
  const filtered = query
    ? searchSuggestions.filter(s => {
        const q = query.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.color?.toLowerCase().includes(q) ||
          s.occasion?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
        )
      })
    : searchSuggestions

  function goToShop(value = query) {
    const nextQuery = value.trim()
    setFocused(false)
    router.push(nextQuery ? `/shop?search=${encodeURIComponent(nextQuery)}` : '/shop')
  }

  function goToOrganicCollection(filter: string) {
    setFocused(false)
    router.push(`/collections/organic-sarees?filter=${encodeURIComponent(filter)}`)
  }

  return (
    <div className="relative w-full max-w-3xl">
      {/* Animated gradient border wrapper */}
      <div className="creative-border w-full relative">
        <div className="flex items-center w-full bg-[#FDFBF7] rounded-[47px] overflow-hidden pr-1 pl-4 relative">
          
          {/* Custom Animated Placeholder that Shines */}
          {!query && (
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[17px] font-['Cormorant_Garamond'] italic tracking-wide font-bold whitespace-nowrap"
              style={{
                background: 'linear-gradient(90deg, #6B1A2A 0%, #B8860B 25%, #8B3A2B 50%, #B8860B 75%, #6B1A2A 100%)',
                backgroundSize: '200% auto',
                color: 'transparent',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                animation: 'textShine 3.5s linear infinite',
                filter: 'drop-shadow(0px 1px 1px rgba(107, 26, 42, 0.15))'
              }}
            >
              {placeholderText}
            </div>
          )}

          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                goToShop()
              }
            }}
            className="w-full bg-transparent py-2.5 outline-none text-[15px] text-[var(--burgundy-dark)] transition-all duration-300"
            style={{ fontFamily: query ? '"DM Sans", sans-serif' : '"Cormorant Garamond", serif', fontWeight: query ? 500 : 600, fontSize: query ? '14px' : '17px' }}
          />

          {/* Creative animated search button */}
          <button type="button" onClick={() => goToShop()} className="creative-search-btn" style={{ width: 36, height: 36, margin: '2px' }}>
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
                type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  goToOrganicCollection(chip)
                }}
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
                onMouseDown={e => {
                  e.preventDefault()
                  goToShop(p.name)
                }}
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
