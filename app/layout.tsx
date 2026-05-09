import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SR Akila Silks – Pure Silks, Timeless Elegance',
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
      <body>{children}</body>
    </html>
  )
}
