'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, Truck, Search, Smartphone, X } from 'lucide-react'
import SearchBar from '@/components/ui/SearchBar'
import LoginDropdown from '@/components/ui/LoginDropdown'
import { mainCategories } from '@/lib/data'

export default function Header() {
  const [showMobileBanner, setShowMobileBanner] = useState(true)

  return (
    <header
      className="sticky top-0 z-[100]"
      style={{
        background: 'white',
        borderBottom: '1px solid var(--ivory-dark)',
        boxShadow: '0 2px 20px rgba(107,26,42,0.06)',
      }}
    >
      {/* Mobile App Download Banner */}
      {showMobileBanner && (
        <div className="flex lg:hidden w-full items-center justify-between px-4 py-2 bg-gradient-to-r from-[#F6E9D5] to-[#E2C792] shadow-sm relative z-[101]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--burgundy)] rounded-md flex items-center justify-center flex-shrink-0 border border-white">
              <Smartphone size={16} color="var(--gold)" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[var(--burgundy-dark)] leading-tight">SOIL GODDESS App</span>
              <span className="text-[9px] font-medium text-[var(--burgundy)] opacity-80 leading-tight">Get 15% off on first order</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="px-3 py-1 bg-[var(--burgundy)] text-white text-[10px] font-bold rounded shadow-sm">
              INSTALL
            </a>
            <button onClick={() => setShowMobileBanner(false)} className="text-[var(--burgundy-dark)] opacity-50 hover:opacity-100 p-1">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Top Row */}
      <div className="flex lg:hidden w-full items-center justify-between px-4 py-3" style={{ background: '#FAF6EE' }}>
        {/* Search Box */}
        <button className="icon-btn w-10 h-10 rounded-lg bg-[#E2C792] flex items-center justify-center text-[var(--charcoal)] transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
          <Search size={20} strokeWidth={2} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex flex-col items-center flex-1 no-underline">
          <span className="text-[18px] md:text-xl font-bold tracking-widest" style={{ fontFamily: 'Playfair Display, serif', color: '#A04724' }}>
            SOIL GODDESS
          </span>
          <span className="text-[10px] tracking-wide font-medium mt-0.5" style={{ fontFamily: '"Assistant", sans-serif', color: '#A04724' }}>
            by Sri Akila
          </span>
          <span className="text-[8px] tracking-[1px] uppercase mt-0.5 opacity-80" style={{ fontFamily: '"Assistant", sans-serif', color: '#A04724' }}>
            Fashion Rejuvenated For You
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
        {/* Search */}
        <div className="flex-1 flex justify-start">
          <div className="w-full max-w-[280px] xl:max-w-[320px]">
            <SearchBar />
          </div>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 md:gap-3.5 no-underline flex-shrink-0">
          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0 relative"
            style={{ background: 'var(--burgundy)', border: '2px solid var(--gold)' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--gold-light)">
              <path d="M12 2C8 2 5 5 5 8c0 5 7 14 7 14s7-9 7-14c0-3-3-6-7-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </div>
          <div className="leading-tight text-center">
            <span
              className="block text-xl font-bold tracking-widest"
              style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy)' }}
            >
              SOIL GODDESS
            </span>
            <span
              className="block text-[11px] tracking-wide font-medium mt-0.5"
              style={{ color: 'var(--burgundy)', fontFamily: '"Assistant", sans-serif' }}
            >
              by Sri Akila
            </span>
            <span
              className="block text-[9px] tracking-[1.5px] uppercase mt-0.5 opacity-80"
              style={{ color: 'var(--burgundy)', fontFamily: '"Assistant", sans-serif' }}
            >
              Fashion Rejuvenated For You
            </span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex-1 flex items-center gap-0 md:gap-1 justify-end">
          <LoginDropdown />

          <div className="w-px h-8 mx-1" style={{ background: 'var(--ivory-dark)' }} />

          {/* Get App */}
          <div className="relative group/app flex items-center h-full">
            <Link href="#" className="action-item flex flex-col items-center gap-1 px-2 md:px-3 py-2 rounded-lg transition-all duration-300 hover:bg-[#FDFBF7] animate-floating-app relative no-underline">
              <Smartphone size={22} color="var(--burgundy)" strokeWidth={1.6} className="fill-transparent transition-colors duration-300 group-hover/app:fill-[#6b1a2a]" />
              <span className="text-[10px] tracking-wide whitespace-nowrap hidden md:block" style={{ color: 'var(--burgundy)', fontWeight: 700 }}>
                Get App
              </span>
              {/* Notification dot to make it inviting */}
              <span className="absolute top-1.5 right-1.5 md:right-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse border border-white"></span>
            </Link>

            {/* Hover Details Mega-Menu */}
            <div className="absolute top-[90%] right-0 pt-4 w-[320px] md:w-[580px] opacity-0 invisible translate-y-4 group-hover/app:opacity-100 group-hover/app:visible group-hover/app:translate-y-0 transition-all duration-300 ease-out z-[200] pointer-events-none group-hover/app:pointer-events-auto">
              <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(107,26,42,0.15)] overflow-hidden flex flex-col md:flex-row relative border border-[#E8DCC4] before:absolute before:top-[-8px] before:right-[35px] before:border-b-8 before:border-b-white before:border-l-8 before:border-l-transparent before:border-r-8 before:border-r-transparent">
                
                {/* Left side: QR & Form */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#E8DCC4] bg-white">
                  <h3 className="text-lg font-bold text-[var(--burgundy)] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Experience SOIL GODDESS</h3>
                  <p className="text-[11px] text-gray-500 mb-5">Scan the QR code to download the app and get exclusive offers.</p>
                  
                  {/* QR Code Placeholder */}
                  <div className="w-24 h-24 bg-[#FAF6EE] border-2 border-dashed border-[#E8DCC4] rounded flex items-center justify-center mb-5 relative hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <div className="absolute inset-1.5 border border-[#E8DCC4] flex flex-wrap gap-0.5 p-0.5">
                      {/* Fake QR pattern */}
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`w-[23%] h-[23%] ${i % 3 === 0 || i % 5 === 0 ? 'bg-[var(--burgundy)]' : 'bg-transparent'}`}></div>
                      ))}
                    </div>
                    <div className="absolute w-5 h-5 bg-white border border-[#E8DCC4] flex items-center justify-center rounded-sm shadow-sm">
                      <span className="text-[7px] font-bold tracking-tighter text-[var(--burgundy)]">SG</span>
                    </div>
                  </div>

                  <div className="w-full text-left">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Or get the link via SMS</p>
                    <div className="flex w-full shadow-sm rounded-md overflow-hidden">
                      <div className="flex items-center justify-center px-3 border border-r-0 border-[#E8DCC4] bg-[#FAF6EE] text-xs font-semibold text-[var(--burgundy)]">
                        +91
                      </div>
                      <input type="tel" placeholder="Mobile Number" className="w-full px-3 py-2 border-t border-b border-[#E8DCC4] text-xs outline-none focus:bg-[#FDFBF7]" />
                      <button className="px-4 py-2 bg-[var(--burgundy)] text-white text-[10px] font-bold hover:bg-[#8A2B3C] transition-colors whitespace-nowrap">
                        SEND
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side: Store Buttons */}
                <div className="w-full md:w-[220px] bg-[#FAF6EE] p-6 flex flex-col items-center justify-center gap-3">
                  <div className="text-center mb-2">
                    <span className="block text-sm font-bold text-[var(--charcoal)] mb-0.5">Download Now</span>
                    <span className="block text-[10px] text-gray-500">Available on iOS and Android</span>
                  </div>
                  
                  <a href="#" className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-lg px-3 py-2.5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 no-underline">
                    <svg viewBox="0 0 512 512" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] uppercase font-semibold leading-none mb-0.5 opacity-90">GET IT ON</span>
                      <span className="text-[12px] font-bold leading-none tracking-wide font-sans">Google Play</span>
                    </div>
                  </a>

                  <a href="#" className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-lg px-3 py-2.5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 no-underline">
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
