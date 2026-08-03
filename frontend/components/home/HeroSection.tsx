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
const BG_SAREE_IMG = '/slide2-bg-new.png'

/* ── Integrated BounceCards Component ─── */
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
              className="cursor-pointer shadow-lg rounded-md overflow-hidden bg-white/90 border-2 border-white/80 block"
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

/* ── Slide 1: Modern Lifestyle Banner 1 ─── */
function Slide1({ isActive }: { isActive?: boolean }) {
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-between">
      {/* Clickable background image */}
      <Link href="/collections/organic-sarees" className="absolute inset-0 z-0 block cursor-pointer">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/lifestyle_banner_1.png)' }}
        />
      </Link>

      {/* Left Bottom: BounceCards animated strip */}
      <div className="absolute bottom-6 left-6 md:left-12 z-30 pointer-events-auto overflow-hidden md:overflow-visible w-full md:w-auto px-0 hidden md:block">
        <div className="flex justify-start items-center w-full overflow-x-auto scrollbar-hide">
          <BounceCards
            images={PRODUCT_IMAGES}
            transformStyles={PRODUCT_IMAGES.map((_, i) => `translate(${i * 140}px) rotate(0deg)`)}
            containerWidth={PRODUCT_IMAGES.length * 140 + 20}
            containerHeight={220}
            isActive={isActive}
            enableHover={true}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Slide 2: Modern Lifestyle Banner 2 ─────── */
function Slide2() {
  return (
    <Link href="/collections/organic-sarees" className="relative w-full h-full block overflow-hidden cursor-pointer">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(/lifestyle_banner_2.png)` }}
      />
    </Link>
  )
}

/* ── Slide 3: Modern Lifestyle Banner 3 ─── */
function Slide3() {
  return (
    <Link href="/collections/organic-sarees" className="relative w-full h-full block overflow-hidden cursor-pointer">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/lifestyle_banner_3.png')` }}
      />
    </Link>
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
