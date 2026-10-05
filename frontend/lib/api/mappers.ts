import type { StorefrontProduct } from './types'
import type { ProductCardProduct, ProductColor } from '@/components/product/ProductCard'

export function getDiscount(price: number, originalPrice?: number | null): number | null {
  if (originalPrice == null || originalPrice <= price) return null
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

type StorefrontVariant = NonNullable<StorefrontProduct['variants']>[number]

function variantImage(v: StorefrontVariant | null | undefined, p: StorefrontProduct): string {
  return v?.imageUrl || v?.images?.[0]?.imageUrl || p.imageUrl || p.image
}

export function getPreferredVariant(p: StorefrontProduct, colorName?: string | null): StorefrontVariant | null {
  if (!p.hasVariants || !p.variants?.length) return null
  if (colorName) {
    const colorMatches = p.variants.filter(v => v.colorName === colorName)
    return colorMatches.find(v => (v.stockQty ?? 0) > 0) || colorMatches[0] || null
  }
  return p.variants.find(v => (v.stockQty ?? 0) > 0) || p.variants.find(v => v.isDefault) || p.variants[0] || null
}

export function mapVariantColors(p: StorefrontProduct): ProductColor[] {
  const colors: ProductColor[] = []
  const seen = new Set<string>()
  ;(p.variants || []).forEach(v => {
    const isColorVariant = !!v.colorName
    const isSizeVariant = !v.colorName && (v.variantType === 'size' || v.size)

    if (isColorVariant) {
      const nameKey = v.colorName!.trim().toLowerCase()
      if (seen.has(nameKey)) return
      seen.add(nameKey)
      const selected = getPreferredVariant(p, v.colorName) || v
      const sizeOptions = Array.from(new Set(
        (p.variants || [])
          .filter(option => option.colorName === v.colorName && option.size)
          .map(option => option.size as string)
      ))
      colors.push({
        name: v.colorName!,
        hex: v.colorHex || '#8B1A2B',
        image: variantImage(selected, p),
        variantId: selected.id,
        variantLabel: selected.label,
        price: selected.price ?? p.price,
        oldPrice: selected.originalPrice ?? p.originalPrice,
        stock: selected.stockQty ?? p.stockQty,
        size: selected.size,
        sizeOptions,
        variantType: 'color',
      })
    } else if (isSizeVariant) {
      // Size-only / free-size variant — use size as the display key
      const displaySize = (v.size || v.label || '').trim()
      if (!displaySize) return
      const sizeKey = displaySize.toLowerCase()
      if (seen.has('size:' + sizeKey)) return
      seen.add('size:' + sizeKey)
      colors.push({
        name: displaySize,
        hex: '#999999', // neutral — not used for color swatch; indicates size-only
        image: variantImage(v, p),
        variantId: v.id,
        variantLabel: v.label || v.size || displaySize,
        price: v.price ?? p.price,
        oldPrice: v.originalPrice ?? p.originalPrice,
        stock: v.stockQty ?? p.stockQty,
        size: v.size,
        sizeOptions: [displaySize],
        variantType: 'size',
      })
    }
  })
  return colors
}

export function mapToProductCardProduct(p: StorefrontProduct): ProductCardProduct {
  const colors = mapVariantColors(p)
  const bestVariant = getPreferredVariant(p)

  const price = bestVariant?.price ?? p.price
  const oldPrice = bestVariant?.originalPrice ?? p.originalPrice
  const disc = getDiscount(price, oldPrice)

  return {
    id: p.id,
    name: p.name,
    category: p.category || p.type || '',
    fabric: p.type || '',
    occasion: '',
    image: variantImage(bestVariant, p),
    price,
    oldPrice: oldPrice ?? null,
    badge: p.isNew ? 'New' : p.isBestSeller ? 'Best Seller' : disc ? `${disc}% OFF` : undefined,
    href: p.slug ? `/products/${p.slug}` : undefined,
    colors: colors.length > 0 ? colors : undefined,
    variantCount: p.variants?.length,
    rating: p.averageRating ?? undefined,
    reviews: undefined,
    variantId: bestVariant?.id,
    variantLabel: bestVariant?.label,
    color: bestVariant?.colorName || p.color,
    size: bestVariant?.size,
    stock: bestVariant?.stockQty ?? p.stockQty,
    enableBackInStockNotify: p.enableBackInStockNotify,
  }
}
