'use client'

import Link from 'next/link'
import { useState, type CSSProperties } from 'react'

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

/* ── Main Component ─────────────────────────────── */
export default function Footer() {
  const [email, setEmail] = useState('')

  const socials = [
    { Icon: IconFacebook, href: '#', label: 'Facebook' },
    { Icon: IconInstagram, href: '#', label: 'Instagram' },
    { Icon: IconThread, href: '#', label: 'Threads' },
    { Icon: IconPinterest, href: '#', label: 'Pinterest' },
  ]

  const handloomImages = [
    { src: '/footer-icons/charkha.png', label: 'Charkha', type: 'octagon' },
    { src: '/footer-icons/yarn.png', label: 'Yarn', type: 'arch' },
    { src: '/footer-icons/saree.png', label: 'Saree', type: 'octagon' },
    { src: '/footer-icons/loom.png', label: 'Loom', type: 'arch' },
    { src: '/footer-icons/tassels.png', label: 'Tassels', type: 'octagon' },
    { src: '/footer-icons/mannequin.png', label: 'Mannequin', type: 'arch' },
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

        {/* ── Decorative Motif Divider ── */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-5">
          <div className="relative flex items-center justify-between">
            <div className="absolute inset-0 flex items-center">
              {/* Base thin line */}
              <div className="w-full h-px" style={{ background: themeColors.borderLight }} />
            </div>
            {/* 5 Motif items positioned over the line */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative z-10 p-1 bg-transparent flex items-center justify-center">
                {/* Replace with actual img tag if needed: <img src="/borderdesign/flower-motif.png" className="w-10 h-10 object-contain" /> */}
                <div
                  className="w-8 h-8 md:w-10 md:h-10 bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage: "url('/borderdesign/flower-motif.png')",
                    filter: 'brightness(0) saturate(100%) invert(77%) sepia(21%) saturate(968%) hue-rotate(352deg) brightness(87%) contrast(85%)' // Approximating gold color for the png
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Handloom Styled Image Blocks Row ── */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-5">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-4 md:gap-3">
            {handloomImages.map(({ src, label, type }, index) => {
              const isOctagon = type === 'octagon';
              return (
                <div key={index} className="flex-shrink-0 relative group transition-transform hover:-translate-y-1 hover:scale-105 duration-300">
                  <div
                    className={`overflow-hidden shadow-sm ${isOctagon ? 'w-28 h-28 md:w-36 md:h-36' : 'w-28 h-36 md:w-32 md:h-44'}`}
                    style={isOctagon ? {
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                    } : {
                      borderTopLeftRadius: '999px',
                      borderTopRightRadius: '999px',
                      borderBottomLeftRadius: '0',
                      borderBottomRightRadius: '0'
                    }}
                  >
                    <img
                      src={src}
                      alt={label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )
            })}
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

      {/* Mobile Bottom Navigation (Updated colors to match dark theme) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#300D14] border-t border-[#5A1827] flex md:hidden items-end justify-between px-6 pb-2 pt-2 z-[100] shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#FAF6EE] hover:text-[#C4A462] transition-colors no-underline">
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          <span className="text-[10px] font-medium">Sarees</span>
        </Link>
        <Link href="/trending" className="flex flex-col items-center gap-1 text-[#FAF6EE] hover:text-[#C4A462] transition-colors no-underline">
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
          <span className="text-[10px] font-medium">Trending</span>
        </Link>
        <Link href="/favourites" className="flex flex-col items-center gap-1 text-[#FAF6EE] hover:text-[#C4A462] transition-colors no-underline">
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          <span className="text-[10px] font-medium">Favourites</span>
        </Link>
        <Link href="/swiftship" className="flex flex-col items-center gap-1 text-[#FAF6EE] hover:text-[#C4A462] transition-colors no-underline">
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
          <span className="text-[10px] font-medium">SwiftShip</span>
        </Link>
        <Link href="/more" className="flex flex-col items-center gap-1 text-[#C4A462] no-underline relative">
          <div className="absolute -top-[52px] w-[46px] h-[46px] rounded-md bg-[#C4A462] flex items-center justify-center text-white shadow-lg">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.76.45 3.42 1.25 4.87L2 22l5.34-1.19c1.42.74 3.03 1.16 4.67 1.16 5.53 0 10.01-4.48 10.01-10S17.54 2 12.01 2zM12 20c-1.46 0-2.87-.38-4.1-1.07l-.3-.17-3.14.7.72-3.07-.19-.3A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"></path></svg>
          </div>
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          <span className="text-[10px] font-medium">More</span>
        </Link>
      </div>
    </>
  )
}
