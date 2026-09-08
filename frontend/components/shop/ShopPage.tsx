'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Check, Heart, LayoutGrid, Grid3X3, Grid2X2, Loader2, RotateCcw, Search, ShoppingBag, SlidersHorizontal, Sparkles, Star, X } from 'lucide-react'
import { fetchProducts } from '@/lib/api/storefront'
import { resolveImageUrl } from '@/lib/api/client'
import { getDiscount } from '@/lib/api/mappers'
import type { StorefrontProduct } from '@/lib/api/types'
import { useCart } from '@/components/cart/CartContext'
import { useWishlist } from '@/components/wishlist/WishlistContext'

/* ── Filter options ─────────────────────── */
type SortMode = 'Featured' | 'Price low to high' | 'Price high to low' | 'Newest'
type PriceRange = 'All' | 'Under ₹2,000' | '₹2,000 – ₹5,000' | '₹5,000+'

const sortModes: SortMode[] = ['Featured', 'Price low to high', 'Price high to low', 'Newest']
const priceRanges: PriceRange[] = ['All', 'Under ₹2,000', '₹2,000 – ₹5,000', '₹5,000+']

const defaultDescription =
  'Explore handloom sarees, festive edits, daily drapes, and thoughtful accents selected for texture, comfort, and quiet elegance.'

/* ── Price helpers ──────────────────────── */
function inPriceRange(price: number, range: PriceRange) {
  if (range === 'Under ₹2,000') return price < 2000
  if (range === '₹2,000 – ₹5,000') return price >= 2000 && price <= 5000
  if (range === '₹5,000+') return price > 5000
  return true
}

