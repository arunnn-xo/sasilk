'use client'

import Image from 'next/image'

export default function FounderSection() {
  return (
    <section className="w-full bg-[#FAF6EE] py-16 md:py-24 relative overflow-hidden">
      {/* Background Watermark/Decorations */}
      <div 
        className="absolute right-0 bottom-0 w-72 h-72 md:w-96 md:h-96 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: "url('/borderdesign/flower-motif.png')", 
          backgroundSize: "contain", 
          backgroundRepeat: "no-repeat", 
          backgroundPosition: "bottom right" 
        }} 
      />
      <div 
        className="absolute left-0 top-0 w-72 h-72 md:w-96 md:h-96 opacity-[0.03] pointer-events-none transform rotate-180" 
        style={{ 
          backgroundImage: "url('/borderdesign/flower-motif.png')", 
          backgroundSize: "contain", 
          backgroundRepeat: "no-repeat", 
          backgroundPosition: "bottom right" 
        }} 
      />

      {/* Decorative Gold Borders */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4A462] to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4A462] to-transparent opacity-30"></div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* Left Column: Portrait Medallion */}
          <div className="flex-shrink-0 relative group">
            {/* Outer Decorative Rings */}
            <div className="absolute -inset-4 rounded-full border border-dashed border-[#C4A462]/40 animate-[spin_120s_linear_infinite] pointer-events-none"></div>
            <div className="absolute -inset-2 rounded-full border border-[#C4A462]/20 pointer-events-none"></div>
            
            {/* Main Portrait Circle */}
            <div 
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[350px] md:h-[350px] rounded-full border-[6px] border-double border-[#C4A462] shadow-[0_20px_50px_rgba(90,24,39,0.15)] transition-all duration-500 group-hover:shadow-[0_25px_60px_rgba(90,24,39,0.25)] group-hover:scale-[1.02]"
              style={{
                backgroundImage: "url('/sri-akila-portrait.png')",
                backgroundSize: "116%",
                backgroundPosition: "56.5% 46%",
                backgroundRepeat: "no-repeat",
                backgroundColor: "white"
              }}
            >
            </div>

            {/* Little Crown Badge on top/bottom center */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#300D14] text-[#C4A462] px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-[#C4A462] shadow-md z-20">
              Founder & Designer
            </div>
          </div>

          {/* Right Column: Message & Quote */}
          <div className="flex-1 text-center lg:text-left">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-[1px] w-6 bg-[#C4A462] lg:block hidden"></span>
              <span className="text-[#C4A462] text-[11px] md:text-[12px] font-bold tracking-[0.25em] uppercase font-cinzel">
                Founder's Vision
              </span>
              <span className="h-[1px] w-6 bg-[#C4A462]"></span>
            </div>

            {/* Main Title */}
            <h2 className="font-playfair text-[#300D14] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Sri Akila's <span className="font-cormorant italic font-normal text-[#C4A462]">Promise</span>
            </h2>

            {/* Quote Body */}
            <div className="relative">
              {/* Elegant Large Quote Mark */}
              <span className="absolute -top-8 -left-4 text-7xl font-playfair text-[#C4A462] opacity-20 pointer-events-none select-none">“</span>
              
              <p className="font-montserrat text-[#4A4A4A] text-sm sm:text-base leading-[1.8] mb-6 italic relative z-10 font-medium">
                "Soil Goddess is born out of my deep love for our cultural roots and traditional handloom weaves. Every saree in our collection is curated to bring back the timeless elegance of heritage crafts, direct from the finest weavers of South India."
              </p>
              
              <p className="font-montserrat text-[#5A5A5A] text-sm sm:text-base leading-[1.8] mb-8 relative z-10">
                "We believe in fashion that is sustainable, pure, and filled with the warmth of human touch. At Soil Goddess, our mission is to rejuvenate our traditions and connect you directly with the magic of master craftsmanship, preserving the beautiful legacy of our artisans."
              </p>
            </div>

            {/* Signature & Details */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="h-[1px] w-16 bg-[#C4A462] mb-4"></div>
              
              {/* Styled name signature */}
              <p className="font-cormorant italic text-3xl text-[#300D14] font-medium tracking-wide mb-1">
                Sri Akila
              </p>
              <p className="font-montserrat text-xs text-[#C4A462] font-semibold tracking-widest uppercase">
                Founder, Soil Goddess
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
