'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, type CSSProperties } from 'react'
import { ChevronRight, Heart, Home, Menu, Percent, ShoppingBag, ShoppingCart, Truck, X, type LucideIcon } from 'lucide-react'
import { useCart } from '@/components/cart/CartContext'
import { fetchNavMenu, type NavMenuItem } from '@/lib/services/storefront.service'
import { STATIC_NAV_MENU } from '@/lib/data/navigation'

function filteredCollectionHref(baseHref: string, filter: string) {
  return `${baseHref}?filter=${encodeURIComponent(filter)}`
}

/* ── Data ─────────────────────────────────────────── */
const quickLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Shop Now', href: '/shop' },
  { label: 'Read Our Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
]

const customerServices = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Return & Refund Policy', href: '/returns' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Exchange Policy', href: '/exchange-policy' },
]

/* ── Contact Icons ────────────────────────────────── */
type IconProps = {
  className?: string
  style?: CSSProperties
}

function IconMail({ className, style }: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
}
function IconPhone({ className, style }: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
}
function IconChat({ className, style }: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>
}
function IconLocation({ className, style }: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

/* ── Social Icons ───────────────────────────────── */
function IconFacebook({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
}
function IconInstagram({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
}
function IconPinterest({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
}
function IconThread({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8c1.5 0 2.5-1 2.5-2.5S13.5 12 12 12" /></svg>
}

/* ── Payment Badges ──────────── */
function BadgeVisa({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded bg-white text-[9px] font-bold tracking-wider border shadow-sm ${className}`} style={{ width: 36, height: 22, borderColor: '#E5E7EB', color: '#1434CB' }}>
      VISA
    </div>
  )
}
function BadgeMastercard({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded bg-white text-[9px] font-bold tracking-wider border shadow-sm ${className}`} style={{ width: 36, height: 22, borderColor: '#E5E7EB', color: '#EB001B' }}>
      <svg width="18" height="12" viewBox="0 0 24 16" fill="none"><circle cx="8" cy="8" r="8" fill="#EB001B" /><circle cx="16" cy="8" r="8" fill="#F79E1B" fillOpacity="0.8" /></svg>
    </div>
  )
}
function BadgeAmex({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded bg-[#2E77BB] text-[8px] font-bold tracking-wider text-white shadow-sm ${className}`} style={{ width: 36, height: 22 }}>
      AMEX
    </div>
  )
}
function BadgeDiscover({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded bg-white text-[8px] font-bold tracking-wider text-[#FF6000] border shadow-sm ${className}`} style={{ width: 58, height: 22, borderColor: '#E5E7EB' }}>
      DISCOVER
    </div>
  )
}

/* ── Custom Golden Minimal Border ───── */
function GoldKolamBorderSVG() {
  return (
    <div className="w-full py-1.5 opacity-60">
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D9B86E] to-transparent"></div>
    </div>
  )
}

/* ── Custom Kolam Corner Flourish SVG ── */
function KolamCornerSVG({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const rotation = {
    'top-left': '',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }[position]

  return (
    <svg className={`w-8 h-8 sm:w-10 sm:h-10 text-[#D9B86E] opacity-80 ${rotation}`} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 2,38 V 14 C 2,7.37 7.37,2 14,2 H 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 8,38 V 16 C 8,11.58 11.58,8 16,8 H 38" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="14" cy="14" r="3" fill="currentColor" />
      <circle cx="25" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="25" r="1.5" fill="currentColor" />
    </svg>
  )
}

import { usePathname } from 'next/navigation'

function MobileNavLink({ href, label, Icon, badge }: { href: string; label: string; Icon: LucideIcon; badge?: string }) {
  const pathname = usePathname()
  const isActive = pathname === href
  const showBadge = badge && badge !== '0'
  
  return (
    <Link href={href} className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 no-underline transition-all duration-200 ${isActive ? 'text-[#F2C94C]' : 'text-[#FAF6EE]/85 hover:text-[#F2C94C]'}`}>
      <span className="relative">
        <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(242,201,76,0.5)]' : ''}`} strokeWidth={isActive ? 2.3 : 2} />
        {showBadge ? (
          <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white/30 bg-[#D32F2F] px-1 text-[9px] font-bold leading-none text-white shadow-sm">
            {badge}
          </span>
        ) : null}
      </span>
      <span className={`max-w-full truncate text-[10px] leading-none ${isActive ? 'font-bold text-[#F2C94C]' : 'font-medium text-[#FAF6EE]/85'}`}>{label}</span>
      {isActive && <span className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-full bg-[#F2C94C] shadow-[0_0_6px_#F2C94C]"></span>}
    </Link>
  )
}

function MobileDrawerQuickLink({ href, label, Icon }: { href: string; label: string; Icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center justify-center gap-2 rounded-lg border border-[#D9B86E] bg-burgundy px-3 py-3 text-sm font-bold text-[#9C1A21] no-underline shadow-[0_8px_22px_rgba(74,15,28,0.04)]"
    >
      <Icon className="h-4 w-4 shrink-0 text-[#BF9A4B]" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

export default function Footer() {
  const { totalUnits: itemCount } = useCart()
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [navMenu, setNavMenu] = useState<NavMenuItem[]>(STATIC_NAV_MENU)
  const [activeMobileCategory, setActiveMobileCategory] = useState<NavMenuItem | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchNavMenu()
      .then(menu => {
        if (cancelled) return
        setNavMenu(menu ? menu : STATIC_NAV_MENU)
      })
      .catch(() => {
        if (!cancelled) setNavMenu(STATIC_NAV_MENU)
      })
    return () => { cancelled = true }
  }, [])

  const footerLogos = [
    { src: '/images/footerlogos/1.png', alt: 'Handloom Weaving', scale: 'scale-[2.4] sm:scale-[2.5] md:scale-[2.6]' },
    { src: '/images/footerlogos/2.png', alt: 'Traditional Silk Saree', scale: 'scale-[1.6] sm:scale-[1.7] md:scale-[1.8]' },
    { src: '/images/footerlogos/3.png', alt: 'Temple Jewellery', scale: 'scale-[1.05] sm:scale-[1.1] md:scale-[1.15]' },
    { src: '/images/footerlogos/4.png', alt: 'Bridal Clutch', scale: 'scale-[2.4] sm:scale-[2.5] md:scale-[2.6]' },
    { src: '/images/footerlogos/5.png', alt: 'Bangles & Accessories', scale: 'scale-[2.4] sm:scale-[2.5] md:scale-[2.6]' },
    { src: '/images/footerlogos/6.png', alt: 'Luxury Silk Serums', scale: 'scale-[1.3] sm:scale-[1.35] md:scale-[1.4]' },
    { src: '/images/footerlogos/7.png', alt: 'Royal Silk Bedding', scale: 'scale-[1.4] sm:scale-[1.45] md:scale-[1.5]' },
  ]

  const themeColors = {
    bg: '#103042',
    textDark: '#FAF6EE',
    textLight: '#FAF6EE',
    accentRed: '#F2C94C',
    accentGold: '#D9B86E',
    borderLight: '#D9B86E'
  }

  return (
    <>
      <footer className="pb-24 md:pb-12 relative flex flex-col justify-center w-full shadow-inner" style={{ background: themeColors.bg, color: themeColors.textDark, paddingTop: '36px', paddingBottom: '36px', fontFamily: '"Assistant", sans-serif', fontSize: '13px', lineHeight: '21px', fontWeight: 500 }}>
        {/* Top Kolam Border (Dark Contrast) */}
        <div className="w-full h-[44px] opacity-90 mb-10" style={{ backgroundImage: "url('/kolam-border.svg')", backgroundRepeat: 'repeat-x', backgroundPosition: 'center', backgroundSize: '32px 44px' }} aria-hidden="true" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 lg:gap-16">
          {/* Brand Intro */}
          <div className="flex flex-col items-start w-full relative md:after:content-[''] md:after:absolute md:after:-right-4 lg:after:-right-8 md:after:top-[10%] md:after:bottom-[10%] md:after:w-[1px] md:after:bg-gradient-to-b md:after:from-transparent md:after:via-[#D9B86E]/30 md:after:to-transparent">
            <Link href="/" className="inline-block no-underline mb-4">
              <div className="bg-[#FAF6EE] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-[#D9B86E]/30 flex items-center justify-center transition-transform duration-300 hover:scale-[1.02] overflow-hidden" style={{ width: '210px', height: '95px' }}>
                <Image 
                  src="/logo.png" 
                  alt="Soil Goddess By Sri Akila" 
                  width={480} 
                  height={380} 
                  className="w-[260px] h-[200px] max-w-none object-contain"
                />
              </div>
            </Link>
            <p className="text-[12px] sm:text-[13px] leading-relaxed mt-1 font-semibold" style={{ color: themeColors.textDark }}>
              <strong className="font-bold uppercase tracking-widest" style={{ color: '#D9B86E', fontFamily: 'Playfair Display, serif', fontSize: '13px' }}>SOIL GODDESS</strong> is for premium handloom sarees, heritage silk collections, and traditional weaves.
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2">
                <IconLocation className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: themeColors.accentGold }} />
                <span className="text-[12px] sm:text-[13px] leading-relaxed font-medium" style={{ color: themeColors.textDark }}>Coimbatore, Tamil Nadu</span>
              </div>
              <div className="flex items-center gap-2">
                <IconMail className="w-3.5 h-3.5 shrink-0" style={{ color: themeColors.accentGold }} />
                <a href="mailto:care@soilgoddess.com" className="text-[12px] sm:text-[13px] font-semibold hover:text-[#D9B86E] transition-colors no-underline break-all" style={{ color: themeColors.textDark }}>care@soilgoddess.com</a>
              </div>
              <div className="flex items-center gap-2">
                <IconPhone className="w-3.5 h-3.5 shrink-0" style={{ color: themeColors.accentGold }} />
                <a href="tel:+919444199944" className="text-[12px] sm:text-[13px] font-semibold hover:text-[#D9B86E] transition-colors no-underline" style={{ color: themeColors.textDark }}>+91 94441-99944</a>
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0" style={{ color: themeColors.accentGold }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <a href="https://www.soilgoddess.com" target="_blank" rel="noopener noreferrer" className="text-[12px] sm:text-[13px] font-semibold hover:text-[#D9B86E] transition-colors no-underline break-all" style={{ color: themeColors.textDark }}>www.soilgoddess.com</a>
              </div>
            </div>
          </div>

          {/* Customer Services */}
          <div className="flex flex-col items-start w-full relative md:after:content-[''] md:after:absolute md:after:-right-4 lg:after:-right-8 md:after:top-[10%] md:after:bottom-[10%] md:after:w-[1px] md:after:bg-gradient-to-b md:after:from-transparent md:after:via-[#D9B86E]/30 md:after:to-transparent">
            <h4 className="footer-section-heading text-[12px] sm:text-[13px] font-bold uppercase tracking-[1.5px] sm:tracking-[2px] mb-2.5" style={{ color: '#D9B86E', fontFamily: '"Assistant", sans-serif' }}>
              CUSTOMER SERVICES
            </h4>
            <div className="space-y-1.5 flex flex-col items-start">
              {customerServices.map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="group relative inline-block text-[12px] sm:text-[13px] font-semibold no-underline pb-0.5 transition-all duration-300"
                  style={{ color: themeColors.textDark }}
                >
                  <span className="relative z-10 group-hover:text-[#D9B86E] transition-colors duration-300">{l.label}</span>
                  <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-[#D9B86E] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col items-start w-full">
            <h4 className="footer-section-heading text-[12px] sm:text-[13px] font-bold uppercase tracking-[1.5px] sm:tracking-[2px] mb-2.5" style={{ color: '#D9B86E', fontFamily: '"Assistant", sans-serif' }}>
              PAYMENT METHODS
            </h4>
            <p className="text-[12px] sm:text-[13px] leading-relaxed mb-3 font-semibold" style={{ color: themeColors.textDark }}>
              At <strong className="font-bold uppercase tracking-widest" style={{ color: '#D9B86E', fontFamily: 'Playfair Display, serif', fontSize: '13px' }}>SOIL GODDESS</strong>, we offer safe & secure payment options.
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <BadgeVisa />
              <BadgeAmex />
              <BadgeMastercard />
              <BadgeDiscover />
            </div>
          </div>
        </div>

        {/* ── Trust & Craftsmanship Badges Container (Custom Gold Kolam Loop Border) ── */}
        <div className="w-full pt-12 pb-4">
          <div className="max-w-[1400px] mx-auto px-2 sm:px-6">
            <div className="relative p-3 sm:p-5 md:p-6 rounded-2xl bg-transparent shadow-[0_12px_40px_rgba(0,0,0,0.25)] overflow-hidden border-2 border-[#D9B86E]/60">
              
              {/* Custom Top Gold Kolam Pattern */}
              <div className="absolute top-0 left-0 right-0 z-10">
                <GoldKolamBorderSVG />
              </div>

              {/* Custom Bottom Gold Kolam Pattern */}
              <div className="absolute bottom-0 left-0 right-0 z-10 transform rotate-180">
                <GoldKolamBorderSVG />
              </div>

              {/* SVG Corner Flourishes */}
              <div className="absolute top-2 left-2 z-10 pointer-events-none">
                <KolamCornerSVG position="top-left" />
              </div>
              <div className="absolute top-2 right-2 z-10 pointer-events-none">
                <KolamCornerSVG position="top-right" />
              </div>
              <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                <KolamCornerSVG position="bottom-left" />
              </div>
              <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
                <KolamCornerSVG position="bottom-right" />
              </div>

              {/* Inner Fine Gold Line Frame */}
              <div className="absolute inset-2 sm:inset-3 border border-[#D9B86E]/35 rounded-xl pointer-events-none z-10"></div>

              {/* 7 Logos in a Single Line (1-7 Order) */}
              <div className="relative z-20 grid grid-cols-7 items-center justify-items-center gap-1 sm:gap-2 md:gap-3 py-3 sm:py-4 w-full">
                {footerLogos.map((logo, idx) => (
                  <div 
                    key={idx} 
                    className="relative flex items-center justify-center group cursor-pointer w-full text-center px-1 sm:px-2 border-r last:border-r-0 border-[#D9B86E]/40"
                  >
                    <div className="relative w-full h-[65px] xs:h-[80px] sm:h-[105px] md:h-[130px] lg:h-[145px] max-w-[170px] flex items-center justify-center overflow-hidden">
                      <Image 
                        src={logo.src} 
                        alt={logo.alt} 
                        fill 
                        unoptimized
                        className={`object-contain ${logo.scale} transition-transform duration-500 group-hover:scale-[1.15] drop-shadow-[0_6px_16px_rgba(0,0,0,0.3)]`}
                        sizes="(max-width: 640px) 14vw, (max-width: 1024px) 14vw, 170px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Kolam Border */}
        <div className="w-full h-[44px] opacity-90 mt-6 mb-2" style={{ backgroundImage: "url('/kolam-border.svg')", backgroundRepeat: 'repeat-x', backgroundPosition: 'center', backgroundSize: '32px 44px' }} aria-hidden="true" />

        {/* Copyright Section */}
        <div className="w-full pt-6 pb-0">
          <div className="max-w-[1000px] mx-auto px-4 flex items-center justify-center">
            <div className="relative py-3.5 px-6 md:px-12 border border-[#D9B86E]/40 rounded-full bg-[#FAF6EE] shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden transition-transform hover:scale-[1.01] duration-300">
              
              {/* Subtle Kolam Background inside the container */}
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "url('/kolam-border.svg')", backgroundRepeat: 'repeat-x', backgroundPosition: 'center', backgroundSize: '32px 44px' }} aria-hidden="true" />
              
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] font-medium tracking-wide">
                <span className="text-[#9C1A21]">Copyright &copy; 2026</span>
                <span className="text-[#300D14] font-bold">Soil Goddess by Sri Akila</span>
                <span className="text-[#300D14] mx-0.5 opacity-40">&bull;</span>
                <span className="text-[#9C1A21]">Designed by</span>
                <a href="http://saitechnosolutions.com/" target="_blank" rel="noopener noreferrer" className="text-[#300D14] font-semibold hover:underline hover:text-[#9C1A21] transition-colors">Sai techno solutions</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {categoriesOpen ? (
        <div className="fixed inset-0 z-[120] md:hidden" role="dialog" aria-modal="true" aria-label="More categories">
          <button
            type="button"
            className="absolute inset-0 bg-burgundy/55"
            aria-label="Close categories"
            onClick={() => {
              setCategoriesOpen(false)
              setActiveMobileCategory(null)
            }}
          />
          <div className="absolute bottom-[64px] right-0 top-0 w-[min(88vw,390px)] overflow-hidden rounded-l-xl border-l border-[#BF9A4B]/45 bg-[#FAF6EE] shadow-[-18px_0_42px_rgba(0,0,0,0.34)] animate-[sgMobileCategoryDrawerIn_260ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="flex items-start justify-between border-b border-[#D9B86E] px-5 py-5">
              <div className="min-w-0 pr-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#BF9A4B]">SOIL GODDESS</p>
                <h2 className="mt-1 truncate text-2xl font-semibold text-[#9C1A21]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {activeMobileCategory ? activeMobileCategory.label : 'Categories'}
                </h2>
                <p className="mt-1 text-xs font-medium text-[#7A5E4B]">
                  {activeMobileCategory ? 'Choose a collection' : 'Explore sarees and collections'}
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
                className={`flex h-12 w-12 shrink-0 items-center justify-center text-gold shadow-sm transition-colors ${
                  activeMobileCategory ? 'rounded-full bg-[#9C1A21]' : 'rounded-sm bg-[#841920]'
                }`}
                aria-label={activeMobileCategory ? 'Back to categories' : 'Close categories'}
              >
                {activeMobileCategory ? <ChevronRight className="h-5 w-5 rotate-180" /> : <X className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative overflow-hidden" style={{ height: 'calc(100% - 105px)' }}>
              <div
                className={`absolute inset-0 overflow-y-auto px-5 py-5 transition-transform duration-300 ease-out ${
                  activeMobileCategory ? '-translate-x-full' : 'translate-x-0'
                }`}
                aria-hidden={Boolean(activeMobileCategory)}
              >
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-2">
                    <MobileDrawerQuickLink href="/track-order" label="Track Order" Icon={Truck} />
                    <MobileDrawerQuickLink href="/sale" label="Sale" Icon={Percent} />
                  </div>

                  <div className="divide-y divide-[#D9B86E] border-y border-[#D9B86E]">
                    {navMenu.map(category => (
                      category.subCategories?.length ? (
                        <button
                          key={category.label}
                          type="button"
                          onClick={() => setActiveMobileCategory(category)}
                          className="flex w-full items-center justify-between py-4 text-left text-[#2A1A1E]"
                        >
                          <span className="min-w-0 pr-3 text-[15px] font-semibold">{category.label}</span>
                          <ChevronRight className="h-5 w-5 shrink-0 text-[#7A5E4B]" />
                        </button>
                      ) : (
                        <Link
                          key={category.label}
                          href={category.href}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center justify-between py-4 text-[#2A1A1E] no-underline"
                        >
                          <span className="min-w-0 pr-3 text-[15px] font-semibold">{category.label}</span>
                          <ChevronRight className="h-5 w-5 shrink-0 text-[#7A5E4B]" />
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              </div>

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
                      className="flex items-center justify-between rounded-lg bg-[#9C1A21] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-gold no-underline"
                    >
                      View All {activeMobileCategory.label}
                      <ChevronRight className="h-4 w-4" />
                    </Link>

                    <div className="divide-y divide-[#D9B86E] border-y border-[#D9B86E]">
                      {activeMobileCategory.subCategories?.map(sub => (
                        <section key={sub.name} className="py-3">
                          <Link
                            href={filteredCollectionHref(activeMobileCategory.href, sub.name)}
                            onClick={() => setCategoriesOpen(false)}
                            className="flex items-center justify-between py-1 text-[15px] font-bold text-[#9C1A21] no-underline"
                          >
                            {sub.name}
                            <ChevronRight className="h-5 w-5 text-[#7A5E4B]" />
                          </Link>
                          {sub.products?.length ? (
                            <div className="mt-2 grid grid-cols-1 gap-1.5">
                              {sub.products.map(product => (
                                <Link
                                  key={product.name}
                                  href={filteredCollectionHref(activeMobileCategory.href, product.name)}
                                  onClick={() => setCategoriesOpen(false)}
                                  className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium leading-5 text-[#2A1A1E] no-underline hover:bg-burgundy"
                                >
                                  <span>{product.name}</span>
                                  <ChevronRight className="h-4 w-4 text-[#BF9A4B]" />
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

      <div className="fixed bottom-0 left-0 right-0 z-[100] flex h-[64px] items-center justify-between border-t border-[#D9B86E]/30 bg-[#1F080D]/95 backdrop-blur-md px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.65)] md:hidden">
        <MobileNavLink href="/" label="Home" Icon={Home} />
        <MobileNavLink href="/shop" label="Shop" Icon={ShoppingBag} />
        <MobileNavLink href="/wishlist" label="Wishlist" Icon={Heart} />
        <MobileNavLink href="/cart" label="Cart" Icon={ShoppingCart} badge={String(itemCount)} />
        <button
          type="button"
          onClick={() => {
            setCategoriesOpen(true)
            setActiveMobileCategory(null)
          }}
          className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-all duration-200 ${
            categoriesOpen ? 'text-[#F2C94C]' : 'text-[#FAF6EE]/85 hover:text-[#F2C94C]'
          }`}
          aria-label="Open more categories"
        >
          <Menu className={`h-5 w-5 transition-transform ${categoriesOpen ? 'scale-110 drop-shadow-[0_0_8px_rgba(242,201,76,0.5)]' : ''}`} strokeWidth={categoriesOpen ? 2.3 : 2} />
          <span className={`max-w-full truncate text-[10px] leading-none ${categoriesOpen ? 'font-bold text-[#F2C94C]' : 'font-medium text-[#FAF6EE]/85'}`}>Categories</span>
          {categoriesOpen && <span className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-full bg-[#F2C94C] shadow-[0_0_6px_#F2C94C]"></span>}
        </button>
      </div>
    </>
  )
}
