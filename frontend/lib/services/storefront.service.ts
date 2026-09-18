import { apiGet, apiPost } from '@/lib/api'
import { apiFetch } from '@/lib/api/client'

export type ProductData = {
  id: number
  code: string
  name: string
  slug: string
  type: string
  description: string
  category: string
  price: number
  originalPrice: number | null
  imageUrl: string
  images: { id: number; imageUrl: string; altText: string }[]
  variants: ProductVariantData[]
  isNew: boolean
  featured: boolean
  stockQty: number
  status: string
  metadata: Record<string, unknown> | null
}

export type ProductVariantData = {
  id: number
  variantType: string
  label: string
  colorName: string
  colorHex: string
  sku: string
  price: number
  originalPrice: number | null
  stockQty: number
  imageUrl: string
  isDefault: boolean
  sortOrder: number
  images: { id: number; imageUrl: string; altText: string }[]
}

export type CategoryData = {
  id: number
  section: string
  name: string
  slug: string
  href: string
  imageUrl: string
  tag: string
  sortOrder: number
}

export type BannerData = {
  id: number
  placement: string
  title: string
  subtitle: string
  imageUrl: string
  ctaLabel: string
  ctaUrl: string
}

export type AnnouncementData = {
  id: number
  text: string
  linkUrl: string
  sortOrder: number
}

export type HomeData = {
  newArrivals: ProductData[]
  featuredCategories: CategoryData[]
  banners: BannerData[]
  announcements: AnnouncementData[]
}

export type NavSubCategory = {
  name: string
  href?: string
  imageUrl?: string | null
  isHighlighted?: boolean
  directLink?: boolean
  products?: { name: string; imageUrl?: string | null; isHot?: boolean; href?: string }[]
  subCategories?: NavSubCategory[]
}

export type NavMenuItem = {
  label: string
  href: string
  isSale?: boolean
  isHighlighted?: boolean
  imageUrl?: string | null
  subCategories?: NavSubCategory[]
}

export async function fetchHomeData(): Promise<HomeData> {
  return apiGet<HomeData>('/storefront/home')
}

export async function fetchProducts(params?: Record<string, string>): Promise<{ products: ProductData[]; total: number }> {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  return apiGet<{ products: ProductData[]; total: number }>(`/storefront/products${query}`)
}

export async function fetchProductBySlug(slug: string): Promise<ProductData> {
  return apiGet<ProductData>(`/storefront/products/${slug}`)
}

export async function fetchCategories(section?: string): Promise<CategoryData[]> {
  const query = section ? `?section=${section}` : ''
  return apiGet<CategoryData[]>(`/storefront/categories${query}`)
}

export async function searchProducts(query: string): Promise<{ products: ProductData[]; categories: CategoryData[] }> {
  return apiGet<{ products: ProductData[]; categories: CategoryData[] }>(`/storefront/search?q=${encodeURIComponent(query)}`)
}

export async function fetchAnnouncementBar(): Promise<AnnouncementData[]> {
  const res = await apiFetch<{ messages: AnnouncementData[] }>('/storefront/announcement-bar')
  return res.messages
}

export type EventItem = {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  eventDate: string
  startTime: string
  endTime: string
  price: number
  mode: 'offline' | 'online' | 'both'
  venueAddress: string | null
  zoomLink: string | null
  capacity: number | null
  seatsLeft?: number
  isUpcoming: boolean
  isPast: boolean
  bookingClosed: boolean
  closesAt: string
  images?: string[] | null
  videoUrl?: string | null
}

export type BookingResult = {
  bookingId: number
  bookingNumber: string
  cashfreeOrderId: string | null
  paymentSessionId: string | null
  amount: number
  currency: string
  status: string
}

export type BookingDetail = {
  id: number
  bookingNumber: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  mode: 'offline' | 'online'
  quantity: number
  total: number
  customerName: string
  qrToken: string | null
  qrImage: string | null
  zoomLink: string | null
  event: {
    name: string
    eventDate: string
    startTime: string
    endTime: string
    venueAddress: string | null
  } | null
}

export async function fetchEvents(): Promise<EventItem[]> {
  const res = await apiFetch<{ events: EventItem[] }>('/storefront/events')
  return res.events
}

export async function fetchEventBySlug(slug: string): Promise<EventItem> {
  const res = await apiFetch<{ event: EventItem }>(`/storefront/events/${encodeURIComponent(slug)}`)
  return res.event
}

