'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import CartNavigationHandler from '@/components/ui/CartNavigationHandler'
import { fetchApprovedReviews } from '@/lib/api/storefront'
import { resolveImageUrl } from '@/lib/api/client'
import type { ApprovedReview } from '@/lib/api/types'

const ALL_REVIEWS = 'All Reviews'

function formatReviewDate(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isVideoMedia(url: string, mediaType?: 'image' | 'video') {
  return mediaType === 'video' || /\.(mp4|webm|mov|m4v)$/i.test(url)
}

function reviewTitle(review: ApprovedReview) {
  return review.subject || `${review.rating}-star review for ${review.product?.name || 'this product'}`
}

function reviewBody(review: ApprovedReview) {
  return review.body || 'A verified customer shared their rating for this product.'
}

export default function ReviewsPage() {
  const [selectedCategory, setSelectedCategory] = useState(ALL_REVIEWS)
  const [reviews, setReviews] = useState<ApprovedReview[]>([])
  const [summary, setSummary] = useState({ total: 0, average: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchApprovedReviews(1, 48)
      .then(data => {
        if (!active) return
        setReviews(data.reviews || [])
        setSummary(data.summary || { total: 0, average: 0 })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => {
    const values = new Set<string>()
    reviews.forEach(review => {
      const category = review.product?.category?.trim()
      if (category) values.add(category)
    })
    return [ALL_REVIEWS, ...Array.from(values).sort((a, b) => a.localeCompare(b))]
  }, [reviews])

  const filteredReviews = useMemo(() => {
    if (selectedCategory === ALL_REVIEWS) return reviews
    return reviews.filter(review => review.product?.category === selectedCategory)
  }, [reviews, selectedCategory])

  const averageRating = summary.average || 0
  const roundedAverage = averageRating > 0 ? averageRating.toFixed(1) : '0.0'

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#103042]">
      <CartNavigationHandler />
      <Header />

      <main className="relative overflow-hidden pb-20 pt-8 sm:pt-12">
        <div className="pointer-events-none absolute right-0 top-0 z-0 h-[500px] w-[500px] bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat opacity-[0.03]" />
        <div className="pointer-events-none absolute bottom-1/3 left-0 z-0 h-[450px] w-[450px] rotate-180 bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat opacity-[0.03]" />

        <div className="container relative z-10 mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D9B86E]/40 bg-[#103042]/5 px-3.5 py-1.5">
              <Sparkles size={14} className="text-[#D9B86E]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#103042]">
                Verified Customer Testimonials
              </span>
            </div>

            <h1
              className="mb-4 text-3xl font-bold tracking-tight text-[#103042] sm:text-5xl"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Voices of Elegance
            </h1>

            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-[#103042]/80 sm:text-base">
              Real approved customer experiences from Soil Goddess products, shown directly from review moderation.
            </p>

            <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center justify-around gap-6 rounded-2xl border border-[#D9B86E]/40 bg-white p-6 shadow-[0_8px_30px_rgba(16,48,66,0.06)] sm:flex-row">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-black text-[#103042] sm:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {roundedAverage}
                  </span>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center text-[#D9B86E]">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          size={18}
                          fill={i <= Math.round(averageRating) ? '#D9B86E' : 'none'}
                          className={i <= Math.round(averageRating) ? 'text-[#D9B86E]' : 'text-[#D9B86E]/35'}
                        />
                      ))}
                    </div>
                    <span className="mt-0.5 text-xs font-semibold text-[#103042]/60">Overall Customer Rating</span>
                  </div>
                </div>
              </div>

              <div className="hidden h-10 w-px bg-[#D9B86E]/30 sm:block" />

              <div className="flex items-center gap-6 text-center">
                <div>
                  <span className="block text-2xl font-bold text-[#103042]">{summary.total}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#103042]/70">
                    Approved Reviews
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-[#D9B86E]">100%</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#103042]/70">
                    Moderated
                  </span>
                </div>
              </div>
            </div>
          </div>

          {categories.length > 1 ? (
            <div className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all sm:text-sm ${
                    selectedCategory === category
                      ? 'border border-[#103042] bg-[#103042] text-[#FAF6EE] shadow-md'
                      : 'border border-[#D9B86E]/40 bg-white text-[#103042]/80 hover:border-[#D9B86E] hover:bg-[#FAF6EE]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#D9B86E]/35 bg-white py-16 text-sm font-semibold text-[#103042]/70">
              <Loader2 className="h-5 w-5 animate-spin text-[#D9B86E]" />
              Loading approved reviews...
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReviews.map(review => {
                const firstMedia = review.images?.[0]
                const mediaUrl = firstMedia?.imageUrl || review.product?.imageUrl || ''
                const resolvedMediaUrl = mediaUrl ? resolveImageUrl(mediaUrl) : ''
                const productHref = review.product?.slug ? `/products/${review.product.slug}` : '/shop'
                return (
                  <article
                    key={review.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#D9B86E]/35 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(16,48,66,0.08)]"
                  >
                    {resolvedMediaUrl ? (
                      <Link href={productHref} className="block aspect-[4/3] overflow-hidden bg-[#FAF6EE]">
                        {firstMedia && isVideoMedia(firstMedia.imageUrl, firstMedia.mediaType) ? (
                          <video
                            src={resolvedMediaUrl}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            muted
                            playsInline
                            controls
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={resolvedMediaUrl}
                            alt={review.product?.name || 'Reviewed product'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </Link>
                    ) : null}

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5 text-[#D9B86E]">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              size={15}
                              fill={i <= review.rating ? '#D9B86E' : 'none'}
                              className={i <= review.rating ? 'text-[#D9B86E]' : 'text-[#D9B86E]/35'}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-medium text-[#103042]/45">{formatReviewDate(review.createdAt)}</span>
                      </div>

                      <h3 className="mb-2 text-base font-bold leading-snug text-[#103042] transition-colors group-hover:text-[#9C1A21]">
                        &ldquo;{reviewTitle(review)}&rdquo;
                      </h3>
                      <p className="mb-4 line-clamp-5 text-xs font-normal leading-relaxed text-[#103042]/75 sm:text-[13px]">
                        {reviewBody(review)}
                      </p>

                      <div className="mt-auto border-t border-[#D9B86E]/20 pt-4">
                        <Link
                          href={productHref}
                          className="mb-1 block truncate text-[11px] font-bold uppercase tracking-wider text-[#D9B86E] no-underline hover:text-[#9C1A21]"
                        >
                          {review.product?.name || 'Reviewed Product'}
                        </Link>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-[#103042]">
                              <span className="truncate">{review.customerName}</span>
                              <CheckCircle2 size={13} className="shrink-0 fill-[#D9B86E] text-[#103042]" />
                            </div>
                            <span className="text-[11px] text-[#103042]/50">
                              {review.product?.category || 'Verified Customer'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D9B86E]/50 bg-white py-16 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-[#D9B86E]" />
              <p className="text-sm font-bold text-[#103042]">No approved reviews yet</p>
              <p className="mt-1 text-xs text-[#103042]/60">Approved customer reviews will appear here automatically.</p>
            </div>
          )}

          <div className="relative mt-16 overflow-hidden rounded-3xl border border-[#D9B86E]/40 bg-gradient-to-r from-[#103042] via-[#0d2635] to-[#103042] p-8 text-center text-white shadow-2xl sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[url('/borderdesign/flower-motif.png')] bg-[length:120px] bg-repeat opacity-10" />

            <div className="relative z-10 mx-auto max-w-xl">
              <h2
                className="mb-3 text-2xl font-bold text-[#FAF6EE] sm:text-4xl"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Experience the Soil Goddess Touch
              </h2>
              <p className="mb-6 text-xs leading-relaxed text-[#FAF6EE]/80 sm:text-sm">
                Shop products with real customer feedback and curated handloom details.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/shop"
                  className="flex items-center gap-2 rounded-full bg-[#D9B86E] px-6 py-3 text-xs font-black uppercase tracking-widest text-[#103042] no-underline shadow-lg transition-transform hover:scale-105 hover:bg-[#c9a75d]"
                >
                  <ShoppingBag size={14} />
                  <span>Explore Sarees</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/events"
                  className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#FAF6EE] no-underline transition-transform hover:scale-105 hover:bg-white/20"
                >
                  <span>Upcoming Events</span>
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
