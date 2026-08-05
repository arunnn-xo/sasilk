'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCart, type CartItem } from '@/components/cart/CartContext'
import { useAuth } from '@/components/auth/AuthContext'
import { useCheckout } from './CheckoutContext'
import { apiFetch } from '@/lib/api/client'
import { fetchShippingConfig, fetchAvailableCoupons, fetchAutoDiscount, type ShippingConfig, type AvailableCoupon } from '@/lib/api/storefront'

function formatPrice(value: number) {
  return `\u20B9 ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function OrderSummary({ isBuyNow }: { isBuyNow?: boolean }) {
  const { items: cartItems, subtotal: cartSubtotal } = useCart()

  const buyNowRaw = useMemo(() => {
    if (!isBuyNow) return null
    try {
      const raw = sessionStorage.getItem('buyNowItem')
      return raw ? JSON.parse(raw) as CartItem : null
    } catch { return null }
  }, [isBuyNow])

  const items = buyNowRaw ? [buyNowRaw] : cartItems
  const subtotal = buyNowRaw
    ? Number(buyNowRaw.price ?? 0) * Number(buyNowRaw.qty ?? 1)
    : cartSubtotal

  const { session } = useAuth()
  const { shippingTotal, shippingCalculated, isProcessing, couponCode, setCouponCode, couponDiscount, setCouponDiscount, setCouponLabel, couponLabel, couponDescription, setCouponDescription } = useCheckout()

  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({ freeShippingEnabled: false, freeShippingThreshold: 0 })
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([])
  const [couponsLoaded, setCouponsLoaded] = useState(false)

  // Welcome discount for a customer's first-ever order — kept separate from the
  // manual couponCode/couponDiscount state, since it's never sent to the backend
  // as a coupon code (the backend re-derives it itself when no code is passed).
  // A manually-applied coupon always takes visual + calculation priority; removing
  // it naturally reveals this again since it's never cleared.
  const [autoDiscountAmount, setAutoDiscountAmount] = useState(0)
  const [autoDiscountLabel, setAutoDiscountLabel] = useState('')
  const [autoDiscountChecked, setAutoDiscountChecked] = useState(false)

  useEffect(() => {
    fetchShippingConfig().then(setShippingConfig)
    if (session) {
      fetchAvailableCoupons().then(coupons => { setAvailableCoupons(coupons); setCouponsLoaded(true) })
    } else {
      setAvailableCoupons([])
      setCouponsLoaded(true)
    }
  }, [session])

  useEffect(() => {
    if (!session || autoDiscountChecked || subtotal <= 0) return
    setAutoDiscountChecked(true)
    fetchAutoDiscount(subtotal).then(data => {
      if (data.valid && data.discount) {
        setAutoDiscountAmount(data.discount.amount)
        setAutoDiscountLabel(data.discount.label)
      }
    }).catch(() => {})
  }, [session, autoDiscountChecked, subtotal])

  const effectiveDiscount = couponCode ? couponDiscount : autoDiscountAmount
  const effectiveDiscountLabel = couponCode ? couponLabel : autoDiscountLabel

  const freeShippingEnabled = shippingConfig.freeShippingEnabled && shippingConfig.freeShippingThreshold > 0
  const threshold = shippingConfig.freeShippingThreshold
  const hasFreeShipping = freeShippingEnabled && subtotal >= threshold

  const effectiveShipping = hasFreeShipping ? 0 : shippingTotal

  const discountedSubtotal = Math.max(0, subtotal - effectiveDiscount)
  const total = discountedSubtotal + effectiveShipping

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return

    setCouponLoading(true)
    setCouponError('')

    try {
      const data = await apiFetch<{ valid: boolean; message?: string; discount?: { amount: number; label: string }; coupon?: { code: string; type: string; value: number; description: string | null } }>(
        '/storefront/orders/validate-coupon',
        { method: 'POST', body: JSON.stringify({ code, subtotal }) },
      )

      if (!data.valid) {
        setCouponError(data.message || 'Invalid coupon code.')
        return
      }

      setCouponCode(data.coupon?.code ?? '')
      setCouponDiscount(data.discount?.amount ?? 0)
      setCouponLabel(data.discount?.label ?? '')
      setCouponDescription(data.coupon?.description ?? null)
      setCouponInput('')
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Failed to validate coupon.')
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponCode(null)
    setCouponDiscount(0)
    setCouponLabel('')
    setCouponDescription(null)
    setCouponError('')
  }

  function handleSelectCoupon(coupon: AvailableCoupon) {
    setCouponInput(coupon.code)
  }

  return (
    <div className="w-full">
      <h2 className="mb-5 pb-3 text-[13px] font-bold uppercase tracking-widest text-[var(--charcoal)] border-b border-gray-100">
        Order Summary
      </h2>

      {/* Items List */}
      <div className="mb-5 space-y-4">
        {items.map(item => {
          const key = `${item.id}__${item.color ?? ''}__${item.size ?? ''}`
          return (
          <div key={key} className="flex gap-4">
            <div className="relative h-24 w-20 shrink-0">
              <div className="h-full w-full overflow-hidden rounded border border-[#E8DCC4] bg-[#FAF6EE]">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <span className="absolute -right-2.5 -top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2A1A1E] text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                {item.qty}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <h3 className="line-clamp-2 text-[13px] font-medium leading-tight text-[var(--charcoal)]">{item.name}</h3>
              {(item.color || item.size) && (
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {item.color && <span>Color: {item.color}</span>}
                  {item.color && item.size && <span className="mx-1.5">|</span>}
                  {item.size && <span>Size: {item.size}</span>}
                </p>
              )}
              <div className="mt-0.5 text-[13px] font-semibold text-[var(--charcoal)]">{formatPrice(item.price)}</div>
            </div>
          </div>
        )})}
      </div>

      <hr className="mb-5 border-gray-100" />

      {/* Welcome discount — auto-applied for a customer's first order, shown only
          when no manual coupon has been applied (manual always takes priority). */}
      {!couponCode && autoDiscountAmount > 0 && (
        <div className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-green-700">
            Welcome Offer — Applied Automatically
          </p>
          <span className="text-sm font-semibold text-green-700">{autoDiscountLabel}</span>
        </div>
      )}

      {/* Coupon — registered-customer perk; guests get a login prompt instead
          of the code input / available-offers list. */}
      {!couponCode && !session ? (
        <div className="mb-5 rounded border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-[12px] text-gray-600">Coupons are available for registered customers. Login to view & apply offers.</p>
        </div>
      ) : !couponCode ? (
        <div className="mb-5">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Have a coupon?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={e => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon() } }}
              placeholder="Enter coupon code"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--burgundy)]/50"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="rounded bg-[var(--burgundy)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[var(--burgundy-dark)] disabled:opacity-50"
            >
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
          {couponError && <p className="mt-1 text-xs text-red-500">{couponError}</p>}

          {couponsLoaded && availableCoupons.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Available Offers</p>
              <div className="space-y-1.5">
                {availableCoupons.map(coupon => (
                  <button
                    key={coupon.id}
                    type="button"
                    onClick={() => handleSelectCoupon(coupon)}
                    className="flex w-full items-center justify-between rounded border border-dashed border-[var(--burgundy)]/30 bg-[var(--burgundy)]/[0.03] px-3 py-2 text-left transition hover:border-[var(--burgundy)]/60 hover:bg-[var(--burgundy)]/[0.06]"
                  >
                    <div>
                      <span className="text-[12px] font-bold tracking-wider text-[var(--burgundy)]">{coupon.code}</span>
                      <span className="ml-2 text-[11px] font-semibold text-green-700">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `${formatPrice(Number(coupon.value))} OFF`}
                      </span>
                      {coupon.description && (
                        <p className="mt-0.5 text-[10px] leading-tight text-gray-500">{coupon.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-[var(--burgundy)]">APPLY →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-5 rounded border border-green-200 bg-green-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-green-700">{couponCode}</span>
            <span className="text-xs text-green-600">({couponLabel})</span>
          </div>
          {couponDescription && (
            <p className="mt-1 text-[11px] text-green-600/80 leading-tight">{couponDescription}</p>
          )}
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="mt-1 text-xs font-semibold text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}

      {/* Totals */}
      <div className="mb-5 space-y-2 text-[13px]">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-[var(--charcoal)]">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={`font-medium ${(hasFreeShipping || (shippingCalculated && shippingTotal === 0)) ? 'text-green-600' : 'text-[var(--charcoal)]'}`}>
            {hasFreeShipping ? 'Free' : !shippingCalculated ? 'Calculated at next step' : shippingTotal === 0 ? 'Free' : formatPrice(shippingTotal)}
          </span>
        </div>
        {effectiveDiscount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount ({effectiveDiscountLabel})</span>
            <span className="font-medium">-{formatPrice(effectiveDiscount)}</span>
          </div>
        )}
      </div>

      <hr className="mb-5 border-gray-100" />

      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-[var(--charcoal)]">Total</span>
        <div className="text-right">
          <span className="text-xl font-bold text-[var(--charcoal)]">{formatPrice(total)}</span>
          <p className="mt-0.5 text-[10px] text-gray-400">Including GST</p>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
          Completing your order... Do not close this page.
        </div>
      )}
    </div>
  )
}
