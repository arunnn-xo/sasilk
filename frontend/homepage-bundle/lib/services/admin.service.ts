'use client'

import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '@/lib/api'

export type DashboardStats = {
  label: string
  value: number
}[]

export type AdminData = {
  id: number
  name: string
  email: string
  role: string
  status: string
  lastLoginAt: string | null
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type ProductData = {
  id: number
  code: string | null
  name: string
  slug: string
  type: string | null
  description: string | null
  category: string | null
  categoryId: number | null
  price: number
  originalPrice: number | null
  stockQty: number
  imageUrl: string | null
  color: string | null
  gender: string | null
  ageGroup: string | null
  hasVariants: boolean
  status: 'draft' | 'active' | 'archived'
  featured: boolean
  isNew: boolean
  sortOrder: number
  gstRate: number
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type CategoryData = {
  id: number
  parentId: number | null
  section: string | null
  name: string
  slug: string
  href: string
  description: string | null
  imageUrl: string | null
  tag: string | null
  navVisible: boolean
  homeVisible: boolean
  sortOrder: number
  active: boolean
  metadata: Record<string, unknown> | null
}

export type OrderData = {
  id: number
  orderNumber: string
  customerId: number | null
  customerEmail: string | null
  status: string
  paymentStatus: string
  subtotal: number
  shippingTotal: number
  grandTotal: number
  shippingAddress: Record<string, unknown> | null
  deliveryAgentName: string | null
  deliveryAgentPhone: string | null
  trackingNumber: string | null
  dispatchedAt: string | null
  deliveredAt: string | null
  couponCode: string | null
  discount: number
  gstTotal: number
  taxableAmount: number
  metadata: Record<string, unknown> | null
  createdAt: string
  items?: OrderItemData[]
  customer?: { id: number; name: string; email: string; mobile: string | null }
}

export type OrderItemData = {
  id: number
  orderId: number
  productId: number | null
  variantId: number | null
  name: string
  sku: string | null
  variantLabel: string | null
  color: string | null
  size: string | null
  imageUrl: string | null
  quantity: number
  unitPrice: number
  total: number
}

export type CouponData = {
  id: number
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minCartValue: number
  maxDiscount: number | null
  usageLimit: number | null
  perUserLimit: number
  usedCount: number
  startsAt: string | null
  expiresAt: string | null
  active: boolean
  description: string | null
}

export type CustomerData = {
  id: number
  name: string
  email: string
  mobile: string | null
  status: string
  emailVerified: boolean
  createdAt: string
}

export type BannerData = {
  id: number
  placement: string
  title: string
  subtitle: string | null
  imageUrl: string
  ctaLabel: string | null
  ctaUrl: string | null
  sortOrder: number
  active: boolean
  startsAt: string | null
  endsAt: string | null
}

export type AnnouncementData = {
  id: number
  text: string
  linkUrl: string | null
  sortOrder: number
  active: boolean
  startsAt: string | null
  endsAt: string | null
}

export type SettingData = {
  id: number
  key: string
  value: unknown
}

export type VariantData = {
  id: number
  productId: number
  variantType: string
  label: string
  colorName: string | null
  colorHex: string | null
  size: string | null
  sku: string | null
  price: number | null
  originalPrice: number | null
  stockQty: number
  imageUrl: string | null
  isDefault: boolean
  status: string
  sortOrder: number
  images?: { id: number; imageUrl: string; sortOrder: number }[]
}

export type OrderPipelineCounts = Record<string, number>

export type UploadResult = {
  file: {
    filename: string
    originalName: string
    path: string
    dimensions: { width: number; height: number }
  }
}

export type CouponUsageData = {
  id: number
  couponId: number
  orderId: number
  customerId: number | null
  customerEmail: string | null
  discountAmount: number
  usedAt: string
  Order?: { orderNumber: string; grandTotal: number; createdAt: string }
}

/* ── Auth ──────────────────────────── */
export async function adminLogin(email: string, password: string) {
  return apiPost<{ admin: AdminData }>('/api/admin/auth/login', { email, password })
}

export async function adminLogout() {
  return apiPost<{ ok: boolean }>('/api/admin/auth/logout')
}

export async function fetchAdminProfile() {
  return apiGet<{ admin: AdminData }>('/api/admin/auth/me')
}

/* ── Dashboard ─────────────────────────── */
export async function fetchDashboard() {
  return apiGet<{ stats: DashboardStats }>('/api/admin/dashboard')
}

/* ── Generic Resource CRUD ──────────────── */
export async function fetchResource<T>(resource: string, page = 1, perPage = 20) {
  return apiGet<PaginatedResponse<T>>(`/api/admin/${resource}?page=${page}&perPage=${perPage}`)
}

export async function fetchResourceItem<T>(resource: string, id: number) {
  return apiGet<{ item: T }>(`/api/admin/${resource}/${id}`)
}

export async function createResource<T>(resource: string, data: unknown) {
  return apiPost<{ item: T }>(`/api/admin/${resource}`, data)
}

export async function updateResource<T>(resource: string, id: number, data: unknown) {
  return apiPut<{ item: T }>(`/api/admin/${resource}/${id}`, data)
}

export async function deleteResource(resource: string, id: number) {
  return apiDelete<{ ok: boolean }>(`/api/admin/${resource}/${id}`)
}

/* ── Products ─────────────────────────── */
export async function fetchProductVariants(productId: number) {
  return apiGet<{ items: VariantData[] }>(`/api/admin/products/${productId}/variants`)
}

export async function createProductVariant(productId: number, data: unknown) {
  return apiPost<{ item: VariantData }>(`/api/admin/products/${productId}/variants`, data)
}

export async function updateProductVariant(productId: number, variantId: number, data: unknown) {
  return apiPut<{ item: VariantData }>(`/api/admin/products/${productId}/variants/${variantId}`, data)
}

export async function deleteProductVariant(productId: number, variantId: number) {
  return apiDelete<{ ok: boolean }>(`/api/admin/products/${productId}/variants/${variantId}`)
}

export async function setDefaultVariant(productId: number, variantId: number) {
  return apiPut<{ ok: boolean }>(`/api/admin/products/${productId}/variants/${variantId}/set-default`, {})
}

/* ── Orders ─────────────────────────── */
export async function fetchOrderPipelineCounts() {
  return apiGet<{ counts: OrderPipelineCounts }>('/api/admin/orders/pipeline/counts')
}

export async function fetchOrderPipelineStage(stage: string, page = 1, perPage = 20) {
  return apiGet<PaginatedResponse<OrderData>>(`/api/admin/orders/pipeline/${stage}?page=${page}&perPage=${perPage}`)
}

export async function fetchOrderDetail(id: number) {
  return apiGet<{ item: OrderData }>(`/api/admin/orders/${id}/detail`)
}

export async function transitionOrder(id: number, data: { nextStatus: string; deliveryAgentName?: string; deliveryAgentPhone?: string; trackingNumber?: string }) {
  return apiPut<{ item: OrderData }>(`/api/admin/orders/${id}/transition`, data)
}

export async function fetchOrderPdf(id: number) {
  return apiGet<Blob>(`/api/admin/orders/${id}/pdf`, { responseType: 'blob' })
}

/* ── Coupons ─────────────────────────── */
export async function fetchCouponUsages(id: number) {
  return apiGet<{ items: CouponUsageData[] }>(`/api/admin/coupons/${id}/usages`)
}

/* ── Uploads ─────────────────────────── */
export async function uploadFile(file: File, dimensionRule?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (dimensionRule) formData.append('dimensionRule', dimensionRule)
  return apiUpload<UploadResult>('/api/admin/uploads', formData)
}

export async function deleteUploadedFile(filename: string) {
  return apiDelete<{ ok: boolean }>(`/api/admin/uploads/${filename}`)
}

/* ── Categories (enhanced) ──────────────── */
export type CategoryTreeNode = CategoryData & {
  children: CategoryTreeNode[]
  productCount: number
}

export async function fetchCategoryTree() {
  return apiGet<{ tree: CategoryTreeNode[] }>('/api/admin/categories/tree')
}

export async function reorderCategories(items: { id: number; sortOrder: number; parentId?: number | null }[]) {
  return apiPut<{ ok: boolean }>('/api/admin/categories/reorder', { items })
}

export async function toggleCategoryNav(id: number) {
  return apiPut<{ item: CategoryData }>(`/api/admin/categories/${id}/toggle-nav`, {})
}

export async function duplicateCategory(id: number) {
  return apiPost<{ item: CategoryData }>(`/api/admin/categories/${id}/duplicate`, {})
}

/* ── Settings ─────────────────────────── */
export async function fetchSettings(page = 1, perPage = 50) {
  return fetchResource<SettingData>('settings', page, perPage)
}

export async function updateSetting(id: number, data: { key: string; value: unknown }) {
  return updateResource<SettingData>('settings', id, data)
}

export async function createSetting(data: { key: string; value: unknown }) {
  return createResource<SettingData>('settings', data)
}
