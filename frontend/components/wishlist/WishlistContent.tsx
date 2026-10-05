'use client'

import { useEffect, useState } from 'react'
import { useWishlist } from '@/components/wishlist/WishlistContext'
import { useAuth } from '@/components/auth/AuthContext'
import { useCart } from '@/components/cart/CartContext'
import ProductCard, { type ProductCardProduct } from '@/components/product/ProductCard'
import { resolveImageUrl as resolveImg } from '@/lib/api/client'
import { getDiscount, mapVariantColors } from '@/lib/api/mappers'
import type { StorefrontProduct } from '@/lib/api/types'
import type { ServerWishlistItem } from '@/lib/api/wishlist'

function resolveImageUrl(url: string | null | undefined): string {
  return resolveImg(url) || ''
}

function stringMeta(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function mapServerItemToCard(item: ServerWishlistItem): ProductCardProduct {
  const disc = getDiscount(item.price, item.originalPrice)
  const image = resolveImageUrl(item.image)
  const colorName = item.color || undefined
  const productForVariants: StorefrontProduct = {
    id: item.productId,
    code: '',
    name: item.name,
    slug: item.slug,
    type: item.type || '',
    price: item.price,
    originalPrice: item.originalPrice,
    isNew: item.isNew,
    isBestSeller: item.isBestSeller,
    color: item.color ?? undefined,
    category: item.category || '',
    image,
    imageUrl: item.image,
    metadata: item.metadata ?? null,
    stockQty: item.stockQty,
    averageRating: item.averageRating ?? undefined,
    hasVariants: item.hasVariants ?? Boolean(item.variants?.length),
    variants: item.variants ?? [],
  }
  const colors = mapVariantColors(productForVariants).map(color => {
    const matchesSavedColor = colorName && color.name.trim().toLowerCase() === colorName.trim().toLowerCase()
    const matchesSavedVariant = item.variantId != null && color.variantId === item.variantId
    if (!matchesSavedColor && !matchesSavedVariant) return color

    return {
      ...color,
      image: image || color.image,
      variantId: item.variantId ?? color.variantId,
      variantLabel: item.variantLabel ?? color.variantLabel,
      price: item.price,
      oldPrice: item.originalPrice,
      stock: item.stockQty,
      size: item.size ?? color.size,
    }
  }).sort((a, b) => {
    const aExact = item.variantId != null && a.variantId === item.variantId
    const bExact = item.variantId != null && b.variantId === item.variantId
    if (aExact !== bExact) return aExact ? -1 : 1
    const aColor = colorName && a.name.trim().toLowerCase() === colorName.trim().toLowerCase()
    const bColor = colorName && b.name.trim().toLowerCase() === colorName.trim().toLowerCase()
    if (aColor !== bColor) return aColor ? -1 : 1
    return 0
  })
  const fabric = stringMeta(item.metadata?.fabric) || item.type || ''
  const occasion = stringMeta(item.metadata?.occasion)

  return {
    id: item.productId,
    name: item.name,
    category: item.category || '',
    fabric,
    occasion,
    image,
    price: item.price,
    oldPrice: item.originalPrice,
    badge: item.tag || (item.isNew ? 'New' : item.isBestSeller ? 'Best Seller' : disc ? `${disc}% OFF` : undefined),
    href: `/products/${item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    rating: item.averageRating ?? undefined,
    stock: item.stockQty,
    variantId: item.variantId ?? undefined,
    variantLabel: item.variantLabel ?? undefined,
    color: colorName,
    size: item.size ?? undefined,
    colors: colors.length > 0 ? colors : undefined,
    variantCount: item.variants?.length,
  }
}

export default function WishlistContent() {
  const { serverItems, wishlistIds, removeFromWishlist, isWished, hydrated, syncing } = useWishlist()
  const { session, loading: authLoading } = useAuth()
  const cart = useCart()
  const [products, setProducts] = useState<ProductCardProduct[]>([])
  const [toast, setToast] = useState('')
  const [addingKey, setAddingKey] = useState<string | null>(null)

  const isLoggedIn = !!session

  useEffect(() => {
    if (authLoading || !hydrated) return

    if (isLoggedIn) {
      setProducts(serverItems.map(mapServerItemToCard))
      return
    }

    if (wishlistIds.length === 0) {
      setProducts([])
      return
    }

    setProducts(serverItems.map(mapServerItemToCard))
  }, [serverItems, wishlistIds, hydrated, isLoggedIn, authLoading])

  async function addToCart(product: ProductCardProduct) {
    const original = serverItems.find(i =>
      String(i.productId) === String(product.id) &&
      (i.variantId ?? null) === (product.variantId ?? null),
    )
    const slug = original?.slug || product.href?.replace('/products/', '') || String(product.id)
    const key = `${product.id}-${product.variantId ?? 'base'}`
    setAddingKey(key)
    try {
      await cart.addItem({
        id: product.id!,
        name: product.name,
        slug,
        price: product.price,
        originalPrice: product.oldPrice ?? undefined,
        image: product.image,
        color: product.color,
        size: product.size,
        variantId: product.variantId,
        variantLabel: product.variantLabel,
        stock: original?.stockQty,
      })
      cart.setDrawerOpen(true)
      setToast(`${product.name} added to cart`)
    } catch (err: any) {
      setToast(err?.message || 'Could not add this item to cart. Please try again.')
    } finally {
      setAddingKey(null)
    }
    setTimeout(() => setToast(''), 2200)
  }

  const isPending = authLoading || !hydrated

  if (isPending) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6B1A2A] border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-2 rounded-lg border border-[#E8DCC4] bg-white p-4 shadow-[0_12px_34px_rgba(74,15,28,0.05)] sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-[#6B1A2A]">
          {syncing ? 'Syncing...' : `Showing ${products.length} saved products`}
        </p>
      </div>
      {toast && (
        <div className="mb-4 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/10 px-4 py-3 text-center text-sm font-semibold text-[#6B1A2A] shadow-sm">
          {toast}
        </div>
      )}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map(product => (
            <ProductCard
              key={`${product.id ?? product.name}-${product.variantId ?? 'base'}`}
              product={product}
              wished={product.id != null ? isWished(Number(product.id), product.variantId ?? null) : false}
              onToggleWishlist={() => {
                if (product.id != null) removeFromWishlist(Number(product.id), product.variantId ?? null, product.name)
              }}
              onAddToCart={addToCart}
              adding={addingKey === `${product.id}-${product.variantId ?? 'base'}`}
            />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-[#7A6065]">Your wishlist is empty. Start adding products you love!</p>
      )}
    </>
  )
}
