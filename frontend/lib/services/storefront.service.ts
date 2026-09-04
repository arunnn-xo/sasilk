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
  razorpayOrderId: string | null
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
  razorpayPaymentId: string
  razorpayOrderId: string
  razorpaySignature: string
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
