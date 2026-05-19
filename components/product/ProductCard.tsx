'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, ShoppingBag, Star } from 'lucide-react'

export type ProductCardProduct = {
  id?: number | string
  name: string
  category: string
  fabric: string
  occasion: string
  image: string
  price: number
  oldPrice?: number | null
  badge?: string
  rating?: number
  reviews?: number
  href?: string
}

type ProductCardProps = {
  product: ProductCardProduct
  wished?: boolean
  onToggleWishlist?: () => void
  onAddToCart?: (product: ProductCardProduct) => void
}

function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString('en-IN')}.00`
}

export default function ProductCard({ product, wished, onToggleWishlist, onAddToCart }: ProductCardProps) {
  const [localWished, setLocalWished] = useState(false)
  const isWished = wished ?? localWished
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null
  const href = product.href ?? '/products/soft-silk-woven-zari-saree'

  function toggleWishlist() {
    if (onToggleWishlist) {
      onToggleWishlist()
      return
    }

    setLocalWished(current => !current)
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-[#E8DCC4] bg-white shadow-[0_8px_22px_rgba(74,15,28,0.045)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(74,15,28,0.11)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EDD6]">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {product.badge ? (
          <span className="absolute left-2 top-2 rounded-full bg-[#6B1A2A] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
            {product.badge}
          </span>
        ) : null}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#6B1A2A] shadow-sm transition hover:bg-white"
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4 w-4 ${isWished ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate rounded-full bg-[#F5EDD6] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#6B1A2A]">
            {product.category}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-[#7A6065]">
            <Star className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />
            {product.rating ?? 4.8} ({product.reviews ?? 14})
          </span>
        </div>

        <h3 className="min-w-0 truncate text-sm font-semibold text-[#2A1A1E]">{product.name}</h3>
        <p className="mt-1 truncate text-xs text-[#7A6065]">
          {product.fabric} / {product.occasion}
        </p>

        <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-base font-bold text-[#6B1A2A]">{formatPrice(product.price)}</span>
          {product.oldPrice ? <span className="text-xs text-[#7A6065] line-through">{formatPrice(product.oldPrice)}</span> : null}
          {discount ? <span className="rounded bg-[#9D3B22] px-1.5 py-1 text-[10px] font-bold text-white">{discount}% OFF</span> : null}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_40px] gap-2">
          <Link href={href} className="inline-flex items-center justify-center rounded-md bg-[#6B1A2A] px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#4A0F1C]">
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#6B1A2A] text-[#6B1A2A] transition hover:bg-[#6B1A2A] hover:text-white"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
