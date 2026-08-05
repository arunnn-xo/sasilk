import { apiGet, apiPost } from '@/lib/api'

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

export type NavMenuItem = {
  label: string
  href: string
  isSale?: boolean
  imageUrl?: string | null
  subCategories?: {
    name: string
    href?: string
    imageUrl?: string | null
    directLink?: boolean
    products?: { name: string; isHot?: boolean; href?: string }[]
  }[]
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
  return apiGet<AnnouncementData[]>('/storefront/announcement-bar')
}

export async function fetchNavMenu(): Promise<NavMenuItem[]> {
  const res = await apiGet<{ navigation: NavMenuItem[] }>('/storefront/nav-menu')
  return res.navigation
}

export async function fetchBanners(placement?: string): Promise<BannerData[]> {
  const query = placement ? `?placement=${placement}` : ''
  return apiGet<BannerData[]>(`/storefront/banners${query}`)
}
