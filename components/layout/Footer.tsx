'use client'

import Link from 'next/link'
import { useState, type CSSProperties } from 'react'
import { ChevronRight, Heart, Home, Menu, Percent, ShoppingBag, ShoppingCart, Truck, X, type LucideIcon } from 'lucide-react'
import { megaMenuData, type MainCategory } from '@/lib/megaMenuData'

function filteredCollectionHref(baseHref: string, filter: string) {
  return `${baseHref}?filter=${encodeURIComponent(filter)}`
}

/* ── Data ─────────────────────────────────────────── */
const usefulLinks = [
  { label: 'Search', href: '/search' },
  { label: 'About SOIL GODDESS', href: '/about' },
  { label: 'Download Our App', href: '/download-app' },
  { label: 'Trademark', href: '/trademark' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund & Return Policy', href: '/returns' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Exchange Policy', href: '/exchange' },
  { label: 'Terms of Conditions', href: '/terms' },
]

const customerService = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Frequently Asked Questions', href: '/faq' },
  { label: 'Track Your Order', href: '/track-order' },
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
  // Using an @ symbol for Threads roughly as placeholder as seen in some social blocks
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8c1.5 0 2.5-1 2.5-2.5S13.5 12 12 12" /></svg>
}

/* ── Payment Badges (simple SVGs/text) ──────────── */
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
function BadgeGPay({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded bg-white text-[9px] font-bold tracking-wider border shadow-sm ${className}`} style={{ width: 36, height: 22, borderColor: '#E5E7EB', color: '#5F6368' }}>
      GPay
    </div>
  )
}

function MobileNavLink({ href, label, Icon, badge }: { href: string; label: string; Icon: LucideIcon; badge?: string }) {
  return (
    <Link href={href} className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[#FAF6EE] no-underline transition-colors hover:text-[#C4A462]">
      <span className="relative">
        <Icon className="h-5 w-5" />
        {badge ? (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full border border-[#300D14] bg-[#C4A462] px-1 text-[9px] font-bold leading-none text-[#300D14]">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="max-w-full truncate text-[10px] font-semibold leading-none">{label}</span>
    </Link>
  )
}

/* ── Main Component ─────────────────────────────── */
function MobileDrawerQuickLink({ href, label, Icon }: { href: string; label: string; Icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center justify-center gap-2 rounded-lg border border-[#E8DCC4] bg-white px-3 py-3 text-sm font-bold text-[#6B1A2A] no-underline shadow-[0_8px_22px_rgba(74,15,28,0.04)]"
    >
      <Icon className="h-4 w-4 shrink-0 text-[#C4A462]" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [activeMobileCategory, setActiveMobileCategory] = useState<MainCategory | null>(null)

  const socials = [
    { Icon: IconFacebook, href: '#', label: 'Facebook' },
    { Icon: IconInstagram, href: '#', label: 'Instagram' },
    { Icon: IconThread, href: '#', label: 'Threads' },
    { Icon: IconPinterest, href: '#', label: 'Pinterest' },
  ]

  const handloomImages = [
    { src: '/footer-icons/charkha.png', label: 'Traditional charkha' },
    { src: '/footer-icons/yarn.png', label: 'Thread spool' },
    { src: '/footer-icons/loom.png', label: 'Handloom' },
    { src: '/footer-icons/tassels.png', label: 'Saree tassels' },
    { src: '/footer-icons/saree.png', label: 'Folded saree' },
    { src: '/footer-icons/mannequin.png', label: 'Tailoring mannequin' },
  ]

  const themeColors = {
    bg: '#300D14',
    textDark: '#FAF6EE',
    textLight: '#E8DFD0',
    accentRed: '#C4A462',
    accentGold: '#C4A462',
    borderLight: '#5A1827'
  }

  return (
    <>
      <footer className="pb-24 md:pb-4 relative" style={{ background: themeColors.bg, color: themeColors.textDark, paddingTop: '40px', fontFamily: '"Assistant", sans-serif', fontSize: '13px', lineHeight: '21px', fontWeight: 400 }}>

        {/* ── Main Grid ── */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4 mb-6">

          {/* About Us */}
          <div>
            <h4 className="footer-section-heading text-[12px] font-bold uppercase tracking-[2px] mb-3 flex items-center gap-2" style={{ color: themeColors.textDark, fontFamily: '"Assistant", sans-serif' }}>
              About Us
              <img src="/sectionicon/golden-quill-feather.png" className="w-4 h-4 object-contain opacity-80" alt="" />
            </h4>
            <p className="text-[12px] leading-relaxed mb-4" style={{ color: themeColors.textDark }}>
              <strong className="font-semibold uppercase tracking-widest" style={{ color: themeColors.textDark, fontFamily: 'Playfair Display, serif', fontSize: '13px' }}>SOIL GODDESS</strong> offers beautifully crafted handloom sarees that blend traditional artistry with modern simplicity — made for comfort and effortless elegance.
            </p>

            <div className="space-y-2 text-[12px] leading-relaxed" style={{ color: themeColors.textDark }}>
              <div className="flex items-start gap-3">
                <IconMail className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: themeColors.accentGold }} />
                <span><strong className="font-medium" style={{ color: themeColors.textDark }}>Email:</strong><br />care@soilgoddess.com</span>
              </div>
              <div className="flex items-start gap-3">
                <IconPhone className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: themeColors.accentGold }} />
                <span><strong className="font-medium" style={{ color: themeColors.textDark }}>Phone:</strong><br />+91 6354506028</span>
              </div>
              <div className="flex items-start gap-3">
                <IconChat className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: themeColors.accentGold }} />
                <span><strong className="font-medium" style={{ color: themeColors.textDark }}>WhatsApp:</strong><br />+91 9265660282</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t" style={{ borderColor: themeColors.borderLight }}>
              <div className="flex items-start gap-3 text-[13px] leading-relaxed" style={{ color: themeColors.textDark }}>
                <IconLocation className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: themeColors.accentGold }} />
                <div>
                  <strong className="font-medium" style={{ color: themeColors.textDark }}>Address:</strong><br />
                  Dr. India Textile Hub, Shop No. 518–522,<br />5th Floor, Surat, Gujarat, India
                </div>
              </div>
              {/* Animated working hours pill */}
              <div className="mt-5">
                <span className="footer-hours-pill">
                  <span className="footer-hours-dot"></span>
                  Open: Mon – Sat &nbsp;|&nbsp; 10 AM – 6 PM IST
                </span>
              </div>
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="footer-section-heading text-[12px] font-bold uppercase tracking-[2px] mb-3" style={{ color: themeColors.textDark, fontFamily: '"Assistant", sans-serif' }}>
              Useful Links
            </h4>
            <div className="space-y-2 flex flex-col items-start">
              {usefulLinks.map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="group relative inline-block text-[13px] no-underline pb-1 transition-all duration-300"
                  style={{ color: themeColors.textDark }}
                >
                  <span className="relative z-10 group-hover:text-[#C4A462] transition-colors duration-300">{l.label}</span>
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#C4A462] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="footer-section-heading text-[12px] font-bold uppercase tracking-[2px] mb-3" style={{ color: themeColors.textDark, fontFamily: '"Assistant", sans-serif' }}>
              Customer Service
            </h4>
            <div className="space-y-2 flex flex-col items-start">
              {customerService.map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="group relative inline-block text-[13px] no-underline pb-1 transition-all duration-300"
                  style={{ color: themeColors.textDark }}
                >
                  <span className="relative z-10 group-hover:text-[#C4A462] transition-colors duration-300">{l.label}</span>
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#C4A462] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter & Socials */}
          <div className="relative overflow-hidden">
            {/* White-gold flowers subtle bg watermark */}
            <div className="absolute -top-4 -right-4 w-32 sm:w-40 h-32 sm:h-40 opacity-10 pointer-events-none select-none rotate-12">
              <img src="/sectionicon/white-gold-flowers.png" className="w-full h-full object-contain" alt="" />
            </div>
            <h4 className="footer-section-heading text-[12px] font-bold uppercase tracking-[2px] mb-3 relative z-10" style={{ color: themeColors.textDark, fontFamily: '"Assistant", sans-serif' }}>
              Newsletter
            </h4>
            <p className="text-[12px] mb-4 leading-relaxed" style={{ color: themeColors.textDark }}>
              Sign up to our newsletter to receive exclusive offers and updates on our latest collections.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address..."
                  className="w-full px-0 py-2.5 text-[13px] outline-none transition-all duration-300 bg-transparent"
                  style={{
                    border: 'none',
                    borderBottom: `1px solid ${themeColors.borderLight}`,
                    color: themeColors.textDark,
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderBottomColor = themeColors.accentGold
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderBottomColor = themeColors.borderLight
                  }}
                />
              </div>
              <button
                className="w-36 py-3 text-[11px] font-bold tracking-[2px] uppercase rounded-sm transition-all duration-300 cursor-pointer relative overflow-hidden group"
                style={{
                  background: 'transparent',
                  color: themeColors.textDark,
                  border: `1px solid ${themeColors.textDark}`
                }}
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Subscribe</span>
                <div className="absolute inset-0 h-full w-0 bg-[#C4A462] transition-all duration-500 ease-out group-hover:w-full z-0"></div>
              </button>
            </div>

            {/* Social Media & Currency Dropdown */}
            <div className="flex flex-col items-start lg:items-end w-full gap-4">
              <div className="flex flex-col items-start lg:items-end gap-3 w-full">
                <h5 className="text-[11px] uppercase tracking-[2px] font-bold" style={{ color: themeColors.textDark }}>
                  Follow Us
                </h5>
                <div
                  className="flex justify-between items-center px-6 py-3 rounded-full w-full max-w-[200px]"
                  style={{ background: themeColors.accentGold }}
                >
                  {socials.map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="transition-transform duration-300 hover:scale-125 hover:-translate-y-1"
                      style={{ color: '#222' }}
                    >
                      <Icon className="w-[15px] h-[15px]" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-3 mt-2 w-full">
                <h5 className="text-[11px] uppercase tracking-[2px] font-bold" style={{ color: themeColors.textDark }}>
                  Local Currency
                </h5>
                <div
                  className="inline-flex items-center justify-between w-24 px-4 py-2.5 rounded-sm text-[12px] cursor-pointer transition-colors duration-300 hover:bg-black hover:text-white"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${themeColors.textDark}`,
                  }}
                >
                  <span className="font-semibold">INR</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Handloom Styled Image Blocks Row ── */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-6">
          <div className="footer-artisan-gallery">
            {handloomImages.map(({ src, label }) => (
              <div key={label} className="footer-artisan-item">
                <img src={src} alt={label} className="footer-artisan-image" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-4">
          <div className="footer-bottom-divider"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
              <span className="text-[13px] font-bold tracking-widest" style={{ color: themeColors.textDark, fontFamily: 'Playfair Display, serif' }}>
                SOIL GODDESS
              </span>
              <span className="hidden sm:block text-[10px]" style={{ color: themeColors.borderLight }}>|</span>
              <span className="text-[11px]" style={{ color: themeColors.textDark }}>
                © 2026 · All rights reserved.
              </span>
              <span className="hidden sm:block text-[10px]" style={{ color: themeColors.borderLight }}>|</span>
              <span className="text-[10px]" style={{ color: themeColors.textDark }}>
                Crafted with ❤ in India
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] hidden md:block" style={{ color: themeColors.textDark }}>
                Designed by Sai Techno Solutions
              </span>
              <div className="flex items-center gap-1.5">
                <BadgeVisa />
                <BadgeMastercard />
                <BadgeAmex />
                <BadgeGPay />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {categoriesOpen ? (
        <div className="fixed inset-0 z-[120] md:hidden" role="dialog" aria-modal="true" aria-label="More categories">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Close categories"
            onClick={() => {
              setCategoriesOpen(false)
              setActiveMobileCategory(null)
            }}
          />
          <div className="absolute bottom-[64px] right-0 top-0 w-[min(88vw,390px)] overflow-hidden rounded-l-xl border-l border-[#C4A462]/45 bg-[#FAF6EE] shadow-[-18px_0_42px_rgba(0,0,0,0.34)] animate-[sgMobileCategoryDrawerIn_260ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="flex items-start justify-between border-b border-[#E8DCC4] px-5 py-5">
              <div className="min-w-0 pr-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#C4A462]">SOIL GODDESS</p>
                <h2 className="mt-1 truncate text-2xl font-semibold text-[#6B1A2A]" style={{ fontFamily: 'Playfair Display, serif' }}>
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
                className={`flex h-12 w-12 shrink-0 items-center justify-center text-white shadow-sm transition-colors ${
                  activeMobileCategory ? 'rounded-full bg-[#6B1A2A]' : 'rounded-sm bg-[#8B172D]'
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

                  <div className="divide-y divide-[#E8DCC4] border-y border-[#E8DCC4]">
                    {megaMenuData.map(category => (
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
                      className="flex items-center justify-between rounded-lg bg-[#6B1A2A] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white no-underline"
                    >
                      View All {activeMobileCategory.label}
                      <ChevronRight className="h-4 w-4" />
                    </Link>

                    <div className="divide-y divide-[#E8DCC4] border-y border-[#E8DCC4]">
                      {activeMobileCategory.subCategories?.map(sub => (
                        <section key={sub.name} className="py-3">
                          <Link
                            href={filteredCollectionHref(activeMobileCategory.href, sub.name)}
                            onClick={() => setCategoriesOpen(false)}
                            className="flex items-center justify-between py-1 text-[15px] font-bold text-[#6B1A2A] no-underline"
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
                                  className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium leading-5 text-[#2A1A1E] no-underline hover:bg-white"
                                >
                                  <span>{product.name}</span>
                                  <ChevronRight className="h-4 w-4 text-[#C4A462]" />
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

      <div className="fixed bottom-0 left-0 right-0 z-[100] flex h-[64px] items-center justify-between border-t border-[#5A1827] bg-[#300D14] px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_12px_rgba(0,0,0,0.5)] md:hidden">
        <MobileNavLink href="/" label="Home" Icon={Home} />
        <MobileNavLink href="/shop" label="Shop" Icon={ShoppingBag} />
        <MobileNavLink href="/wishlist" label="Wishlist" Icon={Heart} />
        <MobileNavLink href="/cart" label="Cart" Icon={ShoppingCart} badge="3" />
        <button
          type="button"
          onClick={() => {
            setCategoriesOpen(true)
            setActiveMobileCategory(null)
          }}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[#C4A462] transition-colors"
          aria-label="Open more categories"
        >
          <Menu className="h-5 w-5" />
          <span className="max-w-full truncate text-[10px] font-semibold leading-none">Categories</span>
        </button>
      </div>
    </>
  )
}
