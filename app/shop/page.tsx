import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import ShopPage from '@/components/shop/ShopPage'

export const metadata: Metadata = {
  title: 'Shop | SOIL GODDESS',
  description: 'Shop curated SOIL GODDESS sarees, festive wear, daily wear, and handcrafted accessories.',
}

type ShopRouteProps = {
  searchParams?: {
    search?: string | string[]
  }
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default function ShopRoute({ searchParams }: ShopRouteProps) {
  const initialQuery = firstParam(searchParams?.search) ?? ''

  return (
    <>
      <AnnouncementBar />
      <Header />
      <ShopPage initialQuery={initialQuery} />
      <Footer />
      <FloatingActions />
    </>
  )
}
