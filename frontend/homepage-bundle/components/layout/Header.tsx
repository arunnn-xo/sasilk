'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingCart, Heart, Truck, Search, Smartphone, User, X, Home, ShoppingBag, CalendarCheck, Sparkles, CalendarDays, MapPin, Video, ArrowRight } from 'lucide-react'
import SearchBar from '@/components/ui/SearchBar'
import LoginDropdown from '@/components/ui/LoginDropdown'
import { useCart } from '@/lib/context/CartContext'
import { fetchNavMenu, fetchEvents, type NavMenuItem, type EventItem } from '@/lib/services/storefront.service'
import { STATIC_NAV_MENU } from '@/lib/data/navigation'
import { formatEventDateTime } from '@/lib/utils/eventFormat'

function filteredCollectionHref(baseHref: string, filter: string) {
  return `${baseHref}?filter=${encodeURIComponent(filter)}`
}

const ACCOUNT_READY_KEY = 'soil_goddess_account_ready'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { itemCount } = useCart()
  const [showMobileBanner, setShowMobileBanner] = useState(true)
  const [activeSubcats, setActiveSubcats] = useState<Record<string, string>>({})
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [accountReady, setAccountReady] = useState(false)
  const [navMenu, setNavMenu] = useState<NavMenuItem[]>(STATIC_NAV_MENU)
  const [activeEventsCount, setActiveEventsCount] = useState(0)
  const [featuredEvent, setFeaturedEvent] = useState<EventItem | null>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Keep STATIC_NAV_MENU as the primary static source of truth
    setNavMenu(STATIC_NAV_MENU)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchEvents()
      .then(events => {
        if (cancelled) return
        const bookable = (events || []).filter(e => !e.bookingClosed && !e.isPast)
        setActiveEventsCount(bookable.length)
        if (bookable.length > 0) {
          setFeaturedEvent(bookable[0])
        } else {
          setFeaturedEvent(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActiveEventsCount(0)
          setFeaturedEvent(null)
        }
      })
    return () => { cancelled = true }
  }, [])


  useEffect(() => {
    const refreshAccountReady = () => {
      setAccountReady(window.localStorage.getItem(ACCOUNT_READY_KEY) === 'true')
    }

    refreshAccountReady()
    window.addEventListener('focus', refreshAccountReady)
    window.addEventListener('storage', refreshAccountReady)

    return () => {
      window.removeEventListener('focus', refreshAccountReady)
      window.removeEventListener('storage', refreshAccountReady)
    }
  }, [])

  // Close mobile search on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSearchOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Auto-focus input when mobile search panel opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 60)
    }
  }, [mobileSearchOpen])

  return (
    <header
      className="sticky top-0 z-[100]"
      style={{
        background: 'white',
        boxShadow: '0 2px 20px rgba(107,26,42,0.06)',
      }}
    >
      {/* Mobile App Download Banner */}
      {showMobileBanner && (
        <div className="flex lg:hidden w-full items-center justify-between px-4 py-2 bg-gradient-to-r from-[#F6E9D5] to-[#E2C792] shadow-sm relative z-[101]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--burgundy)] rounded-md flex items-center justify-center flex-shrink-0 border border-gold">
              <Smartphone size={16} color="var(--gold)" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[var(--burgundy-dark)] leading-tight">SOIL GODDESS App</span>
              <span className="text-[9px] font-medium text-[var(--burgundy)] opacity-80 leading-tight">Get 15% off on first order</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="px-3 py-1 bg-[var(--burgundy)] text-gold text-[10px] font-bold rounded shadow-sm">
              INSTALL
            </a>
            <button onClick={() => setShowMobileBanner(false)} className="text-[var(--burgundy-dark)] opacity-50 hover:opacity-100 p-1">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Top Row */}
      <div className="flex lg:hidden w-full items-center justify-between px-2 sm:px-4 py-2 relative h-[72px] sm:h-[82px]" style={{ background: '#FAF6EE' }}>
        {/* Search Box (Left) */}
        <div className="flex-shrink-0 z-10">
          <button
            type="button"
            aria-label="Toggle search"
            onClick={() => setMobileSearchOpen(prev => !prev)}
            className={`icon-btn w-9 h-9 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 ${
              mobileSearchOpen
                ? 'bg-[var(--burgundy)] text-gold border-[var(--burgundy)] shadow-md'
                : 'bg-[#F6EED8] text-[#5A1827] border-[#D9B86E]/70 hover:bg-[#5A1827] hover:text-[#FAF6EE]'
            }`}
          >
            <Search size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Logo (Center - Prominent, Clear & Centered) */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-1 z-10">
          <Link href="/" className="flex items-center justify-center no-underline max-w-[200px] xs:max-w-[240px] sm:max-w-[280px] w-full">
            <Image 
              src="/logo.png" 
              alt="Soil Goddess" 
              width={260} 
              height={180} 
              style={{ 
                height: 'auto',
                maxHeight: '144px',
                width: 'auto', 
                filter: 'drop-shadow(0px 2px 8px rgba(107,26,42,0.12)) contrast(1.08)'
              }} 
              className="object-contain w-auto h-auto max-h-[144px]" 
              priority 
            />
          </Link>
        </div>

        {/* Actions (Right) */}
        <div className="flex-shrink-0 flex items-center gap-1 sm:gap-1.5 z-10">
          {/* Mobile Home */}
          <Link href="/" className="icon-btn group relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-[#D9B86E]/70 bg-[#F6EED8] text-[#5A1827] shadow-sm transition-all duration-300 hover:scale-105 hover:bg-[#5A1827] hover:text-[#FAF6EE] no-underline">
            <Home size={18} strokeWidth={2.2} />
          </Link>
          
          <a href="https://wa.me/" className="icon-btn group w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-[#25D366]/40 bg-[#196C45] flex items-center justify-center text-white shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#25D366] active:scale-95">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:scale-110 group-active:scale-90"><path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.76.45 3.42 1.25 4.87L2 22l5.34-1.19c1.42.74 3.03 1.16 4.67 1.16 5.53 0 10.01-4.48 10.01-10S17.54 2 12.01 2zM12 20c-1.46 0-2.87-.38-4.1-1.07l-.3-.17-3.14.7.72-3.07-.19-.3A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"></path><path d="M16.48 14.8c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-1.3-.65-2.26-1.2-3.1-2.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42H8.9c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.34.98 2.5c.12.16 1.7 2.6 4.12 3.64 1.54.66 2.14.72 2.92.6.86-.14 2.14-.88 2.44-1.72.3-.84.3-1.56.2-1.72-.1-.16-.36-.24-.6-.36z"></path></svg>
          </a>
          <Link
            href="/events"
            className={`group relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 no-underline ${
              activeEventsCount > 0
                ? 'border-[#D9B86E] luxury-event-shimmer text-[#FAF6EE] shadow-[0_2px_8px_rgba(107,26,42,0.3)]'
                : 'border-[#D9B86E]/60 bg-[var(--burgundy)] text-gold'
            }`}
          >
            <CalendarCheck
              size={14}
              className={`${activeEventsCount > 0 ? 'text-[#FAF6EE]' : 'text-gold'}`}
              strokeWidth={2}
            />
            <span className="hidden xs:inline sm:inline">Book Now</span>
            {activeEventsCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-[#FAF6EE]/20 px-1.5 py-0.5 text-[7.5px] font-extrabold uppercase tracking-wider text-[#E8C87A] border border-[#D9B86E]/60">
                <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8C87A] opacity-80" />
                  <span className="relative inline-flex h-1 w-1 rounded-full bg-[#FAF6EE]" />
                </span>
                LIVE
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label={accountReady ? 'Open my account' : 'Create or sign in to account'}
            onClick={() => router.push(accountReady ? '/account' : '/register')}
            className={`icon-btn group relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 ${
              accountReady
                ? 'bg-[var(--burgundy)] border-[var(--burgundy)] text-[#FAF6EE]'
                : 'bg-[#F6EED8] border-[#D9B86E]/70 text-[#5A1827] hover:bg-[#5A1827] hover:text-[#FAF6EE]'
            }`}
          >
            <User
              size={18}
              strokeWidth={2.2}
              className={`transition-colors duration-300 ${
                accountReady
                  ? 'fill-[#F6E9D5]/20'
                  : 'fill-transparent group-hover:fill-[var(--charcoal)]/20 group-active:fill-[var(--charcoal)]'
              }`}
            />
            {accountReady ? (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-[var(--burgundy)] bg-[#BF9A4B]" />
            ) : null}
          </button>
        </div>
      </div>

      {/* ── Mobile Search Panel ─────────────────────── */}
      <div
        className={`lg:hidden transition-all duration-300 ease-out overflow-hidden ${
          mobileSearchOpen
            ? 'max-h-[420px] opacity-100'
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        style={{
          background: '#FAF6EE',
          borderTop: mobileSearchOpen ? '1px solid var(--ivory-dark)' : 'none',
          transform: mobileSearchOpen ? 'translateY(0)' : 'translateY(-6px)',
        }}
      >
        <div className="px-4 pt-3 pb-4">
          {/* Panel header row */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] uppercase tracking-[2px] font-semibold"
              style={{ color: 'var(--muted)' }}
            >
              Search Products
            </span>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--ivory-dark)]"
              style={{ color: 'var(--burgundy)' }}
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
          {/* Full animated SearchBar */}
          <SearchBar ref={mobileSearchInputRef} />
        </div>
      </div>

      {/* Backdrop — closes search on outside tap */}
      {mobileSearchOpen && (
        <div
          className="fixed inset-0 z-[99] lg:hidden"
          style={{ background: 'rgba(74, 15, 28, 0.15)' }}
          onClick={() => setMobileSearchOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop Top row */}
      <div
        className="hidden lg:flex w-full px-6 xl:px-10 items-center justify-between relative h-[152px]"
      >
        {/* Search */}
        <div className="flex-1 flex justify-start items-center z-10">
          <div className="w-full max-w-[280px] xl:max-w-[340px] 2xl:max-w-[400px]">
            <SearchBar />
          </div>
        </div>

        {/* Logo — Exact Original Prominent Luxury Dimensions */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-[150] pointer-events-none">
          <Link href="/" className="flex items-center justify-center no-underline flex-shrink-0 pointer-events-auto">
            <Image 
              src="/logo.png" 
              alt="Soil Goddess" 
              width={600} 
              height={480} 
              style={{ 
                height: '350px', 
                width: 'auto', 
                marginTop: '-85px', 
                marginBottom: '-85px',
                filter: 'drop-shadow(0px 6px 20px rgba(107,26,42,0.22)) contrast(1.12) brightness(1.03)'
              }} 
              className="object-contain" 
              priority 
            />
          </Link>
        </div>

        {/* Actions — Positioned to the right with zero overlap into the logo */}
        <div className="flex-1 flex items-center justify-end gap-1 xl:gap-2 z-10">
          {/* Home (Visible on wide screens to prevent center encroachment) */}
          <Link href="/" className="action-item group hidden 2xl:flex flex-col items-center gap-1 px-1.5 py-1 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 relative no-underline">
            <Home size={26} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover:fill-[#9c1a21] group-active:fill-[#9c1a21]" />
            <span className="text-[11px] tracking-wide whitespace-nowrap" style={{ color: 'var(--muted)', fontWeight: 500 }}>
              Home
            </span>
            {pathname === '/' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full" style={{ background: 'var(--burgundy)' }} />}
          </Link>

          {/* Divider */}
          <div className="hidden 2xl:block h-6 xl:h-7 w-[1px] bg-gradient-to-b from-transparent via-[#D9B86E]/45 to-transparent flex-shrink-0" aria-hidden="true" />

          {/* Shop (Visible on wide screens to prevent center encroachment) */}
          <Link href="/shop" className="action-item group hidden 2xl:flex flex-col items-center gap-1 px-1.5 py-1 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 relative no-underline">
            <ShoppingBag size={26} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover:fill-[#9c1a21] group-active:fill-[#9c1a21]" />
            <span className="text-[11px] tracking-wide whitespace-nowrap" style={{ color: 'var(--muted)', fontWeight: 500 }}>
              Shop
            </span>
            {pathname === '/shop' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full" style={{ background: 'var(--burgundy)' }} />}
          </Link>

          {/* Divider */}
          <div className="hidden 2xl:block h-6 xl:h-7 w-[1px] bg-gradient-to-b from-transparent via-[#D9B86E]/45 to-transparent flex-shrink-0" aria-hidden="true" />

          {/* Track Order */}
          <Link href="/track-order" className="action-item group flex flex-col items-center gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 relative no-underline">
            <Truck size={26} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover:fill-[#9c1a21] group-active:fill-[#9c1a21]" />
            <span className="text-[11px] tracking-wide whitespace-nowrap hidden md:block" style={{ color: 'var(--muted)', fontWeight: 500 }}>
              Track Order
            </span>
            {pathname === '/track-order' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full" style={{ background: 'var(--burgundy)' }} />}
          </Link>

          {/* Divider */}
          <div className="h-6 xl:h-7 w-[1px] bg-gradient-to-b from-transparent via-[#D9B86E]/45 to-transparent flex-shrink-0" aria-hidden="true" />

          {/* Book Now */}
          <div className="relative group/event flex items-center h-full">
            <Link
              href="/events"
              className="action-item flex flex-col items-center gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 relative no-underline"
              title={featuredEvent ? `✨ Live Event: ${featuredEvent.name} — Click to Book Spot` : 'Book Events'}
            >
              <div className="relative flex items-center justify-center">
                {/* Subtle warm gold ambient aura when live */}
                {activeEventsCount > 0 && (
                  <span
                    className="absolute inset-[-4px] rounded-full opacity-60 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(217, 184, 110, 0.35) 0%, transparent 70%)',
                    }}
                  />
                )}

                <CalendarCheck
                  size={26}
                  color="var(--burgundy)"
                  strokeWidth={1.6}
                  className="fill-transparent transition-transform duration-300 group-hover/event:fill-[#9c1a21] group-active/event:fill-[#9c1a21]"
                />

                {/* Impressive Professional Luxury Event Badge */}
                {activeEventsCount > 0 && (
                  <span className="absolute -top-2.5 -right-5 flex items-center gap-1 px-1.5 py-0.5 rounded-full luxury-event-shimmer text-[#FAF6EE] shadow-[0_2px_8px_rgba(107,26,42,0.35)] pointer-events-none z-20">
                    <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8C87A] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1 w-1 bg-[#FAF6EE]" />
                    </span>
                    <span className="font-montserrat text-[7.5px] font-extrabold uppercase tracking-[0.18em] leading-none text-[#FAF6EE]">
                      LIVE
                    </span>
                  </span>
                )}
              </div>

              <span
                className="text-[11px] tracking-wide whitespace-nowrap hidden md:block"
                style={{
                  color: activeEventsCount > 0 ? 'var(--burgundy)' : 'var(--muted)',
                  fontWeight: activeEventsCount > 0 ? 600 : 500,
                }}
              >
                Book Now
              </span>

              {(pathname === '/events' || pathname?.startsWith('/events/')) && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full"
                  style={{ background: 'var(--burgundy)' }}
                />
              )}
            </Link>

            {/* Luxury Live Event Hover Preview Flyout */}
            {featuredEvent && (
              <div className="absolute top-[85%] right-0 pt-3 w-[290px] opacity-0 invisible translate-y-3 group-hover/event:opacity-100 group-hover/event:visible group-hover/event:translate-y-0 transition-all duration-300 ease-out z-[250] pointer-events-none group-hover/event:pointer-events-auto">
                <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(107,26,42,0.18)] p-4 border border-[#D9B86E] relative before:absolute before:-top-2 before:right-6 before:border-b-8 before:border-b-white before:border-l-8 before:border-l-transparent before:border-r-8 before:border-r-transparent">
                  {/* Header Ribbon */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#D9B86E]/40">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8C87A] opacity-80" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8B1A2B]" />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6D4B]">
                        Soil Goddess Event
                      </span>
                    </div>
                    {typeof featuredEvent.seatsLeft === 'number' && featuredEvent.seatsLeft > 0 && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#8B1A2B] bg-[#8B1A2B]/10 px-1.5 py-0.5 rounded">
                        {featuredEvent.seatsLeft} Spots Left
                      </span>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="mt-2.5">
                    <h4 className="font-serif text-sm font-bold text-[#300D14] leading-snug line-clamp-2">
                      {featuredEvent.name}
                    </h4>
                    <div className="font-sans mt-2 space-y-1 text-xs text-[#5A4A3F]">
                      <p className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-[#8A6D4B] shrink-0" />
                        <span>{formatEventDateTime(featuredEvent.eventDate, featuredEvent.startTime)}</span>
                      </p>
                      {featuredEvent.mode === 'online' ? (
                        <p className="flex items-center gap-1.5 text-[#2B4C9B]">
                          <Video size={13} className="shrink-0" /> Join Live on Zoom
                        </p>
                      ) : featuredEvent.venueAddress ? (
                        <p className="flex items-start gap-1.5 line-clamp-1">
                          <MapPin size={13} className="text-[#8A6D4B] shrink-0 mt-0.5" />
                          <span>{featuredEvent.venueAddress}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Footer with Price & Action */}
                  <div className="mt-3 pt-2.5 border-t border-[#D9B86E]/40 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#7A6065] block uppercase font-medium">Price</span>
                      <span className="font-serif text-base font-bold text-[var(--burgundy)]">
                        ₹{Number(featuredEvent.price).toFixed(2)}
                      </span>
                    </div>
                    <Link
                      href={`/events/${featuredEvent.slug || ''}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--burgundy)] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#E8C87A] shadow-sm transition-all hover:bg-[#6E1220] no-underline"
                    >
                      <span>Book Now</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 xl:h-7 w-[1px] bg-gradient-to-b from-transparent via-[#D9B86E]/45 to-transparent flex-shrink-0" aria-hidden="true" />

          {/* Get App */}
          <div className="relative group/app flex items-center h-full">
            <Link href="#" className="action-item flex flex-col items-center gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition-all duration-300 hover:bg-[#FDFBF7] relative no-underline">
              <Smartphone size={26} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover/app:fill-[#9c1a21]" />
              <span className="text-[11px] tracking-wide whitespace-nowrap hidden md:block" style={{ color: 'var(--burgundy)', fontWeight: 700 }}>
                Get App
              </span>
              {/* Notification dot */}
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse border border-gold"></span>
            </Link>

            {/* Hover Details Mega-Menu */}
            <div className="absolute top-[90%] right-0 pt-4 w-[320px] md:w-[580px] opacity-0 invisible translate-y-4 group-hover/app:opacity-100 group-hover/app:visible group-hover/app:translate-y-0 transition-all duration-300 ease-out z-[200] pointer-events-none group-hover/app:pointer-events-auto">
              <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(107,26,42,0.15)] overflow-hidden flex flex-col md:flex-row relative border border-[#D9B86E] before:absolute before:top-[-8px] before:right-[35px] before:border-b-8 before:border-b-white before:border-l-8 before:border-l-transparent before:border-r-8 before:border-r-transparent">
                
                {/* Left side: QR & Form */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#D9B86E] bg-white">
                  <h3 className="text-lg font-bold text-[var(--burgundy)] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Experience SOIL GODDESS</h3>
                  <p className="text-[11px] text-[#7A6065] mb-5">Scan the QR code to download the app and get exclusive offers.</p>
                  
                  {/* QR Code Placeholder */}
                  <div className="w-24 h-24 bg-[#FAF6EE] border-2 border-dashed border-[#D9B86E] rounded flex items-center justify-center mb-5 relative hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <div className="absolute inset-1.5 border border-[#D9B86E] flex flex-wrap gap-0.5 p-0.5">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`w-[23%] h-[23%] ${i % 3 === 0 || i % 5 === 0 ? 'bg-[var(--burgundy)]' : 'bg-transparent'}`}></div>
                      ))}
                    </div>
                    <div className="absolute w-5 h-5 bg-burgundy border border-[#D9B86E] flex items-center justify-center rounded-sm shadow-sm">
                      <span className="text-[7px] font-bold tracking-tighter text-[var(--burgundy)]">SG</span>
                    </div>
                  </div>

                  <div className="w-full text-left">
                    <p className="text-[9px] font-bold text-gold uppercase tracking-wider mb-2 text-center">Or get the link via SMS</p>
                    <div className="flex w-full shadow-sm rounded-md overflow-hidden">
                      <div className="flex items-center justify-center px-3 border border-r-0 border-[#D9B86E] bg-[#FAF6EE] text-xs font-semibold text-[var(--burgundy)]">
                        +91
                      </div>
                      <input type="tel" placeholder="Mobile Number" className="w-full px-3 py-2 border-t border-b border-[#D9B86E] text-xs outline-none focus:bg-[#FDFBF7]" />
                      <button className="px-4 py-2 bg-[var(--burgundy)] text-gold text-[10px] font-bold hover:bg-[#841920] transition-colors whitespace-nowrap">
                        SEND
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side: Store Buttons */}
                <div className="w-full md:w-[220px] bg-[#FAF6EE] p-6 flex flex-col items-center justify-center gap-3">
                  <div className="text-center mb-2">
                    <span className="block text-sm font-bold text-[var(--charcoal)] mb-0.5">Download Now</span>
                    <span className="block text-[10px] text-gold">Available on iOS and Android</span>
                  </div>
                  
                  <a href="#" className="w-full flex items-center justify-center gap-2 bg-burgundy text-gold rounded-lg px-3 py-2.5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 no-underline">
                    <svg viewBox="0 0 512 512" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] uppercase font-semibold leading-none mb-0.5 opacity-90">GET IT ON</span>
                      <span className="text-[12px] font-bold leading-none tracking-wide font-sans">Google Play</span>
                    </div>
                  </a>

                  <a href="#" className="w-full flex items-center justify-center gap-2 bg-burgundy text-gold rounded-lg px-3 py-2.5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 no-underline">
                    <svg viewBox="0 0 384 512" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] font-semibold leading-none mb-0.5 opacity-90">Download on the</span>
                      <span className="text-[13px] font-bold leading-none tracking-wide font-sans">App Store</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 xl:h-7 w-[1px] bg-gradient-to-b from-transparent via-[#D9B86E]/45 to-transparent flex-shrink-0" aria-hidden="true" />

          <LoginDropdown />

          {/* Divider */}
          <div className="h-6 xl:h-7 w-[1px] bg-gradient-to-b from-transparent via-[#D9B86E]/45 to-transparent flex-shrink-0" aria-hidden="true" />

          {/* Wishlist */}
          <Link href="/wishlist" className="action-item group flex flex-col items-center gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 relative no-underline">
            <Heart size={26} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover:fill-[#9c1a21] group-active:fill-[#9c1a21]" />
            <span className="text-[11px] tracking-wide whitespace-nowrap hidden md:block" style={{ color: 'var(--muted)', fontWeight: 500 }}>Wishlist</span>
            {pathname === '/wishlist' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full" style={{ background: 'var(--burgundy)' }} />}
          </Link>

          {/* Divider */}
          <div className="h-6 xl:h-7 w-[1px] bg-gradient-to-b from-transparent via-[#D9B86E]/45 to-transparent flex-shrink-0" aria-hidden="true" />

          {/* Cart */}
          <Link href="/cart" className="action-item group flex flex-col items-center gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 relative no-underline">
            <ShoppingCart size={26} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover:fill-[#9c1a21] group-active:fill-[#9c1a21]" />
            <span className="text-[11px] tracking-wide whitespace-nowrap hidden md:block" style={{ color: 'var(--muted)', fontWeight: 500 }}>Cart</span>
            {pathname === '/cart' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full" style={{ background: 'var(--burgundy)' }} />}
            <span
              className="absolute top-0 right-0 w-[19px] h-[19px] rounded-full flex items-center justify-center text-[9.5px] font-bold text-gold"
              style={{ background: 'var(--burgundy)', border: '2px solid white' }}
            >
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className="hidden lg:block relative border-t border-b border-[#D9B86E]/40"
        style={{ backgroundColor: '#edb651' }}
      >
        <div className="w-full px-4 lg:px-6 flex items-center justify-start">
          {navMenu.map(cat => (
            <div 
              key={cat.label}
              className="group/mainnav h-full flex-shrink-0"
              onMouseEnter={() => {
                if (cat.subCategories && cat.subCategories.length > 0 && !activeSubcats[cat.label]) {
                  setActiveSubcats(prev => ({ ...prev, [cat.label]: cat.subCategories![0].name }));
                }
              }}
            >
              <div className="h-full">
                <Link
                  href={cat.href}
                  className={`${
                    cat.isSale ? 'text-[#9C1A21] font-extrabold' : 'text-[#300D14]'
                  } px-2 xl:px-3 py-3 text-[12px] xl:text-[13px] tracking-[0.08em] uppercase font-bold no-underline inline-block transition-colors hover:text-[#9C1A21]`}
                >
                  {cat.label}
                </Link>
              </div>

              {/* Mega Menu Dropdown */}
              {cat.subCategories && (
                <div className="absolute top-full left-0 w-full bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-t-2 border-[var(--gold)] z-[200] opacity-0 invisible translate-y-3 pointer-events-none group-hover/mainnav:opacity-100 group-hover/mainnav:visible group-hover/mainnav:translate-y-0 group-hover/mainnav:pointer-events-auto transition-all duration-300 overflow-hidden before:absolute before:inset-0 before:pointer-events-none before:bg-[url('/borderdesign/flower-motif.png')] before:bg-[length:500px] before:bg-[position:110%_120%] before:bg-no-repeat before:opacity-[0.03] transform-gpu">
                  <div className="w-full px-8 xl:px-12 flex h-[480px] relative z-10">
                    
                    {/* Left Column: Subcategories */}
                    <div className="w-[300px] flex-shrink-0 border-r border-[var(--ivory-dark)] bg-[#FAF6EE] py-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                      {cat.subCategories.map(sub => {
                        const currentActive = activeSubcats[cat.label] || cat.subCategories![0].name;
                        return (
                        <div
                          key={sub.name}
                          onMouseEnter={() => setActiveSubcats(prev => ({ ...prev, [cat.label]: sub.name }))}
                          className={`px-8 py-3.5 cursor-pointer transition-all duration-300 flex justify-between items-center border-b border-[#D9B86E]/50 last:border-0 ${
                            currentActive === sub.name 
                              ? 'bg-white text-[var(--burgundy)] shadow-[inset_4px_0_0_var(--gold)]' 
                              : 'text-[#444444] hover:text-[var(--burgundy)] hover:bg-white/60'
                          }`}
                        >
                          <span className={`text-[15px] uppercase ${currentActive === sub.name ? 'font-bold' : 'font-bold opacity-90'}`} style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.08em' }}>
                            {sub.name}
                          </span>
                          {sub.directLink ? (
                             <span className="text-[10px] uppercase tracking-widest text-[var(--gold)] font-bold">View</span>
                          ) : (
                             <span className={`text-[18px] font-bold transition-transform duration-300 ${currentActive === sub.name ? 'text-[var(--gold)] translate-x-1' : 'text-[#888]'}`}>›</span>
                          )}
                        </div>
                      )})}
                    </div>

                    {/* Right Column: Products Grid */}
                    <div className="flex-1 bg-gradient-to-br from-[#FAF6EE]/40 to-white relative p-10 overflow-hidden" style={{ scrollbarWidth: 'thin' }}>
                      {/* Global Floral Abstract Watermarks for the entire right panel */}
                      <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.06] transform translate-x-12 -translate-y-12 bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat pointer-events-none z-0"></div>
                      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.06] transform -translate-x-12 translate-y-12 bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat pointer-events-none z-0"></div>
                      
                      <div className="relative z-10 h-full overflow-y-auto pr-4 scrollbar-thin">
                        {(() => {
                          const currentActive = activeSubcats[cat.label] || cat.subCategories![0].name;
                          const activeSubcatData = cat.subCategories!.find(s => s.name === currentActive);
                          if (!activeSubcatData) return null;
                          
                          if (activeSubcatData.directLink) {
                            return (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center px-10 relative group/banner rounded-xl border border-[var(--ivory-dark)] bg-white/60 shadow-sm backdrop-blur-sm hover:bg-white/90 transition-colors duration-500">
                            <div className="w-16 h-16 mb-6 relative transition-transform duration-700 group-hover/banner:-translate-y-2 group-hover/banner:scale-110 flex items-center justify-center">
                              <div className="absolute inset-0 bg-[var(--gold)] blur-xl opacity-30 rounded-full animate-pulse"></div>
                              <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 animate-[spin_15s_linear_infinite]">
                                <defs>
                                  <linearGradient id="gold-grad-emblem" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#D4AF37" />
                                    <stop offset="50%" stopColor="#9c1a212CD" />
                                    <stop offset="100%" stopColor="#AA7C11" />
                                  </linearGradient>
                                </defs>
                                <path d="M50 5 L54 42 L95 50 L54 58 L50 95 L46 58 L5 50 L46 42 Z" fill="url(#gold-grad-emblem)" opacity="0.95" />
                                <path d="M50 5 L54 42 L95 50 L54 58 L50 95 L46 58 L5 50 L46 42 Z" fill="url(#gold-grad-emblem)" opacity="0.75" transform="rotate(45 50 50)" />
                                <circle cx="50" cy="50" r="5" fill="#FAF6EE" />
                                <circle cx="50" cy="50" r="2" fill="var(--burgundy)" />
                              </svg>
                            </div>
                            <h3 className="text-4xl font-bold mb-3 z-10 transition-transform duration-500 group-hover/banner:-translate-y-1" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy)' }}>
                              {activeSubcatData.name}
                            </h3>
                            <p className="text-[14px] text-[#444] font-medium mb-8 z-10 max-w-md leading-relaxed" style={{ fontFamily: '"Assistant", sans-serif' }}>
                              Experience the epitome of luxury and tradition. Explore our handpicked collection of <strong className="text-[var(--burgundy)]">{activeSubcatData.name}</strong> tailored perfectly for you.
                            </p>
                            <Link href={filteredCollectionHref(cat.href, activeSubcatData.name)} className="z-10 px-10 py-3.5 bg-[var(--burgundy)] text-gold text-[12px] font-bold tracking-[0.2em] uppercase hover:bg-[#841920] transition-all duration-300 no-underline shadow-[0_4px_15px_rgba(107,26,42,0.3)] hover:shadow-[0_6px_20px_rgba(107,26,42,0.4)] hover:-translate-y-1 rounded-sm">
                              Explore Collection
                            </Link>
                          </div>
                            )
                          } else {
                            return (
                          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-full flex flex-col">
                            <h3 className="text-[30px] font-bold mb-8 pb-4 border-b border-[var(--ivory-dark)] flex items-center gap-4" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy)' }}>
                              <span className="w-10 h-[2px] bg-[var(--gold)] inline-block"></span>
                              {activeSubcatData.name}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-5 pb-6">
                              {activeSubcatData.products?.map((prod, i) => (
                                <Link 
                                  key={prod.name} 
                                  href={filteredCollectionHref(cat.href, prod.name)}
                                  className="text-[16px] text-[#2C2C2C] hover:text-[var(--burgundy-dark)] transition-all duration-300 flex items-center gap-2.5 no-underline group/link hover:translate-x-1.5 py-1"
                                  style={{ animationDelay: `${i * 20}ms` }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D1C6B4] group-hover/link:bg-[var(--gold)] transition-colors duration-300 group-hover/link:shadow-[0_0_8px_var(--gold)]"></span>
                                  <span className="font-semibold group-hover/link:font-bold" style={{ fontFamily: '"Assistant", sans-serif', letterSpacing: '0.03em' }}>{prod.name}</span>
                                  {prod.isHot && <span title="Hot Selling" className="text-[13px] animate-pulse drop-shadow-md ml-auto mr-2">🔥</span>}
                                </Link>
                              ))}
                            </div>
                          </div>
                            )
                          }
                        })()}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

    </header>
  )
}
