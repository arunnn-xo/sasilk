'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { resolveImageUrl } from '@/lib/api/client'

export interface EventGalleryProps {
  images?: string[] | string | null
  eventName: string
  coverImageUrl?: string | null
}

export default function EventGallery({ images, eventName, coverImageUrl }: EventGalleryProps) {
  // Normalize gallery images safely from string array or serialized JSON string
  let rawList: string[] = []
  if (Array.isArray(images)) {
    rawList = images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
  } else if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) {
        rawList = parsed.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
      }
    } catch {
      if (images.trim()) rawList = [images.trim()]
    }
  }

  // Combine cover image and gallery images safely without duplicates
  const list: string[] = []
  if (coverImageUrl && typeof coverImageUrl === 'string' && coverImageUrl.trim()) {
    list.push(coverImageUrl.trim())
  }
  for (const img of rawList) {
    if (!list.includes(img.trim())) {
      list.push(img.trim())
    }
  }

  // If no images exist, gracefully omit (zero voids)
  if (list.length === 0) {
    return null
  }

  // Gallery state
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const thumbnailRailRef = useRef<HTMLDivElement>(null)

  // Scroll active thumbnail into view when activeIndex changes
  useEffect(() => {
    if (thumbnailRailRef.current && list.length > 1) {
      const activeThumb = thumbnailRailRef.current.children[activeIndex] as HTMLElement | undefined
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [activeIndex, list.length])

  // Circular navigation handlers
  const handlePrev = useCallback(() => {
    setActiveIndex(prev => (prev === 0 ? list.length - 1 : prev - 1))
  }, [list.length])

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev === list.length - 1 ? 0 : prev + 1))
  }, [list.length])

  // Keyboard navigation & body scroll trap for Lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isLightboxOpen) return
      if (e.key === 'Escape') {
        setIsLightboxOpen(false)
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLightboxOpen, handleNext, handlePrev])

  // Mobile touch swipe gestures
  const minSwipeDistance = 45
  function handleTouchStart(e: React.TouchEvent) {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
  }
  function handleTouchMove(e: React.TouchEvent) {
    setTouchEndX(e.targetTouches[0].clientX)
  }
  function handleTouchEnd() {
    if (!touchStartX || !touchEndX) return
    const distance = touchStartX - touchEndX
    if (distance > minSwipeDistance) {
      handleNext()
    } else if (distance < -minSwipeDistance) {
      handlePrev()
    }
  }

  // Single-Image Presentation
  if (list.length === 1) {
    const singleImgUrl = resolveImageUrl(list[0]) || list[0]
    return (
      <div className="mb-8">
        <div className="group relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-2xl border border-[#D9B86E]/50 bg-[#FAF6EE] shadow-md transition-shadow hover:shadow-lg">
          <img
            src={singleImgUrl}
            alt={eventName}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          />
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="View fullscreen image"
            className="absolute right-3.5 top-3.5 rounded-full bg-black/60 p-2.5 text-[#FAF6EE] backdrop-blur-md transition-all hover:bg-black/80 hover:text-[#E8C87A] focus:outline-none focus:ring-2 focus:ring-[#D9B86E]"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Lightbox for Single Image */}
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-fadeIn"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close fullscreen modal"
              className="absolute right-5 top-5 z-50 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/20 hover:text-[#E8C87A] focus:outline-none"
            >
              <X size={22} />
            </button>
            <div className="relative max-h-[90vh] max-w-[90vw]" onClick={e => e.stopPropagation()}>
              <img
                src={singleImgUrl}
                alt={eventName}
                className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />
              <p className="mt-3 text-center font-sans text-xs text-[#FAF6EE]/80">{eventName}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Multi-Image Presentation
  const activeImgUrl = resolveImageUrl(list[activeIndex]) || list[activeIndex]

  return (
    <div className="mb-8 select-none">
      {/* Active High-Res Viewport */}
      <div
        className="group relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-2xl border border-[#D9B86E]/50 bg-[#FAF6EE] shadow-md transition-all duration-300"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={activeIndex}
          src={activeImgUrl}
          alt={`${eventName} - Photo ${activeIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-pointer animate-fadeIn"
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Top-Right Badge & Fullscreen Lightbox Button */}
        <div className="absolute right-3.5 top-3.5 z-10 flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 font-montserrat text-[11px] font-bold tracking-widest text-[#FAF6EE] backdrop-blur-md shadow-sm">
            {activeIndex + 1} / {list.length}
          </span>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="View fullscreen image"
            className="rounded-full border border-white/15 bg-black/60 p-2 text-[#FAF6EE] backdrop-blur-md shadow-sm transition-all hover:bg-black/80 hover:text-[#E8C87A] focus:outline-none focus:ring-2 focus:ring-[#D9B86E]"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Previous Navigation Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous image"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 rounded-full border border-[#D9B86E]/60 bg-white/90 p-2 text-[#5A1827] shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8B1A2B]/40"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Next Navigation Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next image"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 rounded-full border border-[#D9B86E]/60 bg-white/90 p-2 text-[#5A1827] shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8B1A2B]/40"
        >
          <ChevronRight size={18} />
        </button>

        {/* Mobile Carousel Indicator Dots */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 sm:hidden">
          {list.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Jump to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx ? 'w-5 bg-[#E8C87A]' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Horizontal Thumbnail Switcher Strip */}
      <div
        ref={thumbnailRailRef}
        className="mt-3 flex items-center gap-2.5 overflow-x-auto py-1.5 [scrollbar-width:none] [-ms-overflow-style:none]"
      >
        {list.map((img, idx) => {
          const thumbUrl = resolveImageUrl(img) || img
          const isActive = activeIndex === idx
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Select photo ${idx + 1} of ${list.length}`}
              className={`group relative h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-all duration-200 focus:outline-none ${
                isActive
                  ? 'border-2 border-[#8B1A2B] ring-2 ring-[#D9B86E] scale-105 shadow-md opacity-100'
                  : 'border border-[#E8DCC4] opacity-70 hover:opacity-100 hover:border-[#D9B86E] shadow-sm'
              }`}
            >
              <img
                src={thumbUrl}
                alt={`${eventName} thumbnail ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </button>
          )
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header Bar */}
          <div
            className="flex w-full max-w-6xl items-center justify-between py-2 text-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-montserrat text-xs font-bold tracking-widest text-[#E8C87A]">
                {activeIndex + 1} / {list.length}
              </span>
              <span className="hidden sm:inline font-serif text-sm text-[#FAF6EE] truncate max-w-md">
                {eventName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close fullscreen modal"
              className="rounded-full bg-white/10 p-2.5 text-white transition-all hover:bg-white/25 hover:text-[#E8C87A] focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          {/* Centered High-Res Image Viewport */}
          <div
            className="relative flex flex-1 items-center justify-center w-full max-w-6xl my-2"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-2 sm:left-4 z-20 rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:text-[#E8C87A] focus:outline-none"
            >
              <ChevronLeft size={24} />
            </button>

            <img
              src={activeImgUrl}
              alt={`${eventName} - High-res ${activeIndex + 1}`}
              className="max-h-[75vh] max-w-[92vw] rounded-xl object-contain shadow-2xl animate-fadeIn"
            />

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-2 sm:right-4 z-20 rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:text-[#E8C87A] focus:outline-none"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          <div
            className="flex w-full max-w-2xl items-center justify-center gap-2 overflow-x-auto py-2 [scrollbar-width:none] [-ms-overflow-style:none]"
            onClick={e => e.stopPropagation()}
          >
            {list.map((img, idx) => {
              const thumbUrl = resolveImageUrl(img) || img
              const isActive = activeIndex === idx
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg transition-all ${
                    isActive
                      ? 'border-2 border-[#E8C87A] ring-2 ring-[#E8C87A]/50 scale-105 opacity-100 shadow-md'
                      : 'border border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
