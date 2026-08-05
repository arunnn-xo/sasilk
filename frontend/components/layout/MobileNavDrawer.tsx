'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, ChevronDown, ChevronUp, X, MoveRight, Feather, User, LogIn, UserPlus, ShoppingBag } from 'lucide-react'
import type { MainCategory } from '@/lib/megaMenuData'
import { resolveImageUrl } from '@/lib/api/client'
import { useAuth } from '@/components/auth/AuthContext'

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  menuData: MainCategory[]
  position?: 'left' | 'right'
}

export default function MobileNavDrawer({ isOpen, onClose, menuData, position = 'left' }: MobileNavDrawerProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [expandedSub, setExpandedSub] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const drawerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { session, logout } = useAuth()

  // Focus the close button when drawer opens
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const closeBtn = drawerRef.current.querySelector('button[aria-label="Close menu"]');
      if (closeBtn instanceof HTMLElement) {
        setTimeout(() => closeBtn.focus(), 100);
      }
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setExpandedCat(null)
      setExpandedSub(null)
      setSearch('')
    }
  }, [isOpen])

  const toggleCat = (label: string) => {
    setExpandedCat(prev => prev === label ? null : label)
    setExpandedSub(null)
  }

  const toggleSub = (name: string) => {
    setExpandedSub(prev => prev === name ? null : name)
  }

  const filtered = search.trim()
    ? menuData.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.subCategories?.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
      )
    : menuData

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 z-[201] flex h-full w-[85vw] max-w-[380px] flex-col bg-[#FFFCF7] shadow-2xl transition-transform duration-300 ease-out ${
          position === 'right'
            ? `right-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
            : `left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DCC4] bg-[#520001] px-4 py-3">
          <Image
            src="/logo.png"
            alt="Soil Goddess"
            width={120}
            height={36}
            className="h-9 w-auto brightness-0 invert"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[#E8DCC4] px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#E8DCC4] bg-white px-3 py-2">
            <Search size={16} className="text-[#75646A]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-transparent text-sm text-[#2A1A1E] outline-none placeholder:text-[#75646A]/60"
            />
          </div>
        </div>

        {/* Category List */}
        <nav className="flex-1 overflow-y-auto overscroll-contain" aria-label="Categories">
          <ul className="py-2">
            {filtered.map(cat => {
              const isExpanded = expandedCat === cat.label
              const hasSubs = cat.subCategories && cat.subCategories.length > 0

              return (
                <li key={cat.label} className="border-b border-[#F6EAD2]/60">
                  <div className="flex items-center">
                    <Link
                      href={cat.href}
                      onClick={onClose}
                      className={`flex-1 px-5 py-3.5 no-underline transition-colors relative ${
                        cat.isHighlighted
                          ? 'animate-theme-text-blink font-extrabold tracking-widest !text-[16px]'
                          : cat.isSale
                            ? 'text-[var(--gold)] font-bold text-[14px]'
                            : 'text-[var(--charcoal)] font-semibold text-[14px]'
                      } hover:bg-[#F6EAD2]/50`}
                    >
                      {cat.label}
                      {cat.isSale && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-[#C29B57]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C29B57]">
                          Sale
                        </span>
                      )}
                    </Link>
                    {hasSubs && (
                      <button
                        onClick={() => toggleCat(cat.label)}
                        className="flex h-full items-center px-4 py-3.5 text-[#75646A] transition-colors hover:text-[#4A0F1C]"
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${cat.label}`}
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Subcategories */}
                  {hasSubs && isExpanded && (
                    <ul className="bg-[#FAF6EE] pb-2">
                      {cat.subCategories!.map(sub => {
                        const hasChildCategories = sub.childCategories && sub.childCategories.length > 0
                        const hasProducts = sub.products && sub.products.length > 0
                        const hasItems = hasChildCategories || hasProducts
                        const isSubExpanded = expandedSub === `${cat.label}-${sub.name}`

                        return (
                          <li key={sub.name}>
                            <div className="flex items-center">
                              <Link
                                href={sub.href || `${cat.href}?filter=${encodeURIComponent(sub.name)}`}
                                onClick={onClose}
                                className="flex-1 px-8 py-2.5 text-[13px] font-medium text-[#6B1A2A] no-underline transition-colors hover:bg-[#F6EAD2]/40 hover:text-[#4A0F1C]"
                              >
                                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#C29B57]" />
                                {sub.name}
                              </Link>
                              {hasItems && (
                                <button
                                  onClick={() => toggleSub(`${cat.label}-${sub.name}`)}
                                  className="px-4 py-2.5 text-[#75646A] transition-colors hover:text-[#4A0F1C]"
                                  aria-expanded={isSubExpanded}
                                  aria-label={`${isSubExpanded ? 'Collapse' : 'Expand'} ${sub.name}`}
                                >
                                  <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${isSubExpanded ? 'rotate-180' : ''}`}
                                  />
                                </button>
                              )}
                            </div>

                            {/* Child categories and Product items (Level 3) */}
                            {hasItems && isSubExpanded && (
                              <ul className="bg-[#F6EAD2]/30 pb-1">
                                {hasChildCategories && sub.childCategories!.map(child => (
                                  <li key={child.name}>
                                    <Link
                                      href={child.href || `${cat.href}?filter=${encodeURIComponent(child.name)}`}
                                      onClick={onClose}
                                      className="flex items-center gap-3 px-8 py-2 text-[12px] font-medium text-[#6B1A2A] no-underline transition-colors hover:bg-[#F6EAD2]/40 hover:text-[#4A0F1C]"
                                    >
                                      <span className="ml-4 inline-block h-1 w-1 rounded-full bg-[#C29B57]/60" />
                                      <span className="flex-1">{child.name}</span>
                                      {child.isHot && (
                                        <span className="rounded-full bg-[#6B1A2A] px-1.5 py-0.5 text-[9px] font-bold text-white">
                                          HOT
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                                {hasProducts && sub.products!.map(prod => (
                                  <li key={prod.name}>
                                    <Link
                                      href={`${cat.href}?filter=${encodeURIComponent(prod.name)}`}
                                      onClick={onClose}
                                      className="flex items-center gap-3 px-8 py-2 text-[12px] text-[#75646A] no-underline transition-colors hover:bg-[#F6EAD2]/40 hover:text-[#4A0F1C]"
                                    >
                                      {prod.imageUrl ? (
                                        <div className="h-10 w-8 shrink-0 overflow-hidden rounded">
                                          <img
                                            src={resolveImageUrl(prod.imageUrl)}
                                            alt={prod.name}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                          />
                                        </div>
                                      ) : (
                                        <div className="h-10 w-8 shrink-0 rounded bg-[#E8DCC4]" />
                                      )}
                                      <span className="flex-1">{prod.name}</span>
                                      {prod.isHot && (
                                        <span className="rounded-full bg-[#6B1A2A] px-1.5 py-0.5 text-[9px] font-bold text-white">
                                          HOT
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-[#E8DCC4] bg-[#FAF6EE] px-5 py-3">
          {session ? (
            <div className="space-y-2">
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-semibold text-[#4A0F1C] transition-colors hover:bg-[#F6EAD2]/50"
              >
                <User size={16} />
                {session.name}
              </Link>
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-[#75646A] transition-colors hover:bg-[#F6EAD2]/50"
              >
                <ShoppingBag size={15} />
                My Orders
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout()
                  onClose()
                  router.replace('/')
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-[#A34336] transition-colors hover:bg-red-50"
              >
                <LogIn size={15} className="rotate-180" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-3 rounded-md bg-[#6B1A2A] px-3 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#4A0F1C]"
              >
                <LogIn size={16} />
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center gap-3 rounded-md border border-[#E8DCC4] px-3 py-2.5 text-[14px] font-semibold text-[#4A0F1C] transition-colors hover:bg-[#F6EAD2]/50"
              >
                <UserPlus size={16} />
                Create Account
              </Link>
            </div>
          )}
        </div>

        <div className="border-t border-[#E8DCC4] bg-[#FAF6EE] px-5 py-4">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[2px] text-[#75646A]">
            Style In Every Thread
          </p>
        </div>
      </div>
    </>
  )
}
