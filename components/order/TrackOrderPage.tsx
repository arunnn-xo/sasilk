'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, PackageSearch, Truck } from 'lucide-react'

export default function TrackOrderPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="bg-[#FAF6EE] text-[#2A1A1E]">
      <section className="border-b border-[#E8DCC4] bg-[#4A0F1C]">
        <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-[#E8C97E]">Order Support</p>
          <h1 className="text-4xl font-semibold text-[#FAF6EE] sm:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            Track Order
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#F5EDD6]">
            Enter your mobile or email with an order id to preview a simple SOIL GODDESS tracking flow.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <form
          onSubmit={event => {
            event.preventDefault()
            setSubmitted(true)
          }}
          className="rounded-lg border border-[#E8DCC4] bg-white p-5 shadow-[0_12px_34px_rgba(74,15,28,0.05)] sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5EDD6] text-[#6B1A2A]">
              <PackageSearch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#6B1A2A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Find your order
              </h2>
              <p className="text-xs text-[#7A6065]">Any dummy details will work for this UI pass.</p>
            </div>
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-[#6B1A2A]">Mobile / Email</span>
            <input
              required
              type="text"
              placeholder="+91 or email address"
              className="h-12 w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-4 text-sm outline-none transition focus:border-[#6B1A2A]"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-semibold text-[#6B1A2A]">Order ID</span>
            <input
              required
              type="text"
              placeholder="SG-1001"
              className="h-12 w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-4 text-sm outline-none transition focus:border-[#6B1A2A]"
            />
          </label>

          <button type="submit" className="w-full rounded-md bg-[#6B1A2A] py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#4A0F1C]">
            Track Order
          </button>
          <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-[#6B1A2A] underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </form>

        <div className="rounded-lg border border-[#E8DCC4] bg-white p-5 shadow-[0_12px_34px_rgba(74,15,28,0.05)] sm:p-6">
          <h2 className="text-2xl font-semibold text-[#6B1A2A]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {submitted ? 'Order preview' : 'Tracking status'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#7A6065]">
            {submitted
              ? 'Your sample order is packed and ready for dispatch. This is UI-only and does not call an order API.'
              : 'Submit the form to see a dummy tracking preview for the customer flow.'}
          </p>

          <div className="mt-6 space-y-4">
            {['Order received', 'Packed with care', 'Ready for dispatch'].map((step, index) => {
              const active = submitted || index === 0

              return (
                <div key={step} className="flex gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active ? 'bg-[#6B1A2A] text-white' : 'bg-[#F5EDD6] text-[#A58A48]'}`}>
                    {index === 2 ? <Truck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#2A1A1E]">{step}</p>
                    <p className="text-xs leading-5 text-[#7A6065]">
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
