import { NextRequest } from 'next/server'

const rawApiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.16.0.125:5000/api'
const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '')

type RouteContext = {
  params: {
    path?: string[]
  }
}

function targetUrl(pathSegments: string[] = [], search = '') {
  const path = pathSegments.map(segment => encodeURIComponent(segment)).join('/')
  return `${apiBaseUrl}/${path}${search}`
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const url = targetUrl(context.params.path, request.nextUrl.search)
  const headers = new Headers(request.headers)

  headers.delete('host')
  headers.delete('connection')
  headers.delete('content-length')

  try {
    const backendResponse = await fetch(url, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
    })

    const responseHeaders = new Headers()
    const contentType = backendResponse.headers.get('content-type')

    if (contentType) responseHeaders.set('content-type', contentType)

    return new Response(await backendResponse.arrayBuffer(), {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to connect to backend'

    return Response.json(
      {
        message: `Backend connection failed: ${message}`,
        target: url,
      },
      { status: 502 },
    )
  }
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
