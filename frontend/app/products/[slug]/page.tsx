import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import SingleProductPage from '@/components/product/SingleProductPage'
import { apiGet } from '@/lib/api'

type ProductData = { name: string; slug: string; category: string; metadata: Record<string, unknown> | null }

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await apiGet<ProductData>(`/storefront/products/${params.slug}`)
    return {
      title: `${product.name} | SOIL GODDESS`,
      description: `Shop the ${product.name} from SOIL GODDESS by Sri Akila.`,
    }
  } catch {
    return { title: 'Product | SOIL GODDESS' }
  }
}

export default function ProductRoute({ params }: { params: { slug: string } }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <SingleProductPage slug={params.slug} />
      <Footer />
      <FloatingActions />
    </>
  )
}
