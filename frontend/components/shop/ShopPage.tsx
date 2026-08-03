'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard, { type ProductCardProduct } from '@/components/product/ProductCard'
import { fetchProducts, fetchCategories, type CategoryData } from '@/lib/services/storefront.service'

export type Category = 'All' | 'Sarees' | 'Party Wear' | 'Daily Wear' | 'Accessories'
export type Fabric = 'All' | 'Cotton' | 'Silk' | 'Linen' | 'Tussar'
type PriceRange = 'All' | 'Under Rs. 2,000' | 'Rs. 2,000-5,000' | 'Rs. 5,000+'
type Occasion = 'All' | 'Daily' | 'Festive' | 'Bridal' | 'Office'
type SortMode = 'Featured' | 'Price low to high' | 'Price high to low' | 'Newest'

type Product = ProductCardProduct & {
  id: number
  category: Exclude<Category, 'All'>
  fabric: Exclude<Fabric, 'All'>
  occasion: Exclude<Occasion, 'All'>
  isNewest?: boolean
  featuredRank: number
  subCategory?: string
}

const fabrics: Fabric[] = ['All', 'Cotton', 'Silk', 'Linen', 'Tussar']
const priceRanges: PriceRange[] = ['All', 'Under Rs. 2,000', 'Rs. 2,000-5,000', 'Rs. 5,000+']
const occasions: Occasion[] = ['All', 'Daily', 'Festive', 'Bridal', 'Office']
const sortModes: SortMode[] = ['Featured', 'Price low to high', 'Price high to low', 'Newest']
const defaultDescription =
  'Explore handcrafted sarees, festive drapes, daily wear, and thoughtful accents selected for texture, comfort, and quiet elegance.'

type CategoryOption = { id: number | null; name: string; depth: number; href: string }

