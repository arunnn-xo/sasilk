'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/* ── Placeholder Images for Canvas Preview ─── */
const PRODUCT_IMAGES = [
  '/saree1.png',
  '/saree2.png',
  '/saree3.png',
  '/saree4.png',
  '/saree5.png',
  '/saree6.png',
]

const HERO_MODEL_IMG = '/hero-model.png'
const BG_SAREE_IMG = '/saree3.png'

/* ── Integrated BounceCards Component (GSAP removed, Pure React/CSS used) ─── */
function BounceCards({
  className = '',
  images = [],
  containerWidth = 950,
  containerHeight = 220,
  animationDelay = 0.2,
  animationStagger = 0.08,
  transformStyles = [],
  enableHover = true,
  isActive = true,
}: {
  className?: string
  images: string[]
  containerWidth?: number
  containerHeight?: number
  animationDelay?: number
  animationStagger?: number
  transformStyles?: string[]
  enableHover?: boolean
  isActive?: boolean
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const getNoRotationTransform = (transformStr: string): string => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr)
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)')
    } else if (transformStr === 'none') {
      return 'rotate(0deg)'
    } else {
      return `${transformStr} rotate(0deg)`
    }
  }

  const getPushedTransform = (baseTransform: string, offsetX: number): string => {
    const translateRegex = /translate\(([-0-9.]+)px\)/
    const match = baseTransform.match(translateRegex)
    if (match) {
      const currentX = parseFloat(match[1])
      const newX = currentX + offsetX
      return baseTransform.replace(translateRegex, `translate(${newX}px)`)
    } else {
      return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`
    }
  }

  return (
    <div
      className={`relative flex items-center ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
    >
      <style>{`
        @keyframes slideInBounce {
          0% { transform: translateX(-150px) scale(0.5); opacity: 0; }
          75% { transform: translateX(10px) scale(1.02); opacity: 1; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>

      {images.map((src, idx) => {
        let currentTransform = transformStyles[idx] || 'none'
        let scale = 1
        let zIndex = 10

        // Apply Hover Logic
        if (enableHover && hoveredIdx !== null) {
          if (hoveredIdx === idx) {
            currentTransform = getNoRotationTransform(currentTransform)
            scale = 1.05
            zIndex = 50
          } else {
            const offsetX = idx < hoveredIdx ? -40 : 40
            currentTransform = getPushedTransform(currentTransform, offsetX)
          }
        }

        // Apply the scale to the transform string cleanly
        currentTransform = `${currentTransform} scale(${scale})`

        return (
          <div
            key={`${isActive}-${idx}`}
            className="absolute"
            style={{
              animation: isActive ? `slideInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` : 'none',
              animationDelay: `${animationDelay + (idx * animationStagger)}s`,
              opacity: isActive ? 0 : 1,
              zIndex: zIndex,
            }}
          >
            <Link
              href="/collections/organic-sarees"
              className="cursor-pointer shadow-lg rounded-md overflow-hidden bg-white/90 border-[3px] border-white/80 block"
              style={{
                width: 140,
                height: 200,
                transform: currentTransform,
                transformOrigin: 'bottom center',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className="w-full h-full bg-cover bg-top"
                style={{ backgroundImage: `url(${src})` }}
              />
            </Link>
          </div>
        )
      })}
    </div>
  )
}

/* ── Slide 1: Summer Sufiana – Green Banner with Product Strip ─── */
function Slide1({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative w-full h-full overflow-hidden flex items-start"
      style={{ background: 'linear-gradient(135deg, #FAF6EE 0%, #F5EBE1 45%, #EAD4C2 100%)' }}
    >
      {/* Background depth overlays */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 15% 55%, rgba(107,29,43,0.06) 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, rgba(194,155,87,0.1) 0%, transparent 50%)'
      }} />

      {/* Left: Text content */}
      <div className="relative z-20 flex flex-col justify-start pt-10 pl-10 md:pl-16 pb-44 md:pb-52 max-w-sm md:max-w-md">
        <p className="text-[10px] md:text-[11px] tracking-[3px] uppercase font-semibold mb-2"
          style={{ color: '#9f351c' }}>
          Summer Collection 2025
        </p>
        <h2
          className="text-5xl md:text-7xl leading-none uppercase mb-3 font-bold"
          style={{ fontFamily: 'Playfair Display, serif', color: '#5a1827' }}
        >
          Summer<br />Sufiana
        </h2>
        <p className="text-base md:text-lg mb-6 italic"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#732233' }}>
          From 9 to 5, in effortless style.
        </p>
        <Link
          href="/collections/organic-sarees"
          className="no-underline self-start text-[10px] md:text-[11px] tracking-[2px] uppercase font-bold px-5 py-2.5 transition-all duration-300 hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(115, 34, 51, 0.4)',
            color: '#5a1827',
          }}
        >
          Cool Cotton Starting Under ₹2K
        </Link>
      </div>

      {/* Right: Model image */}
      <div className="absolute right-16 md:right-24 top-8 bottom-0 z-10 hidden md:block"
        style={{ width: 'clamp(260px, 22vw, 350px)' }}>
        <div className="w-full h-full bg-cover bg-top rounded-t-3xl"
          style={{ backgroundImage: `url(${HERO_MODEL_IMG})` }} />
      </div>

      {/* Bottom: BounceCards animated strip */}
      <div className="absolute bottom-0 left-0 right-0 z-30 py-4"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }}>
        <div className="w-full overflow-x-auto scrollbar-hide px-4 flex justify-start items-center">
          <BounceCards
            images={PRODUCT_IMAGES}
            transformStyles={PRODUCT_IMAGES.map((_, i) => `translate(${i * 155}px) rotate(0deg)`)}
            containerWidth={PRODUCT_IMAGES.length * 155}
            containerHeight={210}
            isActive={isActive}
            enableHover={true}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Slide 2: Dark Forest Green – Full Width ─────── */
function Slide2() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_SAREE_IMG})` }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />

      {/* Peacock Watermark — hidden on mobile */}
      <div className="absolute left-0 bottom-0 w-32 sm:w-48 md:w-72 opacity-30 pointer-events-none z-10 hidden sm:block">
        <img src="/sectionicon/peacock-transparent.png" className="w-full h-auto object-contain object-bottom" alt="" />
      </div>

      <div className="relative z-10 text-center flex flex-col items-center px-4">
        <p
          className="tracking-[5px] uppercase text-[11px] md:text-sm mb-4 font-semibold"
          style={{ color: '#E2A969' }}
        >
          Exclusively Curated
        </p>
        <h2
          className="text-6xl md:text-[90px] text-white mb-6 font-light tracking-wide uppercase"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          SUFIANA
        </h2>
        <p
          className="max-w-xl mx-auto mb-10 font-light tracking-wider text-sm md:text-base"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          A collection of culture and timeless beauty.
        </p>
        <Link
          href="/collections/organic-sarees"
          className="no-underline px-10 py-3.5 text-[11px] tracking-[3px] uppercase font-bold transition-colors duration-300 shadow-xl"
          style={{ background: 'white', color: '#2D4A22' }}
        >
          View Collection
        </Link>
      </div>
    </div>
  )
}

