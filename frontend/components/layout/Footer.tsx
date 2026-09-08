'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { CSSProperties } from 'react'


/* ── Data ─────────────────────────────────────────── */
const quickLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Shop Now', href: '/shop' },
  { label: 'Book Events', href: '/events' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'Contact Us', href: '/contact' },
]

const customerServices = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-conditions' },
  { label: 'Shipping & Refund', href: '/shipping-and-refund' },
  { label: 'My Account', href: '/account' },
  { label: 'Wishlist', href: '/wishlist' },
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

export default function Footer() {


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
      <footer className="pt-10 pb-[84px] md:pb-8 relative flex flex-col justify-center w-full shadow-inner" style={{ background: themeColors.bg, color: themeColors.textDark, fontFamily: '"Assistant", sans-serif', fontSize: '13px', lineHeight: '21px', fontWeight: 500 }}>
        {/* Top Kolam Border (Dark Contrast) */}
        <div className="w-full h-[44px] opacity-90 mb-10" style={{ backgroundImage: "url('/kolam-border.svg')", backgroundRepeat: 'repeat-x', backgroundPosition: 'center', backgroundSize: '32px 44px' }} aria-hidden="true" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8 lg:gap-14">
          {/* Brand Intro */}
          <div className="flex flex-col items-start w-full relative md:after:content-[''] md:after:absolute md:after:-right-4 lg:after:-right-7 md:after:top-[10%] md:after:bottom-[10%] md:after:w-[1px] md:after:bg-gradient-to-b md:after:from-transparent md:after:via-[#D9B86E]/30 md:after:to-transparent">
            <Link href="/" className="inline-block no-underline mb-3">
              <div className="bg-[#FAF6EE] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-[#D9B86E]/30 flex items-center justify-center transition-transform duration-300 hover:scale-[1.02] overflow-hidden p-2" style={{ width: '220px', height: '85px' }}>
                <Image 
                  src="/logo.png" 
                  alt="Soil Goddess By Sri Akila" 
                  width={480} 
                  height={380} 
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            <p className="text-[12px] sm:text-[13px] leading-relaxed mt-0.5 font-semibold" style={{ color: themeColors.textDark }}>
              <strong className="font-bold uppercase tracking-widest" style={{ color: '#D9B86E', fontFamily: 'Playfair Display, serif', fontSize: '13px' }}>SOIL GODDESS</strong> is for premium handloom sarees, heritage silk collections, and traditional weaves.
            </p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 w-full">
              <div className="flex items-center gap-2">
                <IconLocation className="w-3.5 h-3.5 shrink-0" style={{ color: themeColors.accentGold }} />
                <span className="text-[12px] sm:text-[13px] leading-relaxed font-medium" style={{ color: themeColors.textDark }}>Coimbatore, Tamil Nadu</span>
              </div>
              <div className="flex items-center gap-2">
                <IconPhone className="w-3.5 h-3.5 shrink-0" style={{ color: themeColors.accentGold }} />
                <a href="tel:+919444199944" className="text-[12px] sm:text-[13px] font-semibold hover:text-[#D9B86E] transition-colors no-underline" style={{ color: themeColors.textDark }}>+91 94441-99944</a>
              </div>
              <div className="flex items-center gap-2">
                <IconMail className="w-3.5 h-3.5 shrink-0" style={{ color: themeColors.accentGold }} />
                <a href="mailto:care@soilgoddess.com" className="text-[12px] sm:text-[13px] font-semibold hover:text-[#D9B86E] transition-colors no-underline break-all" style={{ color: themeColors.textDark }}>care@soilgoddess.com</a>
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0" style={{ color: themeColors.accentGold }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <a href="https://www.soilgoddess.com" target="_blank" rel="noopener noreferrer" className="text-[12px] sm:text-[13px] font-semibold hover:text-[#D9B86E] transition-colors no-underline break-all" style={{ color: themeColors.textDark }}>www.soilgoddess.com</a>
              </div>
            </div>
          </div>

          {/* Quick Links & Customer Services (Compact 2-Column Grid on Mobile) */}
          <div className="flex flex-col items-start w-full relative md:after:content-[''] md:after:absolute md:after:-right-4 lg:after:-right-7 md:after:top-[10%] md:after:bottom-[10%] md:after:w-[1px] md:after:bg-gradient-to-b md:after:from-transparent md:after:via-[#D9B86E]/30 md:after:to-transparent">
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-6 w-full">
              {/* Quick Links */}
              <div>
                <h4 className="footer-section-heading text-[12px] sm:text-[13px] font-bold uppercase tracking-[1.5px] sm:tracking-[2px] mb-2.5" style={{ color: '#D9B86E', fontFamily: '"Assistant", sans-serif' }}>
                  QUICK LINKS
                </h4>
                <div className="space-y-2 flex flex-col items-start">
                  {quickLinks.map(l => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="group relative inline-flex items-center text-[12px] sm:text-[13px] font-semibold no-underline pb-0.5 transition-all duration-300 hover:text-[#D9B86E]"
                      style={{ color: themeColors.textDark }}
                    >
                      <span className="relative z-10">{l.label}</span>
                      <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-[#D9B86E] transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Customer Services */}
              <div>
                <h4 className="footer-section-heading text-[12px] sm:text-[13px] font-bold uppercase tracking-[1.5px] sm:tracking-[2px] mb-2.5" style={{ color: '#D9B86E', fontFamily: '"Assistant", sans-serif' }}>
                  CUSTOMER CARE
                </h4>
                <div className="space-y-2 flex flex-col items-start">
                  {customerServices.map(l => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="group relative inline-flex items-center text-[12px] sm:text-[13px] font-semibold no-underline pb-0.5 transition-all duration-300 hover:text-[#D9B86E]"
                      style={{ color: themeColors.textDark }}
                    >
                      <span className="relative z-10">{l.label}</span>
                      <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-[#D9B86E] transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  ))}
                </div>
              </div>
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
        <div className="w-full pt-4 pb-2">
          <div className="max-w-[1000px] mx-auto px-4 flex items-center justify-center">
            <div className="relative py-3 px-6 md:px-12 border border-[#D9B86E]/40 rounded-full bg-[#FAF6EE] shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden transition-transform hover:scale-[1.01] duration-300">
              
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

      {/* Spacer matching fixed bottom nav height so footer content isn't hidden behind it */}
      <div aria-hidden className="mobile-bottom-nav-spacer" />
    </>
  )
}
