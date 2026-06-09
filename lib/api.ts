const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://172.16.0.125:5000/api'

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

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiProxyUrl(path), init)
}
