'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useWishlist } from '@/components/wishlist/WishlistContext'

export type ProductColor = {
  name: string
  hex: string
  image?: string
}

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
  colors?: ProductColor[]
  variantId?: number
  variantLabel?: string
  color?: string
  size?: string
  stock?: number
  enableBackInStockNotify?: boolean
}

type ProductCardProps = {
  product: ProductCardProduct
  wished?: boolean
  onToggleWishlist?: () => void
  onAddToCart?: (product: ProductCardProduct) => void
}

function formatPrice(value: number) {
  return `\u20B9 ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const MAX_VISIBLE = 4

export default function ProductCard({ product, wished, onToggleWishlist, onAddToCart }: ProductCardProps) {
  const { toggleWishlist: ctxToggleWishlist, isWished: ctxIsWished } = useWishlist()
  const [activeIdx, setActiveIdx] = useState(0)
  const [hoverIdx, setHoverIdx] = useState(-1)
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null)
  const effectiveIdx = hoverIdx >= 0 ? hoverIdx : activeIdx

  const isWished = wished ?? ctxIsWished(Number(product.id), product.variantId ?? null)
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null
  const href = product.href ?? `/products/${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
  
  const rawColors = product.colors ?? []
  const colors = useMemo(() => {
    const seenNames = new Set<string>()
    const seenHexes = new Set<string>()
    return rawColors.filter(c => {
      const nameKey = c.name.trim().toLowerCase()
      const hexKey = c.hex ? c.hex.trim().toLowerCase() : ''
      if (seenNames.has(nameKey) || (hexKey && seenHexes.has(hexKey))) {
        return false
      }
      seenNames.add(nameKey)
      if (hexKey) seenHexes.add(hexKey)
      return true
    })
  }, [rawColors])

  const visibleColors = colors.slice(0, MAX_VISIBLE)
  const extraCount = Math.max(0, colors.length - MAX_VISIBLE)

  const activeColor = colors[effectiveIdx]
  const displayImage = activeColor?.image ?? product.image

  const isOutOfStock = product.stock != null && product.stock <= 0

  function selectColor(idx: number) {
    setActiveIdx(idx)
    setTooltipIdx(idx)
    setTimeout(() => setTooltipIdx(null), 1500)
  }

  function toggleWishlist() {
    if (onToggleWishlist) { onToggleWishlist(); return }
    if (product.id != null) {
      ctxToggleWishlist(Number(product.id), product.name, product.variantId ?? null, product.color, product.size)
    }
  }

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#E8DCC4] bg-white shadow-[0_8px_22px_rgba(74,15,28,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(74,15,28,0.13)]">

      {/* ── Image area ── */}
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-[#F5EDD6]">

        <Link href={href} className="absolute inset-0 z-10 block">
          {/* Product image with smooth cross-fade on color change */}
          <img
            key={displayImage}
            src={displayImage}
            alt={activeColor ? `${product.name} in ${activeColor.name}` : product.name}
            onError={(e) => {
              if (e.currentTarget.src !== '/saree1.png') {
                e.currentTarget.src = '/saree1.png'
              }
            }}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.04] pointer-events-none"
          />
        </Link>

        {/* Wishlist */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#6B1A2A] shadow-sm transition hover:bg-white hover:scale-110"
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4 w-4 transition ${isWished ? 'fill-[#6B1A2A]' : ''}`} />
        </button>

        {/* Rating badge */}
        <div className="absolute left-2.5 top-2.5 z-20 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5">
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-semibold text-white">{product.rating ?? 0}</span>
        </div>

        {/* Stock badge */}
        {product.stock != null && product.stock <= 0 && (
          <Link
            href={href}
            className="absolute left-2.5 top-9 z-20 flex items-center rounded bg-gray-500 px-1.5 py-0.5 hover:bg-gray-600"
          >
            <span className="text-[10px] font-semibold text-white">Notify</span>
          </Link>
        )}

        {/* ── Color Swatches Strip (bottom of image) ── */}
        {colors.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-1.5 bg-gradient-to-t from-black/50 via-black/20 to-transparent px-2.5 pb-2.5 pt-8"
            onMouseLeave={() => setHoverIdx(-1)}
          >

            {visibleColors.map((color, idx) => {
              const isActive = effectiveIdx === idx
              return (
                <div key={color.name} className="relative">
                  {/* Tooltip — shows on hover (desktop) + on tap (mobile) */}
                  {(tooltipIdx === idx || hoverIdx === idx) && (
                    <div
                      className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1A0A0E]/90 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white shadow-lg"
                      role="tooltip"
                    >
                      {color.name}
                      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1A0A0E]/90" />
                    </div>
                  )}

                  <button
                    type="button"
                    aria-label={`Select colour ${color.name}`}
                    onMouseEnter={() => { setTooltipIdx(idx); setHoverIdx(idx) }}
                    onMouseLeave={() => setTooltipIdx(null)}
                    onTouchStart={() => selectColor(idx)}
                    onClick={() => selectColor(idx)}
                    style={{ backgroundColor: color.hex }}
                    className={[
                      'block rounded-full border-2 transition-all duration-200',
                      'h-[18px] w-[18px] sm:h-5 sm:w-5',
                      isActive
                        ? 'border-[#C9A84C] scale-125 shadow-[0_0_0_1.5px_rgba(201,168,76,0.55)]'
                        : 'border-white/80 hover:border-[#C9A84C] hover:scale-110',
                    ].join(' ')}
                  />
                </div>
              )
            })}

            {/* "+N more" pill */}
            {extraCount > 0 && (
              <span className="shrink-0 rounded-full bg-white/85 px-1.5 py-0.5 text-[9px] font-bold leading-none text-[#6B1A2A]">
                +{extraCount}
              </span>
            )}

            {/* Active color label — far right */}
            {activeColor && (
              <span className="ml-auto max-w-[80px] truncate text-[9px] font-semibold text-white/90 drop-shadow">
                {activeColor.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Info area ── */}
      <div className="flex flex-1 flex-col p-3 text-left">

        {/* Category pill + Rating */}
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {product.badge ? (
              <span className="shrink-0 rounded bg-[#6B1A2A] px-1.5 py-0.5 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                {product.badge}
              </span>
            ) : null}
            <span className="min-w-0 truncate rounded-full bg-[#F5EDD6] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#6B1A2A]">
              {product.category}
            </span>
          </div>
        </div>

        <h3 className="min-w-0 line-clamp-2 text-sm font-semibold leading-snug text-[#2A1A1E] break-words" title={product.name}>
          {product.name}
        </h3>
        {(() => {
          const details = [product.fabric, product.occasion].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)
          return details.length > 0 ? (
            <p className="mt-0.5 truncate text-[11px] text-[#7A6065]">
              {details.join(' / ')}
            </p>
          ) : null
        })()}

        {/* Selected Variant Badge (Color / Size) */}
        {(product.color || product.size || product.variantLabel) ? (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="rounded border border-[#E8DCC4] bg-[#FAF6EE] px-2 py-0.5 text-[9px] font-bold text-[#6B1A2A]">
              {[product.color ? `Color: ${product.color}` : '', product.size ? `Size: ${product.size}` : '', product.variantLabel && !product.color && !product.size ? product.variantLabel : ''].filter(Boolean).join(' | ')}
            </span>
          </div>
        ) : null}

        {/* Color count sub-label */}
        {colors.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5"
            onMouseLeave={() => setHoverIdx(-1)}
          >
            <div className="flex gap-1">
              {colors.slice(0, 5).map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  onMouseEnter={() => setHoverIdx(idx)}
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveIdx(idx)
                  }}
                  className={`inline-block h-3 w-3 rounded-full border transition ${effectiveIdx === idx ? 'border-[#6B1A2A] scale-110 shadow-[0_0_0_1px_rgba(107,26,42,0.5)]' : 'border-[#E8DCC4] hover:scale-110'}`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={`Select ${c.name}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-[#7A6065]">
              {colors.length} colour{colors.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="mt-2.5 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-sm md:text-base font-bold text-[#6B1A2A]">{formatPrice(product.price)}</span>
          {product.oldPrice ? (
            <span className="text-xs text-[#7A6065] line-through">{formatPrice(product.oldPrice)}</span>
          ) : null}
          {discount ? (
            <span className="rounded bg-[#9D3B22] px-1.5 py-0.5 text-[9px] font-bold text-white">
              {discount}% OFF
            </span>
          ) : null}
        </div>

        {/* Actions - Pinned to bottom using mt-auto */}
        <div className="mt-auto pt-3 w-full">
          {isOutOfStock ? (
            <Link
              href={href}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-gray-50 px-2 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 transition hover:bg-gray-100"
              aria-label={`Notify me when ${product.name} is back in stock`}
            >
              Out of Stock
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart?.(product)}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#6B1A2A] px-2 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#4A0F1C] shadow-sm"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
