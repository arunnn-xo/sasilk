'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Heart, Home, Menu, Percent, ShoppingBag, ShoppingCart, Truck, X, type LucideIcon } from 'lucide-react'
import { useCart } from '@/components/cart/CartContext'
import { useWishlist } from '@/components/wishlist/WishlistContext'
import { STATIC_NAV_MENU } from '@/lib/data/navigation'
import type { NavMenuItem } from '@/lib/services/storefront.service'

function filteredCollectionHref(baseHref: string, filter: string) {
  return `${baseHref}?filter=${encodeURIComponent(filter)}`
}

function MobileNavLink({
  href,
  label,
  Icon,
  badge,
  onClick,
}: {
  href: string
  label: string
  Icon: LucideIcon
  badge?: string
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
  const showBadge = Boolean(badge && badge !== '0')

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 no-underline transition-all duration-200 active:scale-95 ${
        isActive ? 'text-[#F2C94C]' : 'text-[#FAF6EE]/85 hover:text-[#F2C94C]'
      }`}
    >
      <span className="relative inline-flex items-center justify-center">
        <Icon
          className={`h-5 w-5 transition-transform duration-200 ${
            isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(242,201,76,0.5)]' : ''
          }`}
          strokeWidth={isActive ? 2.3 : 2}
        />
        {showBadge ? (
          <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white/30 bg-[#D32F2F] px-1 text-[9px] font-bold leading-none text-white shadow-sm">
            {badge}
          </span>
        ) : null}
      </span>
      <span
        className={`max-w-full truncate text-[10px] leading-tight ${
          isActive ? 'font-bold text-[#F2C94C]' : 'font-medium text-[#FAF6EE]/85'
        }`}
      >
        {label}
      </span>
      {isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full bg-[#F2C94C] shadow-[0_0_6px_#F2C94C]" />
      )}
    </Link>
  )
}

function MobileDrawerQuickLink({
  href,
  label,
  Icon,
  onClick,
}: {
  href: string
  label: string
  Icon: LucideIcon
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-w-0 items-center justify-center gap-2 rounded-lg border border-[#D9B86E] bg-[#6B1A2A] px-3 py-3 text-sm font-bold text-[#FAF6EE] no-underline shadow-[0_8px_22px_rgba(74,15,28,0.12)] hover:bg-[#8B1A2B] transition-colors"
    >
      <Icon className="h-4 w-4 shrink-0 text-[#D9B86E]" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { totalUnits: cartCount } = useCart()
  const { totalItems: wishlistCount } = useWishlist()
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [activeMobileCategory, setActiveMobileCategory] = useState<NavMenuItem | null>(null)
  const navMenu = STATIC_NAV_MENU

  // Automatically close categories drawer on route change
  useEffect(() => {
    setCategoriesOpen(false)
    setActiveMobileCategory(null)
  }, [pathname])

  // Close on ESC key and lock body scroll only when drawer is active
  useEffect(() => {
    if (!categoriesOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCategoriesOpen(false)
        setActiveMobileCategory(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [categoriesOpen])

  return (
    <>
      {/* Mobile Categories Slide-out Drawer */}
      {categoriesOpen ? (
        <div
          className="fixed inset-0 z-[1000] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="More categories"
        >
          {/* Backdrop overlay */}
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-label="Close categories"
            onClick={() => {
              setCategoriesOpen(false)
              setActiveMobileCategory(null)
            }}
          />

          <div className="mobile-categories-drawer absolute right-0 top-0 w-[min(88vw,390px)] overflow-hidden rounded-l-2xl border-l border-[#D9B86E]/45 bg-[#FAF6EE] shadow-[-18px_0_42px_rgba(0,0,0,0.4)] animate-[sgMobileCategoryDrawerIn_260ms_cubic-bezier(0.22,1,0.36,1)_both]">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-[#D9B86E]/40 px-5 py-4 bg-[#F5EADB]">
              <div className="min-w-0 pr-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8A6327]">
                  SOIL GODDESS
                </p>
                <h2
                  className="mt-0.5 truncate text-xl font-semibold text-[#5A1827]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {activeMobileCategory ? activeMobileCategory.label : 'Categories'}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-[#7A5E4B]">
                  {activeMobileCategory ? 'Choose a collection' : 'Explore sarees & heritage weaves'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeMobileCategory) {
                    setActiveMobileCategory(null)
                    return
                  }
                  setCategoriesOpen(false)
                }}
                className={`flex h-10 w-10 shrink-0 items-center justify-center text-[#FAF6EE] shadow-sm transition-colors ${
                  activeMobileCategory
                    ? 'rounded-full bg-[#5A1827] hover:bg-[#8B1A2B]'
                    : 'rounded-lg bg-[#5A1827] hover:bg-[#8B1A2B]'
                }`}
                aria-label={activeMobileCategory ? 'Back to categories' : 'Close categories'}
              >
                {activeMobileCategory ? (
                  <ChevronRight className="h-5 w-5 rotate-180" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="relative overflow-hidden" style={{ height: 'calc(100% - 92px)' }}>
              {/* Main Categories Level */}
              <div
                className={`absolute inset-0 overflow-y-auto px-5 py-5 transition-transform duration-300 ease-out ${
                  activeMobileCategory ? '-translate-x-full' : 'translate-x-0'
                }`}
                aria-hidden={Boolean(activeMobileCategory)}
              >
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-2">
                    <MobileDrawerQuickLink
                      href="/track-order"
                      label="Track Order"
                      Icon={Truck}
                      onClick={() => setCategoriesOpen(false)}
                    />
                    <MobileDrawerQuickLink
                      href="/sale"
                      label="Sale"
                      Icon={Percent}
                      onClick={() => setCategoriesOpen(false)}
                    />
                  </div>

                  <div className="divide-y divide-[#D9B86E]/30 rounded-xl border border-[#D9B86E]/40 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                    {navMenu.map(category =>
                      category.subCategories?.length ? (
                        <button
                          key={category.label}
                          type="button"
                          onClick={() => setActiveMobileCategory(category)}
                          className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[#300D14] transition-colors hover:bg-[#FAF6EE] active:bg-[#F5EADB]"
                        >
                          <span className="min-w-0 pr-3 text-[15px] font-semibold">
                            {category.label}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-[#BF9A4B]">
                            <span>Explore</span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-[#BF9A4B]" />
                          </div>
                        </button>
                      ) : (
                        <Link
                          key={category.label}
                          href={category.href}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center justify-between px-4 py-3.5 text-[#300D14] no-underline transition-colors hover:bg-[#FAF6EE] active:bg-[#F5EADB]"
                        >
                          <span className="min-w-0 pr-3 text-[15px] font-semibold">
                            {category.label}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-[#7A5E4B]" />
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-categories Level */}
              <div
                className={`absolute inset-0 overflow-y-auto px-5 py-5 transition-transform duration-300 ease-out ${
                  activeMobileCategory ? 'translate-x-0' : 'translate-x-full'
                }`}
                aria-hidden={!activeMobileCategory}
              >
                {activeMobileCategory ? (
                  <div className="space-y-5">
                    <Link
                      href={activeMobileCategory.href}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-[#5A1827] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#D9B86E] no-underline shadow-md"
                    >
                      <span>View All {activeMobileCategory.label}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>

                    <div className="divide-y divide-[#D9B86E]/30 rounded-xl border border-[#D9B86E]/40 bg-white p-3 shadow-sm">
                      {activeMobileCategory.subCategories?.map(sub => (
                        <section key={sub.name} className="py-2.5 first:pt-0 last:pb-0">
                          <Link
                            href={filteredCollectionHref(activeMobileCategory.href, sub.name)}
                            onClick={() => setCategoriesOpen(false)}
                            className="flex items-center justify-between py-1 text-[14px] font-bold text-[#5A1827] no-underline hover:text-[#8B1A2B]"
                          >
                            <span>{sub.name}</span>
                            <ChevronRight className="h-4 w-4 text-[#BF9A4B]" />
                          </Link>
                          {sub.products?.length ? (
                            <div className="mt-1.5 grid grid-cols-1 gap-1 pl-2">
                              {sub.products.map(product => (
                                <Link
                                  key={product.name}
                                  href={filteredCollectionHref(activeMobileCategory.href, product.name)}
                                  onClick={() => setCategoriesOpen(false)}
                                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium text-[#2A1A1E] no-underline hover:bg-[#F5EADB]"
                                >
                                  <span>{product.name}</span>
                                  <ChevronRight className="h-3.5 w-3.5 text-[#BF9A4B]" />
                                </Link>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <style jsx global>{`
            @keyframes sgMobileCategoryDrawerIn {
              from {
                opacity: 0.92;
                transform: translateX(100%);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      ) : null}

      {/* Persistent Fixed Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="mobile-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      >
        <MobileNavLink href="/" label="Home" Icon={Home} />
        <MobileNavLink href="/shop" label="Shop" Icon={ShoppingBag} />
        <MobileNavLink
          href="/wishlist"
          label="Wishlist"
          Icon={Heart}
          badge={wishlistCount > 0 ? String(wishlistCount) : undefined}
        />
        <MobileNavLink
          href="/cart"
          label="Cart"
          Icon={ShoppingCart}
          badge={cartCount > 0 ? String(cartCount) : undefined}
        />
        <button
          type="button"
          onClick={() => {
            setCategoriesOpen(prev => !prev)
            setActiveMobileCategory(null)
          }}
          className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200 active:scale-95 ${
            categoriesOpen ? 'text-[#F2C94C]' : 'text-[#FAF6EE]/85 hover:text-[#F2C94C]'
          }`}
          aria-label="Open more categories"
          aria-expanded={categoriesOpen}
        >
          <Menu
            className={`h-5 w-5 transition-transform duration-200 ${
              categoriesOpen ? 'scale-110 drop-shadow-[0_0_8px_rgba(242,201,76,0.5)]' : ''
            }`}
            strokeWidth={categoriesOpen ? 2.3 : 2}
          />
          <span
            className={`max-w-full truncate text-[10px] leading-tight ${
              categoriesOpen ? 'font-bold text-[#F2C94C]' : 'font-medium text-[#FAF6EE]/85'
            }`}
          >
            Categories
          </span>
          {categoriesOpen && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full bg-[#F2C94C] shadow-[0_0_6px_#F2C94C]" />
          )}
        </button>
      </nav>
    </>
  )
}
