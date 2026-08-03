import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import ShopPage, { type Category, type Fabric } from '@/components/shop/ShopPage'

const API_BASE = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5005/api'
).replace(/\/+$/, '')

type ApiCategory = {
  id: number
  parentId: number | null
  name: string
  slug: string
  href: string
  imageUrl: string | null
}

type Crumb = { name: string; href: string }

async function fetchDbCategory(slug: string): Promise<ApiCategory | null> {
  try {
    const res = await fetch(`${API_BASE}/storefront/categories/by-slug/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = (await res.json()) as { category?: ApiCategory }
    return json?.category ?? null
  } catch {
    return null
  }
}

async function fetchDbCategories(): Promise<ApiCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/storefront/categories`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = (await res.json()) as { categories?: ApiCategory[] }
    return json?.categories ?? []
  } catch {
    return []
  }
}

function buildBreadcrumb(categories: ApiCategory[], target: ApiCategory | null): Crumb[] {
  if (!target) return []
  const map = new Map(categories.map(c => [c.id, c]))
  const chain: ApiCategory[] = []
  let cur: ApiCategory | null = target
  while (cur) {
    chain.unshift(cur)
    cur = cur.parentId ? map.get(cur.parentId) ?? null : null
  }
  return [
    { name: 'Home', href: '/' },
    ...chain.map(c => ({ name: c.name, href: c.href || `/collections/${c.slug}` })),
  ]
}

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

export default async function CollectionRoute({ params, searchParams }: CollectionRouteProps) {
  const dbCategory = await fetchDbCategory(params.slug)
  const collection = dbCategory
    ? {
        title: dbCategory.name,
        category: 'All' as Category,
        description: `Explore the handpicked ${dbCategory.name} collection curated for texture, comfort, and quiet elegance.`,
      }
    : getCollection(params.slug)
  const categoryId = dbCategory?.id ?? undefined
  const dbCategories = await fetchDbCategories()
  const breadcrumb = buildBreadcrumb(dbCategories, dbCategory)
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
        initialCategoryId={categoryId}
        backgroundImage={headerBg}
        breadcrumb={breadcrumb}
      />
      <Footer />
      <FloatingActions />
    </>
  )
}
