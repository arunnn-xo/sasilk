import type { Metadata } from 'next'
import TabVisibilityHandler from '@/components/ui/TabVisibilityHandler'
import CustomCursor from '@/components/ui/CustomCursor'
import { CartProvider } from '@/components/cart/CartContext'
import { AuthProvider } from '@/components/auth/AuthContext'
import { WishlistProvider } from '@/components/wishlist/WishlistContext'
import CartDrawer from '@/components/cart/CartDrawer'
import GuestDiscountPopup from '@/components/layout/GuestDiscountPopup'
import './globals.css'

export const metadata: Metadata = {
  title: 'SOIL GODDESS by Sri Akila',
  description: 'Authentic handloom sarees, silk weaves and organic fabrics. Kanchipuram silk, Mysore silk, handloom cotton and more. Free shipping in India.',
  keywords: 'silk sarees, kanchipuram silk, handloom sarees, organic sarees, mysore silk, bridal sarees',
  icons: {
    icon: '/favicon-logo.png',
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
          </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
