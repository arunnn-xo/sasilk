'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, ShoppingBag, Star } from 'lucide-react'

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

const MAX_VISIBLE = 4

export default function ProductCard({ product, wished, onToggleWishlist, onAddToCart }: ProductCardProps) {
  const [localWished, setLocalWished] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [hoveredTooltip, setHoveredTooltip] = useState<number | null>(null)

  const isWished = wished ?? localWished
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null
  const href = product.href ?? '/products/soft-silk-woven-zari-saree'
  const colors = product.colors ?? []
  const visibleColors = colors.slice(0, MAX_VISIBLE)
  const extraCount = Math.max(0, colors.length - MAX_VISIBLE)

  // Hover overrides active for image preview; click locks the selection
  const displayIdx = hoveredIdx ?? activeIdx
  const activeColor = colors[displayIdx]
  const displayImage = activeColor?.image ?? product.image

  function toggleWishlist() {
    if (onToggleWishlist) { onToggleWishlist(); return }
    setLocalWished(c => !c)
  }

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E8DCC4] bg-white shadow-[0_8px_22px_rgba(74,15,28,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(74,15,28,0.13)] sm:rounded-xl">

      {/* ── Image area ── */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EDD6]">

        {/* Product image with smooth cross-fade on color change */}
        <img
          key={displayImage}
          src={displayImage}
          alt={activeColor ? `${product.name} in ${activeColor.name}` : product.name}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.04]"
        />

        {/* Badge */}
        {product.badge ? (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-[#6B1A2A] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-white shadow-md sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.14em]">
            {product.badge}
          </span>
        ) : null}

        {/* Wishlist */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#6B1A2A] shadow-sm transition hover:scale-110 hover:bg-white sm:right-2.5 sm:top-2.5 sm:h-8 sm:w-8"
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-3.5 w-3.5 transition sm:h-4 sm:w-4 ${isWished ? 'fill-[#6B1A2A]' : ''}`} />
        </button>

        {/* ── Color Swatches Strip (bottom of image) ── */}
        {colors.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1 bg-gradient-to-t from-black/50 via-black/20 to-transparent px-1.5 pb-1.5 pt-7 sm:gap-1.5 sm:px-2.5 sm:pb-2.5 sm:pt-8">

            {visibleColors.map((color, idx) => {
              const isActive = activeIdx === idx
              return (
                <div key={color.name} className="relative">
                  {/* Tooltip */}
                  {hoveredTooltip === idx && (
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
                    onMouseEnter={() => { setHoveredIdx(idx); setHoveredTooltip(idx) }}
                    onMouseLeave={() => { setHoveredIdx(null); setHoveredTooltip(null) }}
                    onClick={() => setActiveIdx(idx)}
                    style={{ backgroundColor: color.hex }}
                    className={[
                      'block rounded-full border-2 transition-all duration-200',
                      'h-3.5 w-3.5 min-[380px]:h-4 min-[380px]:w-4 sm:h-5 sm:w-5',
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
              <span className="shrink-0 rounded-full bg-white/85 px-1.5 py-0.5 text-[8px] font-bold leading-none text-[#6B1A2A] sm:text-[9px]">
                +{extraCount}
              </span>
            )}

            {/* Active color label — far right */}
            {activeColor && (
              <span className="ml-auto hidden max-w-[80px] truncate text-[9px] font-semibold text-white/90 drop-shadow min-[380px]:inline">
                {activeColor.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Info area ── */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">

        {/* Category pill + Rating */}
        <div className="mb-1.5 flex min-w-0 items-center justify-between gap-1.5 sm:mb-2 sm:gap-2">
          <span className="min-w-0 truncate rounded-full bg-[#F5EDD6] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#6B1A2A] sm:px-2 sm:text-[9px] sm:tracking-[0.1em]">
            {product.category}
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] text-[#7A6065] sm:gap-1 sm:text-xs">
            <Star className="h-3 w-3 fill-[#C9A84C] text-[#C9A84C] sm:h-3.5 sm:w-3.5" />
            {product.rating ?? 4.8} ({product.reviews ?? 14})
          </span>
        </div>

        <h3 className="min-w-0 truncate text-[13px] font-semibold leading-5 text-[#2A1A1E] sm:text-sm">{product.name}</h3>
        <p className="mt-0.5 truncate text-[11px] text-[#7A6065] sm:text-xs">
          {product.fabric} / {product.occasion}
        </p>

        {/* Color count sub-label */}
        <div className="mt-1.5 flex min-h-[14px] min-w-0 items-center gap-1 sm:min-h-[16px] sm:gap-1.5">
          {colors.length > 0 ? (
            <>
            <div className="flex gap-0.5">
              {colors.slice(0, 5).map(c => (
                <span
                  key={c.name}
                  className="inline-block h-1.5 w-1.5 rounded-full border border-[#E8DCC4] sm:h-2 sm:w-2"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <span className="min-w-0 truncate text-[9px] text-[#7A6065] sm:text-[10px]">
              {colors.length} colour{colors.length > 1 ? 's' : ''}
            </span>
            </>
          ) : null}
        </div>

        {/* Price row */}
        <div className="mt-2.5 flex min-h-[45px] flex-wrap items-start gap-x-1.5 gap-y-1 sm:mt-3 sm:min-h-[48px] sm:items-end sm:gap-x-2">
          <span className="text-[15px] font-bold leading-5 text-[#6B1A2A] sm:text-base">{formatPrice(product.price)}</span>
          {product.oldPrice ? (
            <span className="text-[10px] text-[#7A6065] line-through sm:text-xs">{formatPrice(product.oldPrice)}</span>
          ) : null}
          {discount ? (
            <span className="rounded bg-[#9D3B22] px-1 py-0.5 text-[9px] font-bold text-white sm:px-1.5 sm:py-1 sm:text-[10px]">
              {discount}% OFF
            </span>
          ) : null}
        </div>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_34px] gap-1.5 pt-2.5 sm:grid-cols-[1fr_40px] sm:gap-2 sm:pt-3">
          <Link
            href={href}
            className="inline-flex min-w-0 items-center justify-center rounded-md bg-[#6B1A2A] px-2 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#4A0F1C] sm:px-3 sm:py-2.5 sm:text-[11px] sm:tracking-[0.12em]"
          >
            <span className="sm:hidden">Details</span>
            <span className="hidden sm:inline">View Details</span>
          </Link>
          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#6B1A2A] text-[#6B1A2A] transition hover:bg-[#6B1A2A] hover:text-white sm:h-10"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
