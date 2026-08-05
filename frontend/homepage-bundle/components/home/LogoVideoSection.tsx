'use client'

import React, { useRef, useEffect } from 'react'

export default function LogoVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => {
      video.play().catch(() => {})
    }

    // Seamless loop handler: reset before video end to avoid native browser pause
    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.08) {
        video.currentTime = 0.001
        video.play().catch(() => {})
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    handlePlay()

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  return (
    <section className="w-full bg-[#FAF6EE] py-12 md:py-16 relative overflow-hidden">
      {/* Background Decorative Motif Watermarks */}
      <div 
        className="absolute top-0 left-0 w-48 h-48 md:w-72 md:h-72 opacity-[0.04] pointer-events-none bg-contain bg-no-repeat bg-left-top"
        style={{ backgroundImage: "url('/borderdesign/flower-motif.png')" }}
      />
      <div 
        className="absolute bottom-0 right-0 w-48 h-48 md:w-72 md:h-72 opacity-[0.04] pointer-events-none bg-contain bg-no-repeat bg-right-bottom transform rotate-180"
        style={{ backgroundImage: "url('/borderdesign/flower-motif.png')" }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Video Card Container */}
        <div className="max-w-3xl md:max-w-4xl mx-auto flex flex-col items-center justify-center">
          <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#BF9A4B]/30 bg-black/5 flex items-center justify-center">
            <video
              ref={videoRef}
              src="/logogif.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-auto max-h-[70vh] object-contain rounded-2xl md:rounded-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
