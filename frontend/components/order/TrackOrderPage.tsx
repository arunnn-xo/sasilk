'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, PackageSearch, Truck } from 'lucide-react'

export default function TrackOrderPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="bg-[#FAF6EE] text-[#2A1A1E] min-h-screen">
      <section className="border-b border-[#D9B86E]/50 bg-[#FAF6EE]">
        <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#A57C3A]">Order Support</p>
          <h1 className="text-3xl font-bold text-[#300D14] sm:text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            Track Order
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5A4045]">
            Enter your mobile or email with an order id to preview your SOIL GODDESS tracking status.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-6 px-4 py-10 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <form
          onSubmit={event => {
            event.preventDefault()
            setSubmitted(true)
          }}
          className="rounded-xl border border-[#D9B86E]/60 bg-white p-6 shadow-[0_12px_34px_rgba(42,26,30,0.06)] sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF6EE] border border-[#D9B86E]/50 text-[#721016]">
              <PackageSearch className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#300D14]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Find your order
              </h2>
              <p className="text-xs text-[#7A6065]">Enter your tracking details below.</p>
            </div>
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#300D14]">Mobile / Email</span>
            <input
              required
              type="text"
              placeholder="+91 or email address"
              className="h-12 w-full rounded-lg border border-[#D9B86E]/70 bg-[#FAF6EE]/50 px-4 text-sm text-[#2A1A1E] outline-none transition focus:border-[#721016] focus:bg-white"
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#300D14]">Order ID</span>
            <input
              required
              type="text"
              placeholder="SG-1001"
              className="h-12 w-full rounded-lg border border-[#D9B86E]/70 bg-[#FAF6EE]/50 px-4 text-sm text-[#2A1A1E] outline-none transition focus:border-[#721016] focus:bg-white"
            />
          </label>

          <button type="submit" className="w-full rounded-lg bg-[#300D14] py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#F2C94C] shadow-md transition hover:bg-[#5A1827]">
            Track Order
          </button>
          <Link href="/shop" className="mt-4 block text-center text-xs font-semibold uppercase tracking-wider text-[#721016] underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </form>

        <div className="rounded-xl border border-[#D9B86E]/60 bg-white p-6 shadow-[0_12px_34px_rgba(42,26,30,0.06)] sm:p-8">
          <h2 className="text-2xl font-bold text-[#300D14]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {submitted ? 'Order preview' : 'Tracking status'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5A4045]">
            {submitted
              ? 'Your sample order is packed and ready for dispatch. This is UI-only and does not call an order API.'
              : 'Submit the form to see a dummy tracking preview for the customer flow.'}
          </p>

          <div className="mt-8 space-y-5">
            {['Order received', 'Packed with care', 'Ready for dispatch'].map((step, index) => {
              const active = submitted || index === 0

              return (
                <div key={step} className="flex gap-4 items-start">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${active ? 'bg-[#300D14] border-[#300D14] text-[#F2C94C] shadow-sm' : 'bg-[#FAF6EE] border-[#D9B86E]/50 text-[#A58A48]'}`}>
                    {index === 2 ? <Truck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#300D14]">{step}</p>
                    <p className="text-xs leading-5 text-[#7A6065] mt-0.5">
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
