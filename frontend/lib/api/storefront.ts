import { apiFetch } from './client'
import type { CanReviewResponse, MarqueeMessageData, NavigationResponse, Review, ReviewSubmission, ReviewSummary, StorefrontArtWaveItem, StorefrontBanner, StorefrontCategory, StorefrontHomeData, StorefrontProduct, StorefrontReel } from './types'

export async function fetchAnnouncementMessages() {
  try {
    const data = await apiFetch<{ messages: Array<{ id?: number; text: string; linkUrl?: string | null }> }>('/storefront/announcement-bar')
    return data.messages || []
  } catch {
    return []
  }
}

export async function fetchNavigation() {
  try {
    const data = await apiFetch<NavigationResponse>('/storefront/nav-menu')
    return data.navigation || []
  } catch {
    return []
  }
}

export async function fetchMarqueeMessages() {
  try {
    const data = await apiFetch<{ messages: MarqueeMessageData[] }>('/storefront/marquee-messages')
    return data.messages || []
  } catch {
    return []
  }
}

export async function fetchStorefrontHome() {
  try {
    const data = await apiFetch<StorefrontHomeData>('/storefront/home')
    return {
      announcementMessages: data.announcementMessages || [],
      banners: data.banners || [],
      sectionCategories: data.sectionCategories || [],
      featuredCategories: data.featuredCategories || [],
      womensCategories: data.womensCategories || [],
      kidsCategories: data.kidsCategories || [],
      fabricCategories: data.fabricCategories || [],
      newArrivals: data.newArrivals || [],
      marqueeMessages: data.marqueeMessages || [],
    }
  } catch {
    return {
      announcementMessages: [],
      banners: [],
      sectionCategories: [],
      featuredCategories: [],
      womensCategories: [],
      kidsCategories: [],
      fabricCategories: [],
      newArrivals: [],
      marqueeMessages: [],
    }
  }
}

export async function fetchCategories(section?: string) {
  try {
    const query = section ? `?section=${encodeURIComponent(section)}` : ''
    return await apiFetch<StorefrontCategory[]>(`/storefront/categories${query}`)
  } catch {
    return []
  }
}

export async function fetchBanners(placement?: string) {
  try {
    const query = placement ? `?placement=${encodeURIComponent(placement)}` : ''
    const data = await apiFetch<{ banners: StorefrontBanner[] }>(`/storefront/banners${query}`)
    return data.banners || []
  } catch {
    return []
  }
}

export async function searchStorefront(query: string) {
  try {
    return await apiFetch<{ products: Array<StorefrontProduct> }>(
      `/storefront/search?q=${encodeURIComponent(query)}`,
    )
  } catch {
    return { products: [] }
  }
}

export async function fetchCategoryBySlug(slug: string) {
  try {
    const data = await apiFetch<{ category: { id: number; name: string; slug: string; href: string } }>(
      `/storefront/categories/by-slug/${encodeURIComponent(slug)}`,
    )
    return data.category || null
  } catch {
    return null
  }
}

export async function fetchProducts(opts: {
  category?: string
  categoryId?: number
  section?: string
  gender?: string
  search?: string
} = {}): Promise<StorefrontProduct[]> {
  try {
    const params = new URLSearchParams()
    if (opts.section) params.set('section', opts.section)
    else if (opts.gender) params.set('gender', opts.gender)
    else if (opts.categoryId) params.set('categoryId', String(opts.categoryId))
    else if (opts.category && opts.category !== 'All') params.set('category', opts.category)
    if (opts.search) params.set('search', opts.search)
    const qs = params.toString()
    const data = await apiFetch<{ products: StorefrontProduct[] }>(
      `/storefront/products${qs ? `?${qs}` : ''}`,
    )
    return data.products || []
  } catch {
    return []
  }
}