function formatShopPrice(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

/* ── Skeleton Loading Card ──────────────── */
function ShopCatalogCardSkeleton() {
  return (
    <div className="relative flex flex-col rounded-2xl border border-amber-200/50 bg-[#FAF6EE] p-3 shadow-sm animate-pulse">
      <div className="aspect-[3/4] w-full rounded-xl bg-slate-200/60" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-1/3 rounded bg-amber-200/40" />
        <div className="h-5 w-3/4 rounded bg-slate-200/60" />
        <div className="h-4 w-1/2 rounded bg-amber-300/40 mt-3" />
        <div className="h-9 w-full rounded-xl bg-slate-200/60 mt-4" />
      </div>
    </div>
  )
}

/* ── Product Card ──────────────────────── */
function ShopCatalogCard({
  product,
  wished,
  onToggleWishlist,
  onAddToCart,
}: {
  product: StorefrontProduct
  wished: boolean
  onToggleWishlist: () => void
  onAddToCart: (colorName?: string) => void
}) {
  const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const href = `/products/${slug}`
  const disc = getDiscount(product.price, product.originalPrice)
  const badge = product.isNew ? 'New' : disc ? `${disc}% OFF` : null

  const colorOptions = useMemo(() => {
    const list: { colorName: string; colorHex?: string; imageUrl?: string }[] = []
    const seenNames = new Set<string>()
    const seenHexes = new Set<string>()
    ;(product.variants || []).forEach(v => {
      if (v.colorName) {
        const nameKey = v.colorName.trim().toLowerCase()
        const hexKey = v.colorHex ? v.colorHex.trim().toLowerCase() : ''
        
        const hasName = seenNames.has(nameKey)
        const hasHex = hexKey ? seenHexes.has(hexKey) : false
        
        if (!hasName && !hasHex) {
          seenNames.add(nameKey)
          if (hexKey) seenHexes.add(hexKey)
          list.push({
            colorName: v.colorName,
            colorHex: v.colorHex,
            imageUrl: v.imageUrl || v.images?.[0]?.imageUrl || product.imageUrl || product.image
          })
        }
      }
    })
    return list
  }, [product])

  const isOutOfStock = !!(product.stockQty != null && product.stockQty <= 0)

  const [selectedColorIdx, setSelectedColorIdx] = useState(-1)
  const [hoverColorIdx, setHoverColorIdx] = useState(-1)
  const effectiveIdx = hoverColorIdx >= 0 ? hoverColorIdx : selectedColorIdx
  const activeColor = effectiveIdx >= 0 && effectiveIdx < colorOptions.length ? colorOptions[effectiveIdx] : null
  const cartColor = selectedColorIdx >= 0 && selectedColorIdx < colorOptions.length ? colorOptions[selectedColorIdx] : null
  const displayImage = resolveImageUrl(activeColor?.imageUrl || product.imageUrl || product.image)

  return (
    <article className="group relative flex min-w-0 flex-col rounded-2xl border border-[rgba(201,168,76,0.65)] bg-[#fffaf0] shadow-[0_10px_28px_rgba(82,0,1,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_rgba(82,0,1,0.15)] overflow-hidden">
      <div className="pointer-events-none absolute inset-[6px] z-10 rounded-[12px] border border-[rgba(201,168,76,0.45)]" />

      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--ivory-dark)]">
        <Link href={href} className="block h-full w-full no-underline">
          <img
            src={displayImage}
            alt={activeColor ? `${product.name} in ${activeColor.colorName}` : product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {badge && (
          <span className="absolute left-3 top-3 z-20 rounded-md border border-amber-300/60 bg-gradient-to-r from-[#6B1A2A] to-[#8B1A1A] px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-[#E8C97E] shadow-md">
            {badge}
          </span>
        )}

        <div className={`absolute left-3 ${badge ? 'top-11' : 'top-3'} z-30 flex items-center gap-1 rounded-md bg-black/75 backdrop-blur-sm px-2 py-0.5 shadow-sm`}>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[10.5px] font-bold text-white">{product.averageRating ?? 4.8}</span>
        </div>

        {isOutOfStock && (
          <div className="absolute left-3 z-30 flex items-center rounded-md bg-rose-900/90 px-2 py-0.5 shadow-sm"
            style={{ top: badge ? '5.5rem' : '3.5rem' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Sold Out</span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleWishlist}
          className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 shadow-md ${
            wished
              ? 'border-rose-500 bg-rose-600 text-white scale-110'
              : 'border-[rgba(201,168,76,0.6)] bg-white/90 text-[var(--burgundy)] hover:bg-[var(--burgundy)] hover:text-white hover:scale-110'
          }`}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4.5 w-4.5 ${wished ? 'fill-current' : ''}`} />
        </button>

        {colorOptions.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-1.5 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3 pb-3 pt-8 backdrop-blur-[1px]"
            onMouseLeave={() => setHoverColorIdx(-1)}
          >
            {colorOptions.map((color, idx) => (
              <button
                key={color.colorName}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColorIdx(idx) }}
                onMouseEnter={() => setHoverColorIdx(idx)}
                className={`block h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                  idx === effectiveIdx ? 'border-[#E8C97E] scale-125 shadow-[0_0_0_2px_rgba(232,201,126,0.6)]' : 'border-white/80 hover:border-[#E8C97E] hover:scale-110'
                }`}
                style={{ backgroundColor: color.colorHex || '#ccc' }}
                aria-label={color.colorName}
              />
            ))}
            {activeColor && (
              <span className="ml-auto max-w-[80px] truncate text-[9.5px] font-bold text-white drop-shadow">
                {activeColor.colorName}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col border-t border-[rgba(201,168,76,0.75)] px-3 py-3.5 md:px-4 md:py-4 bg-gradient-to-b from-[#FAF6EE] to-[#F7F0E3]">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B8860B]">
            {product.type || product.category}
          </p>
          <p className="shrink-0 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B1A2A]">
            {product.category}
          </p>
        </div>

        <h3 className="truncate text-[14px] md:text-[17px] font-bold leading-snug text-[#300D14] transition-colors group-hover:text-[#6B1A2A]" style={{ fontFamily: 'Playfair Display, serif' }}>
          {product.name}
        </h3>

        <div className="mt-3 flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[14px] md:text-[17px] font-extrabold text-[#6B1A2A] leading-none">{formatShopPrice(product.price)}</p>
            {product.originalPrice ? (
              <p className="text-[10px] md:text-[12px] text-slate-500 line-through mt-1 font-medium">{formatShopPrice(product.originalPrice)}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => !isOutOfStock && onAddToCart(cartColor?.colorName)}
            disabled={isOutOfStock}
            className={`hidden md:inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 shadow-sm ${
              isOutOfStock
                ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-100'
                : 'border-[#6B1A2A] text-[#6B1A2A] hover:bg-[#6B1A2A] hover:text-white hover:shadow-md active:scale-95'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3.5 grid grid-cols-[1fr_36px] md:grid-cols-1 gap-1.5 md:gap-0">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-xl border border-[#6B1A2A] bg-[#6B1A2A] px-3 py-2.5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.16em] text-[#FAF6EE] no-underline transition-all duration-300 hover:bg-transparent hover:text-[#6B1A2A] shadow-sm hover:shadow-md text-center leading-tight"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => !isOutOfStock && onAddToCart(cartColor?.colorName)}
            disabled={isOutOfStock}
            className={`md:hidden inline-flex h-full w-full items-center justify-center rounded-xl border transition-all duration-300 ${
              isOutOfStock
                ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-100'
                : 'border-[#6B1A2A] text-[#6B1A2A] hover:bg-[#6B1A2A] hover:text-white active:scale-95'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}

/* ── Main ShopPage ────────────────────── */
export type ShopPageProps = {
  title?: string
  eyebrow?: string
  description?: string
  initialCategory?: string
  initialCategoryId?: number
  initialSection?: string
  initialGender?: string
  initialQuery?: string
  saleOnly?: boolean
  backgroundImage?: string
}

export default function ShopPage({
  title = 'Soil Goddess Shop',
  eyebrow = 'Curated Collection',
  description = defaultDescription,
  initialCategory = 'All',
  initialCategoryId,
  initialSection,
  initialGender,
  initialQuery = '',
  saleOnly = false,
  backgroundImage,
}: ShopPageProps) {
  const [query, setQuery] = useState(initialQuery)
  const [priceRange, setPriceRange] = useState<PriceRange>('All')
  const [audienceFilter, setAudienceFilter] = useState('All')
  const [sizeFilter, setSizeFilter] = useState('All')
  const [sortMode, setSortMode] = useState<SortMode>('Featured')
  const { wishlistIds, toggleWishlist } = useWishlist()
  const [toast, setToast] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Category filter state (separate from props so clearFilters can reset it)
  const [filterCategory, setFilterCategory] = useState(initialCategory)
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(initialCategoryId)
  const [filterCategoryEnabled, setFilterCategoryEnabled] = useState(!!initialCategoryId || initialCategory !== 'All')

  // API state
  const [products, setProducts] = useState<StorefrontProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  const audienceOptions = useMemo(() => {
    const genders = new Set<string>()
    products.forEach(p => {
      if (p.gender) genders.add(p.gender.toLowerCase())
    })
    return ['All', ...Array.from(genders).map(g => g.charAt(0).toUpperCase() + g.slice(1))]
  }, [products])

  const sizeOptions = useMemo(() => {
    const sizes = new Set<string>()
    products.forEach(p => {
      ;(p.variants || []).forEach(v => {
        if (v.size) sizes.add(v.size)
      })
    })
    const sorted = Array.from(sizes).sort((a, b) => {
      const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'One Size']
      return order.indexOf(a) - order.indexOf(b)
    })
    return ['All', ...sorted]
  }, [products])

  // Fetch products from backend
  const loadProducts = useCallback(async () => {
    setLoading(true)
    setApiError(false)
    try {
      const data = await fetchProducts({
        section: initialSection,
        gender: initialGender,
        categoryId: filterCategoryEnabled && !initialSection && !initialGender ? filterCategoryId : undefined,
        category: filterCategoryEnabled && !initialSection && !initialGender && !filterCategoryId && filterCategory !== 'All' ? filterCategory : undefined,
        search: initialQuery || undefined,
      })
      setProducts(data)
    } catch {
      setApiError(true)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filterCategory, filterCategoryId, filterCategoryEnabled, initialSection, initialGender, initialQuery])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Reset filters when props change (page navigation)
  useEffect(() => {
    setQuery(initialQuery)
    setPriceRange('All')
    setSortMode('Featured')
    setAudienceFilter('All')
    setSizeFilter('All')
    setFilterCategory(initialCategory)
    setFilterCategoryId(initialCategoryId)
    setFilterCategoryEnabled(!!initialCategoryId || initialCategory !== 'All')
  }, [initialCategory, initialCategoryId, initialSection, initialGender, initialQuery])

  // Client-side filtering (search + price range)
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const filtered = products.filter(product => {
      // Search filter (client-side for instant results)
      const matchesQuery = !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.category || '').toLowerCase().includes(normalizedQuery) ||
        (product.type || '').toLowerCase().includes(normalizedQuery) ||
        (product.code || '').toLowerCase().includes(normalizedQuery)

      // Price range filter
      const matchesPrice = inPriceRange(product.price, priceRange)

      // Sale filter
      const matchesSale = !saleOnly || Boolean(product.originalPrice)

      // Audience filter
      const productGender = (product.gender || '').toLowerCase()
      const selectedAudience = audienceFilter.toLowerCase()
      const matchesAudience = audienceFilter === 'All' || productGender === selectedAudience

      // Size filter
      const matchesSize = sizeFilter === 'All' || (product.variants || []).some(v => v.size === sizeFilter)

      return matchesQuery && matchesPrice && matchesSale && matchesAudience && matchesSize
    })

    return [...filtered].sort((a, b) => {
      if (sortMode === 'Price low to high') return a.price - b.price
      if (sortMode === 'Price high to low') return b.price - a.price
      if (sortMode === 'Newest') return Number(b.isNew) - Number(a.isNew)
      return 0 // Featured = original order
    })
  }, [products, query, priceRange, sortMode, saleOnly, audienceFilter, sizeFilter])

  const hasActiveFilters = filterCategoryEnabled || !!query || priceRange !== 'All' || audienceFilter !== 'All' || sizeFilter !== 'All'

  const activeFilterChips = [
    filterCategoryEnabled && filterCategory !== 'All' ? { label: `Category: ${filterCategory}`, onRemove: () => { setFilterCategoryEnabled(false); setFilterCategory('All'); setFilterCategoryId(undefined) } } : null,
    query ? { label: `Search: ${query}`, onRemove: () => setQuery('') } : null,
    priceRange !== 'All' ? { label: priceRange, onRemove: () => setPriceRange('All') } : null,
    audienceFilter !== 'All' ? { label: `Audience: ${audienceFilter}`, onRemove: () => setAudienceFilter('All') } : null,
    sizeFilter !== 'All' ? { label: `Size: ${sizeFilter}`, onRemove: () => setSizeFilter('All') } : null,
  ].filter((chip): chip is { label: string; onRemove: () => void } => Boolean(chip))

  function clearFilters() {
    setQuery('')
    setPriceRange('All')
    setSortMode('Featured')
    setAudienceFilter('All')
    setSizeFilter('All')
    setFilterCategoryEnabled(false)
    setFilterCategory('All')
    setFilterCategoryId(undefined)
  }

  const cart = useCart()

  function addToCart(product: StorefrontProduct, colorName?: string) {
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const selectedVariant = colorName
      ? product.variants?.find(v => v.colorName === colorName)
      : null
    const fallbackVariant = product.hasVariants && product.variants?.length
      ? product.variants.find(v => v.isDefault) || product.variants[0]
      : null
    const variant = selectedVariant || (product.hasVariants && product.variants?.length
      ? product.variants.find(v => (v.stockQty ?? 0) > 0) || fallbackVariant
      : null)
    cart.addItem({
      id: product.id,
      name: product.name,
      slug,
      price: variant ? variant.price : product.price,
      originalPrice: variant ? (variant.originalPrice ?? product.originalPrice) : product.originalPrice,
      image: resolveImageUrl(
        variant?.imageUrl || variant?.images?.[0]?.imageUrl || product.imageUrl || product.image
      ) || '',
      color: variant?.colorName || product.color,
      size: variant?.size,
      variantId: variant?.id,
      variantLabel: variant?.label,
      stock: variant?.stockQty ?? product.stockQty,
    })
    cart.setDrawerOpen(true)
    setToast(`${product.name} added to cart`)
    window.setTimeout(() => setToast(''), 2200)
  }

  const filterPanel = (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.55)] pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#6B1A2A]" />
          <h2 className="font-playfair text-xl sm:text-2xl font-bold italic tracking-wide text-[#300D14]">
            Refine
          </h2>
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#6B1A2A] bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1A2A] transition-all hover:bg-[#6B1A2A] hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        ) : null}
      </div>

      <FilterGroup title="Price Range" options={priceRanges} value={priceRange} onChange={value => setPriceRange(value as PriceRange)} />
      {audienceOptions.length > 1 && (
        <FilterGroup 
          title="Audience" 
          options={audienceOptions} 
          value={audienceFilter} 
          onChange={value => setAudienceFilter(value)} 
        />
      )}
      {sizeOptions.length > 1 && (
        <FilterGroup 
          title="Size" 
          options={sizeOptions} 
          value={sizeFilter} 
          onChange={value => setSizeFilter(value)} 
        />
      )}
    </div>
  )

  const [cols, setCols] = useState<2 | 3 | 4>(4)

  const gridClass = cols === 2
    ? 'grid grid-cols-2 gap-3 md:gap-5'
    : cols === 3
      ? 'grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3'
      : 'grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <main className="relative bg-[#FAF6EE] text-[#300D14] min-h-screen">
      {/* Full Page Premium Modern Silk Background Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.35] transition-opacity duration-500"
        style={{
          backgroundImage: "url('/modern_shop_bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      {backgroundImage && (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-repeat opacity-[0.02]"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: '350px',
          }}
        />
      )}

      {/* Luxury Hero Banner */}
      <section className="relative overflow-hidden border-b border-[rgba(201,168,76,0.6)] bg-gradient-to-r from-[#20050A] via-[#420A12] to-[#20050A] py-10 md:py-16 lg:py-20 text-white shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-70"
          style={{
            backgroundImage: "url('/shop_heading_bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        <div className="relative z-10 mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Eyebrow Badge & Breadcrumb */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8C97E]/40 bg-[#6B1A2A]/80 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#E8C97E] backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {eyebrow}
              </span>
              <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                <Link href="/" className="hover:text-[#E8C97E] no-underline transition-colors">Home</Link>
                <span className="text-[#E8C97E]">›</span>
                <span className="text-amber-200">Shop</span>
              </nav>
            </div>

            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#E8C97E] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {title}
            </h1>

            {/* Decorative Gold Flourish Line */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-0.5 w-16 bg-gradient-to-r from-[#E8C97E] to-transparent" />
              <div className="h-2 w-2 rotate-45 border border-[#E8C97E] bg-[#6B1A2A]" />
              <div className="h-0.5 w-32 bg-gradient-to-r from-[#E8C97E] to-transparent opacity-60" />
            </div>

            <p className="font-sans text-sm sm:text-base font-medium leading-relaxed text-slate-100/90 max-w-2xl drop-shadow-sm">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Desk */}
      <section className="relative z-10 mx-auto max-w-[1500px] px-4 py-6 md:py-10 sm:px-6 lg:px-8">
        {/* Sticky Control & Search Bar */}
        <div className="sticky top-20 z-30 mb-8 rounded-2xl border border-[rgba(201,168,76,0.5)] bg-[#FAF6EE]/90 p-4 shadow-lg backdrop-blur-md transition-all">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,620px)] lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#B8860B]" />
                <p className="font-montserrat text-[11px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-[#B8860B]">
                  Catalog Desk
                </p>
              </div>
              <p className="font-montserrat mt-1.5 text-sm font-bold text-[#6B1A2A]">
                {loading ? 'Fetching products…' : `Showing ${filteredProducts.length} products`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              {/* Search input */}
              <label className="relative block flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B1A2A]" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search sarees, fabric, occasion..."
                  className="h-10 w-full rounded-xl border border-[rgba(201,168,76,0.55)] bg-white/90 pl-10 pr-3.5 text-xs font-medium outline-none transition focus:border-[#6B1A2A] focus:ring-2 focus:ring-[#6B1A2A]/20"
                />
              </label>

              {/* Sort Selector */}
              <select
                value={sortMode}
                onChange={event => setSortMode(event.target.value as SortMode)}
                className="h-10 rounded-xl border border-[rgba(201,168,76,0.55)] bg-white/90 px-3.5 text-xs font-bold text-[#300D14] outline-none transition focus:border-[#6B1A2A]"
                aria-label="Sort products"
              >
                {sortModes.map(mode => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>

              {/* Grid Column Switcher (Desktop) */}
              <div className="hidden lg:flex items-center gap-1 rounded-xl border border-[rgba(201,168,76,0.55)] bg-white/90 p-1">
                <button
                  type="button"
                  onClick={() => setCols(2)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${cols === 2 ? 'bg-[#6B1A2A] text-white' : 'text-slate-500 hover:text-[#6B1A2A]'}`}
                  title="2 Columns"
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCols(3)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${cols === 3 ? 'bg-[#6B1A2A] text-white' : 'text-slate-500 hover:text-[#6B1A2A]'}`}
                  title="3 Columns"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCols(4)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${cols === 4 ? 'bg-[#6B1A2A] text-white' : 'text-slate-500 hover:text-[#6B1A2A]'}`}
                  title="4 Columns"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {activeFilterChips.length > 0 ? (
            <div className="mt-3.5 flex flex-wrap gap-2 border-t border-[rgba(201,168,76,0.45)] pt-3.5">
              {activeFilterChips.map(chip => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(107,26,42,0.35)] bg-white px-3 py-1.5 text-[11px] font-bold text-[#6B1A2A] transition-all hover:bg-[#6B1A2A] hover:text-white shadow-sm"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}

          {/* Mobile Filter Button */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#6B1A2A] bg-[#6B1A2A] py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-98"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter Products
            </button>
          </div>
        </div>

        {/* Main Grid & Sidebar Layout */}
        <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)]">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden self-start rounded-2xl border border-[rgba(201,168,76,0.55)] bg-[#FAF6EE]/95 p-5 shadow-md backdrop-blur-md lg:sticky lg:top-40 lg:block">
            {filterPanel}
          </aside>

          {/* Catalog Product Grid */}
          <div className="min-w-0">
            {loading ? (
              <div className={gridClass}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ShopCatalogCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={gridClass}>
                {filteredProducts.map(product => {
                  const wished = wishlistIds.includes(product.id)

                  return (
                    <ShopCatalogCard
                      key={product.id}
                      product={product}
                      wished={wished}
                      onToggleWishlist={() => toggleWishlist(product.id, product.name)}
                      onAddToCart={(colorName) => addToCart(product, colorName)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[rgba(201,168,76,0.7)] bg-[#FAF6EE] p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-[#6B1A2A]">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold italic tracking-wide text-[#300D14]">
                  No products found
                </h2>
                <p className="mx-auto mt-2.5 max-w-md text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                  {apiError
                    ? 'Unable to load products. Please check your connection and try again.'
                    : 'We could not find any products matching your selected filters. Try clearing your search or price range.'}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#6B1A2A] bg-[#6B1A2A] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-transparent hover:text-[#6B1A2A] active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Drawer Filter */}
      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs lg:hidden" role="dialog" aria-modal="true">
          <div className="ml-auto flex h-full w-full max-w-sm flex-col border-l border-[rgba(201,168,76,0.55)] bg-[#FAF6EE] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.55)] p-4">
              <h2 className="font-playfair text-lg sm:text-xl font-bold italic tracking-wide text-[#300D14]">
                Refine Catalog
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#6B1A2A] text-[#6B1A2A] transition-colors hover:bg-[#6B1A2A] hover:text-white"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
            <div className="border-t border-[rgba(201,168,76,0.55)] p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-xl border border-[#6B1A2A] bg-[#6B1A2A] py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md"
              >
                Show {filteredProducts.length} products
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 z-[140] -translate-x-1/2 rounded-xl bg-[#300D14] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-200 shadow-2xl border border-amber-300/40 backdrop-blur-md">
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
  const [open, setOpen] = useState(true)

  return (
    <fieldset className="border-b border-[rgba(201,168,76,0.4)] pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#B8860B] hover:text-[#6B1A2A] transition-colors text-left"
      >
        <span>{title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="space-y-1.5">
          {options.map(option => {
            const selected = value === option

            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                  selected
                    ? 'border-[#6B1A2A] bg-[#6B1A2A] text-white shadow-sm'
                    : 'border-transparent text-[#300D14] hover:border-[rgba(201,168,76,0.4)] hover:bg-white/80'
                }`}
              >
                <span>{option}</span>
                <div className="flex items-center gap-1.5">
                  {selected && <Check className="h-3.5 w-3.5 text-amber-300" />}
                  <input
                    type="radio"
                    name={title}
                    checked={selected}
                    onChange={() => onChange(option)}
                    className="sr-only"
                  />
                </div>
              </label>
            )
          })}
        </div>
      )}
    </fieldset>
  )
}
