'use client'

import Link from 'next/link'

const footerLinks = {
  Collections: [
    { label: 'Kanchipuram Silk', href: '/collections/kanchipuram' },
    { label: 'Mysore Silk',      href: '/collections/mysore' },
    { label: 'Handloom Cotton',  href: '/collections/cotton' },
    { label: 'Bridal Sarees',    href: '/collections/bridal' },
    { label: 'Clearance Sale',   href: '/sale' },
  ],
  'Customer Care': [
    { label: 'Track My Order',    href: '/track-order' },
    { label: 'Returns & Exchange',href: '/returns' },
    { label: 'Size Guide',        href: '/size-guide' },
    { label: 'Shipping Info',     href: '/shipping' },
    { label: 'WhatsApp Support',  href: 'https://wa.me/919999999999' },
  ],
  Company: [
    { label: 'About Us',       href: '/about' },
    { label: 'Our Weavers',    href: '/weavers' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service',href: '/terms' },
  ],
}

export default function Footer() {
  return (
    <>
    <footer className="pb-24 md:pb-6" style={{ background: 'var(--charcoal)', paddingTop: '56px' }}>
      <div
        className="max-w-[1400px] mx-auto px-8 mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12"
      >
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-3.5 no-underline mb-4">
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--burgundy)', border: '2px solid var(--gold)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--gold-light)">
                <path d="M12 2C8 2 5 5 5 8c0 5 7 14 7 14s7-9 7-14c0-3-3-6-7-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </div>
            <div>
              <span className="block text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--gold-light)' }}>SR Akila Silks</span>
              <span className="text-[10px] tracking-[2.5px] uppercase font-medium" style={{ color: 'rgba(201,168,76,0.6)' }}>Pure Silks · Timeless Elegance</span>
            </div>
          </Link>
          <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Curated handloom silks and organic fabrics, sourced directly from master weavers across India.
            Delivering heritage to your doorstep since 2010.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4
              className="text-xs tracking-[2px] uppercase font-semibold mb-4"
              style={{ color: 'var(--gold)' }}
            >
              {title}
            </h4>
            {links.map(l => (
              <Link
                key={l.label}
                href={l.href}
                className="block text-[13px] mb-2.5 no-underline transition-colors"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-light)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-[1400px] mx-auto px-8 pt-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        <span>© 2025 SR Akila Silks. All rights reserved.</span>
        <span>Designed & Developed by Sai Techno Solutions</span>
      </div>
    </footer>

    {/* Mobile Bottom Navigation */}
    <div className="fixed bottom-0 left-0 right-0 bg-[#FAF6EE] border-t border-[#E8DCC4] flex md:hidden items-end justify-between px-6 pb-2 pt-2 z-[100] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <Link href="/" className="flex flex-col items-center gap-1 text-[#A04724] no-underline">
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        <span className="text-[10px] font-medium">Sarees</span>
      </Link>
      <Link href="/trending" className="flex flex-col items-center gap-1 text-[#A04724] no-underline">
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
        <span className="text-[10px] font-medium">Trending</span>
      </Link>
      <Link href="/favourites" className="flex flex-col items-center gap-1 text-[#A04724] no-underline">
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
        <span className="text-[10px] font-medium">Favourites</span>
      </Link>
      <Link href="/swiftship" className="flex flex-col items-center gap-1 text-[#A04724] no-underline">
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
        <span className="text-[10px] font-medium">SwiftShip</span>
      </Link>
      <Link href="/more" className="flex flex-col items-center gap-1 text-[#1B4332] no-underline relative">
        <div className="absolute -top-[52px] w-[46px] h-[46px] rounded-md bg-[#1B4332] flex items-center justify-center text-white shadow-lg">
           <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.76.45 3.42 1.25 4.87L2 22l5.34-1.19c1.42.74 3.03 1.16 4.67 1.16 5.53 0 10.01-4.48 10.01-10S17.54 2 12.01 2zM12 20c-1.46 0-2.87-.38-4.1-1.07l-.3-.17-3.14.7.72-3.07-.19-.3A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"></path></svg>
        </div>
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        <span className="text-[10px] font-medium">More</span>
      </Link>
    </div>
    </>
  )
}