export async function fetchProductReviews(slug: string, page = 1, perPage = 10) {
  try {
    const data = await apiFetch<{
      reviews: Review[]
      summary: ReviewSummary
      page: number
      perPage: number
      totalPages: number
    }>(`/storefront/products/${encodeURIComponent(slug)}/reviews?page=${page}&perPage=${perPage}`)
    return data
  } catch {
    return { reviews: [], summary: { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, page: 1, perPage: 10, totalPages: 0 }
  }
}

export async function checkCanReview(productId: number): Promise<CanReviewResponse> {
  try {
    return await apiFetch<CanReviewResponse>(`/storefront/products/${productId}/can-review`)
  } catch {
    return { canReview: false, hasReviewed: false, hasDeliveredOrder: false, existingReviewId: null }
  }
}

export async function submitReview(productId: number, data: ReviewSubmission, images?: File[]) {
  const fd = new FormData()
  fd.append('rating', String(data.rating))
  if (data.subject) fd.append('subject', data.subject)
  if (data.body) fd.append('body', data.body)
  if (images) {
    for (const f of images) fd.append('images', f)
  }
  return await apiFetch<{ review: Record<string, unknown> }>(`/storefront/products/${productId}/reviews`, {
    method: 'POST',
    body: fd,
  })
}

export async function fetchProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  try {
    const data = await apiFetch<{ product: StorefrontProduct }>(`/storefront/products/${encodeURIComponent(slug)}`)
    return data.product || null
  } catch {
    return null
  }
}

export async function submitContactEnquiry(data: { name: string; email: string; phonenumber: string; message: string }) {
  return await apiFetch<{ success: boolean; message: string }>('/storefront/contact-enquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export type ShippingConfig = {
  freeShippingEnabled: boolean
  freeShippingThreshold: number
}

export async function fetchShippingConfig(): Promise<ShippingConfig> {
  try {
    return await apiFetch<ShippingConfig>('/storefront/shipping-config')
  } catch {
    return { freeShippingEnabled: false, freeShippingThreshold: 0 }
  }
}

export type GuestDiscountPopupConfig = {
  enabled: boolean
  discountPercentage: number
  message: string
}

export async function fetchGuestDiscountPopupConfig(): Promise<GuestDiscountPopupConfig> {
  try {
    return await apiFetch<GuestDiscountPopupConfig>('/storefront/guest-discount-popup')
  } catch {
    return { enabled: false, discountPercentage: 0, message: '' }
  }
}

export type AutoDiscountResult = {
  valid: boolean
  discount?: { amount: number; percentage: number; label: string }
}

export async function fetchAutoDiscount(subtotal: number): Promise<AutoDiscountResult> {
  try {
    return await apiFetch<AutoDiscountResult>(`/storefront/orders/auto-discount?subtotal=${encodeURIComponent(subtotal)}`)
  } catch {
    return { valid: false }
  }
}

export type AvailableCoupon = {
  id: number
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minCartValue: number
  maxDiscount: number | null
  description: string | null
  expiresAt: string | null
}

export async function fetchAvailableCoupons(): Promise<AvailableCoupon[]> {
  try {
    const data = await apiFetch<{ coupons: AvailableCoupon[] }>('/storefront/available-coupons')
    return data.coupons || []
  } catch {
    return []
  }
}

export async function fetchReels(): Promise<StorefrontReel[]> {
  try {
    const data = await apiFetch<{ reels: StorefrontReel[] }>('/storefront/reels')
    return data.reels || []
  } catch {
    return []
  }
}

export async function fetchArtWave(): Promise<StorefrontArtWaveItem[]> {
  try {
    const data = await apiFetch<{ items: StorefrontArtWaveItem[] }>('/storefront/art-wave')
    return data.items || []
  } catch {
    return []
  }
}

export async function confirmCodOrder(orderId: number, guestToken?: string) {
  return await apiFetch<{ ok: boolean; status: string; message: string }>(
    `/storefront/orders/${orderId}/confirm-cod`,
    {
      method: 'POST',
      body: JSON.stringify({ guestToken }),
    },
  )
}
