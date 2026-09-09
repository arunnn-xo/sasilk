'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, PackageSearch, AlertCircle, Loader2 } from 'lucide-react'
import { fetchOrderById } from '@/lib/services/order.service'
import type { OrderData } from '@/lib/services/order.service'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  pending_payment: 'Payment Pending',
  confirmed: 'Confirmed',
  packing: 'Packing',
  dispatched: 'Dispatched',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function handleTrack(event: React.FormEvent) {
    event.preventDefault()
    if (!orderId.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    setSearched(true)
    try {
      const data = await fetchOrderById(orderId.trim())
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-[var(--ivory)] text-[var(--charcoal)]">
      <section className="border-b border-[var(--ivory-dark)] bg-[var(--burgundy-dark)]">
        <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <p className="font-montserrat mb-3 text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] text-[var(--gold-light)]">Order Support</p>
          <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-medium tracking-wide text-[var(--ivory)]">
            Track Order
          </h1>
          <p className="font-sans mt-4 max-w-2xl text-sm sm:text-base font-medium leading-relaxed text-[var(--gold-pale)]">
            Enter your order ID to view its current status.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <form
          onSubmit={handleTrack}
          className="rounded-lg border border-[var(--ivory-dark)] bg-white p-5 shadow-[0_12px_34px_rgba(74,15,28,0.05)] sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold-pale)] text-[var(--burgundy)]">
              <PackageSearch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-medium italic tracking-wide text-[var(--burgundy)]">
                Find your order
              </h2>
              <p className="text-xs text-[var(--muted)]">Looks up the real order from your account.</p>
            </div>
          </div>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-semibold text-[var(--burgundy)]">Order ID <span className="text-red-500">*</span></span>
            <input
              required
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. 1234"
              className="h-12 w-full rounded-md border border-[var(--ivory-dark)] bg-[var(--surface-soft)] px-4 text-sm outline-none transition focus:border-[var(--burgundy)]"
            />
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-md bg-[var(--burgundy)] py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--burgundy-dark)] disabled:opacity-60">
            {loading ? 'Looking up...' : 'Track Order'}
          </button>
          <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-[var(--burgundy)] underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </form>

        <div className="rounded-lg border border-[var(--ivory-dark)] bg-white p-5 shadow-[0_12px_34px_rgba(74,15,28,0.05)] sm:p-6">
          <h2 className="font-playfair text-2xl sm:text-3xl font-medium italic tracking-wide text-[var(--burgundy)]">
            {order ? `Order #${order.orderNumber}` : 'Tracking status'}
          </h2>

          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-[var(--muted)]">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--burgundy)]" /> Loading order...
            </div>
          ) : error ? (
            <div className="mt-6 flex items-start gap-3 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Order could not be loaded.</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          ) : order ? (
            <>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
                style={{ background: 'var(--gold-pale)', color: 'var(--burgundy)' }}>
                {STATUS_LABELS[order.status] || order.status}
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                This is the live status of order <strong className="text-[var(--charcoal)]">#{order.orderNumber}</strong>.
              </p>

              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Items</p>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={item.id ?? index} className="flex items-center gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--burgundy)] text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div key={`txt-${index}`} className="min-w-0">
                          <p className="truncate font-semibold text-[var(--charcoal)]">{item.name}</p>
                          <p className="text-xs leading-5 text-[var(--muted)]">
                            Qty {item.quantity} × ₹{item.unitPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted)]">No items on this order.</p>
                )}
              </div>
            </>
          ) : searched ? (
            <div className="mt-6 text-sm leading-6 text-[var(--muted)]">
              No order found. Check the order ID and try again.
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Enter an order ID above to see its live status.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}