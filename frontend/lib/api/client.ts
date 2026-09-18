function getApiBaseUrl(): string {
  const isServer = typeof window === 'undefined'
  let defaultBase = 'https://sasilk.onrender.com/api'
  if (!isServer) {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
      defaultBase = 'http://localhost:5005/api'
    }
  }
  let url = isServer
    ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || defaultBase)
    : (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || defaultBase)

  if (!url.endsWith('/api') && !url.includes('/api/')) {
    url = `${url.replace(/\/$/, '')}/api`
  }
  return url
}

export const apiBaseUrl = getApiBaseUrl()

type ApiOptions = RequestInit & {
  timeoutMs?: number
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 7000)

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      cache: 'no-store',
      credentials: 'include',
      signal: controller.signal,
      headers: options.body instanceof FormData
        ? (options.headers as Record<string, string> || {})
        : {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || data?.error || 'API request failed')
    }
    return data as T
  } finally {
    clearTimeout(timeout)
  }
}

export function resolveImageUrl(url: string | null | undefined, fallback: string = '/saree1.png'): string {
  if (!url || typeof url !== 'string') return fallback
  const trimmed = url.trim()
  if (!trimmed) return fallback
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }
  // Uploaded files are proxied by the Next rewrite /uploads/* -> backend uploads dir,
  // so keep the relative path (same-origin). Avoids next/image hostname config.
  if (trimmed.startsWith('/uploads/')) {
    return trimmed
  }
  // All other relative paths are Next.js public folder assets — return as-is
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}
