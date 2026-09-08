import type { Metadata, Viewport } from 'next'
import TabVisibilityHandler from '@/components/ui/TabVisibilityHandler'
import CustomCursor from '@/components/ui/CustomCursor'
import { CartProvider } from '@/components/cart/CartContext'
import { AuthProvider } from '@/components/auth/AuthContext'
import { WishlistProvider } from '@/components/wishlist/WishlistContext'
import CartDrawer from '@/components/cart/CartDrawer'
import GuestDiscountPopup from '@/components/layout/GuestDiscountPopup'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#103042',
}

export const metadata: Metadata = {
  title: 'SOIL GODDESS by Sri Akila',
  description: 'Authentic handloom sarees, silk weaves and organic fabrics. Kanchipuram silk, Mysore silk, handloom cotton and more. Free shipping in India.',
  keywords: 'silk sarees, kanchipuram silk, handloom sarees, organic sarees, mysore silk, bridal sarees',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/introvideo/introvideo.mp4"
          as="video"
          type="video/mp4"
          fetchPriority="high"
        />
      </head>
      <body>
        <CustomCursor />
        <AuthProvider>
          <WishlistProvider>
          <CartProvider>
            <TabVisibilityHandler />
            {children}
            <CartDrawer />
            <GuestDiscountPopup />
            <MobileBottomNav />
          </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