function buildCategoryOptions(cats: CategoryData[]): CategoryOption[] {
  const byParent = new Map<number | null, CategoryData[]>()
  for (const c of cats) {
    const key = c.parentId
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(c)
  }
  for (const list of Array.from(byParent.values())) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
  }
  const options: CategoryOption[] = []
  const walk = (parentId: number | null, depth: number) => {
    for (const c of byParent.get(parentId) || []) {
      options.push({
        id: c.id,
        name: c.name,
        depth,
        href: c.href || `/collections/${c.slug}`,
      })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return options
}

function inPriceRange(product: Product, range: PriceRange) {
  if (range === 'Under Rs. 2,000') return product.price < 2000
  if (range === 'Rs. 2,000-5,000') return product.price >= 2000 && product.price <= 5000
  if (range === 'Rs. 5,000+') return product.price > 5000
  return true
}

function mapMetadata(product: ProductCardProduct & { id: number; metadata?: Record<string, unknown> | null; featuredRank?: number; subCategory?: string }): Product {
  return {
    ...product,
    id: product.id,
    category: (product.metadata?.category as Exclude<Category, 'All'>) || product.category as Exclude<Category, 'All'>,
    fabric: (product.metadata?.fabric as Exclude<Fabric, 'All'>) || (product as Record<string, unknown>).fabric as Exclude<Fabric, 'All'> || 'Silk' as Exclude<Fabric, 'All'>,
    occasion: (product.metadata?.occasion as Exclude<Occasion, 'All'>) || (product as Record<string, unknown>).occasion as Exclude<Occasion, 'All'> || 'Festive' as Exclude<Occasion, 'All'>,
    isNewest: product.metadata?.isNewest as boolean ?? false,
    featuredRank: product.featuredRank ?? 99,
    subCategory: product.subCategory ?? (product.metadata?.subCategory as string | undefined),
  }
}

type ShopPageProps = {
  title?: string
  eyebrow?: string
  description?: string
  initialCategory?: Category
  initialFabric?: Fabric
  initialQuery?: string
  initialCategoryId?: number
  initialSection?: string
  saleOnly?: boolean
  backgroundImage?: string
  breadcrumb?: { name: string; href: string }[]
}

export default function ShopPage({
  title = 'Shop SOIL GODDESS',
  eyebrow = 'Curated Collection',
  description = defaultDescription,
  initialCategory = 'All',
  initialFabric = 'All',
  initialQuery = '',
  initialCategoryId,
  initialSection,
  saleOnly = false,
  backgroundImage,
  breadcrumb,
}: ShopPageProps) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<Category>(initialCategory)
  const [fabric, setFabric] = useState<Fabric>(initialFabric)
  const [priceRange, setPriceRange] = useState<PriceRange>('All')
  const [occasion, setOccasion] = useState<Occasion>('All')
  const [sortMode, setSortMode] = useState<SortMode>('Featured')
  const [wishlist, setWishlist] = useState<number[]>([])
  const [toast, setToast] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategoryId ?? null)
  const requestRef = useRef(0)

  useEffect(() => {
    setQuery(initialQuery)
    setCategory(initialCategory)
    setFabric(initialFabric)
    setOccasion('All')
    setPriceRange('All')
    setSortMode('Featured')
    setSelectedCategoryId(initialCategoryId ?? null)
  }, [initialCategory, initialFabric, initialQuery, initialCategoryId])

  useEffect(() => {
    fetchCategories()
      .then(cats => setCategoryOptions(buildCategoryOptions(cats)))
      .catch(() => {})
  }, [])

  function mapResult(result: Awaited<ReturnType<typeof fetchProducts>>): Product[] {
    return result.products.map((p, i) => {
      const meta = p.metadata as Record<string, unknown> | null
      return mapMetadata({
        id: p.id,
        name: p.name,
        category: p.category || 'Sarees',
        fabric: meta?.fabric as string || 'Silk',
        occasion: meta?.occasion as string || 'Festive',
        image: p.imageUrl,
        price: p.price,
        oldPrice: p.originalPrice,
        badge: meta?.badge as string | undefined,
        rating: meta?.rating as number || 4.5,
        reviews: meta?.reviews as number || 0,
        colors: meta?.colors as { name: string; hex: string }[] | undefined,
        metadata: { ...(p.metadata as Record<string, unknown> | null || {}), isNewest: p.isNew },
        featuredRank: i + 1,
        subCategory: meta?.subCategory as string | undefined,
      })
    })
  }

  useEffect(() => {
    async function loadProducts() {
      const requestId = ++requestRef.current
      setLoading(true)
      try {
        const params: Record<string, string> = {}
        if (selectedCategoryId) params.categoryId = String(selectedCategoryId)
        else if (initialSection) params.section = initialSection
        const result = await fetchProducts(Object.keys(params).length > 0 ? params : undefined)
        if (requestRef.current !== requestId) return
        setAllProducts(mapResult(result))
      } catch {
        if (requestRef.current === requestId) setAllProducts([])
      } finally {
        if (requestRef.current === requestId) setLoading(false)
      }
    }
    loadProducts()
  }, [selectedCategoryId, initialSection])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const nextProducts = allProducts.filter(product => {
      let matchesQuery = !normalizedQuery
      if (normalizedQuery) {
        if (
          normalizedQuery === 'kurti & tops' ||
          normalizedQuery === 'kurti' ||
          normalizedQuery === 'tops' ||
          normalizedQuery === 'kurti and tops'
        ) {
          matchesQuery =
            product.category === 'Daily Wear' &&
            (product.name.toLowerCase().includes('kurti') ||
              product.name.toLowerCase().includes('top') ||
              product.name.toLowerCase().includes('set') ||
              product.name.toLowerCase().includes('co-ord'))
        } else {
          const subCatMatch = product.subCategory
            ? product.subCategory.toLowerCase().includes(normalizedQuery)
            : false
          matchesQuery =
            subCatMatch ||
            [product.name, product.category, product.fabric, product.occasion].some(value =>
              value.toLowerCase().includes(normalizedQuery),
            )
        }
      }

      return (
        matchesQuery &&
        (!saleOnly || Boolean(product.oldPrice)) &&
        (category === 'All' || product.category === category) &&
        (fabric === 'All' || product.fabric === fabric) &&
        (occasion === 'All' || product.occasion === occasion) &&
        inPriceRange(product, priceRange)
      )
    })

    return [...nextProducts].sort((a, b) => {
      if (sortMode === 'Price low to high') return a.price - b.price
      if (sortMode === 'Price high to low') return b.price - a.price
      if (sortMode === 'Newest') return Number(b.isNewest) - Number(a.isNewest) || a.featuredRank - b.featuredRank
      return a.featuredRank - b.featuredRank
    })
  }, [allProducts, category, fabric, occasion, priceRange, query, saleOnly, sortMode])

  const hasActiveFilters =
    query || fabric !== initialFabric || occasion !== 'All' || priceRange !== 'All'

  function clearFilters() {
    setQuery('')
    setCategory(initialCategory)
    setFabric(initialFabric)
    setOccasion('All')
    setPriceRange('All')
    setSortMode('Featured')
  }

  function addToCart(productName: string) {
    setToast(`${productName} added to cart`)
    window.setTimeout(() => setToast(''), 2200)
  }

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-[#9C1A21]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Filters
        </h2>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9C1A21] underline-offset-4 hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      <fieldset>
        <legend className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#7A6065]">Categories</legend>
        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          <Link
            href="/shop"
            className={`flex items-center rounded px-2 py-1.5 text-sm no-underline transition-colors ${
              selectedCategoryId === null
                ? 'bg-[#F6EED8] font-semibold text-[#9C1A21]'
                : 'text-[#2A1A1E] hover:bg-[#FAF6EE]'
            }`}
          >
            <span>All</span>
          </Link>
          {categoryOptions.map(opt => (
            <Link
              key={opt.id}
              href={opt.href}
              className={`flex items-center rounded px-2 py-1.5 text-sm no-underline transition-colors ${
                selectedCategoryId === opt.id
                  ? 'bg-[#F6EED8] font-semibold text-[#9C1A21]'
                  : 'text-[#2A1A1E] hover:bg-[#FAF6EE]'
              }`}
            >
              <span
                className={opt.depth === 0 ? 'font-semibold' : 'text-[#5A4045]'}
                style={{ marginLeft: `${opt.depth * 12}px` }}
              >
                {opt.depth > 0 ? '↳ ' : ''}{opt.name}
              </span>
            </Link>
          ))}
        </div>
      </fieldset>
      <FilterGroup title="Fabric" options={fabrics} value={fabric} onChange={value => setFabric(value as Fabric)} />
      <FilterGroup title="Price" options={priceRanges} value={priceRange} onChange={value => setPriceRange(value as PriceRange)} />
      <FilterGroup title="Occasion" options={occasions} value={occasion} onChange={value => setOccasion(value as Occasion)} />
    </div>
  )

  if (loading) {
    return (
      <main className="relative bg-[#FAF6EE] text-[#2A1A1E]">
        <section className="relative overflow-hidden border-b border-[#D9B86E]/50 bg-[#FAF6EE] py-12 sm:py-14 md:py-16">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#A57C3A]">{eyebrow}</p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-[#300D14] sm:text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              {title}
            </h1>
          </div>
        </section>
        <section className="mx-auto max-w-[1500px] px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#D9B86E] border-t-[#9C1A21]" />
          <p className="mt-4 text-sm text-[#7A6065]">Loading products...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="relative bg-[#FAF6EE] text-[#2A1A1E]">
      {backgroundImage && (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-repeat opacity-[0.02]"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: '350px',
          }}
        />
      )}

      <section className="relative overflow-hidden border-b border-[#D9B86E]/50 bg-[#FAF6EE] py-12 sm:py-14 md:py-16">
        <div className="relative z-30 mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
              {breadcrumb.map((crumb, i) => (
                <span key={`${crumb.href}-${i}`} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[#BF9A4B]">›</span>}
                  {i < breadcrumb.length - 1 ? (
                    <Link href={crumb.href} className="no-underline text-[#7A6065] transition-colors hover:text-[#9C1A21]">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-[#9C1A21]">{crumb.name}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#A57C3A]">{eyebrow}</p>
          <h1
            className="max-w-3xl text-3xl font-bold leading-tight text-[#300D14] sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5A4045] sm:text-base">{description}</p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-lg border border-[#D9B86E] bg-white p-4 shadow-[0_12px_34px_rgba(74,15,28,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#9C1A21]">Showing {filteredProducts.length} products</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_190px] lg:w-[620px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9C1A21]" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search sarees, fabric, occasion"
                  className="h-11 w-full rounded-md border border-[#D9B86E] bg-[#FFFCF7] pl-10 pr-3 text-sm outline-none transition focus:border-[#9C1A21]"
                />
              </label>

              <select
                value={sortMode}
                onChange={event => setSortMode(event.target.value as SortMode)}
                className="h-11 rounded-md border border-[#D9B86E] bg-[#FFFCF7] px-3 text-sm text-[#2A1A1E] outline-none transition focus:border-[#9C1A21]"
                aria-label="Sort products"
              >
                {sortModes.map(mode => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {[{ id: null as number | null, name: 'All', href: '/shop', depth: 0 }, ...categoryOptions].map(item => (
              <Link
                key={item.id ?? 'all'}
                href={item.href}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold no-underline ${
                  selectedCategoryId === item.id
                    ? 'border-[#9C1A21] bg-[#9C1A21] text-gold'
                    : 'border-[#D9B86E] bg-[#FAF6EE] text-[#2A1A1E]'
                }`}
              >
                {item.depth > 0 ? '↳ ' : ''}{item.name}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#BF9A4B] bg-[#F6EED8] px-4 py-2 text-xs font-semibold text-[#9C1A21]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden rounded-lg border border-[#D9B86E] bg-white p-4 shadow-[0_12px_34px_rgba(74,15,28,0.05)] lg:block">
            {filterPanel}
          </aside>

          <div className="min-w-0">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map(product => {
                  const wished = wishlist.includes(product.id)

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      wished={wished}
                      onToggleWishlist={() =>
                        setWishlist(current => (wished ? current.filter(id => id !== product.id) : [...current, product.id]))
                      }
                      onAddToCart={() => addToCart(product.name)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#BF9A4B] bg-white p-10 text-center">
                <h2 className="text-3xl font-semibold text-[#9C1A21]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  No products found
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6065]">
                  Try clearing filters or searching for another weave, fabric, or occasion.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-md bg-[#9C1A21] px-6 py-3 text-sm font-semibold text-gold transition hover:bg-[#721016]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[130] bg-black/40 lg:hidden" role="dialog" aria-modal="true">
          <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-[#FAF6EE]">
            <div className="flex items-center justify-between border-b border-[#D9B86E] p-4">
              <h2 className="text-lg font-semibold text-[#9C1A21]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Filter products
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D9B86E] text-[#9C1A21]"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
            <div className="border-t border-[#D9B86E] p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-md bg-[#9C1A21] py-3 text-sm font-semibold text-gold"
              >
                Show {filteredProducts.length} products
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[140] -translate-x-1/2 rounded-md bg-[#2A1A1E] px-5 py-3 text-sm font-medium text-gold shadow-xl">
          {toast}
        </div>
      ) : null}
    </main>
  )
}

function FilterGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#7A6065]">{title}</legend>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-[#2A1A1E]">
            <input
              type="radio"
              name={title}
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-4 w-4 accent-[#9C1A21]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