export async function bookEvent(slug: string, data: {
  customerName: string
  customerEmail: string
  customerMobile: string
  mode: 'offline' | 'online'
  quantity: number
}): Promise<BookingResult> {
  const res = await apiFetch<BookingResult>(`/storefront/events/${encodeURIComponent(slug)}/book`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res
}

export async function verifyEventBooking(data: {
  cashfreeOrderId: string
  bookingId: number
}): Promise<BookingDetail> {
  const res = await apiFetch<{ booking: BookingDetail }>(`/storefront/events/bookings/${data.bookingId}/verify`, {
    method: 'POST',
    timeoutMs: 30000,
    body: JSON.stringify(data),
  })
  return res.booking
}

export async function fetchEventBooking(bookingId: number): Promise<BookingDetail> {
  const res = await apiFetch<{ booking: BookingDetail }>(`/storefront/events/bookings/${bookingId}`)
  return res.booking
}

export type EventBookingListItem = {
  id: number
  bookingNumber: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  mode: 'offline' | 'online'
  quantity: number
  total: number
  createdAt: string
  qrImage: string | null
  zoomLink: string | null
  event: {
    name: string
    eventDate: string
    startTime: string
    endTime: string
    venueAddress: string | null
  } | null
}

export async function fetchMyEventBookings(): Promise<EventBookingListItem[]> {
  const res = await apiFetch<{ bookings: EventBookingListItem[] }>('/storefront/events/my-bookings')
  return res.bookings
}

export async function fetchNavMenu(): Promise<NavMenuItem[]> {
  const res = await apiFetch<{ navigation: NavMenuItem[] }>('/storefront/nav-menu')
  return res.navigation
}

export async function fetchBanners(placement?: string): Promise<BannerData[]> {
  const query = placement ? `?placement=${placement}` : ''
  return apiGet<BannerData[]>(`/storefront/banners${query}`)
}

export interface IntroVideoConfig {
  enabled: boolean
  videoUrl: string
  posterUrl?: string
  skipEnabled: boolean
  skipAfterSeconds: number
  showOncePerSession: boolean
}

export const DEFAULT_INTRO_VIDEO_CONFIG: IntroVideoConfig = {
  enabled: false,
  videoUrl: '',
  posterUrl: '',
  skipEnabled: true,
  skipAfterSeconds: 0,
  showOncePerSession: true,
}

export const defaultIntroVideoConfig: IntroVideoConfig = DEFAULT_INTRO_VIDEO_CONFIG

export async function fetchIntroVideoConfig(): Promise<IntroVideoConfig> {
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const timer = controller ? setTimeout(() => controller.abort(), 3500) : null

    const endpoint = typeof window !== 'undefined'
      ? '/api/storefront/intro-video'
      : (() => {
          const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:5005/api'
          const cleanBase = base.replace(/\/+$/, '')
          return cleanBase.endsWith('/api') ? `${cleanBase}/storefront/intro-video` : `${cleanBase}/api/storefront/intro-video`
        })()

    const res = await fetch(endpoint, {
      signal: controller ? controller.signal : undefined,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (timer) clearTimeout(timer)
    if (!res.ok) return DEFAULT_INTRO_VIDEO_CONFIG

    const data = await res.json().catch(() => null)
    if (!data) return DEFAULT_INTRO_VIDEO_CONFIG

    const cfg = (data && typeof data === 'object' && 'config' in data && data.config) ? data.config : data

    return {
      enabled: Boolean(cfg?.enabled),
      videoUrl: typeof cfg?.videoUrl === 'string' ? cfg.videoUrl.trim() : '',
      posterUrl: typeof cfg?.posterUrl === 'string' ? cfg.posterUrl.trim() : '',
      skipEnabled: cfg?.skipEnabled !== undefined ? Boolean(cfg.skipEnabled) : true,
      skipAfterSeconds: typeof cfg?.skipAfterSeconds === 'number' && !isNaN(cfg.skipAfterSeconds)
        ? Math.max(0, Math.min(30, cfg.skipAfterSeconds))
        : (Number(cfg?.skipAfterSeconds) || 0),
      showOncePerSession: cfg?.showOncePerSession !== undefined ? Boolean(cfg.showOncePerSession) : true,
    }
  } catch {
    return DEFAULT_INTRO_VIDEO_CONFIG
  }
}
