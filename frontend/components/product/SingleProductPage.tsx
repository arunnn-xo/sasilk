'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  CheckCircle2,
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

  // Images to display in gallery
  const displayImages = useMemo(() => {
    let list: string[] = []
    if (currentVariant?.imageUrl) {
      list.push(currentVariant.imageUrl)
    }
    if (currentVariant?.images && currentVariant.images.length > 0) {
      list = [...list, ...currentVariant.images.map(img => img.imageUrl)]
    }
    
    list = list.filter((url, index) => list.indexOf(url) === index)
    
    if (list.length === 0 && product.images && product.images.length > 0) {
      list = product.images.map(img => img.imageUrl)
    }
    
    if (list.length === 0 && product.imageUrl) {
      list = [product.imageUrl]
    }
    
    if (list.length === 0 && product.image) {
      list = [product.image]
    }
    
    return list
  }, [currentVariant, product])

  const [mainImage, setMainImage] = useState(displayImages[0] || '')

  useEffect(() => {
    setMainImage(displayImages[0] || '')
  }, [displayImages])

  const activeThumb = useMemo(() => {
    return displayImages.find(image => image === mainImage) ?? displayImages[0]
  }, [mainImage, displayImages])



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
    product.description ? { id: 'desc' as const, title: 'Description', content: product.description } : null,
    { id: 'shipping' as const, title: 'Shipping & Delivery', content: 'All orders are processed within 1\u20133 business days. Delivery takes 3\u20137 business days across India. Tracking details will be provided once dispatched. We accept returns within 7 days of delivery, provided the product is unused and in its original condition. Refunds are processed within 5\u20137 business days. Orders can be cancelled within 24 hours of purchase.' },
    product.metadata?.washCare ? { id: 'wash' as const, title: 'Wash Care & Maintenance', content: product.metadata.washCare } : null,
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
    <main className="product-page min-h-screen bg-[#FDFBF7] font-product text-[#333333] antialiased pb-24 lg:pb-0">
      
      {/* Mobile Sticky Action Bar */}
      {!isOutOfStock && (
        <div className="fixed bottom-0 left-0 z-50 w-full bg-white/85 backdrop-blur-xl border-t border-gray-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] lg:hidden transition-all duration-300">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-sm bg-[#6B1A2A] py-3.5 text-[15px] font-semibold tracking-widest text-white transition-all active:scale-[0.98] shadow-lg shadow-[#6B1A2A]/30"
          >
            {inCart ? 'ADD MORE TO CART' : 'ADD TO CART'}
          </button>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] px-0 lg:px-8 xl:px-12 pt-0 pb-12 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-20 relative">
          
          {/* LEFT: Image Gallery */}
          <section className="w-full lg:w-[55%] xl:w-[60%]">
            
            {/* Mobile: Snap Carousel */}
            <div className="relative w-full overflow-hidden lg:hidden">
              <div className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                {displayImages.length > 0 ? displayImages.map((image, index) => (
                  <div key={image + index} className="relative w-full shrink-0 snap-center aspect-[3/4] bg-gray-100">
                    <img
                      src={resolveImageUrl(image)}
                      alt={`${product.name} image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {/* Badges */}
                    {index === 0 && (
                      <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
                        {isOutOfStock ? (
                          <span className="rounded bg-gray-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">Sold Out</span>
                        ) : originalPrice && originalPrice > price ? (
                          <span className="rounded bg-[#6B1A2A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">{getDiscount(price, originalPrice)}% OFF</span>
                        ) : product.isNew ? (
                          <span className="rounded bg-[#6B1A2A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">New</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="relative w-full shrink-0 snap-center aspect-[3/4] bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 font-medium">No Image Available</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id, product.name, currentVariant?.id ?? null, selectedColor || undefined, selectedSize || undefined)}
                className={`absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-lg backdrop-blur-md transition-transform active:scale-95 ${
                  isWished(product.id, currentVariant?.id ?? null)
                    ? 'bg-[#6B1A2A] text-white'
                    : 'bg-white/80 text-[#6B1A2A]'
                }`}
              >
                <Heart className={`h-5 w-5 transition ${isWished(product.id, currentVariant?.id ?? null) ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Desktop: Masonry/Stacked Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 xl:gap-6">
              {displayImages.length > 0 ? displayImages.map((image, index) => (
                <div 
                  key={image + index} 
                  className={`group relative overflow-hidden rounded-md bg-gray-100 ${
                    index === 0 || (displayImages.length % 2 !== 0 && index === displayImages.length - 1)
                      ? 'col-span-2 aspect-[16/10] xl:aspect-[16/9]' 
                      : 'col-span-1 aspect-[3/4]'
                  }`}
                >
                  <img
                    src={resolveImageUrl(image)}
                    alt={`${product.name} image ${index + 1}`}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                  />
                  {index === 0 && (
                    <>
                      <div className="absolute left-6 top-6 flex flex-col gap-2 z-10">
                        {isOutOfStock ? (
                          <span className="rounded-sm bg-gray-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">Sold Out</span>
                        ) : originalPrice && originalPrice > price ? (
                          <span className="rounded-sm bg-[#6B1A2A] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">{getDiscount(price, originalPrice)}% OFF</span>
                        ) : product.isNew ? (
                          <span className="rounded-sm bg-[#6B1A2A] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">New Arrival</span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id, product.name, currentVariant?.id ?? null, selectedColor || undefined, selectedSize || undefined)}
                        className={`absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 ${
                          isWished(product.id, currentVariant?.id ?? null)
                            ? 'bg-[#6B1A2A] text-white'
                            : 'bg-white/80 text-[#6B1A2A] hover:bg-white'
                        }`}
                      >
                        <Heart className={`h-5 w-5 transition ${isWished(product.id, currentVariant?.id ?? null) ? 'fill-white' : ''}`} />
                      </button>
                    </>
                  )}
                </div>
              )) : (
                <div className="col-span-2 aspect-[16/10] xl:aspect-[16/9] overflow-hidden rounded-md bg-gray-100 flex items-center justify-center relative">
                  <span className="text-gray-400 font-medium">No Image Available</span>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id, product.name, currentVariant?.id ?? null, selectedColor || undefined, selectedSize || undefined)}
                    className={`absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 ${
                      isWished(product.id, currentVariant?.id ?? null)
                        ? 'bg-[#6B1A2A] text-white'
                        : 'bg-white/80 text-[#6B1A2A] hover:bg-white'
                    }`}
                  >
                    <Heart className={`h-5 w-5 transition ${isWished(product.id, currentVariant?.id ?? null) ? 'fill-white' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: Product Info (Sticky) */}
          <section className="w-full lg:w-[45%] xl:w-[40%] px-5 py-8 lg:px-0 lg:py-0">
            <div className="lg:sticky lg:top-28 flex flex-col">
              
              {/* Title & Price */}
              <div className="mb-8 border-b border-gray-200 pb-8">
                <h1 className="font-playfair text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#1A1A1A] leading-tight mb-4 tracking-wide">{product.name}</h1>
                
                <div className="flex items-end gap-4 mb-2">
                  <span className="text-3xl lg:text-4xl font-light text-[#6B1A2A]">
                    {'\u20B9'}{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-xl text-gray-400 line-through mb-1 font-light">
                      {'\u20B9'}{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 font-light tracking-wide">
                  {product.gstRate != null && product.gstRate > 0 
                    ? `incl. ${product.gstRate}% GST (CGST ${product.gstRate / 2}% + SGST ${product.gstRate / 2}%)` 
                    : 'Tax included. Free shipping nationwide.'}
                </p>
              </div>

              {/* Selectors */}
              <div className="mb-8 flex flex-col gap-8">
                
                {/* Color Selector */}
                {colorOptions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium tracking-wide text-gray-800 uppercase">
                        Color: <span className="text-gray-500 font-normal capitalize ml-1">{selectedColor}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {colorOptions.map(variant => {
                        const isSelected = selectedColor === variant.colorName
                        return (
                          <button
                            key={variant.colorName}
                            type="button"
                            onClick={() => setSelectedColor(variant.colorName)}
                            className={`group relative h-16 w-12 overflow-hidden rounded-sm transition-all duration-300 ${
                              isSelected ? 'ring-1 ring-[#6B1A2A] ring-offset-2' : 'ring-1 ring-gray-200 hover:ring-gray-400 hover:shadow-md'
                            }`}
                            aria-label={`Select ${variant.colorName}`}
                          >
                            {variant.imageUrl ? (
                              <img src={resolveImageUrl(variant.imageUrl)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full" style={{ backgroundColor: variant.colorHex || '#ccc' }} />
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />
                              </div>
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
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium tracking-wide text-gray-800 uppercase">Size</p>
                      <button type="button" onClick={() => setShowSizeGuide(true)} className="text-xs font-medium text-gray-500 underline underline-offset-4 hover:text-[#6B1A2A] transition-colors">
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {visibleSizeOptions.map(size => {
                        const isSelected = selectedSize === size
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`flex h-11 min-w-[3.5rem] px-4 items-center justify-center rounded-sm border text-sm font-medium transition-all duration-300 ${
                              isSelected 
                                ? 'border-[#6B1A2A] bg-[#6B1A2A] text-white shadow-md' 
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm'
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

              {/* Actions & Qty */}
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex h-14 w-32 shrink-0 items-center overflow-hidden rounded-sm border border-gray-300 bg-white transition-colors focus-within:border-[#6B1A2A]">
                    <button type="button" className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30" onClick={() => updateQtyAmount(-1)} disabled={qty <= 1}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <input value={qty} readOnly className="h-full w-full border-none bg-transparent text-center text-[15px] font-medium outline-none text-gray-800" aria-label="Quantity" />
                    <button type="button" className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30" onClick={() => updateQtyAmount(1)} disabled={qty >= totalStock}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`flex-1 rounded-sm py-4 text-[15px] font-semibold tracking-widest text-white transition-all duration-300 shadow-md ${
                      isOutOfStock 
                        ? 'bg-gray-400 hover:bg-gray-500 shadow-none cursor-not-allowed' 
                        : 'bg-[#6B1A2A] hover:bg-[#521220] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                    onClick={() => { if (isOutOfStock) { setShowNotifyForm(true); if (session?.email) setNotifyEmail(session.email) } else { handleBuyNow() } }}
                  >
                    {isOutOfStock ? 'NOTIFY ME' : 'BUY NOW'}
                  </button>
                </div>
                
                {/* Desktop Add to Cart (hidden on mobile where sticky bar is used) */}
                {!isOutOfStock && (
                  <button
                    type="button"
                    id={inCart ? 'add-more-btn' : 'add-to-cart-btn'}
                    className="hidden lg:flex w-full items-center justify-center gap-2 rounded-sm border border-[#6B1A2A] bg-transparent py-4 text-[15px] font-semibold tracking-widest text-[#6B1A2A] transition-all duration-300 hover:bg-[#6B1A2A] hover:text-white disabled:opacity-50"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {inCart ? 'ADD MORE TO CART' : 'ADD TO CART'}
                  </button>
                )}

                {!isOutOfStock && stockQty > 0 && stockQty <= 5 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#A34336] font-medium animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A34336] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A34336]"></span>
                    </span>
                    Only {stockQty} left in stock - order soon.
                  </div>
                )}
              </div>

              {/* Notify Form */}
              {showNotifyForm && (
                <div className="mb-10 rounded-md border border-gray-200 bg-white p-5 shadow-sm">
                  {notifySubmitted ? (
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="text-sm font-medium">We'll email you when it's restocked.</p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-4 text-sm font-semibold tracking-wide text-gray-800 uppercase">Notify me when available</p>
                      <div className="flex flex-col gap-3">
                        <input
                          type="email"
                          value={notifyEmail}
                          onChange={e => { if (!session) setNotifyEmail(e.target.value) }}
                          placeholder="Email address"
                          readOnly={!!session}
                          className={`w-full rounded-sm border px-4 py-3 text-sm outline-none transition-colors focus:border-[#6B1A2A] ${session ? 'bg-gray-50 text-gray-500' : 'border-gray-300 bg-white'}`}
                        />
                        <input
                          type="tel"
                          value={notifyPhone}
                          onChange={e => setNotifyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Phone number (optional)"
                          className="w-full rounded-sm border border-gray-300 px-4 py-3 text-sm outline-none transition-colors focus:border-[#6B1A2A]"
                        />
                        <button
                          type="button"
                          onClick={handleNotify}
                          disabled={!notifyEmail.trim()}
                          className="w-full rounded-sm bg-gray-900 py-3.5 text-sm font-semibold tracking-widest text-white transition-colors hover:bg-black disabled:opacity-50"
                        >
                          NOTIFY ME
                        </button>
                      </div>
                      {notifyMessage && <p className="mt-3 text-xs font-medium text-red-600">{notifyMessage}</p>}
                    </>
                  )}
                </div>
              )}

              {/* Accordions */}
              <div className="border-t border-gray-200">
                {accordions.map(item => {
                  const isOpen = openAccordion === item.id
                  return (
                    <div key={item.id} className="border-b border-gray-200">
                      <button 
                        type="button" 
                        className="flex w-full items-center justify-between py-5 text-left group" 
                        onClick={() => setOpenAccordion(isOpen ? null : item.id)}
                      >
                        <span className="text-[14px] font-semibold tracking-wide text-gray-900 uppercase group-hover:text-[#6B1A2A] transition-colors">{item.title}</span>
                        <div className="relative h-4 w-4 text-gray-400 group-hover:text-[#6B1A2A] transition-colors">
                          <span className={`absolute top-1/2 left-0 h-[1.5px] w-4 -translate-y-1/2 bg-current transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                          <span className={`absolute top-0 left-1/2 h-4 w-[1.5px] -translate-x-1/2 bg-current transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
                        </div>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100 pb-5' : 'max-h-0 opacity-0 pb-0'}`}>
                        {item.content && (
                          <div className="prose prose-sm prose-gray max-w-none text-[15px] font-light leading-relaxed text-gray-600 whitespace-pre-line">
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

        {/* Reviews Section */}
        <div className="mt-20 w-full lg:mt-32">
          <ReviewSection productId={product.id} slug={product.slug || String(product.id)} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 lg:mt-32 border-t border-gray-200 pt-16">
            <h2 className="font-playfair mb-10 text-center text-3xl md:text-4xl font-medium tracking-wide text-[#1A1A1A]">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
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
