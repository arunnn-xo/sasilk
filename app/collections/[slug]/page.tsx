import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import ShopPage, { type Category, type Fabric } from '@/components/shop/ShopPage'

type CollectionRouteProps = {
  params: {
    slug: string
  }
  searchParams?: {
    filter?: string | string[]
    search?: string | string[]
  }
}

const collectionMap: Record<string, { title: string; category: Category; description: string }> = {
  'organic-sarees': {
    title: 'Organic Sarees',
    category: 'Sarees',
    description: 'Browse organic cotton, silk, linen, and tussar sarees curated for graceful everyday and occasion wear.',
  },
  'party-wear': {
    title: 'Party Wear',
    category: 'Party Wear',
    description: 'Festive silhouettes and elegant drapes selected for celebrations, receptions, and evening occasions.',
  },
  'daily-wear': {
    title: 'Daily Wear',
    category: 'Daily Wear',
    description: 'Comfort-first pieces with SOIL GODDESS color, texture, and handcrafted detail for regular wear.',
  },
  accessories: {
    title: 'Accessories',
    category: 'Accessories',
    description: 'Complete each look with saree-ready bags, stoles, and thoughtful finishing pieces.',
  },
}

const fabricFilters: Fabric[] = ['Cotton', 'Silk', 'Linen', 'Tussar']

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getCollection(slug: string) {
  return collectionMap[slug] ?? {
    title: titleFromSlug(slug),
    category: 'All' as Category,
    description: 'Explore this curated SOIL GODDESS collection through the same premium shop experience.',
  }
}

export function generateMetadata({ params }: CollectionRouteProps): Metadata {
  const collection = getCollection(params.slug)

  return {
    title: `${collection.title} | SOIL GODDESS`,
    description: collection.description,
  }
}

export default function CollectionRoute({ params, searchParams }: CollectionRouteProps) {
  const collection = getCollection(params.slug)
  const filter = firstParam(searchParams?.filter) ?? ''
  const search = firstParam(searchParams?.search) ?? ''
  const initialFabric = fabricFilters.includes(filter as Fabric) ? (filter as Fabric) : 'All'
  const initialQuery = initialFabric === 'All' ? filter || search : search

  const combinedFilter = (filter + ' ' + search).toLowerCase()

  // organic-sarees sub-filters → Kanchi silk abstract bg
  const isKanchi =
    params.slug === 'organic-sarees' &&
    (combinedFilter.includes('kanchi') || combinedFilter.includes('kanchipuram'))

  // daily-wear → Kurti & Tops abstract bg
  const isKurtiTops =
    params.slug === 'daily-wear' &&
    (combinedFilter.includes('kurti') || combinedFilter.includes('top'))

  const headerBg = isKanchi
    ? '/bgabstractimage/kanchi_sarees_bg.png'
    : isKurtiTops
    ? '/bgabstractimage/kurti_tops_bg.png'
    : undefined

  // Make title more descriptive for the sub-filter
  const displayTitle = filter ? `${collection.title} — ${filter}` : collection.title

  return (
    <>
      <AnnouncementBar />
      <Header />
      <ShopPage
        title={displayTitle}
        eyebrow="SOIL GODDESS Collection"
        description={collection.description}
        initialCategory={collection.category}
        initialFabric={initialFabric}
        initialQuery={initialQuery}
        backgroundImage={headerBg}
      />
      <Footer />
      <FloatingActions />
    </>
  )
}
