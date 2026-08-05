const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:5005/api'

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '')
export const API_PROXY_BASE_URL = '/api/backend'

export function apiUrl(path = '') {
  if (!path) return API_BASE_URL
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function apiProxyUrl(path = '') {
  if (!path) return API_PROXY_BASE_URL
  return `${API_PROXY_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

export function apiFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers)
  const token = getAuthToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(apiProxyUrl(path), { ...init, headers })
}

export async function apiGet<T = unknown>(path: string, opts?: { responseType?: 'json' | 'blob' }): Promise<T> {
  const res = await apiFetch(path)
  if (!res.ok) throw new Error(`API GET ${path} failed: ${res.status}`)
  if (opts?.responseType === 'blob') return res.blob() as Promise<T>
  return res.json()
}

export async function apiUpload<T = unknown>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers()
  const token = getAuthToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(apiProxyUrl(path), {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!res.ok) throw new Error(`API UPLOAD ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API POST ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiPut<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API PUT ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: 'DELETE' })
  if (!res.ok) throw new Error(`API DELETE ${path} failed: ${res.status}`)
  return res.json()
}
