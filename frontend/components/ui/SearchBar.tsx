'use client'

import { useState, useEffect, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles } from 'lucide-react'
import { searchProducts } from '@/lib/services/storefront.service'

const placeholders = [
  'Search by color - E.g. red color sarees...',
  'Search by Occasions - Marriage, bridal...',
  'Search by item code (e.g. SAS-KS-0324)...',
  'Search Saree Types - Kanchipuram, Mysore...',
  'Search relevant product names...'
]

const collectionChips = ['Cotton', 'Silk', 'Linen', 'Tussar', 'Bridal']

const SearchBar = forwardRef<HTMLInputElement>(function SearchBar(_props, ref) {
  const router = useRouter()
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ name: string; price: number }[]>([])
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
        setTypingSpeed(30)
      } else {
        setPlaceholderText(fullText.substring(0, placeholderText.length + 1))
        setTypingSpeed(70)
      }
      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000)
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
        setTypingSpeed(400)
      }
    }
    const timer = setTimeout(handleType, typingSpeed)
    return () => clearTimeout(timer)
  }, [placeholderText, isDeleting, loopNum, typingSpeed])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const data = await searchProducts(query.trim())
        setResults(data.products.slice(0, 5).map(p => ({ name: p.name, price: p.price })))
      } catch {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function goToShop(value = query) {
    const nextQuery = value.trim()
    setFocused(false)
    router.push(nextQuery ? `/shop?search=${encodeURIComponent(nextQuery)}` : '/shop')
  }

  function goToCollection(filter: string) {
    setFocused(false)
    router.push(`/collections/organic-sarees?filter=${encodeURIComponent(filter)}`)
  }

  return (
    <div className="relative w-full max-w-3xl">
      <div className="creative-border w-full relative">
        <div className="flex items-center w-full bg-[#FDFBF7] rounded-[47px] overflow-hidden pr-1 pl-4 relative">
          {!query && (
            <div
              className="absolute left-4 right-12 top-1/2 -translate-y-1/2 pointer-events-none text-[17px] font-['Cormorant_Garamond'] italic tracking-wide font-bold whitespace-nowrap overflow-hidden text-ellipsis"
              style={{
                background: 'linear-gradient(90deg, #9C1A21 0%, #B8860B 25%, #8B3A2B 50%, #B8860B 75%, #9C1A21 100%)',
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
            ref={ref}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); goToShop() }
            }}
            className="w-full bg-transparent py-3 outline-none text-[15px] text-[var(--burgundy-dark)] transition-all duration-300"
            style={{ fontFamily: query ? '"DM Sans", sans-serif' : '"Cormorant Garamond", serif', fontWeight: query ? 500 : 600, fontSize: query ? '14px' : '17px' }}
          />

          <button type="button" onClick={() => goToShop()} className="creative-search-btn" style={{ width: 40, height: 40, margin: '2px' }}>
            <Search className="search-icon-svg w-5.5 h-5.5" strokeWidth={2.5} />
            <Sparkles className="sparkle-icon w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {focused && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl p-3"
          style={{
            background: 'white',
            border: '1px solid var(--ivory-dark)',
            boxShadow: '0 8px 32px rgba(107,26,42,0.12)',
          }}
        >
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)', fontWeight: 500 }}>
            Shop by Collections
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {collectionChips.map(chip => (
              <button
                key={chip}
                type="button"
                onMouseDown={e => { e.preventDefault(); goToCollection(chip) }}
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

          <div className="flex flex-col">
            {results.length > 0 ? results.map((p, i) => (
              <div
                key={p.name}
                onMouseDown={e => { e.preventDefault(); goToShop(p.name) }}
                className="flex items-center gap-3 py-2 cursor-pointer"
                style={{ borderBottom: i < results.length - 1 ? '1px solid var(--ivory-dark)' : 'none' }}
              >
                <span className="flex-1 text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                  {p.name}
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--burgundy)' }}>
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
              </div>
            )) : query.trim() ? (
              <p className="py-3 text-sm text-center" style={{ color: 'var(--muted)' }}>
                No results found
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
})

export default SearchBar
