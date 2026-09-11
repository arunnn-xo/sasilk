function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')
    if (!isLocal && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return 'https://sasilk.onrender.com/api'
    }
  }
  return envUrl || 'https://sasilk.onrender.com/api'
}

function getStorefrontBaseUrl(): string {
  const envUrl = import.meta.env.VITE_STOREFRONT_URL as string | undefined
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')
    if (!isLocal && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1') || envUrl.includes('172.16.'))) {
      return 'https://soilgoddeswebsite.vercel.app'
    }
  }
  return envUrl || 'https://soilgoddeswebsite.vercel.app'
}

export const apiBaseUrl = getApiBaseUrl()
export const storefrontBaseUrl = getStorefrontBaseUrl()

function originFromUrl(url: string) {
  try {
    return new URL(url).origin
  } catch {
    return ''
  }
}

export function resolveImageUrl(value: unknown) {
  if (!value) return ''
  const url = String(value).trim()
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    return `${originFromUrl(apiBaseUrl)}${url}`
  }
  if (url.startsWith('/')) {
    return `${storefrontBaseUrl.replace(/\/$/, '')}${url}`
  }
  return url
}

type ApiOptions = RequestInit & {
  timeoutMs?: number
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000)

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        ...(!(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      // Zod validation errors — extract specific issue messages
      if (data?.issues && Array.isArray(data.issues) && data.issues.length > 0) {
        const issueMessages = data.issues
          .map((issue: any) => issue.message)
          .filter((m: string) => m && m !== 'Required')
          .slice(0, 3)
        const msg = issueMessages.length > 0
          ? issueMessages.join('. ')
          : data?.message || 'Validation failed'
        throw new Error(msg)
      }
      const msg = data?.detail
        ? `${data.message} — ${data.detail}`
        : data?.message || data?.error || 'Request failed'
      throw new Error(msg)
    }
    return data as T
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Is the backend running on port 5005?')
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export function adminLogin(input: { email: string; password: string }) {
  return apiFetch<{ admin: { id: number; name: string; email: string; role: string } }>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function adminLogout() {
  return apiFetch<{ ok: boolean }>('/admin/auth/logout', { method: 'POST' })
}

export function getAdminMe() {
  return apiFetch<{ admin: { id: number; name: string; email: string; role: string } }>('/admin/auth/me')
}

export function downloadSampleImportUrl() {
  return `${apiBaseUrl}/admin/products/import/sample`
}

export function importProducts(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch<{ total: number; created: number; errors: { row: number; message: string }[] }>('/admin/products/import', {
    method: 'POST',
    body: formData,
  })
}

export function downloadVariantImportSampleUrl() {
  return `${apiBaseUrl}/admin/products/variants/import/sample`
}

export function importVariants(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch<{ total: number; created: number; errors: { row: number; message: string }[] }>('/admin/products/variants/import', {
    method: 'POST',
    body: formData,
  })
}

export function listResource(resource: string, page = 1, perPage = 20, search?: string) {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
  if (search) params.set('search', search)
  return apiFetch<{ items: Array<Record<string, unknown>>; total: number; page: number; perPage: number; totalPages: number }>(
    `/admin/${resource}?${params}`,
  )
}

export function getResource(resource: string, id: string | number) {
  return apiFetch<{ item: Record<string, unknown> }>(`/admin/${resource}/${id}`)
}

export type TopCustomer = { customerId: number; name: string | null; email: string | null; orderCount: number; totalAmount: number }

export function getTopCustomers() {
  return apiFetch<{ items: TopCustomer[] }>('/admin/coupons/top-customers')
}

export function createResource(resource: string, body: Record<string, unknown>) {
  return apiFetch<{ item: Record<string, unknown> }>(`/admin/${resource}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateResource(resource: string, id: string | number, body: Record<string, unknown>) {
  return apiFetch<{ item: Record<string, unknown> }>(`/admin/${resource}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteResource(resource: string, id: string | number) {
  return apiFetch<{ ok: boolean }>(`/admin/${resource}/${id}`, {
    method: 'DELETE',
  })
}

export async function bulkDeleteResource(resource: string, ids: (string | number)[]) {
  const succeeded: (string | number)[] = []
  const errors: { id: string | number; message: string }[] = []

  for (const id of ids) {
    try {
      await deleteResource(resource, id)
      succeeded.push(id)
    } catch (err) {
      errors.push({ id, message: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  return { succeeded, failed: errors.length, errors }
}

export async function uploadImage(file: File, dimensionHint?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (dimensionHint) {
    formData.append('dimensionRule', dimensionHint)
  }
  return apiFetch<{ file: { filename: string; originalName: string; path: string; dimensions?: { width: number; height: number } } }>('/admin/uploads', {
    method: 'POST',
    body: formData,
    timeoutMs: 30000,
  })
}

export async function uploadVideo(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch<{ file: { filename: string; originalName: string; path: string } }>('/admin/uploads/video', {
    method: 'POST',
    body: formData,
    timeoutMs: 60000,
  })
}

export function deleteUpload(filename: string) {
  return apiFetch<{ ok: boolean }>(`/admin/uploads/${filename}`, {
    method: 'DELETE',
  })
}

export function listVariants(productId: number | string) {
  return apiFetch<{ items: Array<Record<string, unknown>> }>(`/admin/products/${productId}/variants`)
}

export function createVariant(productId: number | string, payload: Record<string, unknown>) {
  return apiFetch<{ item: Record<string, unknown> }>(`/admin/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateVariant(productId: number | string, variantId: number | string, payload: Record<string, unknown>) {
  return apiFetch<{ item: Record<string, unknown> }>(`/admin/products/${productId}/variants/${variantId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteVariant(productId: number | string, variantId: number | string) {
  return apiFetch<{ ok: boolean }>(`/admin/products/${productId}/variants/${variantId}`, {
    method: 'DELETE',
  })
}

export function setDefaultVariant(productId: number | string, variantId: number | string) {
  return apiFetch<{ ok: boolean }>(`/admin/products/${productId}/variants/${variantId}/set-default`, {
    method: 'PUT',
  })
}

export async function uploadVariantImage(productId: number | string, variantId: number | string, file: File, dimensionRule?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (dimensionRule) {
    formData.append('dimensionRule', dimensionRule)
  }
  return apiFetch<{ file: { id: number; variantId: number; imageUrl: string; altText: string | null; sortOrder: number } }>(`/admin/products/${productId}/variants/${variantId}/images`, {
    method: 'POST',
    body: formData,
    timeoutMs: 30000,
  })
}

export async function uploadVariantMainImage(productId: number | string, variantId: number | string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('dimensionRule', 'variant-main')
  return apiFetch<{ imageUrl: string }>(`/admin/products/${productId}/variants/${variantId}/main-image`, {
    method: 'PUT',
    body: formData,
    timeoutMs: 30000,
  })
}

export function deleteVariantImage(productId: number | string, variantId: number | string, imageId: number | string) {
  return apiFetch<{ ok: boolean }>(`/admin/products/${productId}/variants/${variantId}/images/${imageId}`, {
    method: 'DELETE',
  })
}

export function reorderVariantImages(productId: number | string, variantId: number | string, imageIds: (number | string)[]) {
  return apiFetch<{ ok: boolean }>(`/admin/products/${productId}/variants/${variantId}/images/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ imageIds }),
  })
}

// ─── Product Gallery Images API ───────────────────────────────────

export function listProductImages(productId: number | string) {
  return apiFetch<{ items: Array<{ id: number; imageUrl: string; altText: string | null; sortOrder: number }> }>(
    `/admin/products/${productId}/images`
  )
}

export async function uploadProductGalleryImage(productId: number | string, file: File, dimensionRule?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (dimensionRule) {
    formData.append('dimensionRule', dimensionRule)
  }
  return apiFetch<{ file: { id: number; imageUrl: string; altText: string | null; sortOrder: number } }>(
    `/admin/products/${productId}/images`,
    {
      method: 'POST',
      body: formData,
      timeoutMs: 30000,
    }
  )
}

export function deleteProductGalleryImage(productId: number | string, imageId: number | string) {
  return apiFetch<{ ok: boolean }>(`/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
  })
}

export function reorderProductImages(productId: number | string, imageIds: (number | string)[]) {
  return apiFetch<{ ok: boolean }>(`/admin/products/${productId}/images/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ imageIds }),
  })
}

// ─── Store Overview API ─────────────────────────────────────────

export type StoreStatKey = 'products' | 'categories' | 'customers' | 'orders' | 'banners'

export type StoreStatMeta = {
  key: string
  label: string
  value: number
}

export type StoreStat = {
  key: StoreStatKey
  label: string
  value: number
  // Short line explaining what the headline number actually counts.
  hint: string
  meta: StoreStatMeta[]
}

export type DashboardStats = {
  stats: StoreStat[]
  generatedAt: string
  timezone: string
}

export function getDashboardStats() {
  return apiFetch<DashboardStats>('/admin/dashboard')
}

// ─── Sales Stats API ────────────────────────────────────────────

export type SalesStats = {
  totalSales: number
  todaySales: number
  rangeSales: number | null
  orderCount: { total: number; today: number; range: number | null }
}

export function getSalesStats(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString()
  return apiFetch<SalesStats>(`/admin/dashboard/sales${qs ? `?${qs}` : ''}`)
}

export type SalesBreakdown = {
  date: { from: string; to: string }
  orderCount: number
  totalOrdersAllTime: number
  products: Array<{ productId: number | null; name: string; quantity: number; revenue: number }>
}

export function getSalesBreakdown(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString()
  return apiFetch<SalesBreakdown>(`/admin/dashboard/sales/products${qs ? `?${qs}` : ''}`)
}

export type TopSellingProduct = {
  productId: number
  name: string
  slug: string | null
  imageUrl: string | null
  quantity: number
  revenue: number
}

export type TopSellingProducts = {
  // null when no date filter was applied — the list then covers all time.
  range: { from: string; to: string } | null
  products: TopSellingProduct[]
}

export function getTopSellingProducts(limit = 5, from?: string, to?: string) {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return apiFetch<TopSellingProducts>(`/admin/dashboard/top-products?${params.toString()}`)
}

// ─── Order Pipeline API ───────────────────────────────────────────

export function getOrderPipelineCounts() {
  return apiFetch<{ counts: Record<string, number> }>('/admin/orders/pipeline/counts')
}

export function getOrdersByStage(stage: string, page = 1, perPage = 20) {
  return apiFetch<{ items: Array<Record<string, unknown>>; total: number; page: number; perPage: number; totalPages: number }>(
    `/admin/orders/pipeline/${stage}?page=${page}&perPage=${perPage}`,
  )
}

export function getOrderDetail(id: number | string) {
  return apiFetch<{ item: Record<string, unknown> }>(`/admin/orders/${id}/detail`)
}

export function sendRecoveryEmail(id: number | string) {
  return apiFetch<{ ok: boolean; message: string; recoveryCount: number }>(`/admin/orders/${id}/send-recovery-email`, {
    method: 'POST',
  })
}

// ─── Review API ─────────────────────────────────────────────

export function listReviews(page = 1, perPage = 20, filters?: { search?: string; status?: string }) {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
  if (filters?.search) params.set('search', filters.search)
  if (filters?.status) params.set('status', filters.status)
  return apiFetch<{ items: Array<Record<string, unknown>>; total: number; page: number; perPage: number; totalPages: number }>(
    `/admin/reviews?${params.toString()}`,
  )
}

export function moderateReview(id: number | string, action: 'approve' | 'reject') {
  return apiFetch<{ item: Record<string, unknown> }>(`/admin/reviews/${id}/moderate`, {
    method: 'PUT',
    body: JSON.stringify({ action }),
  })
}

export function deleteReview(id: number | string) {
  return apiFetch<{ ok: boolean }>(`/admin/reviews/${id}`, {
    method: 'DELETE',
  })
}

// ─── Invoice API ────────────────────────────────────────────

export function generateInvoice(orderId: number | string) {
  return apiFetch<{ item: Record<string, unknown> }>(`/admin/orders/${orderId}/invoice`, {
    method: 'POST',
  })
}

export function getInvoice(orderId: number | string) {
  return apiFetch<{ item: Record<string, unknown> | null }>(`/admin/orders/${orderId}/invoice`)
}

export function downloadConfirmedAddressesPdf() {
  const date = new Date().toISOString().split('T')[0]
  return downloadBlob('/admin/orders/confirmed/addresses/pdf', `confirmed-addresses-${date}.pdf`)
}

/** Fetch a binary blob (PDF / Excel) with auth credentials and trigger browser download */
export async function downloadBlob(path: string, filename: string) {
  const response = await fetch(`${apiBaseUrl}${path}`, { credentials: 'include' })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `Download failed (${response.status})`)
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function transitionOrderStatus(
  id: number | string,
  nextStatus: string,
  extra?: { deliveryAgentName?: string; deliveryAgentPhone?: string; trackingNumber?: string; cancellationReason?: string },
) {
  return apiFetch<{ item: Record<string, unknown> }>(`/admin/orders/${id}/transition`, {
    method: 'PUT',
    body: JSON.stringify({ nextStatus, ...extra }),
  })
}

// ─── Standalone Variants API ────────────────────────────────────

export function listAllVariants(page = 1, perPage = 20, productId?: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
  if (productId) params.set('productId', String(productId))
  if (search) params.set('search', search)
  return apiFetch<{ items: Array<Record<string, unknown>>; total: number; page: number; perPage: number; totalPages: number }>(
    `/admin/variants?${params}`,
  )
}

// ─── Stock Notification API ────────────────────────────────────

export function listStockNotifications(page = 1, perPage = 20, status?: string) {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
  if (status) params.set('status', status)
  return apiFetch<{ items: Array<Record<string, unknown>>; total: number; page: number; perPage: number; totalPages: number }>(
    `/admin/stock-notifications?${params}`,
  )
}

export function markStockNotified(id: number | string) {
  return apiFetch<{ message: string }>(`/admin/stock-notifications/${id}/mark-notified`, {
    method: 'POST',
  })
}

export function sendStockNotifyMessage(id: number | string, message: string) {
  return apiFetch<{ message: string; emailSent: boolean; emailError: string | null }>(
    `/admin/stock-notifications/${id}/send-message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

// ─── Stock API ────────────────────────────────────────────────

export function getStockList(page = 1, perPage = 20) {
  return apiFetch<{ items: Array<Record<string, unknown>>; total: number; page: number; perPage: number; totalPages: number }>(
    `/admin/stock?page=${page}&perPage=${perPage}`,
  )
}

export function batchUpdateStock(updates: { variantId: number; stockQty: number; lowStockThreshold?: number | null }[]) {
  return apiFetch<{ items: Array<Record<string, unknown>> }>('/admin/stock/batch', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
  })
}

export function adjustStock(input: { variantId: number; delta: number; reason: string; reference?: string | null }) {
  return apiFetch<{ item: Record<string, unknown>; adjustment: { before: number; after: number; delta: number }; message: string }>('/admin/stock/adjust', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

// ─── Email Campaign Customers API ─────────────────────────────────

export function listCampaignCustomers(page = 1, perPage = 50, search?: string) {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
  if (search) params.set('search', search)
  return apiFetch<{ customers: Array<{ id: number; name: string; email: string }>; total: number; page: number; perPage: number; totalPages: number }>(
    `/admin/email-campaigns/customers?${params}`,
  )
}