/* ── Slide 3: Warm Gold – Offer with Dashed Box ─── */
function Slide3() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full h-full p-8 md:p-16 gap-8 relative overflow-hidden">
      <div className="w-full md:w-1/2 flex justify-center items-center relative h-64 md:h-full">
        <div
          className="bg-white p-2 shadow-2xl relative z-10"
          style={{ width: 220, height: 290 }}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_MODEL_IMG})` }}
          />
        </div>
        <div
          className="absolute z-20 flex flex-col items-center justify-center shadow-xl"
          style={{
            right: '8%', bottom: '8%',
            width: 88, height: 116,
            background: '#FDFBF7',
            borderTop: '4px solid #2C241B',
            transform: 'rotate(6deg)',
          }}
        >
          <div
            className="absolute -top-5 rounded-t-full"
            style={{ width: 28, height: 16, border: '2px solid #2C241B', borderBottom: 'none' }}
          />
          <span
            className="text-[9px] font-serif text-center px-1 mt-2"
            style={{ color: '#2C241B' }}
          >
            SR Akila<br />Silks
          </span>
        </div>
      </div>

      <div className="w-full md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start z-30">
        <h2
          className="text-5xl md:text-7xl mb-2 leading-tight italic"
          style={{ fontFamily: 'Playfair Display, serif', color: '#2C241B', fontWeight: 400 }}
        >
          Just Arrived
        </h2>
        <p className="text-sm md:text-base mb-6 max-w-sm font-medium" style={{ color: 'rgba(44,26,0,0.75)' }}>
          A perfect blend of comfort, style, and simplicity for your daily saree look.
        </p>

        <div
          className="p-4 md:p-6 mb-8 w-full max-w-sm"
          style={{
            border: '2px dashed #2C241B',
            background: 'rgba(217,156,91,0.35)',
          }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <h3
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: 'Playfair Display, serif', color: '#2C241B' }}
            >
              15% OFF
            </h3>
            <p className="text-[10px] tracking-[3px] uppercase font-bold" style={{ color: '#2C241B' }}>
              Sitewide
            </p>
            <span className="text-[11px]" style={{ color: 'rgba(44,26,0,0.65)' }}>
              + ₹300 OFF On First Order
            </span>
            <div
              className="mt-2 px-4 py-2 text-[11px] tracking-widest font-bold font-mono"
              style={{ background: '#2C241B', color: '#D99C5B' }}
            >
              CODE: SUTI300
            </div>
          </div>
        </div>

        <Link
          href="/collections/organic-sarees"
          className="no-underline px-10 py-4 text-[11px] tracking-[3px] uppercase font-bold transition-colors duration-300 shadow-xl"
          style={{ background: '#2C241B', color: 'white' }}
        >
          Shop Now
        </Link>
      </div>
    </div>
  )
}

/* ── Main Hero Carousel ──────────────────────────── */
export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    { id: 0, bg: 'transparent', content: <Slide1 isActive={currentSlide === 0} /> },
    { id: 1, bg: '#2D4A22', content: <Slide2 /> },
    { id: 2, bg: '#D99C5B', content: <Slide3 /> },
  ]

  const next = () => setCurrentSlide(p => (p + 1) % slides.length)
  const prev = () => setCurrentSlide(p => (p === 0 ? slides.length - 1 : p - 1))

  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="relative w-full overflow-hidden group"
      style={{ height: 'clamp(420px, 37.5vw, 1200px)' }}
    >
      {/* Slide track */}
      <div className="relative w-full h-full bg-[#0a0a0a]">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="absolute inset-0 w-full h-full transition-opacity duration-[1200ms] ease-in-out"
            style={{ 
              background: slide.bg,
              opacity: currentSlide === idx ? 1 : 0,
              pointerEvents: currentSlide === idx ? 'auto' : 'none',
              zIndex: currentSlide === idx ? 10 : 1
            }}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {/* Prev button */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Next button */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
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
    </div>
  )
}
