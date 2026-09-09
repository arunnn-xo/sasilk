'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchBanners } from '@/lib/api/storefront'
import { resolveImageUrl } from '@/lib/api/client'
import type { StorefrontBanner } from '@/lib/api/types'

/* ── Main Hero Carousel (dynamic banners only) ────────── */
export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [banners, setBanners] = useState<StorefrontBanner[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    setMounted(true)
    let cancelled = false
    fetchBanners()
      .then(data => {
        if (!cancelled && data.length > 0) setBanners(data)
      })
      .catch(() => {
        if (!cancelled) setBanners([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const count = banners.length

  const next = () => setCurrentSlide(p => (p + 1) % count)
  const prev = () => setCurrentSlide(p => (p === 0 ? count - 1 : p - 1))

  useEffect(() => {
    if (count <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [count])

  if (!mounted || count === 0) return null

  return (
    <div
      className="relative w-full overflow-hidden group"
      style={{ height: 'clamp(420px, 37.5vw, 1200px)' }}
    >
      {/* Slide track */}
      <div className="relative w-full h-full bg-[#0a0a0a]">
        {banners.map((banner, idx) => {
          const href = banner.ctaUrl || '/shop'
          const wrap = (
            <div
              key={banner.id ?? `slide-${idx}`}
              className="absolute inset-0 w-full h-full transition-opacity duration-[1200ms] ease-in-out"
              style={{
                opacity: currentSlide === idx ? 1 : 0,
                pointerEvents: currentSlide === idx ? 'auto' : 'none',
                zIndex: currentSlide === idx ? 10 : 1,
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${resolveImageUrl(banner.imageUrl)})` }}
              />
              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 flex items-center justify-start px-6 md:px-16">
                  <div className="max-w-xl text-left">
                    {banner.title && (
                      <h2
                        className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF' }}
                      >
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p className="text-base md:text-xl mb-6 drop-shadow" style={{ color: '#FFFFFF' }}>
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.ctaLabel && (
                      <span className="inline-block px-8 py-3.5 text-xs font-bold uppercase tracking-[3px] rounded-sm"
                        style={{ background: '#9C1A21', color: '#FFFFFF' }}
                      >
                        {banner.ctaLabel}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
          return href ? (
            <Link key={banner.id ?? `slide-link-${idx}`} href={href} className="absolute inset-0 block w-full h-full">
              {wrap}
            </Link>
          ) : wrap
        })}
      </div>

      {/* Prev button */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-gold opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Next button */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-gold opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {banners.map((banner, idx) => (
            <button
              key={banner.id ?? `dot-${idx}`}
              onClick={() => setCurrentSlide(idx)}
              className="h-2.5 rounded-full transition-all duration-300"
              style={{
                width: currentSlide === idx ? 32 : 10,
                background: currentSlide === idx ? 'white' : 'rgba(255,255,255,0.4)',
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}