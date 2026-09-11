/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'sasilk.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sasilk.onrender.com/api'
    const base = apiUrl.replace(/\/api$/, '') || 'https://sasilk.onrender.com'
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${base}/uploads/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
