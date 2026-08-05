function getApiBaseUrl(): string {
  const isServer = typeof window === 'undefined'
  let url = isServer
    ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://demottnapi.saitechnosolutions.co.in/api')
    : (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://demottnapi.saitechnosolutions.co.in/api')

  if (url.includes('demottn.saitechnosolutions.co.in') && !url.includes('demottnapi')) {
    url = url.replace('demottn.saitechnosolutions.co.in', 'demottnapi.saitechnosolutions.co.in')
  }
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

export function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  // Only prepend backend base URL for uploaded files
  // Paths like /categories/*, /saree*.png, etc. are served from Next.js public/
  if (url.startsWith('/uploads/')) {
    const base = apiBaseUrl.replace(/\/api$/, '')
    return `${base}${url}`
  }
  // All other relative paths are Next.js public folder assets — return as-is
  return url
}
