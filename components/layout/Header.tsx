'use client'

import Link from 'next/link'
import { ShoppingCart, Heart, Truck, Search } from 'lucide-react'
import SearchBar from '@/components/ui/SearchBar'
import LoginDropdown from '@/components/ui/LoginDropdown'
import { mainCategories } from '@/lib/data'

export default function Header() {
  return (
    <header
      className="sticky top-0 z-[100]"
      style={{
        background: 'white',
        borderBottom: '1px solid var(--ivory-dark)',
        boxShadow: '0 2px 20px rgba(107,26,42,0.06)',
      }}
    >
      {/* Mobile Top Row */}
      <div className="flex lg:hidden w-full items-center justify-between px-4 py-3" style={{ background: '#FAF6EE' }}>
        {/* Search Box */}
        <button className="icon-btn w-10 h-10 rounded-lg bg-[#E2C792] flex items-center justify-center text-[var(--charcoal)] transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
          <Search size={20} strokeWidth={2} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex flex-col items-center flex-1 no-underline">
          <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#A04724' }}>
            SR Akila
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a href="https://wa.me/" className="icon-btn group w-10 h-10 rounded-lg bg-[#84A98C] flex items-center justify-center text-white transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-[#25D366] active:scale-95">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:scale-110 group-active:scale-90"><path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.76.45 3.42 1.25 4.87L2 22l5.34-1.19c1.42.74 3.03 1.16 4.67 1.16 5.53 0 10.01-4.48 10.01-10S17.54 2 12.01 2zM12 20c-1.46 0-2.87-.38-4.1-1.07l-.3-.17-3.14.7.72-3.07-.19-.3A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"></path><path d="M16.48 14.8c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-1.3-.65-2.26-1.2-3.1-2.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42H8.9c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.34.98 2.5c.12.16 1.7 2.6 4.12 3.64 1.54.66 2.14.72 2.92.6.86-.14 2.14-.88 2.44-1.72.3-.84.3-1.56.2-1.72-.1-.16-.36-.24-.6-.36z"></path></svg>
          </a>
          <button className="icon-btn group w-10 h-10 rounded-lg bg-[#E2C792] flex items-center justify-center text-[var(--charcoal)] transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 relative">
            <ShoppingCart size={20} strokeWidth={2} className="fill-transparent transition-colors duration-300 group-hover:fill-[var(--charcoal)]/20 group-active:fill-[var(--charcoal)]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-[var(--burgundy)] border-2 border-white animate-badge-pulse">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Desktop Top row */}
      <div
        className="hidden lg:flex max-w-[1400px] mx-auto px-8 py-3 items-center justify-between gap-5"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3.5 no-underline order-1">
          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0 relative"
            style={{ background: 'var(--burgundy)', border: '2px solid var(--gold)' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--gold-light)">
              <path d="M12 2C8 2 5 5 5 8c0 5 7 14 7 14s7-9 7-14c0-3-3-6-7-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </div>
          <div className="leading-tight">
            <span
              className="block text-xl font-bold tracking-wide"
              style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy)' }}
            >
              SR Akila Silks
            </span>
            <span
              className="text-[10px] tracking-[2.5px] uppercase font-medium"
              style={{ color: 'var(--gold)' }}
            >
              Pure Silks · Timeless Elegance
            </span>
          </div>
        </Link>

        {/* Search */}
        <div className="order-3 lg:order-2 w-full lg:w-[380px] xl:w-[460px]">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0 md:gap-1 justify-end order-2 lg:order-3">
          <LoginDropdown />

          <div className="w-px h-8 mx-1" style={{ background: 'var(--ivory-dark)' }} />

          {/* Track Order */}
          <button className="action-item group flex flex-col items-center gap-1 px-2 md:px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95">
            <Truck size={22} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover:fill-[#6b1a2a] group-active:fill-[#6b1a2a]" />
            <span className="text-[10px] tracking-wide whitespace-nowrap hidden md:block" style={{ color: 'var(--muted)', fontWeight: 500 }}>
              Track Order
            </span>
          </button>

          <div className="w-px h-8 mx-1" style={{ background: 'var(--ivory-dark)' }} />

          {/* Wishlist */}
          <button className="action-item group flex flex-col items-center gap-1 px-2 md:px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95">
            <Heart size={22} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover:fill-[#6b1a2a] group-active:fill-[#6b1a2a]" />
            <span className="text-[10px] tracking-wide hidden md:block" style={{ color: 'var(--muted)', fontWeight: 500 }}>Wishlist</span>
          </button>

          <div className="w-px h-8 mx-1" style={{ background: 'var(--ivory-dark)' }} />

          {/* Cart */}
          <button className="action-item group flex flex-col items-center gap-1 px-2 md:px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 relative">
            <ShoppingCart size={22} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover:fill-[#6b1a2a] group-active:fill-[#6b1a2a]" />
            <span className="text-[10px] tracking-wide hidden md:block" style={{ color: 'var(--muted)', fontWeight: 500 }}>Cart</span>
            <span
              className="absolute top-0.5 right-1 md:right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: 'var(--burgundy)', border: '2px solid white' }}
            >
              3
            </span>
          </button>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className="hidden lg:block overflow-x-auto scrollbar-hide"
        style={{ background: 'var(--burgundy)' }}
      >
        <div className="max-w-[1400px] mx-auto px-8 flex items-center whitespace-nowrap">
          {mainCategories.map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`${
                cat.isSale ? 'nav-sale' : 'nav-item'
              } px-4 py-3.5 text-[11.5px] tracking-widest uppercase font-medium no-underline`}
            >
              {cat.isSale && '🔥 '}{cat.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
