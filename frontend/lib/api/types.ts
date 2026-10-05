import type { MainCategory } from '@/lib/megaMenuData'

export type StorefrontCategory = {
  id?: number
  parentId?: number | null
  name: string
  label?: string
  href: string
  image?: string
  imageUrl?: string
  tag?: string
  section?: string
  sortOrder?: number
  active?: boolean
}

export type StorefrontProduct = {
  id: number
  code: string
  name: string
  slug?: string
  type: string
  price: number
  originalPrice: number | null
  gstRate?: number | null
  isNew?: boolean
  isBestSeller?: boolean
  tag?: string | null
  featured?: boolean
  color?: string
  category: string
  categoryId?: number | null
  image: string
  imageUrl?: string
  description?: string
  metadata?: Record<string, any> | null
  stockQty?: number
  gender?: string
  weightKg?: number | null
  enableBackInStockNotify?: boolean
  averageRating?: number
  hasVariants?: boolean
  status?: string
  images?: Array<{ id: number; imageUrl: string; altText?: string; sortOrder?: number }>
  variants?: Array<{
    id: number
    variantType: string
    label?: string
    colorName?: string
    colorHex?: string
    size?: string
    sku: string
    price: number
    originalPrice?: number | null
    stockQty: number
    imageUrl?: string
    isDefault?: boolean
    sortOrder?: number
    images?: Array<{ id: number; imageUrl: string; altText?: string; sortOrder?: number }>
  }>
}

export type StorefrontBanner = {
  id?: number
  placement: string
  title: string
  subtitle?: string | null
  imageUrl: string
  ctaLabel?: string | null
  ctaUrl?: string | null
}

export type MarqueeMessageData = {
  id?: number
  text: string
  sortOrder?: number
  active?: boolean
}

export type StorefrontHomeData = {
  announcementMessages: Array<{ id?: number; text: string; linkUrl?: string | null }>
  banners: StorefrontBanner[]
  sectionCategories: StorefrontCategory[]
  featuredCategories: StorefrontCategory[]
  womensCategories: StorefrontCategory[]
  kidsCategories: StorefrontCategory[]
  fabricCategories: StorefrontCategory[]
  newArrivals: StorefrontProduct[]
  marqueeMessages?: MarqueeMessageData[]
}

export type NavigationResponse = {
  navigation: MainCategory[]
}

export type CustomerSession = {
  id: number
  name: string
  email: string
  mobile?: string | null
  status?: string
  emailVerified?: boolean
}

export type Review = {
  id: number
  rating: number
  subject: string | null
  body: string | null
  customerName: string
  createdAt: string
  images: Array<{ id: number; imageUrl: string; mediaType?: 'image' | 'video' }>
}

export type ReviewSummary = {
  total: number
  average: number
  distribution: Record<number, number>
}

export type ReviewSubmission = {
  rating: number
  subject?: string
  body?: string
}

export type CanReviewResponse = {
  canReview: boolean
  hasReviewed: boolean
  hasDeliveredOrder: boolean
  existingReviewId: number | null
}

export type CustomerAddress = {
  id: number
  customerId: number
  firstName: string
  lastName?: string | null
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  isDefault: boolean
  createdAt?: string
}

export type StorefrontReelProduct = {
  id: number
  name: string
  slug: string
  price: number | string
  originalPrice?: number | string | null
  imageUrl?: string | null
  stockQty?: number
  images?: Array<{ id: number; imageUrl: string; isPrimary?: boolean }>
}

export type StorefrontReel = {
  id: number
  imageUrl?: string | null
  videoUrl?: string | null
  title?: string | null
  views: string
  sortOrder: number
  productId?: number | null
  product?: StorefrontReelProduct | null
}

export type StorefrontArtWaveItem = {
  id: number
  title: string
  subtitle?: string | null
  description?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  mediaType?: 'image' | 'video'
  sortOrder?: number
}
