'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Shield, Clock, Globe, Truck } from 'lucide-react'
import { featuredCategories, organicSareeSubcats, newArrivals, loyaltyTiers } from '@/lib/data'

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
            className={`flex items-center gap-4 px-6 relative ${
              index !== features.length - 1 ? 'lg:border-r border-stone-300' : ''
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
    <div className="py-16 bg-white flex flex-col items-center px-4 font-sans overflow-hidden">
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
      <h3 className="font-montserrat text-[#c29b57] text-[11px] font-semibold tracking-[0.25em] uppercase mb-4 text-center">
        Organic Sarees
      </h3>

      {/* Mukkiya thalaippu (Main Title) */}
      <h1 className="font-playfair text-[#5a1827] text-4xl md:text-5xl font-bold mb-5 tracking-wide text-center">
        Shop by Fabric
      </h1>

      {/* Winding Floral Divider Line */}
      <img
        src="/borderdesign/winding-border.jpg"
        alt=""
        aria-hidden="true"
        className="w-80 max-w-[86vw] sm:w-[26rem] md:w-[34rem] h-auto mb-12 opacity-80 object-contain"
      />

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
    background: #f7efe7;
    padding: 60px 0 35px;
    text-align: center;
    overflow: hidden;
  }

  /* ── Section heading area ─────────────────────────── */
  .collection-heading .section-label {
    font-size: 13px;
    letter-spacing: 3px;
    color: #9f351c;
    font-weight: 600;
    margin-bottom: 10px;
    text-transform: uppercase;
    font-family: system-ui, -apple-system, sans-serif;
    display: block;
  }

  .collection-heading h2 {
    font-size: 40px;
    font-family: 'Playfair Display', serif;
    color: #6B1D15;
    margin: 0 0 40px;
    font-weight: 700;
  }

  /* ── Inner container – caps width and centers ─────── */
  .collection-container {
    max-width: 100%;
    margin: auto;
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
          {featuredCategories.map((cat) => (
            <Link key={cat.name} href={cat.href} className="cat-item">
              <div className="collection-card">
                <svg viewBox="0 0 210 310" className="card-svg" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <clipPath id={`clip-${cat.name.replace(/\s+/g, '-')}`}>
                      <path d="M102 0 C135 0 145 35 175 35 C205 35 210 75 190 95 C220 125 205 165 175 168 C190 205 158 235 130 220 C110 255 70 250 65 220 C30 235 5 205 25 170 C-5 160 -2 115 25 98 C5 65 30 35 62 38 C70 15 82 0 102 0 Z" />
                    </clipPath>
                  </defs>
                  
                  <g clipPath={`url(#clip-${cat.name.replace(/\s+/g, '-')})`}>
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
  const [wishlist, setWishlist] = useState<number[]>([])
  const toggle = (id: number) =>
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])

  return (
    <section className="py-16" style={{ background: 'white' }}>
      <div className="w-full mx-auto px-4 lg:px-8">
        <div className="text-center mb-11">
          <p className="text-xs tracking-[3px] uppercase font-medium mb-2" style={{ color: 'var(--gold)' }}>Just In</p>
          <h2 className="text-[36px] font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--burgundy-dark)' }}>New Arrivals</h2>
          <div className="w-14 h-0.5 mx-auto rounded" style={{ background: 'var(--gold)' }} />
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {newArrivals.map(p => (
                <div
                  key={p.id}
                  className="rounded-lg overflow-hidden"
                  style={{
                    background: 'white', border: '1px solid var(--ivory-dark)',
                    transition: 'transform .25s, box-shadow .25s', cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-4px)'
                    el.style.boxShadow = '0 16px 40px rgba(107,26,42,0.15)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = ''
                    el.style.boxShadow = ''
                  }}
                >
                  {/* Image */}
                  <div className="h-[280px] relative bg-cover bg-center" style={{ backgroundImage: p.image ? `url(${p.image})` : `linear-gradient(160deg, ${p.color.split(' ')[0].replace('from-[', '').replace(']', '')}, ${p.color.split(' ')[1].replace('to-[', '').replace(']', '')})` }}>
                    {p.isNew && (
                      <span
                        className="absolute top-0 right-0 text-[10px] font-bold px-2 py-0.5 uppercase"
                        style={{ background: 'var(--gold)', color: 'var(--charcoal)' }}
                      >
                        NEW
                      </span>
                    )}
                    <div
                      className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-medium shadow-sm"
                      style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--charcoal)' }}
                    >
                      <span style={{ color: 'var(--gold)' }}>★</span> 4.8 | 14 Review
                    </div>
                    <button
                      className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-sm flex items-center justify-center text-lg shadow-sm"
                      style={{ color: 'var(--charcoal)', border: 'none', cursor: 'pointer' }}
                    >
                      +
                    </button>

                  </div>

                  {/* Info */}
                  <div className="p-2.5 md:p-4 bg-white">
                    <div className="text-[12px] md:text-[14px] font-medium mb-1 truncate" style={{ color: 'var(--charcoal)' }}>
                      {p.name}
                    </div>

                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex flex-col">
                        <span className="text-[13px] md:text-[15px] font-bold" style={{ color: 'var(--charcoal)' }}>
                          ₹ {p.price.toLocaleString('en-IN')}.00 INR
                        </span>
                        {p.originalPrice && (
                          <span className="text-[10px] md:text-xs line-through" style={{ color: 'var(--muted)' }}>
                            ₹ {p.originalPrice.toLocaleString('en-IN')}.00 INR
                          </span>
                        )}
                      </div>

                      {p.originalPrice && (
                        <div
                          className="px-1.5 py-1 rounded-sm flex flex-col items-center justify-center ml-1"
                          style={{ background: '#9D3B22', color: 'white', fontSize: '9px', lineHeight: 1.2, fontWeight: 'bold' }}
                        >
                          <span>{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%</span>
                          <span>OFF</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-9">
              <Link
                href="/collections/new-arrivals"
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
    <section className="w-full bg-white overflow-hidden">
      {/* The user's uploaded banner image - touching edges perfectly */}
      <img
        src="/spotlight-banner.png"
        alt="Spotlight Stealer"
        className="w-full h-auto block object-cover"
      />
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
