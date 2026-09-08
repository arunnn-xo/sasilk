'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  CheckCircle2,
  Shield,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Share2,
} from 'lucide-react'
import ProductCard, { type ProductCardProduct } from '@/components/product/ProductCard'
import ReviewSection from '@/components/product/ReviewSection'
import SizeGuideModal from '@/components/product/SizeGuideModal'
import { useCart, itemKey } from '@/components/cart/CartContext'
import { useAuth } from '@/components/auth/AuthContext'
import { useWishlist } from '@/components/wishlist/WishlistContext'
import type { StorefrontProduct } from '@/lib/api/types'
import { resolveImageUrl } from '@/lib/api/utils'
import { getDiscount, mapToProductCardProduct } from '@/lib/api/mappers'
import { apiFetch } from '@/lib/api/client'

const FREE_SIZE_LABELS = new Set(['free size', 'freesize', 'one size', 'onesize'])

function isFreeSizeLabel(size: string) {
  return FREE_SIZE_LABELS.has(size.trim().toLowerCase())
}

type SingleProductPageProps = {
  product: StorefrontProduct
}

export default function SingleProductPage({ product }: SingleProductPageProps) {
  const cart = useCart()
  const router = useRouter()
  const { session } = useAuth()
  const { toggleWishlist, isWished } = useWishlist()

  const variants = product.variants || []
  const hasVariants = variants.length > 0
  
  const defaultVariant = useMemo(() => {
    return variants.find(v => v.isDefault) || variants[0] || null
  }, [variants])

  const [selectedColor, setSelectedColor] = useState(defaultVariant?.colorName || product.color || '')
  const [selectedSize, setSelectedSize] = useState(defaultVariant?.size || '')
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const audience = product.gender || 'women'
  const [qty, setQty] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ProductCardProduct[]>([])
  const [showNotifyForm, setShowNotifyForm] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyPhone, setNotifyPhone] = useState('')
  const [notifySubmitted, setNotifySubmitted] = useState(false)
  const [notifyMessage, setNotifyMessage] = useState('')

  // Mobile Carousel State
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0)
  const mobileScrollRef = useRef<HTMLDivElement>(null)

  const handleMobileScroll = () => {
    if (!mobileScrollRef.current) return
    const { scrollLeft, clientWidth } = mobileScrollRef.current
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth)
      setMobileActiveIdx(idx)
    }
  }

  const scrollMobileTo = (idx: number) => {
    if (!mobileScrollRef.current) return
    const clientWidth = mobileScrollRef.current.clientWidth
    mobileScrollRef.current.scrollTo({
      left: idx * clientWidth,
      behavior: 'smooth',
    })
    setMobileActiveIdx(idx)
  }

  useEffect(() => {
    if (!product.categoryId) return
    apiFetch<{ products: any[] }>(`/storefront/products/${product.id}/related`)
      .then(data => setRelatedProducts(data.products.map(mapToProductCardProduct)))
      .catch(() => {})
  }, [product.id, product.categoryId])

  // Determine current active variant based on selection
  const currentVariant = useMemo(() => {
    if (!hasVariants) return null
    let match = variants.find(v =>
      (v.colorName || '') === (selectedColor || '') &&
      (v.size || '') === (selectedSize || '')
    )
    if (!match) {
      match = variants.find(v => (v.colorName || '') === (selectedColor || ''))
    }
    return match || variants[0]
  }, [variants, hasVariants, selectedColor, selectedSize])

  // Check if the currently selected variant is already in cart
  const inCart = useMemo(() => {
    return cart.isInCart(
      product.id,
      currentVariant?.id,
      selectedColor || undefined,
      selectedSize || undefined,
    )
  }, [cart.isInCart, product.id, currentVariant?.id, selectedColor, selectedSize])

  // Variant specifics
  const price = currentVariant ? (currentVariant.price ?? 0) : (product.price ?? 0)
  const originalPrice = currentVariant ? (currentVariant.originalPrice ?? null) : (product.originalPrice ?? null)
  const sku = currentVariant ? currentVariant.sku : product.code

  const totalStock = (currentVariant ? currentVariant.stockQty : (product.stockQty ?? 0)) ?? 0

  // Cart item for this exact variant/color/size combination
  const cartItem = useMemo(() => {
    return cart.items.find(item => 
      item.id === product.id && 
      item.variantId === currentVariant?.id &&
      item.color === (selectedColor || undefined) &&
      item.size === (selectedSize || undefined)
    )
  }, [cart.items, product.id, currentVariant?.id, selectedColor, selectedSize])

  const cartQty = cartItem ? cartItem.qty : 0
  // Remaining purchasable stock = DB stock minus what's already in cart
  const stockQty = Math.max(0, totalStock - cartQty)
  // Out of stock when remaining available stock (after cart) is 0
  const isOutOfStock = stockQty <= 0

  // Sync quantity state with cart quantity if item is already in cart, otherwise default to 1
  useEffect(() => {
    if (inCart && cartQty > 0) {
      setQty(cartQty)
    } else {
      setQty(1)
    }
  }, [inCart, cartQty, selectedColor, selectedSize])

  // Constrain quantity state by total available stock
  useEffect(() => {
    if (qty > totalStock && totalStock > 0) {
      setQty(totalStock)
    }
  }, [totalStock, qty])

  // Images to display in gallery (combine variant image with full product gallery)
  const displayImages = useMemo(() => {
    const list: string[] = []
    
    // 1. Current variant image first
    if (currentVariant?.imageUrl) {
      list.push(currentVariant.imageUrl)
    }
    if (currentVariant?.images && currentVariant.images.length > 0) {
      list.push(...currentVariant.images.map(img => img.imageUrl))
    }
    
    // 2. Product gallery images
    if (product.images && product.images.length > 0) {
      list.push(...product.images.map(img => img.imageUrl))
    }
    
    // 3. Main product image fallbacks
    if (product.imageUrl) list.push(product.imageUrl)
    if (product.image) list.push(product.image)
    
    // Deduplicate and filter valid strings
    const uniqueList: string[] = []
    const seen = new Set<string>()
    for (const url of list) {
      if (url && typeof url === 'string' && !seen.has(url)) {
        seen.add(url)
        uniqueList.push(url)
      }
    }
    
    return uniqueList.length > 0 ? uniqueList : ['/saree1.png']
  }, [currentVariant, product])

  const [mainImage, setMainImage] = useState(displayImages[0] || '')

  useEffect(() => {
    if (displayImages.length > 0) {
      setMainImage(displayImages[0])
      setMobileActiveIdx(0)
      if (mobileScrollRef.current) {
        mobileScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      }
    }
  }, [displayImages])

  // Colors
  const colorOptions = useMemo(() => {
    const map = new Map<string, { colorName: string, colorHex?: string, imageUrl?: string }>()
    variants.forEach(v => {
      if (v.colorName && !map.has(v.colorName)) {
        map.set(v.colorName, {
          colorName: v.colorName,
          colorHex: v.colorHex,
          imageUrl: v.imageUrl || v.images?.[0]?.imageUrl || product.image
        })
      }
    })
    return Array.from(map.values())
  }, [variants, product.image])

  const hasColorOptions = colorOptions.length > 0

  // Reset size when switching to a color that doesn't have the current size
  useEffect(() => {
    if (!hasColorOptions || !selectedColor) return
    const availableSizes = new Set(
      variants
        .filter(v => v.colorName === selectedColor && v.size)
        .map(v => v.size as string)
    )
    if (selectedSize && !availableSizes.has(selectedSize)) {
      setSelectedSize('')
    }
  }, [selectedColor, variants, hasColorOptions, selectedSize])

  // Sizes for the current color (or all sizes if no color variants exist)
  const sizeOptions = useMemo(() => {
    if (hasColorOptions && !selectedColor) return []
    const sizes = variants
      .filter(v => {
        if (hasColorOptions) return v.colorName === selectedColor && v.size
        return v.size
      })
      .map(v => v.size as string)
    return Array.from(new Set(sizes))
  }, [variants, selectedColor, hasColorOptions])

  const visibleSizeOptions = useMemo(() => sizeOptions.filter(size => !isFreeSizeLabel(size)), [sizeOptions])
  const showSizeSelector = visibleSizeOptions.length > 0 && variants.some(v => v.size)

  useEffect(() => {
    if (sizeOptions.length === 0) {
      if (selectedSize) setSelectedSize('')
      return
    }
    if (!selectedSize || !sizeOptions.includes(selectedSize)) {
      setSelectedSize(sizeOptions[0])
    }
  }, [sizeOptions, selectedSize])

  const accordions = useMemo(() => [
    product.description ? { id: 'desc' as const, title: 'Description & Highlights', content: product.description } : null,
    product.metadata?.washCare ? { id: 'wash' as const, title: 'Fabric & Wash Care', content: product.metadata.washCare } : null,
    { id: 'shipping' as const, title: 'Shipping & Easy Returns', content: '• All orders dispatched within 24–48 hours from Tamil Nadu handloom boutique centers.\n• Standard express delivery takes 3–5 business days across India.\n• Easy 7-day hassle-free exchange & return policy for unused sarees with original tags attached.\n• 100% insured delivery with live tracking notifications.' },
  ].filter(Boolean) as Array<{ id: string; title: string; content: string }>, [product])

  function updateQtyAmount(change: number) {
    setQty(current => Math.max(1, Math.min(totalStock, current + change)))
  }

  async function handleBuyNow() {
    if (isOutOfStock) return

    sessionStorage.setItem('buyNowItem', JSON.stringify({
      id: product.id,
      name: product.name,
      slug: product.slug || product.code,
      price,
      originalPrice,
      image: mainImage,
      color: selectedColor,
      size: selectedSize,
      variantId: currentVariant?.id,
      variantLabel: currentVariant?.label,
      qty,
      stock: totalStock,
    }))
    router.push('/checkout?buyNow=1')
  }

  function handleAddToCart() {
    if (inCart) {
      // Already in cart — update to user-selected qty and open cart drawer
      const key = itemKey(product.id, currentVariant?.id, selectedColor || undefined, selectedSize || undefined)
      cart.updateQty(key, qty)
      cart.setDrawerOpen(true)
      return
    }
    cart.addItem({
      id: product.id,
      name: product.name,
      slug: product.slug || product.code,
      price,
      originalPrice,
      image: mainImage,
      color: selectedColor,
      size: selectedSize,
      variantId: currentVariant?.id,
      variantLabel: currentVariant?.label,
      qty,
      stock: totalStock,
    })
    cart.setDrawerOpen(true)
  }

  async function handleNotify() {
    if (!notifyEmail.trim()) return
    try {
      await apiFetch('/storefront/stock-notify', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          variantId: currentVariant?.id,
          email: notifyEmail.trim(),
          phone: notifyPhone.trim() || undefined,
          customerName: session?.name || undefined,
        }),
      })
      setNotifySubmitted(true)
      setNotifyMessage('')
    } catch (err: any) {
      setNotifyMessage(err?.message || 'Something went wrong. Try again.')
    }
  }

  function handleRelatedAddToCart(relatedProduct: ProductCardProduct) {
    const relatedSlug = relatedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    cart.addItem({
      id: relatedProduct.id || relatedSlug,
      name: relatedProduct.name,
      slug: relatedSlug,
      price: relatedProduct.price,
      originalPrice: relatedProduct.oldPrice,
      image: relatedProduct.image,
      variantId: relatedProduct.variantId,
      variantLabel: relatedProduct.variantLabel,
      color: relatedProduct.color,
      size: relatedProduct.size,
      stock: relatedProduct.stock,
    })
    cart.setDrawerOpen(true)
  }

  return (
    <main className="product-page min-h-screen bg-[#FDFBF7] font-product text-[#333333] antialiased pb-44 lg:pb-16">
      
      {/* Mobile Sticky Bottom Action Bar (Sits comfortably above persistent bottom nav) */}
      {!isOutOfStock && (
        <div className="mobile-product-sticky-bar bg-white/95 backdrop-blur-xl border-t border-[#E8DCC4] px-4 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            {/* Price Preview */}
            <div className="shrink-0 flex flex-col">
              <span className="text-[17px] font-bold text-[#6B1A2A] leading-tight">
                {'\u20B9'}{price.toLocaleString('en-IN')}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-[11px] text-gray-400 line-through">
                  {'\u20B9'}{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 rounded-md border border-[#6B1A2A] bg-white py-2.5 text-xs font-bold tracking-wider text-[#6B1A2A] transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {inCart ? 'IN CART' : 'ADD TO CART'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 rounded-md bg-[#6B1A2A] py-2.5 text-xs font-bold tracking-wider text-[#FAF6EE] transition-all active:scale-[0.98] shadow-md shadow-[#6B1A2A]/25 flex items-center justify-center"
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-[1440px] px-0 sm:px-4 lg:px-8 xl:px-12 pt-0 lg:pt-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="hidden lg:flex items-center gap-2 text-xs text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#6B1A2A] transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <Link href="/shop" className="hover:text-[#6B1A2A] transition-colors">Shop</Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-[#6B1A2A] font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:gap-10 xl:gap-16 relative">
          
          {/* LEFT: Image Gallery Section */}
          <section className="w-full lg:w-[54%] xl:w-[56%]">
            
            {/* Mobile: Sleek Touch Carousel with Indicator Dots */}
            <div className="relative w-full lg:hidden bg-[#FAF6EE]">
              {/* Main Image Slider */}
              <div 
                ref={mobileScrollRef}
                onScroll={handleMobileScroll}
                className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-[4/5] max-h-[460px] sm:max-h-[520px]"
              >
                {displayImages.map((image, index) => (
                  <div key={image + index} className="relative w-full h-full shrink-0 snap-center bg-[#FAF6EE]">
                    <img
                      src={resolveImageUrl(image)}
                      alt={`${product.name} angle ${index + 1}`}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                ))}
              </div>

              {/* Top Badges */}
              <div className="absolute left-3.5 top-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
                {isOutOfStock ? (
                  <span className="rounded bg-gray-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">Sold Out</span>
                ) : originalPrice && originalPrice > price ? (
                  <span className="rounded bg-[#6B1A2A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FAF6EE] shadow-md">{getDiscount(price, originalPrice)}% OFF</span>
                ) : product.isNew ? (
                  <span className="rounded bg-[#6B1A2A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FAF6EE] shadow-md">New Arrival</span>
                ) : null}
              </div>

              {/* Top Right Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id, product.name, currentVariant?.id ?? null, selectedColor || undefined, selectedSize || undefined)}
                className={`absolute right-3.5 top-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-transform active:scale-90 ${
                  isWished(product.id, currentVariant?.id ?? null)
                    ? 'bg-[#6B1A2A] text-white'
                    : 'bg-white/90 text-[#6B1A2A]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`h-4 w-4 transition ${isWished(product.id, currentVariant?.id ?? null) ? 'fill-white' : ''}`} />
              </button>

              {/* Bottom Image Counter Pill (e.g. 1/4) */}
              {displayImages.length > 1 && (
                <div className="absolute right-3.5 bottom-3.5 z-10 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white tracking-widest pointer-events-none">
                  {mobileActiveIdx + 1} / {displayImages.length}
                </div>
              )}

              {/* Bottom Slide Indicator Dots */}
              {displayImages.length > 1 && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-3.5 z-10 flex items-center gap-1.5 pointer-events-none">
                  {displayImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === mobileActiveIdx ? 'w-5 bg-[#6B1A2A]' : 'w-1.5 bg-white/70 shadow-sm'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: Mini Thumbnail Rail below Image Slider */}
            {displayImages.length > 1 && (
              <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-[#F7F3E9] border-b border-[#E8DCC4] scrollbar-hide">
                {displayImages.map((image, index) => {
                  const isActive = mobileActiveIdx === index
                  return (
                    <button
                      key={image + index}
                      type="button"
                      onClick={() => scrollMobileTo(index)}
                      className={`relative shrink-0 w-12 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                        isActive
                          ? 'border-[#6B1A2A] ring-1 ring-[#6B1A2A] scale-105 shadow-sm'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={resolveImageUrl(image)}
                        alt={`Angle ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Desktop: Luxury Portrait Viewport + Left Vertical Thumbnail Strip */}
            <div className="hidden lg:flex gap-4 xl:gap-6 items-start">
              {/* Vertical Thumbnails List */}
              {displayImages.length > 1 && (
                <div className="flex flex-col gap-3 shrink-0 w-20 xl:w-24 max-h-[680px] overflow-y-auto scrollbar-hide py-1">
                  {displayImages.map((image, index) => {
                    const isActive = (mainImage || displayImages[0]) === image
                    return (
                      <button
                        key={image + index}
                        type="button"
                        onClick={() => setMainImage(image)}
                        onMouseEnter={() => setMainImage(image)}
                        className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 transition-all duration-200 bg-gray-50 group cursor-pointer ${
                          isActive 
                            ? 'border-[#6B1A2A] shadow-md ring-2 ring-[#6B1A2A]/25 scale-[1.03]' 
                            : 'border-[#EFE8DA] hover:border-[#D9B86E] opacity-75 hover:opacity-100'
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img
                          src={resolveImageUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Main Portrait Viewport (3:4 ratio for full vertical saree display) */}
              <div className="flex-1 relative aspect-[3/4] max-h-[740px] rounded-2xl overflow-hidden border border-[#EFE8DA] bg-[#FAF6EE] shadow-[0_8px_30px_rgba(107,26,42,0.06)] group">
                <img
                  src={resolveImageUrl(mainImage || displayImages[0])}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                />

                {/* Badges */}
                <div className="absolute left-6 top-6 flex flex-col gap-2 z-10 pointer-events-none">
                  {isOutOfStock ? (
                    <span className="rounded-md bg-gray-800 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">Sold Out</span>
                  ) : originalPrice && originalPrice > price ? (
                    <span className="rounded-md bg-[#6B1A2A] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FAF6EE] shadow-md">{getDiscount(price, originalPrice)}% OFF</span>
                  ) : product.isNew ? (
                    <span className="rounded-md bg-[#6B1A2A] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FAF6EE] shadow-md">New Arrival</span>
                  ) : null}
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id, product.name, currentVariant?.id ?? null, selectedColor || undefined, selectedSize || undefined)}
                  className={`absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 ${
                    isWished(product.id, currentVariant?.id ?? null)
                      ? 'bg-[#6B1A2A] text-white'
                      : 'bg-white/85 text-[#6B1A2A] hover:bg-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 transition ${isWished(product.id, currentVariant?.id ?? null) ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT: Product Information & Purchase Area */}
          <section className="w-full lg:w-[46%] xl:w-[44%] px-4 sm:px-6 py-5 lg:px-0 lg:py-0">
            <div className="lg:sticky lg:top-28 flex flex-col">
              
              {/* Category Tag & SKU */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#BF9A4B]">
                  {product.category || 'Pure Silk Saree'}
                </span>
                {sku && (
                  <span className="text-[11px] font-medium text-gray-400 tracking-wider">
                    • SKU: {sku}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-playfair text-2xl sm:text-3xl lg:text-[36px] font-semibold text-[#1A1A1A] leading-snug mb-3 tracking-wide">
                {product.name}
              </h1>
              
              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6B1A2A]">
                  {'\u20B9'}{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-base sm:text-lg text-gray-400 line-through font-light">
                    {'\u20B9'}{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
                {originalPrice && originalPrice > price && (
                  <span className="rounded bg-[#6B1A2A]/10 text-[#6B1A2A] px-2 py-0.5 text-xs font-bold">
                    {getDiscount(price, originalPrice)}% OFF
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 font-normal tracking-wide mb-5">
                {product.gstRate != null && product.gstRate > 0 
                  ? `Inclusive of all taxes (${product.gstRate}% GST). Free delivery across India.` 
                  : 'Inclusive of all taxes. Free express shipping nationwide.'}
              </p>

              {/* Selectors Area */}
              <div className="mb-6 flex flex-col gap-5 border-t border-gray-100 pt-4">
                
                {/* Color Selector */}
                {colorOptions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-xs sm:text-sm font-semibold tracking-wider text-gray-900 uppercase">
                        Color: <span className="text-[#6B1A2A] font-bold capitalize ml-1">{selectedColor}</span>
                      </p>
                      <span className="text-[11px] text-gray-400">{colorOptions.length} available</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {colorOptions.map(variant => {
                        const isSelected = selectedColor === variant.colorName
                        return (
                          <button
                            key={variant.colorName}
                            type="button"
                            onClick={() => setSelectedColor(variant.colorName)}
                            className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                              isSelected 
                                ? 'border-[#6B1A2A] bg-[#6B1A2A]/5 ring-1 ring-[#6B1A2A] shadow-sm' 
                                : 'border-gray-200 bg-white hover:border-gray-400'
                            }`}
                            aria-label={`Select ${variant.colorName}`}
                          >
                            <div className="relative h-8 w-7 rounded overflow-hidden shrink-0 border border-gray-100">
                              {variant.imageUrl ? (
                                <img src={resolveImageUrl(variant.imageUrl)} alt="" className="h-full w-full object-cover object-top" />
                              ) : (
                                <div className="h-full w-full" style={{ backgroundColor: variant.colorHex || '#6B1A2A' }} />
                              )}
                            </div>
                            <span className={`text-xs font-medium ${isSelected ? 'text-[#6B1A2A] font-bold' : 'text-gray-700'}`}>
                              {variant.colorName}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#6B1A2A] ml-0.5 shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {showSizeSelector && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-xs sm:text-sm font-semibold tracking-wider text-gray-900 uppercase">Size</p>
                      <button type="button" onClick={() => setShowSizeGuide(true)} className="text-xs font-medium text-gray-500 underline underline-offset-4 hover:text-[#6B1A2A] transition-colors">
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {visibleSizeOptions.map(size => {
                        const isSelected = selectedSize === size
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`flex h-10 min-w-[3.25rem] px-3.5 items-center justify-center rounded-md border text-xs font-bold transition-all duration-200 ${
                              isSelected 
                                ? 'border-[#6B1A2A] bg-[#6B1A2A] text-white shadow-sm' 
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & Primary Action Buttons (Desktop & Tablet) */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  {/* Quantity Stepper */}
                  <div className="flex h-12 w-28 shrink-0 items-center overflow-hidden rounded-md border border-gray-300 bg-white transition-colors focus-within:border-[#6B1A2A]">
                    <button 
                      type="button" 
                      className="flex h-full w-8 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30" 
                      onClick={() => updateQtyAmount(-1)} 
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input 
                      value={qty} 
                      readOnly 
                      className="h-full w-full border-none bg-transparent text-center text-sm font-bold outline-none text-gray-800" 
                      aria-label="Quantity" 
                    />
                    <button 
                      type="button" 
                      className="flex h-full w-8 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30" 
                      onClick={() => updateQtyAmount(1)} 
                      disabled={qty >= totalStock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Buy Now Button */}
                  <button
                    type="button"
                    className={`flex-1 rounded-md py-3.5 text-xs sm:text-sm font-bold tracking-widest text-white transition-all duration-200 shadow-md ${
                      isOutOfStock 
                        ? 'bg-gray-400 hover:bg-gray-500 shadow-none cursor-not-allowed' 
                        : 'bg-[#6B1A2A] hover:bg-[#521220] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                    onClick={() => { if (isOutOfStock) { setShowNotifyForm(true); if (session?.email) setNotifyEmail(session.email) } else { handleBuyNow() } }}
                  >
                    {isOutOfStock ? 'NOTIFY ME' : 'BUY NOW'}
                  </button>
                </div>
                
                {/* Desktop Add to Cart */}
                {!isOutOfStock && (
                  <button
                    type="button"
                    id={inCart ? 'add-more-btn' : 'add-to-cart-btn'}
                    className="w-full items-center justify-center gap-2 rounded-md border border-[#6B1A2A] bg-white py-3.5 text-xs sm:text-sm font-bold tracking-widest text-[#6B1A2A] transition-all duration-200 hover:bg-[#6B1A2A] hover:text-white shadow-sm flex"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {inCart ? 'ADD MORE TO CART' : 'ADD TO CART'}
                  </button>
                )}

                {/* Stock urgency badge */}
                {!isOutOfStock && stockQty > 0 && stockQty <= 5 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#A34336] font-semibold animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A34336] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A34336]"></span>
                    </span>
                    Only {stockQty} sarees left in stock — order soon!
                  </div>
                )}
              </div>

              {/* Notify Form if Out of Stock */}
              {showNotifyForm && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                  {notifySubmitted ? (
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="text-xs sm:text-sm font-medium">We will notify you immediately once restocked.</p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-3 text-xs font-bold tracking-wider text-gray-800 uppercase">Notify me when available</p>
                      <div className="flex flex-col gap-2.5">
                        <input
                          type="email"
                          value={notifyEmail}
                          onChange={e => { if (!session) setNotifyEmail(e.target.value) }}
                          placeholder="Email address"
                          readOnly={!!session}
                          className={`w-full rounded-md border px-3.5 py-2.5 text-xs outline-none transition-colors focus:border-[#6B1A2A] ${session ? 'bg-gray-50 text-gray-500' : 'border-gray-300 bg-white'}`}
                        />
                        <input
                          type="tel"
                          value={notifyPhone}
                          onChange={e => setNotifyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Phone number (optional)"
                          className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-xs outline-none transition-colors focus:border-[#6B1A2A]"
                        />
                        <button
                          type="button"
                          onClick={handleNotify}
                          disabled={!notifyEmail.trim()}
                          className="w-full rounded-md bg-gray-900 py-3 text-xs font-bold tracking-widest text-white transition-colors hover:bg-black disabled:opacity-50"
                        >
                          NOTIFY ME
                        </button>
                      </div>
                      {notifyMessage && <p className="mt-2 text-xs font-medium text-red-600">{notifyMessage}</p>}
                    </>
                  )}
                </div>
              )}

              {/* Luxury Boutique Trust Badges (2x2 Grid) */}
              <div className="mb-6 rounded-xl border border-[#E8DCC4] bg-[#FAF6EE]/90 p-3.5 sm:p-4 grid grid-cols-2 gap-3 shadow-[0_2px_10px_rgba(107,26,42,0.03)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B1A2A]/10 text-[#6B1A2A]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A] leading-tight">100% Pure Silk</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Silk Mark Certified</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B1A2A]/10 text-[#6B1A2A]">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A] leading-tight">Free Shipping</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Pan-India Delivery</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B1A2A]/10 text-[#6B1A2A]">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A] leading-tight">7-Day Return</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Hassle-free policy</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B1A2A]/10 text-[#6B1A2A]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A] leading-tight">Handcrafted</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Master Weaver Art</p>
                  </div>
                </div>
              </div>

              {/* Collapsible Accordions */}
              <div className="border-t border-gray-200">
                {accordions.map(item => {
                  const isOpen = openAccordion === item.id
                  return (
                    <div key={item.id} className="border-b border-gray-200">
                      <button 
                        type="button" 
                        className="flex w-full items-center justify-between py-3.5 text-left group" 
                        onClick={() => setOpenAccordion(isOpen ? null : item.id)}
                      >
                        <span className="text-xs sm:text-[13px] font-bold tracking-wider text-gray-900 uppercase group-hover:text-[#6B1A2A] transition-colors">{item.title}</span>
                        <div className="relative h-3.5 w-3.5 text-gray-400 group-hover:text-[#6B1A2A] transition-colors">
                          <span className={`absolute top-1/2 left-0 h-[1.5px] w-3.5 -translate-y-1/2 bg-current transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                          <span className={`absolute top-0 left-1/2 h-3.5 w-[1.5px] -translate-x-1/2 bg-current transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
                        </div>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100 pb-4' : 'max-h-0 opacity-0 pb-0'}`}>
                        {item.content && (
                          <div className="text-xs sm:text-[13px] font-normal leading-relaxed text-gray-600 whitespace-pre-line">
                            {item.content}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          </section>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-10 lg:mt-20 w-full">
          <ReviewSection productId={product.id} slug={product.slug || String(product.id)} />
        </div>

        {/* You May Also Like / Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-10 lg:mt-20 border-t border-gray-200 pt-8 lg:pt-14">
            <h2 className="font-playfair mb-6 text-center text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wide text-[#1A1A1A]">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id ?? rp.name} product={rp} onAddToCart={() => handleRelatedAddToCart(rp)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {showSizeGuide && (
        <SizeGuideModal audience={audience} onClose={() => setShowSizeGuide(false)} />
      )}
    </main>
  )
}

