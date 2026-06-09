'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard, { type ProductCardProduct } from '@/components/product/ProductCard'

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

const categories: Category[] = ['All', 'Sarees', 'Party Wear', 'Daily Wear', 'Accessories']
const fabrics: Fabric[] = ['All', 'Cotton', 'Silk', 'Linen', 'Tussar']
const priceRanges: PriceRange[] = ['All', 'Under Rs. 2,000', 'Rs. 2,000-5,000', 'Rs. 5,000+']
const occasions: Occasion[] = ['All', 'Daily', 'Festive', 'Bridal', 'Office']
const sortModes: SortMode[] = ['Featured', 'Price low to high', 'Price high to low', 'Newest']
const defaultDescription =
  'Explore handcrafted sarees, festive drapes, daily wear, and thoughtful accents selected for texture, comfort, and quiet elegance.'

const products: Product[] = [
  {
    id: 1,
    name: 'Soft Silk Woven Zari Saree',
    category: 'Sarees',
    fabric: 'Silk',
    occasion: 'Festive',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900',
    price: 2580,
    oldPrice: 5160,
    badge: 'Bestseller',
    rating: 4.8,
    reviews: 42,
    isNewest: true,
    featuredRank: 1,
    colors: [
      { name: 'Kum Kum Red', hex: '#C0392B' },
      { name: 'Peacock Teal', hex: '#0E6655' },
      { name: 'Royal Sapphire', hex: '#1A3A8F' },
      { name: 'Turmeric Gold', hex: '#D4AC0D' },
      { name: 'Plum Purple', hex: '#6C3483' },
    ],
  },
  {
    id: 2,
    name: 'Royal Kanchipuram Bridal Saree',
    category: 'Sarees',
    fabric: 'Silk',
    occasion: 'Bridal',
    image: '/saree1.png',
    price: 18500,
    oldPrice: 22000,
    badge: 'New',
    rating: 4.9,
    reviews: 28,
    isNewest: true,
    featuredRank: 2,
    colors: [
      { name: 'Bridal Red', hex: '#922B21' },
      { name: 'Deep Maroon', hex: '#641E16' },
      { name: 'Champagne Gold', hex: '#C9A84C' },
      { name: 'Ivory Cream', hex: '#FAF0DC' },
    ],
  },
  {
    id: 3,
    name: 'Mysore Crepe Silk Saree',
    category: 'Sarees',
    fabric: 'Silk',
    occasion: 'Festive',
    image: '/saree2.png',
    price: 6200,
    badge: 'Bestseller',
    rating: 4.7,
    reviews: 19,
    featuredRank: 3,
    colors: [
      { name: 'Pastel Lilac', hex: '#C39BD3' },
      { name: 'Rose Dust', hex: '#D98880' },
      { name: 'Seafoam', hex: '#76D7C4' },
      { name: 'Butter Yellow', hex: '#F7DC6F' },
      { name: 'Sky Mist', hex: '#85C1E9' },
    ],
  },
  {
    id: 4,
    name: 'Tussar Kalamkari Silk Saree',
    category: 'Sarees',
    fabric: 'Tussar',
    occasion: 'Office',
    image: '/saree3.png',
    price: 4500,
    oldPrice: 5200,
    badge: 'Sale',
    rating: 4.6,
    reviews: 14,
    featuredRank: 4,
    colors: [
      { name: 'Natural Beige', hex: '#D7B899' },
      { name: 'Copper Bronze', hex: '#B5651D' },
      { name: 'Forest Olive', hex: '#556B2F' },
      { name: 'Dusty Rose', hex: '#C08080' },
    ],
  },
  {
    id: 5,
    name: 'Organic Chettinad Cotton Saree',
    category: 'Sarees',
    fabric: 'Cotton',
    occasion: 'Daily',
    image: '/saree4.png',
    price: 1350,
    badge: 'New',
    rating: 4.8,
    reviews: 31,
    isNewest: true,
    featuredRank: 5,
    colors: [
      { name: 'Mango Yellow', hex: '#F0A500' },
      { name: 'Indigo Blue', hex: '#3B3F8C' },
      { name: 'Terracotta', hex: '#C1693A' },
      { name: 'Off White', hex: '#F5F0E8' },
      { name: 'Sage Green', hex: '#8DA47E' },
    ],
  },
  {
    id: 6,
    name: 'Lotus Linen Office Saree',
    category: 'Sarees',
    fabric: 'Linen',
    occasion: 'Office',
    image: '/saree5.png',
    price: 3890,
    oldPrice: 4590,
    badge: 'Sale',
    rating: 4.5,
    reviews: 11,
    featuredRank: 6,
    colors: [
      { name: 'Slate Blue', hex: '#6C8EBF' },
      { name: 'Taupe Gray', hex: '#9E9085' },
      { name: 'Soft Cream', hex: '#EDE7D9' },
      { name: 'Muted Teal', hex: '#4E8A7A' },
    ],
  },
  {
    id: 7,
    name: 'Festive Half Saree Set',
    category: 'Party Wear',
    fabric: 'Silk',
    occasion: 'Festive',
    image: 'https://images.unsplash.com/photo-1583391733958-6c5905d76161?auto=format&fit=crop&q=80&w=900',
    price: 7450,
    oldPrice: 9200,
    badge: 'Bestseller',
    rating: 4.7,
    reviews: 24,
    featuredRank: 7,
    colors: [
      { name: 'Festive Red', hex: '#B03A2E' },
      { name: 'Emerald', hex: '#1E8449' },
      { name: 'Violet', hex: '#7D3C98' },
      { name: 'Gold Ochre', hex: '#C9A227' },
      { name: 'Peacock Blue', hex: '#1A5276' },
    ],
  },
  {
    id: 8,
    name: 'Maroon Ethnic Gown',
    category: 'Party Wear',
    fabric: 'Silk',
    occasion: 'Bridal',
    image: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=900',
    price: 5290,
    badge: 'New',
    rating: 4.6,
    reviews: 16,
    isNewest: true,
    featuredRank: 8,
    colors: [
      { name: 'Deep Maroon', hex: '#6B1A2A' },
      { name: 'Midnight Black', hex: '#1A1A2E' },
      { name: 'Wine Red', hex: '#8B0000' },
      { name: 'Royal Plum', hex: '#5B2C6F' },
    ],
  },
  {
    id: 9,
    name: 'Handloom Cotton Kurti',
    category: 'Daily Wear',
    fabric: 'Cotton',
    occasion: 'Daily',
    image: 'https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?auto=format&fit=crop&q=80&w=900',
    price: 1690,
    oldPrice: 2190,
    badge: 'Sale',
    rating: 4.4,
    reviews: 18,
    featuredRank: 9,
    colors: [
      { name: 'Sky Blue', hex: '#5DADE2' },
      { name: 'Coral Pink', hex: '#E8927C' },
      { name: 'Mint Green', hex: '#76C893' },
      { name: 'Lavender', hex: '#A78BCA' },
      { name: 'Warm White', hex: '#FAF3E8' },
    ],
  },
  {
    id: 10,
    name: 'Linen Co-ord Set',
    category: 'Daily Wear',
    fabric: 'Linen',
    occasion: 'Office',
    image: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80&w=900',
    price: 2890,
    badge: 'New',
    rating: 4.5,
    reviews: 9,
    isNewest: true,
    featuredRank: 10,
    colors: [
      { name: 'Stone Gray', hex: '#8D9099' },
      { name: 'Camel Brown', hex: '#C19A6B' },
      { name: 'Dusty Pink', hex: '#D4A5A5' },
      { name: 'Sage Green', hex: '#B2C9AD' },
    ],
  },
  {
    id: 11,
    name: 'Zari Tassel Potli Bag',
    category: 'Accessories',
    fabric: 'Silk',
    occasion: 'Festive',
    image: 'https://images.unsplash.com/photo-1620242273111-c918ffce8231?auto=format&fit=crop&q=80&w=900',
    price: 890,
    oldPrice: 1290,
    badge: 'Sale',
    rating: 4.3,
    reviews: 12,
    featuredRank: 11,
    colors: [
      { name: 'Antique Gold', hex: '#C9A84C' },
      { name: 'Ruby Red', hex: '#9B1B30' },
      { name: 'Emerald Green', hex: '#1B6B45' },
      { name: 'Royal Blue', hex: '#1F3A8F' },
    ],
  },
  {
    id: 12,
    name: 'Organic Cotton Stole',
    category: 'Accessories',
    fabric: 'Cotton',
    occasion: 'Daily',
    image: '/saree6.png',
    price: 1190,
    badge: 'Bestseller',
    rating: 4.6,
    reviews: 21,
    featuredRank: 12,
    colors: [
      { name: 'Indigo', hex: '#4B0082' },
      { name: 'Terracotta', hex: '#C1693A' },
      { name: 'Forest Green', hex: '#228B22' },
      { name: 'Blush Pink', hex: '#FFB6C1' },
      { name: 'Charcoal', hex: '#36454F' },
    ],
  },
  {
    id: 13,
    name: 'Kanchi Pure Silk Zari Saree',
    category: 'Sarees',
    fabric: 'Silk',
    occasion: 'Festive',
    subCategory: 'Kanchi',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900',
    price: 14500,
    oldPrice: 18000,
    badge: 'Bestseller',
    rating: 4.9,
    reviews: 56,
    isNewest: true,
    featuredRank: 13,
    colors: [
      { name: 'Temple Red', hex: '#A93226' },
      { name: 'Parrot Green', hex: '#28B463' },
      { name: 'Sapphire Blue', hex: '#154360' },
      { name: 'Golden Yellow', hex: '#D4AC0D' },
      { name: 'Deep Purple', hex: '#512E5F' },
    ],
  },
  {
    id: 14,
    name: 'Kanchi Cotton Temple Border Saree',
    category: 'Sarees',
    fabric: 'Cotton',
    occasion: 'Daily',
    subCategory: 'Kanchi',
    image: 'https://images.unsplash.com/photo-1583391733958-6c5905d76161?auto=format&fit=crop&q=80&w=900',
    price: 2200,
    oldPrice: 2800,
    badge: 'Sale',
    rating: 4.7,
    reviews: 33,
    isNewest: true,
    featuredRank: 14,
    colors: [
      { name: 'Saffron', hex: '#F4A300' },
      { name: 'Indigo Blue', hex: '#3B3F8C' },
      { name: 'Off White', hex: '#FAF0DC' },
      { name: 'Rust Red', hex: '#B7410E' },
    ],
  },
  {
    id: 15,
    name: 'Kanchi Korvai Bridal Silk Saree',
    category: 'Sarees',
    fabric: 'Silk',
    occasion: 'Bridal',
    subCategory: 'Kanchi',
    image: '/saree1.png',
    price: 22000,
    oldPrice: 27000,
    badge: 'New',
    rating: 5.0,
    reviews: 18,
    isNewest: true,
    featuredRank: 15,
    colors: [
      { name: 'Bridal Red', hex: '#922B21' },
      { name: 'Deep Maroon', hex: '#641E16' },
      { name: 'Midnight Blue', hex: '#1C2980' },
      { name: 'Forest Green', hex: '#145A32' },
    ],
  },
  {
    id: 16,
    name: 'Kanchi Tissue Silk Saree',
    category: 'Sarees',
    fabric: 'Silk',
    occasion: 'Festive',
    subCategory: 'Kanchi',
    image: '/saree2.png',
    price: 8900,
    badge: 'Bestseller',
    rating: 4.8,
    reviews: 41,
    featuredRank: 16,
    colors: [
      { name: 'Rose Gold', hex: '#B76E79' },
      { name: 'Silver Mist', hex: '#BDC3C7' },
      { name: 'Champagne', hex: '#C9A84C' },
      { name: 'Ivory', hex: '#FFFFF0' },
      { name: 'Blush Mauve', hex: '#C39EA0' },
    ],
  },
  {
    id: 17,
    name: 'Kanchi x Cotton Silk Blend Saree',
    category: 'Sarees',
    fabric: 'Cotton',
    occasion: 'Office',
    subCategory: 'Kanchi',
    image: '/saree3.png',
    price: 3800,
    oldPrice: 4500,
    badge: 'Sale',
    rating: 4.6,
    reviews: 22,
    featuredRank: 17,
    colors: [
      { name: 'Stone Blue', hex: '#6C8EBF' },
      { name: 'Warm Taupe', hex: '#9E9085' },
      { name: 'Olive Green', hex: '#708238' },
      { name: 'Pale Coral', hex: '#E8927C' },
    ],
  },
  {
    id: 18,
    name: 'Kanchi Soft Silk Checks Saree',
    category: 'Sarees',
    fabric: 'Silk',
    occasion: 'Daily',
    subCategory: 'Kanchi',
    image: '/saree4.png',
    price: 5500,
    badge: 'New',
    rating: 4.7,
    reviews: 14,
    isNewest: true,
    featuredRank: 18,
    colors: [
      { name: 'Peacock Green', hex: '#0E6655' },
      { name: 'Kum Kum Red', hex: '#C0392B' },
      { name: 'Turmeric', hex: '#D4AC0D' },
      { name: 'Midnight Blue', hex: '#1A3A8F' },
      { name: 'Plum', hex: '#6C3483' },
    ],
  },
]


