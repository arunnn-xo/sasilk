import type { StorefrontProduct } from './types'
import type { ProductCardProduct, ProductColor } from '@/components/product/ProductCard'

export function getDiscount(price: number, originalPrice?: number | null): number | null {
  if (originalPrice == null || originalPrice <= price) return null
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export function mapToProductCardProduct(p: StorefrontProduct): ProductCardProduct {
  const colors: ProductColor[] = []
  const seen = new Set<string>()
  ;(p.variants || []).forEach(v => {
    if (v.colorName && v.colorHex) {
      const nameKey = v.colorName.trim().toLowerCase()
      const hexKey = v.colorHex.trim().toLowerCase()
      if (!seen.has(nameKey) && !seen.has(hexKey)) {
        seen.add(nameKey)
        seen.add(hexKey)
        colors.push({
          name: v.colorName,
          hex: v.colorHex,
          image: v.imageUrl || v.images?.[0]?.imageUrl || p.imageUrl || p.image,
        })
      }
    }
  })

  const defaultVariant = p.hasVariants && p.variants?.length
    ? p.variants.find(v => v.isDefault) || p.variants[0]
    : null

  const inStockVariant = p.hasVariants && p.variants?.length
    ? p.variants.find(v => (v.stockQty ?? 0) > 0) || defaultVariant
    : null

  const bestVariant = inStockVariant || defaultVariant

  const disc = getDiscount(p.price, p.originalPrice)

  return {
    id: p.id,
    name: p.name,
    category: p.category || p.type || '',
    fabric: p.type || '',
    occasion: '',
    image: p.imageUrl || p.image,
    price: p.price,
    oldPrice: p.originalPrice ?? null,
    badge: p.isNew ? 'New' : p.isBestSeller ? 'Best Seller' : disc ? `${disc}% OFF` : undefined,
    href: p.slug ? `/products/${p.slug}` : undefined,
    colors: colors.length > 0 ? colors : undefined,
    rating: p.averageRating ?? 0,
    reviews: undefined,
    variantId: bestVariant?.id,
    variantLabel: bestVariant?.label,
    color: bestVariant?.colorName || p.color,
    size: bestVariant?.size,
    stock: bestVariant?.stockQty ?? p.stockQty,
    enableBackInStockNotify: p.enableBackInStockNotify,
  }
}
