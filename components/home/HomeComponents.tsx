'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Shield, Clock, Globe, Truck } from 'lucide-react'
import { featuredCategories, organicSareeSubcats, newArrivals, loyaltyTiers } from '@/lib/data'
import ProductCard from '@/components/product/ProductCard'

/* ── Summer Sufiana Collection Banner ─────────────── */
export function CollectionBanner() {
  const sarees = [
    { id: 1, img: '/saree1.png', name: 'Classic Black' },
    { id: 2, img: '/saree2.png', name: 'Grey Gold' },
    { id: 3, img: '/saree3.png', name: 'Vibrant Red' },
    { id: 4, img: '/saree4.png', name: 'Rainbow Stripe' },
    { id: 5, img: '/saree5.png', name: 'Cream Pastel' },
    { id: 6, img: '/saree6.png', name: 'Orange Black' },
    { id: 7, img: '/saree1.png', name: 'Purple Zari' },
    { id: 8, img: '/saree2.png', name: 'White Floral' },
    { id: 9, img: '/saree3.png', name: 'Yellow Gold' },
    { id: 10, img: '/saree4.png', name: 'Blue Peacock' },
  ]

  return (
    <section className="relative overflow-hidden" style={{ background: '#5B7D3E' }}>
      {/* Floral motif watermark */}
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 opacity-15 pointer-events-none" style={{ backgroundImage: "url('/borderdesign/flower-motif.png')", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "top right" }}></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 opacity-15 pointer-events-none transform rotate-180" style={{ backgroundImage: "url('/borderdesign/flower-motif.png')", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "top right" }}></div>

      {/* Blurred nature overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(120,180,80,0.6) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(80,140,60,0.5) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 md:py-10">
        {/* Top row: Title + Badge */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A', lineHeight: 1.1 }}
            >
              SUMMER
            </h2>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A', lineHeight: 1.1 }}
            >
              SUFIANA
            </h2>
            <p className="text-sm mt-2" style={{ color: 'rgba(26,26,26,0.7)' }}>
              From 9 to 5, in effortless style.
            </p>
          </div>

          <div className="flex items-start">
            <span
              className="inline-block px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase"
              style={{
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                color: '#1A1A1A',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              COOL COTTON STARTING UNDER ₹2K
            </span>
          </div>
        </div>

        {/* Saree cards horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {sarees.map((saree) => (
            <Link
              key={saree.id}
              href="/collections/organic-sarees"
              className="flex-shrink-0 rounded-xl overflow-hidden block no-underline group"
              style={{
                width: 'clamp(110px, 14vw, 170px)',
                aspectRatio: '3/4',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-6px) scale(1.03)'
                el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = ''
                el.style.boxShadow = ''
              }}
            >
              <img
                src={saree.img}
                alt={saree.name}
                className="w-full h-full object-cover"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Features Strip ───────────────────────────────── */
export function FeaturesStrip() {
  const features = [
    {
      id: 'shipping',
      title: "Free Shipping in India",
      description: "On all orders above ₹999",
      icon: (
        <div className="relative flex items-center justify-center">
          {/* Smoke particles for the truck */}
          <div className="absolute -left-2 bottom-1 flex gap-1">
            <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-smoke delay-0"></div>
            <div className="w-2 h-2 bg-stone-300 rounded-full animate-smoke delay-300"></div>
            <div className="w-1 h-1 bg-stone-400 rounded-full animate-smoke delay-700"></div>
          </div>
          <Truck size={24} className="text-[#5e171b] animate-truck-drive" />
        </div>
      )
    },
    {
      id: 'delivery',
      title: "10–15 Day Delivery",
      description: "Working days across India",
      icon: <Clock size={24} className="text-[#5e171b] animate-clock-spin" />
    },
    {
      id: 'worldwide',
      title: "Worldwide Shipping",
      description: "Delivered to 50+ countries",
      icon: <Globe size={24} className="text-[#5e171b] animate-globe-spin" />
    },
    {
      id: 'authentic',
      title: "100% Authentic Weaves",
      description: "Direct from master weavers",
      icon: (
        <div className="relative flex items-center justify-center">
          <Shield size={24} className="text-[#5e171b]" />
          {/* Custom SVG Tick for drawing animation */}
          <svg
            className="absolute w-4 h-4 text-[#5e171b]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" className="animate-tick-draw" />
          </svg>
        </div>
      )
    }
  ];

  return (
    <>
      {/* Top Hexagon Border */}
      <div className="w-full h-5 md:h-6 bg-repeat-x opacity-70" style={{ backgroundImage: "url('/borderdesign/hex-border.jpg')", backgroundSize: "contain", backgroundPosition: "center" }}></div>
      <div className="w-full bg-[#faf7f2] py-8 px-4 md:px-8 overflow-hidden">
        <style>{`
        /* Truck driving vibration */
        @keyframes truckDrive {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-1px) translateX(2px); }
          50% { transform: translateY(0) translateX(4px); }
          75% { transform: translateY(-1px) translateX(2px); }
        }

        /* Smoke puff animation */
        @keyframes smokePuff {
          0% { transform: scale(0.5) translateX(0); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: scale(1.5) translateX(-20px) translateY(-5px); opacity: 0; }
        }

        /* Clock rotation */
        @keyframes clockSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Globe rotation */
        @keyframes globeSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Drawing the tick mark */
        @keyframes tickDraw {
          0% { stroke-dashoffset: 30; }
          40% { stroke-dashoffset: 0; }
          80% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }

        .animate-truck-drive { animation: truckDrive 0.6s ease-in-out infinite; }
        .animate-smoke { animation: smokePuff 1.5s linear infinite; }
        .animate-clock-spin { animation: clockSpin 4s linear infinite; }
        .animate-globe-spin { animation: globeSpin 10s linear infinite; }
        
        .animate-tick-draw { 
          stroke-dasharray: 30; 
          stroke-dashoffset: 30; 
          animation: tickDraw 3s ease-in-out infinite;
        }

        .delay-0 { animation-delay: 0s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-0">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`flex items-center gap-4 px-6 relative ${index !== features.length - 1 ? 'lg:border-r border-stone-300' : ''
                }`}
            >
              {/* Icon Container with White Circle */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-110">
                {feature.icon}
              </div>

              {/* Text Information */}
              <div className="flex flex-col">
                <h3 className="text-[#5e171b] font-bold text-[13.5px] md:text-base leading-tight uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-[11px] md:text-sm mt-1 font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom Hexagon Border */}
      <div className="w-full h-5 md:h-6 bg-repeat-x opacity-70" style={{ backgroundImage: "url('/borderdesign/hex-border.jpg')", backgroundSize: "contain", backgroundPosition: "center" }}></div>
    </>
  );
}

/* ── Subcategory Scroll Bar ────────────────────────── */
export function SubcatBar() {
  // Active button state-ai track panna
  const [activeTab, setActiveTab] = useState('All');

  // Saree categories list images udan (with images)
  const categories = [
    { name: 'All', img: '/categories/fabric/all.png' },
    { name: 'Cotton', img: '/categories/fabric/cotton.png' },
    { name: 'Handloom', img: '/categories/fabric/handloom.png' },
    { name: 'Linen', img: '/categories/fabric/linen.png' },
    { name: 'Bridal', img: '/categories/ethnic_wear.png' },
    { name: 'Kanchipuram Silk', img: '/categories/mul_diaries.png' },
    { name: 'Mysore Silk', img: '/categories/tissue_tales.png' },
    { name: 'Tussar Silk', img: '/categories/weave_heritage.png' },
    { name: 'Pen Kalamkari Silk', img: '/categories/linen_luxe.png' },
    { name: 'Mulberry Silk', img: '/categories/cloud_cotton.png' },
    { name: 'Banana Silk', img: '/categories/jewellery.png' }
  ];

  return (
    <div className="py-16 bg-[#FAF6EE] flex flex-col items-center px-4 font-sans overflow-hidden relative border-y border-[#E8DCC4]">
      {/* Abstract Luxury Paisley Background (CSS + SVG Masking) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
        {/* Floral Paisley Motif fading out from left */}
        <div className="absolute top-0 left-0 w-[120%] md:w-[60%] h-full" style={{
          backgroundImage: "url('/sectionicon/white-gold-flowers.png')",
          backgroundSize: "cover",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
          maskImage: "linear-gradient(to right, black 10%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to right, black 10%, transparent 90%)"
        }} />
        {/* Subtle Geometric Texture over the section */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30.5V28H0v-2h30v-2.5l15-6.5 15 6.5V26h-30v2h30v2.5l-15 6.5-15-6.5zM30 30.5V28H0v-2h30v-2.5L15 13 0 19.5V26h30v2H0v2.5L15 37l15-6.5z' fill='%23c29b57' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px"
        }} />
      </div>

      {/* Google Fonts and Animations import seiyum style tag */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        
        /* Scrollbar-ai maraikka */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Rotating Border Animation Effects */
        @keyframes spin-border {
          100% { transform: rotate(360deg); }
        }
        
        .border-spin-wrapper {
          position: relative;
          border-radius: 40px 0px 40px 0px;
          overflow: hidden;
          padding: 4px; /* Thicker border for better visibility */
          background-color: #fdf6f0; /* Default solid track color */
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }
        
        /* Impressive hover state */
        .group:hover .border-spin-wrapper {
          background-color: #fcf0e3; 
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(194, 155, 87, 0.25); /* Beautiful gold glow */
        }
        
        .border-spin-wrapper.active {
          background-color: #f7e6ea;
          box-shadow: 0 10px 25px rgba(115, 34, 51, 0.25); /* Burgundy glow */
        }

        /* The spinning highlight (Constantly visible on all cards) */
        .border-spin-wrapper::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          /* Stronger, more visible gold gradient with a longer tail */
          background: conic-gradient(from 0deg, transparent 40%, rgba(194,155,87,0.3) 75%, #c29b57 100%);
          animation: spin-border 5s linear infinite;
          opacity: 0.85;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        
        /* Make the spinning light much more dramatic on hover */
        .group:hover .border-spin-wrapper::before {
          opacity: 1;
          background: conic-gradient(from 0deg, transparent 30%, rgba(194,155,87,0.6) 70%, #d4af37 100%);
        }

        /* Active state highlight color matches burgundy */
        .border-spin-wrapper.active::before {
          background: conic-gradient(from 0deg, transparent 30%, rgba(115,34,51,0.5) 70%, #732233 100%);
          opacity: 1;
        }

        /* Inner image container */
        .border-spin-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 36px 0px 36px 0px; /* Adjusted for thicker padding */
          overflow: hidden;
          z-index: 10;
          background: white;
        }
      `}} />

      {/* Siriya thalaippu (Small Header) */}
      <h3 className="font-montserrat text-[#c29b57] text-[11px] font-semibold tracking-[0.25em] uppercase mb-4 text-center z-10 relative">
        Organic Sarees
      </h3>

      {/* Mukkiya thalaippu (Main Title) */}
      <h1 className="font-playfair text-[#5a1827] text-4xl md:text-5xl font-bold mb-5 tracking-wide text-center z-10 relative">
        Shop by Fabric
      </h1>

      {/* Image Categories Container */}
      <div className="w-full max-w-7xl overflow-x-auto hide-scrollbar">
        <div className="flex gap-6 md:gap-10 lg:justify-center px-4 pb-10 min-w-max items-center">
          {categories.map((category, index) => (
            <button
              key={category.name}
              onClick={() => setActiveTab(category.name)}
              className="flex flex-col items-center group transition-all duration-300 outline-none"
            >
              {/* Image Container with Animated Rotating Border */}
              <div
                className={`border-spin-wrapper mb-4 aspect-square ${activeTab === category.name ? 'active scale-110 shadow-[0_10px_25px_rgba(115,34,51,0.15)]' : 'group-hover:scale-105 shadow-sm'
                  }`}
                style={{ width: '110px' }}
              >
                <div className="border-spin-inner">
                  <img
                    src={category.img}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Category Name */}
              <span
                className={`
                  font-montserrat text-[13px] transition-colors duration-300 tracking-wide
                  ${activeTab === category.name ? 'text-[#732233] font-bold' : 'text-[#444444] font-medium group-hover:text-[#732233]'}
                `}
              >
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Category Grid ────────────────────────────────── */
const categoryStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

  /* ── Outer wrapper ── */
  .collection-wrapper {
    position: relative;
    background-color: #FAF6EE;
    background-image: 
      radial-gradient(circle at 15% 50%, rgba(194, 155, 87, 0.08), transparent 40%),
      radial-gradient(circle at 85% 30%, rgba(107, 29, 21, 0.04), transparent 50%),
      radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.8), transparent 70%);
    padding: 80px 0 50px;
    text-align: center;
    overflow: hidden;
  }

  .collection-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: url('/sectionicon/white-gold-flowers.png') no-repeat top right;
    background-size: 60% auto;
    opacity: 0.2;
    pointer-events: none;
    z-index: 0;
    mask-image: linear-gradient(to bottom left, black 10%, transparent 60%);
    -webkit-mask-image: linear-gradient(to bottom left, black 10%, transparent 60%);
  }

  /* ── Section heading area ─────────────────────────── */
  .collection-heading {
    position: relative;
    z-index: 10;
  }

  .collection-heading .section-label {
    font-size: 13px;
    letter-spacing: 3px;
    color: #c29b57;
    font-weight: 700;
    margin-bottom: 12px;
    text-transform: uppercase;
    font-family: 'Montserrat', sans-serif;
    display: block;
  }

  .collection-heading h2 {
    font-size: 44px;
    font-family: 'Playfair Display', serif;
    color: #5a1827;
    margin: 0 0 45px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  /* ── Inner container – caps width and centers ─────── */
  .collection-container {
    max-width: 100%;
    margin: auto;
    position: relative;
    z-index: 10;
  }

  /* ── Desktop & Mobile: Single-line horizontal scroll ── */
  .collection-row {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 48px;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 10px 40px 40px;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .collection-row::-webkit-scrollbar {
    display: none; /* Hide scrollbar for Chrome, Safari, etc. */
  }

  /* ── Each card column (image + label) ─────────────── */
  .cat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    flex: 0 0 auto; /* Prevent shrinking in horizontal scroll */
  }

  /* ── The flower-shaped image container ────────────── */
  .collection-card {
    position: relative;
    width: 210px;
    aspect-ratio: 210 / 310;
    cursor: pointer;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .collection-card:hover {
    transform: translateY(-8px);
  }

  .card-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .card-image {
    transition: transform 0.7s ease;
    transform-origin: center;
  }

  .collection-card:hover .card-image {
    transform: scale(1.1);
  }

  /* ── Animated SVG border that hugs the clip-path edge ──────── */

  @keyframes trace-border {
    0% { stroke-dashoffset: 100; }
    100% { stroke-dashoffset: 0; }
  }

  .animated-stroke {
    stroke-dasharray: 35 65; /* Length of the golden trail */
    stroke-dashoffset: 100;
    animation: trace-border 8s linear infinite; /* Medium, elegant pace */
    stroke: #c29b57; /* Elegant gold */
    stroke-width: 8;
    filter: drop-shadow(0 0 5px rgba(194, 155, 87, 0.5));
    transition: all 0.4s ease;
    stroke-linecap: round;
  }

  .cat-item:hover .animated-stroke {
    stroke: #d4af37; /* Brighter gold on hover */
    stroke-width: 9;
    stroke-dasharray: 50 50; /* Longer trail on hover */
    filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.9));
    animation-duration: 6s; /* Slightly faster on hover, but still smooth */
  }

  /* ── Category label below the card ───────────────── */
  .category-name {
    margin-top: 6px; /* Brought text much closer to the image card */
    color: #9f351c;
    font-size: 19px;
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-weight: 500;
    text-align: center;
    transition: color 0.3s ease;
  }

  .cat-item:hover .category-name {
    color: #6B1D15;
  }

  /* ── Responsive adjustments ── */
  @media (max-width: 768px) {
    .collection-row {
      gap: 24px;
      padding-left: 20px;
      padding-right: 80px; /* Adjust for floating buttons */
    }
    .collection-card {
      width: 160px;
      height: auto;
    }
    .category-name {
      font-size: 16px;
    }
    .collection-heading h2 {
      font-size: 32px;
    }
  }
`;

export function CategoryGrid() {
  return (
    <div className="collection-wrapper">
      <style dangerouslySetInnerHTML={{ __html: categoryStyles }} />

      {/* Heading */}
      <div className="collection-heading">
        <span className="section-label">Browse</span>
        <h2>All Categories</h2>
      </div>

      {/* Cards */}
      <div className="collection-container">
        <div className="collection-row">
          {featuredCategories.map((cat, index) => (
            <Link key={cat.name} href={cat.href} className="cat-item">
              <div className="collection-card">
                <svg viewBox="0 0 210 310" className="card-svg" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <clipPath id={`clip-cat-${index}`}>
                      <path d="M102 0 C135 0 145 35 175 35 C205 35 210 75 190 95 C220 125 205 165 175 168 C190 205 158 235 130 220 C110 255 70 250 65 220 C30 235 5 205 25 170 C-5 160 -2 115 25 98 C5 65 30 35 62 38 C70 15 82 0 102 0 Z" />
                    </clipPath>
                  </defs>

                  <g clipPath={`url(#clip-cat-${index})`}>
                    <image
                      href={cat.image}
                      width="100%"
                      height="100%"
                      preserveAspectRatio="xMidYMid slice"
                      className="card-image"
                    />
                  </g>

                  {/* Base Track (Faint outline) */}
                  <path
                    d="M102 0 C135 0 145 35 175 35 C205 35 210 75 190 95 C220 125 205 165 175 168 C190 205 158 235 130 220 C110 255 70 250 65 220 C30 235 5 205 25 170 C-5 160 -2 115 25 98 C5 65 30 35 62 38 C70 15 82 0 102 0 Z"
                    fill="none"
                    stroke="rgba(194, 155, 87, 0.15)"
                    strokeWidth="7"
                  />
                  {/* Glowing Animated Highlight */}
                  <path
                    className="animated-stroke"
                    d="M102 0 C135 0 145 35 175 35 C205 35 210 75 190 95 C220 125 205 165 175 168 C190 205 158 235 130 220 C110 255 70 250 65 220 C30 235 5 205 25 170 C-5 160 -2 115 25 98 C5 65 30 35 62 38 C70 15 82 0 102 0 Z"
                    fill="none"
                    pathLength="100"
                  />
                </svg>
              </div>
              <p className="category-name">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}








/* ── New Arrivals Product Grid ────────────────────── */
export function ProductGrid() {
  return (
    <section className="py-16 relative overflow-hidden bg-[#FAF6EE] border-b border-[#E8DCC4]">
      {/* Abstract Symmetrical Mughal Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        {/* Subtle Geometric Texture */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5l10-4.5 10 4.5V16h-20v2h20v2.5l-10 4.5-10-4.5z' fill='%23c29b57' fill-opacity='0.3' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px"
        }} />
        {/* Symmetrical Floral Frames (Mughal Arch vibe) */}
        <div className="absolute top-0 left-0 w-[120px] md:w-[250px] h-full" style={{ backgroundImage: "url('/sectionicon/golden-floral-pillar.png')", backgroundSize: "contain", backgroundPosition: "left center", backgroundRepeat: "no-repeat" }} />
        <div className="absolute top-0 right-0 w-[120px] md:w-[250px] h-full transform scale-x-[-1]" style={{ backgroundImage: "url('/sectionicon/golden-floral-pillar.png')", backgroundSize: "contain", backgroundPosition: "left center", backgroundRepeat: "no-repeat" }} />
      </div>

      <div className="w-full mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-8 md:mb-11">
          <p className="text-xs tracking-[3px] uppercase font-medium mb-2" style={{ color: 'var(--gold)' }}>Just In</p>
          <h2 className="text-[28px] md:text-[36px] font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy-dark)' }}>New Arrivals</h2>
          {/* Teal-Gold Flourish under heading */}
        </div>

        {/* Elegant CSS Frame Wrapper */}
        <div
          className="relative p-6 md:p-10 rounded-none md:rounded-xl mx-auto w-full"
          style={{
            background: 'white',
            border: '1px solid var(--ivory-dark)',
            boxShadow: '0 8px 32px rgba(107,26,42,0.04)',
          }}
        >
          {/* Double line traditional border */}
          <div className="absolute inset-2 md:inset-3 pointer-events-none" style={{ border: '2px solid var(--gold)', opacity: 0.6 }}></div>
          <div className="absolute inset-[12px] md:inset-[16px] pointer-events-none" style={{ border: '1px solid var(--burgundy)', opacity: 0.8 }}></div>

          {/* Corner Blocks for traditional look */}
          <div className="absolute top-2 left-2 w-4 h-4 bg-white border-2 border-[var(--gold)] md:top-3 md:left-3" />
          <div className="absolute top-2 right-2 w-4 h-4 bg-white border-2 border-[var(--gold)] md:top-3 md:right-3" />
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-white border-2 border-[var(--gold)] md:bottom-3 md:left-3" />
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-white border-2 border-[var(--gold)] md:bottom-3 md:right-3" />

          {/* Inner Corner Accents */}
          <div className="absolute top-[12px] left-[12px] w-[6px] h-[6px] bg-[var(--burgundy)] md:top-[16px] md:left-[16px]" />
          <div className="absolute top-[12px] right-[12px] w-[6px] h-[6px] bg-[var(--burgundy)] md:top-[16px] md:right-[16px]" />
          <div className="absolute bottom-[12px] left-[12px] w-[6px] h-[6px] bg-[var(--burgundy)] md:bottom-[16px] md:left-[16px]" />
          <div className="absolute bottom-[12px] right-[12px] w-[6px] h-[6px] bg-[var(--burgundy)] md:bottom-[16px] md:right-[16px]" />

          <div className="relative z-10 pt-4 md:pt-6">
            {/* Mobile Filter / Sort */}
            <div className="flex md:hidden items-center justify-center gap-4 mb-6">
              <button className="flex-1 py-2.5 rounded-full border border-[var(--ivory-dark)] text-[13px] font-medium text-[var(--charcoal)] bg-white shadow-sm">
                Filter
              </button>
              <button className="flex-1 py-2.5 rounded-full border border-[var(--ivory-dark)] text-[13px] font-medium text-[var(--charcoal)] bg-white shadow-sm flex items-center justify-center gap-1">
                Sort by
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 lg:grid-cols-4">
              {newArrivals.map(p => {
                const fabric = p.category.includes('Cotton') ? 'Cotton' : p.category.includes('Tussar') ? 'Tussar' : 'Silk'
                const occasion = p.category.includes('Kanchipuram') ? 'Bridal' : p.category.includes('Cotton') ? 'Daily' : 'Festive'

                return (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id,
                      name: p.name,
                      category: 'Sarees',
                      fabric,
                      occasion,
                      image: p.image,
                      price: p.price,
                      oldPrice: p.originalPrice,
                      badge: p.isNew ? 'New' : p.originalPrice ? 'Sale' : 'Bestseller',
                      rating: 4.8,
                      reviews: 14,
                    }}
                  />
                )
              })}
            </div>

            <div className="text-center mt-9">
              <Link
                href="/shop"
                className="inline-block px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded-sm no-underline"
                style={{ background: 'var(--gold)', color: 'var(--burgundy-dark)' }}
              >
                View All New Arrivals →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Spotlight Section ─────────────────────────────── */
export function SpotlightSection() {
  return (
    <section className="relative w-full bg-[#FAF6EE] overflow-hidden py-8 md:py-14">

      {/* Golden Floral Pillars — hidden on mobile, show md+ */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[90%] w-24 md:w-44 lg:w-60 pointer-events-none z-10 hidden md:block">
        <img src="/sectionicon/golden-floral-pillar.png" alt="" className="w-full h-full object-contain object-left drop-shadow-xl" />
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[90%] w-24 md:w-44 lg:w-60 pointer-events-none z-10 hidden md:block">
        <img src="/sectionicon/golden-floral-pillar.png" alt="" className="w-full h-full object-contain object-right scale-x-[-1] drop-shadow-xl" />
      </div>

      {/* Spotlight Banner image */}
      <div className="max-w-[1200px] mx-auto relative z-0 px-2 sm:px-4 md:px-16 lg:px-24">
        <img
          src="/spotlight-banner.png"
          alt="Spotlight Stealer"
          className="w-full h-auto block object-cover rounded-xl shadow-[0_16px_40px_rgba(107,26,42,0.15)] border-2 md:border-4 border-white"
        />
      </div>
    </section>
  )
}

function AnimatedCounter({ end, duration = 5000, suffix = "" }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }
    
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 5); 
      setCount(Math.floor(easeOut * end));
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Smooth Typography Component ─────────────── */
function SmoothTypography({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={className} 
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(25px)',
        filter: isVisible ? 'blur(0px)' : 'blur(5px)',
        transition: `opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, filter 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Heritage & Craftsmanship Section ───────────── */
export function HeritageSection() {
  return (
    <section className="py-16 md:py-24 relative text-center px-4 overflow-hidden bg-[#FAF6EE]">
      {/* Abstract Silk Glow Effect */}
      <div className="absolute inset-0 opacity-50 mix-blend-multiply pointer-events-none"
           style={{ 
             backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(194,155,87,0.1) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(107,29,21,0.05) 0%, transparent 40%)' 
           }}>
      </div>
      {/* Abstract thread lines SVG */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-100,200 C300,-100 600,500 1200,100' fill='none' stroke='%23C29B57' stroke-width='4'/%3E%3Cpath d='M-100,300 C400,0 500,400 1200,200' fill='none' stroke='%236B1D15' stroke-width='2'/%3E%3C/svg%3E")`,
             backgroundSize: 'cover'
           }}>
      </div>

      <div className="max-w-5xl mx-auto mb-10 md:mb-14 relative z-10">
        <SmoothTypography delay={0}>
          <h2 className="text-2xl md:text-3xl font-montserrat tracking-[0.15em] text-[#333333] font-semibold mb-6 uppercase">
            Artisans and Weavers
          </h2>
        </SmoothTypography>
        <SmoothTypography delay={0.2}>
          <p className="text-[13px] md:text-[14px] font-montserrat text-[#555555] leading-relaxed max-w-4xl mx-auto">
            Artisans and weavers are the guardians of heritage and sustainability in the fashion industry. They use their skills to create intricate handweaving pieces that tell stories and carry cultural traditions. These craftsmen prioritize sustainable materials and traditional techniques, advocating for eco-friendly fashion. Their creations, often made from pure natural fibers, offer unparalleled comfort and durability, defying the trends of fast fashion. Supporting artisans and weavers means embracing timeless artistry, preserving heritage, and making a conscious choice for a more sustainable and earth-friendly lifestyle.
          </p>
        </SmoothTypography>
      </div>

      <div className="w-full max-w-[1600px] mx-auto mb-16 md:mb-20 relative z-10">
        <div className="w-full h-[300px] md:h-[500px] lg:h-[600px] overflow-hidden shadow-2xl">
          <img 
            src="/artisan_weaver.png" 
            alt="Artisan Weaver working on handloom" 
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 text-center relative z-10">
        <div>
          <h3 className="text-4xl md:text-5xl font-playfair text-[#6B1D15] mb-3">
            <AnimatedCounter end={300} suffix="K+" />
          </h3>
          <p className="text-[11px] md:text-xs tracking-widest font-montserrat uppercase text-[#666666]">Instagram Family</p>
        </div>
        <div>
          <h3 className="text-4xl md:text-5xl font-playfair text-[#6B1D15] mb-3">
            <AnimatedCounter end={2} suffix="Lakh" />
          </h3>
          <p className="text-[11px] md:text-xs tracking-widest font-montserrat uppercase text-[#666666]">Artisans Network</p>
        </div>
        <div>
          <h3 className="text-4xl md:text-5xl font-playfair text-[#6B1D15] mb-3">
            <AnimatedCounter end={120} suffix="%" />
          </h3>
          <p className="text-[11px] md:text-xs tracking-widest font-montserrat uppercase text-[#666666]">Sustainable Art</p>
        </div>
      </div>
    </section>
  )
}

/* ── Signature Lookbook Section ──────────────────── */
export function LookbookSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])

  const stories = [
    {
      image: "/story_spinner.png",
      title: "The Spinner of Dreams",
      body: "At the heart of every handwoven saree is the painstaking process of spinning the perfect thread, a task mastered with years of dedication. The spinning wheel sings a rhythmic song, turning raw cotton into fine threads, which later becomes the elegant saree loved by our patrons. Their work is the foundation of the handloom tradition, ensuring that the magic of the weaving legacy continues to thrive.",
      watermark: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23C29B57' stroke-width='2'/%3E%3Cpath d='M50,10 L50,90 M10,50 L90,50 M22,22 L78,78 M22,78 L78,22' stroke='%23C29B57' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='10' fill='none' stroke='%23C29B57' stroke-width='2'/%3E%3C/svg%3E")`,
    },
    {
      image: "/story_loom.png",
      title: "The Master of the Loom",
      body: "Weaving is more than a craft—it is a lifelong devotion to artistry. Sitting at the wooden loom in the heart of the village, they transform fine cotton threads into exquisite handwoven sarees, each a testament to unparalleled skill. Steady hands and sharp focus breathe life into every warp and weft, ensuring that each SutiSancha saree carries a story of dedication, resilience, and cultural pride.",
      watermark: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='20' width='80' height='60' fill='none' stroke='%23C29B57' stroke-width='2'/%3E%3Cpath d='M10,35 L90,35 M10,65 L90,65 M30,20 L30,80 M70,20 L70,80' stroke='%23C29B57' stroke-width='1'/%3E%3Cpath d='M10,50 L90,50' stroke='%23C29B57' stroke-width='1' stroke-dasharray='4 2'/%3E%3C/svg%3E")`,
    },
    {
      image: "/lookbook_detail.png",
      title: "The Essence of Tradition",
      body: "With skilled hands and unwavering dedication, our artisans bring to life the delicate threads of handloom sarees. Every weave crafted is a reflection of rich textile heritage, passed down through generations. Intricate work on the loom symbolizes patience, precision, and passion—creating fabrics that are not just sarees but timeless pieces of art, carrying the soul of SutiSancha.",
      watermark: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50,10 C70,40 90,50 90,50 C90,50 70,60 50,90 C30,60 10,50 10,50 C10,50 30,40 50,10 Z' fill='none' stroke='%23C29B57' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='10' fill='none' stroke='%23C29B57' stroke-width='1'/%3E%3C/svg%3E")`,
    },
  ]

  useEffect(() => {
    const observers = blockRefs.current.map((ref, index) => {
      if (!ref) return null
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index)
            }
          })
        },
        { threshold: 0.4 }
      )
      observer.observe(ref)
      return observer
    })
    return () => observers.forEach((obs) => obs?.disconnect())
  }, [])

  return (
    <section className="relative border-t border-[#E8DCC4] bg-[#FAF6EE]">
      {/* Conceptual Abstract Background: Spinner of Dreams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep rich background gradient */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 80% 20%, rgba(194, 155, 87, 0.12) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(107, 29, 21, 0.06) 0%, transparent 60%), linear-gradient(to bottom right, #FAF6EE 0%, #F5F0E6 100%)'
        }} />
        
        {/* Conceptual Floating Threads SVG */}
        <svg className="absolute w-full h-full opacity-60" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          {/* Gold threads */}
          <g stroke="#C29B57" fill="none" strokeWidth="1" opacity="0.5">
            <path d="M-200,300 C100,500 400,100 800,400 C1200,700 1400,200 1600,400" />
            <path d="M-200,350 C150,550 450,150 850,450 C1250,750 1450,250 1650,450" />
            <path d="M-200,400 C200,600 500,200 900,500 C1300,800 1500,300 1700,500" />
          </g>
          {/* Burgundy threads */}
          <g stroke="#6B1D15" fill="none" strokeWidth="1" opacity="0.2">
            <path d="M1200,-200 C900,100 1100,400 800,800 C500,1200 200,900 0,1100" />
            <path d="M1150,-200 C850,150 1050,450 750,850 C450,1250 150,950 -50,1150" />
          </g>
          {/* Abstract Spinning Wheel Conceptual Rings */}
          <g opacity="0.15" stroke="#C29B57" fill="none">
             <circle cx="800" cy="200" r="150" strokeWidth="2" strokeDasharray="10 15" />
             <circle cx="800" cy="200" r="250" strokeWidth="1" strokeDasharray="5 20" />
             <circle cx="800" cy="200" r="350" strokeWidth="0.5" />
          </g>
          {/* Bottom left Wheel */}
          <g opacity="0.08" stroke="#6B1D15" fill="none">
             <circle cx="100" cy="900" r="200" strokeWidth="1" strokeDasharray="10 30" />
             <circle cx="100" cy="900" r="300" strokeWidth="0.5" />
          </g>
        </svg>

        {/* Floating Motifs */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: "url('/sectionicon/white-gold-flowers.png')", backgroundSize: "300px", backgroundRepeat: "repeat" }} />
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row relative z-10">

        {/* ── Left: Sticky image panel ── */}
        <div className="hidden lg:flex lg:w-[48%] flex-shrink-0 lg:sticky lg:top-0 lg:h-screen items-center justify-center px-6 lg:px-12 py-12 lg:py-16">
          <div className="relative w-full max-w-[420px] lg:max-w-[460px]" style={{ aspectRatio: '4/5' }}>
            {stories.map((s, idx) => (
              <img
                key={idx}
                src={s.image}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover shadow-xl"
                style={{
                  opacity: activeIndex === idx ? 1 : 0,
                  transform: activeIndex === idx ? 'scale(1)' : 'scale(1.03)',
                  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                  zIndex: activeIndex === idx ? 10 : 0,
                }}
              />
            ))}
            {/* Caption */}
            <p className="absolute -bottom-7 left-0 text-[11px] font-montserrat text-[#999] italic tracking-wide">
              The Hands Behind the Heritage
            </p>
          </div>
        </div>


        {/* ── Right: Naturally scrolling text blocks ── */}
        <div className="w-full lg:w-[52%] flex flex-col">
          {stories.map((s, idx) => (
            <div
              key={idx}
              ref={(el) => { blockRefs.current[idx] = el }}
              className="min-h-screen lg:min-h-screen flex flex-col justify-center px-6 lg:px-14 py-16 lg:py-0 relative"
            >
              {/* SVG Watermark */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: s.watermark,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />

              {/* Story number */}
              <p className="text-[11px] tracking-[0.25em] font-montserrat uppercase text-[#C29B57] mb-4">
                {String(idx + 1).padStart(2, '0')}&nbsp;&nbsp;/&nbsp;&nbsp;{String(stories.length).padStart(2, '0')}
              </p>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-montserrat text-[#2A2A2A] font-semibold mb-6 leading-snug">
                {s.title}
              </h3>

              {/* Mobile Inline Image */}
              <div className="block lg:hidden w-full max-w-[420px] mx-auto mb-12 relative" style={{ aspectRatio: '4/5' }}>
                <img src={s.image} className="absolute inset-0 w-full h-full object-cover shadow-xl rounded-md" alt={s.title} />
                <p className="absolute -bottom-7 left-0 text-[11px] font-montserrat text-[#999] italic tracking-wide w-full text-center">
                  The Hands Behind the Heritage
                </p>
              </div>

              {/* Thin gold rule */}
              <div className="w-12 h-[2px] bg-[#C29B57] mb-6 rounded-full" />

              {/* Body */}
              <p className="text-[14px] md:text-[15px] text-[#666] leading-[2] font-montserrat max-w-md">
                {s.body}
              </p>

              {/* Progress dots */}
              <div className="flex gap-2 mt-10">
                {stories.map((_, di) => (
                  <span
                    key={di}
                    className="block h-[3px] rounded-full"
                    style={{
                      width: di === activeIndex ? '36px' : '14px',
                      backgroundColor: di === activeIndex ? '#6B1D15' : '#D9C8A8',
                      transition: 'width 0.4s ease, background-color 0.4s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}


/* ── Offers Strip (Hidden) ─────────────────────────── */
export function OffersStrip() {
  return null
}

/* ── Loyalty Banner (Hidden) ───────────────────────── */
export function LoyaltyBanner() {
  return null
}

