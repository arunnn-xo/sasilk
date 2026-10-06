'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, ShieldCheck, CheckCircle2, Sparkles, Heart, MessageSquare, ArrowRight, ShoppingBag } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import CartNavigationHandler from '@/components/ui/CartNavigationHandler'

interface CustomerReview {
  id: string
  name: string
  location: string
  rating: number
  date: string
  productName: string
  productCategory: string
  title: string
  comment: string
  verified: boolean
  tag?: string
}

const reviewsData: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'Priyadarshini S.',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    date: '2 weeks ago',
    productName: 'Kanjivaram Korvai Silk Saree with Pure Zari',
    productCategory: 'Bridal Silks',
    title: 'Exceeded every expectation for my wedding day!',
    comment: 'The craftsmanship and weight of the pure gold zari is unmatched. The drape was regal and everyone kept complimenting the unique contrast border. Soil Goddess has earned a lifelong patron.',
    verified: true,
    tag: 'Bridal Choice',
  },
  {
    id: 'rev-2',
    name: 'Ananya Raghavan',
    location: 'Bangalore, Karnataka',
    rating: 5,
    date: '1 month ago',
    productName: 'Handspun Tussar Silk Saree in Emerald & Gold',
    productCategory: 'Tussar & Banarasi',
    title: 'Breathtaking texture & lightweight luxury',
    comment: 'The natural organic sheen of the Tussar silk is stunning. It feels so breathable and comfortable yet looks extraordinarily rich. The packaging with personalized handwritten care card was a lovely touch.',
    verified: true,
  },
  {
    id: 'rev-3',
    name: 'Kavitha Sundar',
    location: 'Coimbatore, Tamil Nadu',
    rating: 5,
    date: '3 weeks ago',
    productName: 'Vaira Oosi Elephant Motif Traditional Kanchipuram',
    productCategory: 'Pure Kanjivaram',
    title: 'Authentic pure silk with genuine Silk Mark tag',
    comment: 'The vaira oosi needle-thin zari stripes are woven with sublime precision. Verified the Silk Mark certificate upon delivery. Prompt delivery and excellent customer care on WhatsApp!',
    verified: true,
    tag: 'Heritage Weave',
  },
  {
    id: 'rev-4',
    name: 'Meenakshi Iyer',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    date: '1 month ago',
    productName: 'Handloom Kora Organza Silk Saree with Kolam Border',
    productCategory: 'Pure Kanjivaram',
    title: 'Subtle, understated elegance for festive evenings',
    comment: 'The softness of the organza and crisp Kolam border detailing is pure poetry. Stays in place beautifully throughout the puja without puffing up.',
    verified: true,
  },
  {
    id: 'rev-5',
    name: 'Dr. Radhika N.',
    location: 'Hyderabad, Telangana',
    rating: 5,
    date: '2 months ago',
    productName: 'Masterclass: The Art of Traditional Handloom Drapes',
    productCategory: 'Masterclasses & Events',
    title: 'An unforgettable cultural & artisanal experience',
    comment: 'Attended the live masterclass and was mesmerized by the deep lore, weaving techniques, and styling masterclass. The physical workshop kit arrived promptly at my doorstep.',
    verified: true,
    tag: 'Masterclass Attendee',
  },
  {
    id: 'rev-6',
    name: 'Swathi Venkatesh',
    location: 'Singapore (International Buyer)',
    rating: 5,
    date: '3 weeks ago',
    productName: 'Bridal Muhurtham Silk with Heavy Brocade Pallu',
    productCategory: 'Bridal Silks',
    title: 'Seamless international shipping & flawless saree',
    comment: 'Ordered from Singapore for my daughter’s engagement. The saree arrived within 5 days in pristine condition. The color match with the website photos was 100% accurate.',
    verified: true,
  },
]

const categories = ['All Reviews', 'Bridal Silks', 'Pure Kanjivaram', 'Tussar & Banarasi', 'Masterclasses & Events']