function inPriceRange(product: Product, range: PriceRange) {
  if (range === 'Under Rs. 2,000') return product.price < 2000
  if (range === 'Rs. 2,000-5,000') return product.price >= 2000 && product.price <= 5000
  if (range === 'Rs. 5,000+') return product.price > 5000
  return true
}

type ShopPageProps = {
  title?: string
  eyebrow?: string
  description?: string
  initialCategory?: Category
  initialFabric?: Fabric
  initialQuery?: string
  saleOnly?: boolean
  backgroundImage?: string
}

export default function ShopPage({
  title = 'Shop SOIL GODDESS',
  eyebrow = 'Curated Collection',
  description = defaultDescription,
  initialCategory = 'All',
  initialFabric = 'All',
  initialQuery = '',
  saleOnly = false,
  backgroundImage,
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

  useEffect(() => {
    setQuery(initialQuery)
    setCategory(initialCategory)
    setFabric(initialFabric)
    setOccasion('All')
    setPriceRange('All')
    setSortMode('Featured')
  }, [initialCategory, initialFabric, initialQuery])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const nextProducts = products.filter(product => {
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
          // Check subCategory first for precise filter matching (e.g. Kanchi, Chettinad)
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
  }, [category, fabric, occasion, priceRange, query, saleOnly, sortMode])

  const hasActiveFilters =
    query || category !== initialCategory || fabric !== initialFabric || occasion !== 'All' || priceRange !== 'All'

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
        <h2 className="text-xl font-semibold text-[#6B1A2A]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Filters
        </h2>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B1A2A] underline-offset-4 hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      <FilterGroup title="Category" options={categories} value={category} onChange={value => setCategory(value as Category)} />
      <FilterGroup title="Fabric" options={fabrics} value={fabric} onChange={value => setFabric(value as Fabric)} />
      <FilterGroup title="Price" options={priceRanges} value={priceRange} onChange={value => setPriceRange(value as PriceRange)} />
      <FilterGroup title="Occasion" options={occasions} value={occasion} onChange={value => setOccasion(value as Occasion)} />
    </div>
  )

  return (
    <main className="relative bg-[#FAF6EE] text-[#2A1A1E]">
      {/* Dynamic Watermark / Abstract Overlay for Premium Boutique Feeling */}
      {backgroundImage && (
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-repeat opacity-[0.02]"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: '350px',
          }}
        />
      )}

      {/* Header Banner Section */}
      <section className="relative overflow-hidden border-b border-[#E8DCC4] bg-[#4A0F1C] py-14 sm:py-16 md:py-20 lg:py-24">
        {backgroundImage ? (
          <>
            {/* High-end Abstract Visual Background Cover */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            {/* Elegant Gradient To Ensure Premium Styling & Contrast */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#4A0F1C] via-[#4A0F1C]/85 to-[#4A0F1C]/40" />
            {/* Corner traditional flower motif blended subtly */}
            <div className="pointer-events-none absolute inset-0 z-20 bg-[url('/borderdesign/flower-motif.png')] bg-[length:420px] bg-right-top bg-no-repeat opacity-[0.05]" />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[url('/borderdesign/flower-motif.png')] bg-[length:420px] bg-right-top bg-no-repeat opacity-[0.06]" />
        )}

        <div className="relative z-30 mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-[#E8C97E]">{eyebrow}</p>
          <h1
            className="max-w-3xl text-4xl font-semibold leading-tight text-[#FAF6EE] sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#F5EDD6] sm:text-base">{description}</p>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-lg border border-[#E8DCC4] bg-white p-4 shadow-[0_12px_34px_rgba(74,15,28,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#6B1A2A]">Showing {filteredProducts.length} products</p>
              <p className="mt-1 text-xs text-[#7A6065]">Search, filter, and sort the full UI-only catalog.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_190px] lg:w-[620px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B1A2A]" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search sarees, fabric, occasion"
                  className="h-11 w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] pl-10 pr-3 text-sm outline-none transition focus:border-[#6B1A2A]"
                />
              </label>

              <select
                value={sortMode}
                onChange={event => setSortMode(event.target.value as SortMode)}
                className="h-11 rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-3 text-sm text-[#2A1A1E] outline-none transition focus:border-[#6B1A2A]"
                aria-label="Sort products"
              >
                {sortModes.map(mode => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {categories.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${
                  category === item
                    ? 'border-[#6B1A2A] bg-[#6B1A2A] text-white'
                    : 'border-[#E8DCC4] bg-[#FAF6EE] text-[#2A1A1E]'
                }`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#C9A84C] bg-[#F5EDD6] px-4 py-2 text-xs font-semibold text-[#6B1A2A]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden rounded-lg border border-[#E8DCC4] bg-white p-4 shadow-[0_12px_34px_rgba(74,15,28,0.05)] lg:block">
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
              <div className="rounded-lg border border-dashed border-[#C9A84C] bg-white p-10 text-center">
                <h2 className="text-3xl font-semibold text-[#6B1A2A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  No products found
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6065]">
                  Try clearing filters or searching for another weave, fabric, or occasion.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-md bg-[#6B1A2A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0F1C]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[130] bg-black/45 lg:hidden" role="dialog" aria-modal="true">
          <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-white">
            <div className="flex items-center justify-between border-b border-[#E8DCC4] p-4">
              <h2 className="text-lg font-semibold text-[#6B1A2A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Filter products
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8DCC4] text-[#6B1A2A]"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
            <div className="border-t border-[#E8DCC4] p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-md bg-[#6B1A2A] py-3 text-sm font-semibold text-white"
              >
                Show {filteredProducts.length} products
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[140] -translate-x-1/2 rounded-md bg-[#2A1A1E] px-5 py-3 text-sm font-medium text-white shadow-xl">
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
              className="h-4 w-4 accent-[#6B1A2A]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
