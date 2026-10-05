'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules'
import { Play, Pause, Eye, X, ChevronLeft, ChevronRight, Volume2, VolumeX, ShoppingBag } from 'lucide-react'
import { fetchReels } from '@/lib/api/storefront'
import { resolveImageUrl } from '@/lib/api/client'
import type { StorefrontReel } from '@/lib/api/types'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

export default function InstaReels() {
  const [mounted, setMounted] = useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null)
  const [reelsData, setReelsData] = useState<StorefrontReel[]>([])
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  const modalSwiperRef = useRef<SwiperType | null>(null)
  const baseSwiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    setMounted(true)
    let cancelled = false
    fetchReels().then((data) => {
      if (!cancelled) setReelsData(data || [])
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Lock body scroll only when modal is open
  useEffect(() => {
    if (activeSlideIndex === null) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [activeSlideIndex])

  const displayData = useMemo(
    () => reelsData.filter(reel => Boolean(reel.videoUrl || reel.imageUrl)),
    [reelsData]
  )

  // Ensure sufficient slides for Swiper's Coverflow infinite loop calculation so it never stops at the edge
  const modalSlides = useMemo(() => {
    if (displayData.length === 0) return []
    if (displayData.length >= 8) {
      return displayData.map((item, idx) => ({ ...item, uniqueKey: `reel-${item.id}-${idx}`, originalIndex: idx }))
    }
    const repeatCount = Math.ceil(8 / displayData.length)
    const result: Array<StorefrontReel & { uniqueKey: string; originalIndex: number }> = []
    for (let r = 0; r < repeatCount; r++) {
      displayData.forEach((item, idx) => {
        result.push({
          ...item,
          uniqueKey: `reel-${item.id}-rep-${r}-${idx}`,
          originalIndex: idx,
        })
      })
    }
    return result
  }, [displayData])

  // Synchronize playback: ONLY the center slide video plays, all other videos are paused
  const updateActiveVideo = useCallback(
    (swiper: SwiperType) => {
      if (!swiper || !swiper.el) return

      const slides = swiper.el.querySelectorAll('.swiper-slide')
      slides.forEach((slideEl) => {
        const video = slideEl.querySelector('video') as HTMLVideoElement | null
        if (!video) return

        if (slideEl.classList.contains('swiper-slide-active')) {
          video.muted = isMuted
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch(() => {
                // If browser blocks unmuted playback, fallback to muted playback
                video.muted = true
                video
                  .play()
                  .then(() => setIsPlaying(true))
                  .catch(() => setIsPlaying(false))
              })
          }
        } else {
          // Pause and reset all non-center videos immediately
          video.pause()
        }
      })
    },
    [isMuted]
  )

  // Pause all videos when modal closes
  useEffect(() => {
    if (activeSlideIndex === null && modalSwiperRef.current?.el) {
      const allVideos = modalSwiperRef.current.el.querySelectorAll('video')
      allVideos.forEach((v) => v.pause())
    }
  }, [activeSlideIndex])

  // Toggle mute on active center video
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  // Toggle play/pause on active center video
  const toggleActivePlay = useCallback(() => {
    if (!modalSwiperRef.current?.el) return
    const activeSlide = modalSwiperRef.current.el.querySelector('.swiper-slide-active')
    const activeVideo = activeSlide?.querySelector('video') as HTMLVideoElement | null
    if (!activeVideo) return

    if (activeVideo.paused) {
      activeVideo
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    } else {
      activeVideo.pause()
      setIsPlaying(false)
    }
  }, [])

  // Render nothing until mounted and only when real reels exist
  if (!mounted || displayData.length === 0) return null

  return (
    <>
      {/* --- BASE HOMEPAGE SECTION --- */}
      <section className="py-16 md:py-24 bg-[#FAF6EE] relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.03] transform translate-x-20 -translate-y-20 bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat pointer-events-none z-0"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-5xl font-bold text-[#103042] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Reel the Weave
            </h2>
          </div>

          <div className="w-full max-w-[1400px] mx-auto min-h-[400px] relative group">
            {/* Custom Navigation for the Main Slider */}
            <button
              onClick={() => baseSwiperRef.current?.slidePrev()}
              className="watch-prev absolute -left-2 md:-left-6 top-[45%] -translate-y-1/2 z-[10] w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-[#FAF6EE] border border-[#D9B86E] rounded-full flex items-center justify-center text-[#103042] transition-all hover:scale-110 shadow-[0_4px_10px_rgba(0,0,0,0.1)] hidden md:flex cursor-pointer"
              aria-label="Previous reel"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => baseSwiperRef.current?.slideNext()}
              className="watch-next absolute -right-2 md:-right-6 top-[45%] -translate-y-1/2 z-[10] w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-[#FAF6EE] border border-[#D9B86E] rounded-full flex items-center justify-center text-[#103042] transition-all hover:scale-110 shadow-[0_4px_10px_rgba(0,0,0,0.1)] hidden md:flex cursor-pointer"
              aria-label="Next reel"
            >
              <ChevronRight size={24} />
            </button>

            <Swiper
              onSwiper={(swiper) => {
                baseSwiperRef.current = swiper
              }}
              spaceBetween={24}
              slidesPerView={'auto'}
              grabCursor={true}
              loop={displayData.length >= 3}
              loopPreventsSliding={false}
              autoplay={{
                delay: 3200,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              modules={[Autoplay, Navigation]}
              className="w-full pt-4 pb-12 px-4 md:px-0"
            >
              {displayData.map((reel, index) => {
                const reelVideoUrl = resolveImageUrl(reel.videoUrl || '', '')
                const reelImageUrl = resolveImageUrl(reel.imageUrl || '')
                return (
                <SwiperSlide
                  key={reel.id}
                  onClick={() => setActiveSlideIndex(index)}
                  className="!w-[180px] sm:!w-[200px] md:!w-[220px] !h-[320px] sm:!h-[355px] md:!h-[390px] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white border border-[#D9B86E]/30 group cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="w-full h-full relative block">
                    {reelVideoUrl ? (
                      <video
                        src={reelVideoUrl}
                        poster={reelImageUrl || undefined}
                        muted
                        autoPlay
                        loop
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : reelImageUrl ? (
                      <Image
                        src={reelImageUrl}
                        alt={`Instagram Reel ${reel.id}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 240px, 280px"
                        priority={reel.id <= 4}
                      />
                    ) : null}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 opacity-70 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>

                    {/* Views Badge */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 pointer-events-none">
                      <Eye size={14} />
                      {reel.views}
                    </div>

                    {!reelVideoUrl && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 border border-white/40 pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <Play size={24} className="text-white ml-1 fill-white" />
                      </div>
                    )}

                    {/* Attached Product Pill or Brand Watermark */}
                    {reel.product ? (
                      <div className="absolute bottom-3 left-2.5 right-2.5 z-10 pointer-events-none">
                        <div className="bg-black/75 backdrop-blur-md border border-[#D9B86E]/40 rounded-full px-2.5 py-1 flex items-center gap-1.5 text-white shadow-lg max-w-full">
                          <ShoppingBag size={11} className="text-[#D9B86E] shrink-0" />
                          <span className="text-[10px] font-semibold truncate flex-1">{reel.product.name}</span>
                          <span className="text-[10px] font-bold text-[#D9B86E] shrink-0">
                            ₹{Number(reel.product.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center w-full pointer-events-none">
                        <p
                          className="text-[var(--gold)] text-base font-bold tracking-widest uppercase opacity-90"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          Soil Goddess
                        </p>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              )})}
            </Swiper>
          </div>
        </div>
      </section>

      {/* --- 3D COVERFLOW FULLSCREEN MODAL (Infinite Loop & Active Center Video Playback) --- */}
      {activeSlideIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-[#103042]/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.05] bg-[url('/borderdesign/flower-motif.png')] bg-repeat bg-[length:150px] pointer-events-none z-0"></div>

          {/* Close Button */}
          <button
            onClick={() => setActiveSlideIndex(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 z-[250] w-12 h-12 bg-[#D9B86E]/10 hover:bg-[#D9B86E]/20 backdrop-blur-md border border-[#D9B86E]/30 rounded-full flex items-center justify-center text-[#D9B86E] transition-all hover:scale-110 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={() => modalSwiperRef.current?.slidePrev()}
            className="reels-prev absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-[250] w-12 h-12 md:w-16 md:h-16 bg-[#D9B86E]/10 hover:bg-[#D9B86E]/20 backdrop-blur-md border border-[#D9B86E]/30 rounded-full flex items-center justify-center text-[#D9B86E] transition-all hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Previous reel"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={() => modalSwiperRef.current?.slideNext()}
            className="reels-next absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-[250] w-12 h-12 md:w-16 md:h-16 bg-[#D9B86E]/10 hover:bg-[#D9B86E]/20 backdrop-blur-md border border-[#D9B86E]/30 rounded-full flex items-center justify-center text-[#D9B86E] transition-all hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Next reel"
          >
            <ChevronRight size={32} />
          </button>

          <div className="w-full max-w-[1200px] h-[75vh] md:h-[85vh] relative flex items-center justify-center z-10">
            <Swiper
              key={`coverflow-modal-${activeSlideIndex}`}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              loop={modalSlides.length >= 2}
              loopPreventsSliding={false}
              loopAdditionalSlides={2}
              slideToClickedSlide={true}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 200,
                modifier: 2,
                slideShadows: true,
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              modules={[EffectCoverflow, Pagination, Navigation]}
              className="w-full h-full pt-10 pb-16"
              onSwiper={(swiper) => {
                modalSwiperRef.current = swiper
                if (activeSlideIndex !== null) {
                  swiper.slideToLoop(activeSlideIndex, 0, false)
                }
                setTimeout(() => {
                  updateActiveVideo(swiper)
                }, 100)
              }}
              onSlideChange={(swiper) => {
                updateActiveVideo(swiper)
              }}
              onSlideChangeTransitionEnd={(swiper) => {
                updateActiveVideo(swiper)
              }}
              onTransitionEnd={(swiper) => {
                updateActiveVideo(swiper)
              }}
            >
              {modalSlides.map((reel) => (
                <SwiperSlide
                  key={reel.uniqueKey}
                  className="!w-[280px] sm:!w-[340px] md:!w-[420px] !h-[500px] sm:!h-[600px] md:!h-[720px] rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-black border border-white/10 relative select-none"
                >
                  <div
                    className="w-full h-full relative block cursor-pointer"
                    onClick={toggleActivePlay}
                  >
                    {reel.videoUrl ? (
                      <video
                        src={resolveImageUrl(reel.videoUrl, '')}
                        poster={reel.imageUrl ? resolveImageUrl(reel.imageUrl) : undefined}
                        muted={isMuted}
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Image
                          src={resolveImageUrl(reel.imageUrl)}
                          alt={`Instagram Reel ${reel.id}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 340px, 420px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.2)] pointer-events-none">
                          <Play size={36} className="text-white ml-2 fill-white" />
                        </div>
                      </>
                    )}

                    {/* Play/Pause indicator icon when paused on active slide */}
                    {!isPlaying && reel.videoUrl && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-xl pointer-events-none z-20">
                        <Play size={28} className="text-white ml-1 fill-white" />
                      </div>
                    )}

                    {/* Views Badge (top-left) */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 pointer-events-none z-20">
                      <Eye size={15} />
                      {reel.views}
                    </div>

                    {/* Audio Mute/Unmute Toggle (top-right) */}
                    {reel.videoUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleMute()
                        }}
                        className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 transition-transform hover:scale-110 cursor-pointer"
                        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                      >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                    )}

                    {/* Attached Product Card or Brand Watermark */}
                    {reel.product ? (
                      <div
                        className="absolute bottom-4 left-3 right-3 sm:bottom-6 sm:left-4 sm:right-4 z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-black/80 hover:bg-black/90 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-[#D9B86E]/40 shadow-[0_12px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 transition-colors">
                          <Link
                            href={`/products/${reel.product.slug || reel.product.id}`}
                            className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 group/prod no-underline"
                          >
                            {/* Product Thumbnail */}
                            <div className="relative h-12 w-10 sm:h-14 sm:w-12 rounded-lg overflow-hidden border border-[#D9B86E]/40 bg-zinc-900 shrink-0">
                              <img
                                src={resolveImageUrl(reel.product.imageUrl || reel.product.images?.[0]?.imageUrl || '')}
                                alt={reel.product.name}
                                className="h-full w-full object-cover group-hover/prod:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>

                            {/* Product Info */}
                            <div className="min-w-0 flex-1 text-left">
                              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#D9B86E]">
                                <ShoppingBag size={11} className="shrink-0" />
                                <span>Featured Product</span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover/prod:text-[#D9B86E] transition-colors">
                                {reel.product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs sm:text-sm font-extrabold text-[#D9B86E]">
                                  ₹{Number(reel.product.price || 0).toLocaleString('en-IN')}
                                </span>
                                {reel.product.originalPrice && (
                                  <span className="text-[10px] sm:text-xs text-white/50 line-through">
                                    ₹{Number(reel.product.originalPrice).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>

                          {/* Action Button */}
                          <Link
                            href={`/products/${reel.product.slug || reel.product.id}`}
                            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#D9B86E] hover:bg-[#c9a75d] text-[#103042] font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition-transform hover:scale-105 shadow flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer no-underline"
                          >
                            <span>Shop</span>
                            <ChevronRight size={14} className="stroke-[2.5]" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center w-full pointer-events-none z-10">
                        <div className="w-8 h-8 mx-auto mb-2 opacity-90">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full text-[var(--gold)]"
                          >
                            <path
                              d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                        <p
                          className="text-[var(--gold)] text-lg font-bold tracking-widest uppercase"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          Soil Goddess
                        </p>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* Custom Swiper Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .swiper-pagination-bullet {
          background-color: var(--gold) !important;
          opacity: 0.4;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          opacity: 1 !important;
          width: 24px !important;
          border-radius: 4px !important;
          background-color: var(--burgundy) !important;
        }
        
        /* Modal specific pagination overrides */
        .fixed .swiper-pagination-bullet-active {
          background-color: var(--gold) !important;
        }
      `,
        }}
      />
    </>
  )
}
