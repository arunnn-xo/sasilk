import type { Metadata } from 'next'
import { Providers } from '@/lib/context/Providers'
import TabVisibilityHandler from '@/components/ui/TabVisibilityHandler'
import CustomCursor from '@/components/ui/CustomCursor'
import './globals.css'

export const metadata: Metadata = {
  title: 'SOIL GODDESS by Sri Akila',
  description: 'Authentic handloom sarees, silk weaves and organic fabrics. Kanchipuram silk, Mysore silk, handloom cotton and more. Free shipping in India.',
  keywords: 'silk sarees, kanchipuram silk, handloom sarees, organic sarees, mysore silk, bridal sarees',
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
        <TabVisibilityHandler />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
