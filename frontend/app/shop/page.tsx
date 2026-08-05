import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import ShopPage from '@/components/shop/ShopPage'

export const metadata: Metadata = {
  title: 'Shop | Soil Goddess',
  description: 'Shop curated Soil Goddess sarees, festive wear, daily wear, and handcrafted accessories.',
}

type ShopRouteProps = {
  searchParams?: {
    search?: string | string[]
    section?: string | string[]
    gender?: string | string[]
  }
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default function ShopRoute({ searchParams }: ShopRouteProps) {
  const initialQuery = firstParam(searchParams?.search) ?? ''
  const initialSection = firstParam(searchParams?.section) ?? ''
  const initialGender = firstParam(searchParams?.gender) ?? ''

  const sectionTitles: Record<string, string> = {
    women: "Women's Collection",
    kids: "Kids' Collection",
    main: 'Featured Collection',
    fabric: 'Fabric Collection',
  }

  let title = initialSection ? sectionTitles[initialSection] || `Shop ${initialSection}` : undefined
  if (!title && initialGender) {
    title = `Shop ${initialGender.charAt(0).toUpperCase() + initialGender.slice(1)}`
  }

  return (
    <>
      <Header />
      <ShopPage
        title={title}
        initialQuery={initialQuery}
        initialSection={initialSection || undefined}
        initialGender={initialGender || undefined}
      />
      <Footer />
      <FloatingActions />
    </>
  )
}
