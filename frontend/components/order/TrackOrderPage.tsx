'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, PackageSearch, Truck } from 'lucide-react'

export default function TrackOrderPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="bg-[var(--ivory)] text-[var(--charcoal)]">
      <section className="border-b border-[var(--ivory-dark)] bg-[var(--burgundy-dark)]">
        <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <p className="font-montserrat mb-3 text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] text-[var(--gold-light)]">Order Support</p>
          <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-medium tracking-wide text-[var(--ivory)]">
            Track Order
          </h1>
          <p className="font-sans mt-4 max-w-2xl text-sm sm:text-base font-medium leading-relaxed text-[var(--gold-pale)]">
            Enter your mobile or email with an order id to preview a simple Soil Goddess tracking flow.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <form
          onSubmit={event => {
            event.preventDefault()
            setSubmitted(true)
          }}
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
              <p className="text-xs text-[var(--muted)]">Any dummy details will work for this UI pass.</p>
            </div>
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-[var(--burgundy)]">Mobile / Email <span className="text-red-500">*</span></span>
            <input
              required
              type="text"
              placeholder="+91 or email address"
              className="h-12 w-full rounded-md border border-[var(--ivory-dark)] bg-[var(--surface-soft)] px-4 text-sm outline-none transition focus:border-[var(--burgundy)]"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-semibold text-[var(--burgundy)]">Order ID <span className="text-red-500">*</span></span>
            <input
              required
              type="text"
              placeholder="SG-1001"
              className="h-12 w-full rounded-md border border-[var(--ivory-dark)] bg-[var(--surface-soft)] px-4 text-sm outline-none transition focus:border-[var(--burgundy)]"
            />
          </label>

          <button type="submit" className="w-full rounded-md bg-[var(--burgundy)] py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--burgundy-dark)]">
            Track Order
          </button>
          <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-[var(--burgundy)] underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </form>

        <div className="rounded-lg border border-[var(--ivory-dark)] bg-white p-5 shadow-[0_12px_34px_rgba(74,15,28,0.05)] sm:p-6">
          <h2 className="font-playfair text-2xl sm:text-3xl font-medium italic tracking-wide text-[var(--burgundy)]">
            {submitted ? 'Order preview' : 'Tracking status'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {submitted
              ? 'Your sample order is packed and ready for dispatch. This is UI-only and does not call an order API.'
              : 'Submit the form to see a dummy tracking preview for the customer flow.'}
          </p>

          <div className="mt-6 space-y-4">
            {['Order received', 'Packed with care', 'Ready for dispatch'].map((step, index) => {
              const active = submitted || index === 0

              return (
                <div key={step} className="flex gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active ? 'bg-[var(--burgundy)] text-white' : 'bg-[var(--gold-pale)] text-[var(--gold)]'}`}>
                    {index === 2 ? <Truck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--charcoal)]">{step}</p>
                    <p className="text-xs leading-5 text-[var(--muted)]">
                      {active ? 'Completed in this preview flow.' : 'Waiting for lookup details.'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