export default function ReviewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Reviews')

  const filteredReviews = selectedCategory === 'All Reviews'
    ? reviewsData
    : reviewsData.filter(r => r.productCategory === selectedCategory)

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#103042]">
      <CartNavigationHandler />
      <Header />

      <main className="relative overflow-hidden pb-20 pt-8 sm:pt-12">
        {/* Background Decorative Patterns */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.03] bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat pointer-events-none z-0"></div>
        <div className="absolute bottom-1/3 left-0 w-[450px] h-[450px] opacity-[0.03] bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat pointer-events-none z-0 transform rotate-180"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-6xl">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#103042]/5 border border-[#D9B86E]/40 mb-4">
              <Sparkles size={14} className="text-[#D9B86E]" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#103042]">
                Verified Customer Testimonials
              </span>
            </div>

            <h1
              className="text-3xl sm:text-5xl font-bold text-[#103042] mb-4 tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Voices of Elegance
            </h1>

            <p className="text-sm sm:text-base text-[#103042]/80 leading-relaxed font-medium max-w-2xl mx-auto">
              Discover authentic experiences and heartfelt stories from cherished patrons who celebrate heritage handlooms, bridal heirlooms, and curated events with Soil Goddess.
            </p>

            {/* Rating Summary Card */}
            <div className="mt-8 p-6 rounded-2xl bg-white border border-[#D9B86E]/40 shadow-[0_8px_30px_rgba(16,48,66,0.06)] flex flex-col sm:flex-row items-center justify-around gap-6 max-w-2xl mx-auto">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-[#103042]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    4.9
                  </span>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center text-[#D9B86E]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="#D9B86E" strokeWidth={0} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-[#103042]/60 mt-0.5">Overall Customer Rating</span>
                  </div>
                </div>
              </div>

              <div className="h-10 w-[1px] bg-[#D9B86E]/30 hidden sm:block"></div>

              <div className="flex items-center gap-6 text-center">
                <div>
                  <span className="block text-2xl font-bold text-[#103042]">1,200+</span>
                  <span className="text-[11px] font-semibold text-[#103042]/70 uppercase tracking-wider">Verified Buyers</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-[#D9B86E]">100%</span>
                  <span className="text-[11px] font-semibold text-[#103042]/70 uppercase tracking-wider">Silk Mark Certified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#103042] text-[#FAF6EE] shadow-md border border-[#103042]'
                    : 'bg-white hover:bg-[#FAF6EE] text-[#103042]/80 border border-[#D9B86E]/40 hover:border-[#D9B86E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-6 border border-[#D9B86E]/35 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(16,48,66,0.08)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Stars + Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-0.5 text-[#D9B86E]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="#D9B86E" strokeWidth={0} />
                      ))}
                    </div>

                    {rev.tag ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#103042]/5 text-[#103042] border border-[#103042]/15">
                        {rev.tag}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#103042]/40 font-medium">{rev.date}</span>
                    )}
                  </div>

                  {/* Title & Comment */}
                  <h3 className="text-base font-bold text-[#103042] mb-2 leading-snug group-hover:text-[#9C1A21] transition-colors">
                    &ldquo;{rev.title}&rdquo;
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#103042]/75 leading-relaxed font-normal mb-4">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D9B86E]/20 mt-auto">
                  <div className="text-[11px] font-bold text-[#D9B86E] uppercase tracking-wider truncate mb-1">
                    {rev.productName}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#103042] flex items-center gap-1.5">
                        <span>{rev.name}</span>
                        {rev.verified && (
                          <CheckCircle2 size={13} className="text-[#103042] fill-[#D9B86E]" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#103042]/50">{rev.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Call to Action */}
          <div className="mt-16 text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#103042] via-[#0d2635] to-[#103042] text-white border border-[#D9B86E]/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('/borderdesign/flower-motif.png')] bg-repeat bg-[length:120px] pointer-events-none"></div>

            <div className="relative z-10 max-w-xl mx-auto">
              <h2
                className="text-2xl sm:text-4xl font-bold mb-3 text-[#FAF6EE]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Experience the Soil Goddess Touch
              </h2>
              <p className="text-xs sm:text-sm text-[#FAF6EE]/80 mb-6 leading-relaxed">
                Step into a world of timeless heritage, handwoven pure zari silks, and unmatched artisanal care crafted to last generations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/shop"
                  className="px-6 py-3 rounded-full bg-[#D9B86E] hover:bg-[#c9a75d] text-[#103042] font-black text-xs uppercase tracking-widest transition-transform hover:scale-105 shadow-lg flex items-center gap-2 no-underline"
                >
                  <ShoppingBag size={14} />
                  <span>Explore Loved Sarees</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/events"
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6EE] font-bold text-xs uppercase tracking-widest border border-white/30 transition-transform hover:scale-105 flex items-center gap-2 no-underline"
                >
                  <span>Upcoming Masterclasses</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
