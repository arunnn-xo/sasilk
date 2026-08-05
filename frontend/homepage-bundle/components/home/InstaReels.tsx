'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules'
import { Play, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// Mock Data for the reels
const reelsData = [
  {
    id: 1,
    videoThumbnail: '/saree1.png',
    views: '1L',
  },
  {
    id: 2,
    videoThumbnail: '/saree2.png',
    views: '52K',
  },
  {
    id: 3,
    videoThumbnail: '/saree3.png',
    views: '36K',
  },
  {
    id: 4,
    videoThumbnail: '/saree4.png',
    views: '27K',
  },
  {
    id: 5,
    videoThumbnail: '/saree5.png',
    views: '19K',
  },
  {
    id: 6,
    videoThumbnail: '/saree6.png',
    views: '31K',
  },
]

export default function InstaReels() {
  const [mounted, setMounted] = useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeSlideIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [activeSlideIndex])

  if (!mounted) return null;

  return (
    <>
      {/* --- BASE HOMEPAGE SECTION (Normal View like Image 1) --- */}
      <section className="py-16 md:py-24 bg-[#FAF6EE] relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.03] transform translate-x-20 -translate-y-20 bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat pointer-events-none z-0"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-[#103042] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Reel the Weave
            </h2>
          </div>

          <div className="w-full max-w-[1400px] mx-auto min-h-[400px] relative group">
            
            {/* Custom Navigation for the Main Slider */}
            <button className="watch-prev absolute -left-2 md:-left-6 top-[45%] -translate-y-1/2 z-[10] w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-[#FAF6EE] border border-[#D9B86E] rounded-full flex items-center justify-center text-[#103042] transition-all hover:scale-110 shadow-[0_4px_10px_rgba(0,0,0,0.1)] hidden md:flex">
              <ChevronLeft size={24} />
            </button>
            <button className="watch-next absolute -right-2 md:-right-6 top-[45%] -translate-y-1/2 z-[10] w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-[#FAF6EE] border border-[#D9B86E] rounded-full flex items-center justify-center text-[#103042] transition-all hover:scale-110 shadow-[0_4px_10px_rgba(0,0,0,0.1)] hidden md:flex">
              <ChevronRight size={24} />
            </button>

            <Swiper
              spaceBetween={24}
              slidesPerView={'auto'}
              grabCursor={true}
              navigation={{
                prevEl: '.watch-prev',
                nextEl: '.watch-next',
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              modules={[Autoplay, Navigation]}
              className="w-full pt-4 pb-12 px-4 md:px-0"
            >
              {reelsData.map((reel, index) => (
                <SwiperSlide 
                  key={reel.id} 
                  onClick={() => setActiveSlideIndex(index)}
                  className="!w-[180px] sm:!w-[200px] md:!w-[220px] !h-[320px] sm:!h-[355px] md:!h-[390px] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white border border-[#D9B86E]/30 group cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="w-full h-full relative block">
                    {/* Thumbnail */}
                    <Image
                      src={reel.videoThumbnail}
                      alt={`Instagram Reel ${reel.id}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 240px, 280px"
                      priority={reel.id <= 4}
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 opacity-70 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>

                    {/* Views Badge */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 pointer-events-none">
                      <Eye size={14} />
                      {reel.views}
                    </div>

                    {/* Play Button */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 border border-white/40 pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      <Play size={24} className="text-white ml-1 fill-white" />
                    </div>

                    {/* Brand Watermark */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center w-full pointer-events-none">
                      <p className="text-[var(--gold)] text-base font-bold tracking-widest uppercase opacity-90" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Soil Goddess
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>


      {/* --- 3D COVERFLOW FULLSCREEN MODAL (Inside View like Image 2 with Infinite Loop) --- */}
      {activeSlideIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-[#103042]/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.05] bg-[url('/borderdesign/flower-motif.png')] bg-repeat bg-[length:150px] pointer-events-none z-0"></div>

          {/* Close Button */}
          <button 
            onClick={() => setActiveSlideIndex(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 z-[250] w-12 h-12 bg-[#D9B86E]/10 hover:bg-[#D9B86E]/20 backdrop-blur-md border border-[#D9B86E]/30 rounded-full flex items-center justify-center text-[#D9B86E] transition-all hover:scale-110"
          >
            <X size={24} />
          </button>

          {/* Custom Navigation Buttons (positioned absolutely) */}
          <button className="reels-prev absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-[250] w-12 h-12 md:w-16 md:h-16 bg-[#D9B86E]/10 hover:bg-[#D9B86E]/20 backdrop-blur-md border border-[#D9B86E]/30 rounded-full flex items-center justify-center text-[#D9B86E] transition-all hover:scale-110 shadow-lg">
            <ChevronLeft size={32} />
          </button>
          
          <button className="reels-next absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-[250] w-12 h-12 md:w-16 md:h-16 bg-[#D9B86E]/10 hover:bg-[#D9B86E]/20 backdrop-blur-md border border-[#D9B86E]/30 rounded-full flex items-center justify-center text-[#D9B86E] transition-all hover:scale-110 shadow-lg">
            <ChevronRight size={32} />
          </button>

          <div className="w-full max-w-[1200px] h-[75vh] md:h-[85vh] relative flex items-center justify-center z-10">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={activeSlideIndex}
              loop={true}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 200,
                modifier: 2,
                slideShadows: true,
              }}
              navigation={{
                prevEl: '.reels-prev',
                nextEl: '.reels-next',
              }}
              pagination={{ clickable: true }}
              modules={[EffectCoverflow, Pagination, Navigation]}
              className="w-full h-full pt-10 pb-16"
            >
              {reelsData.map((reel) => (
                <SwiperSlide 
                  key={reel.id} 
                  className="!w-[280px] sm:!w-[340px] md:!w-[420px] !h-[500px] sm:!h-[600px] md:!h-[720px] rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-black border border-white/10"
                >
                  <div className="w-full h-full relative block">
                    <Image
                      src={reel.videoThumbnail}
                      alt={`Instagram Reel ${reel.id}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 340px, 420px"
                    />
                    
                    {/* Darker Gradient for Cinematic Feel */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none"></div>

                    {/* Views Badge */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 pointer-events-none">
                      <Eye size={16} />
                      {reel.views}
                    </div>

                    {/* Play Button - Always visible in modal center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 cursor-pointer hover:scale-110 hover:bg-[#800020]/80 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      <Play size={36} className="text-white ml-2 fill-white" />
                    </div>

                    {/* Brand Footer */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center w-full pointer-events-none">
                      <div className="w-10 h-10 mx-auto mb-3 opacity-90">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[var(--gold)]">
                          <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <p className="text-[var(--gold)] text-xl font-bold tracking-widest uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Soil Goddess
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
      
      {/* Custom Swiper Styles */}
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
    </>
  )
}
