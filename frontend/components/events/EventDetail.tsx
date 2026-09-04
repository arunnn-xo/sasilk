'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Video, CalendarDays, Users, Lock, Smartphone, Mail, User as UserIcon, AlertCircle } from 'lucide-react'
import { bookEvent, fetchEventBooking, verifyEventBooking, type EventItem } from '@/lib/services/storefront.service'
import { loadRazorpayScript, type RazorpayResponse } from '@/lib/razorpay'
import { resolveImageUrl } from '@/lib/api/client'
import { formatEventDateTime, formatTime12h } from '@/lib/utils/eventFormat'
import EventGallery from './EventGallery'
import EventVideoPlayer from './EventVideoPlayer'

type Mode = 'offline' | 'online'

export default function EventDetail({ event }: { event: EventItem }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('offline')
  const [quantity, setQuantity] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)

  const allowedModes: Mode[] = ['offline', 'online'].filter(m => event.mode === 'both' || event.mode === m) as Mode[]
  const effectiveMode = allowedModes.includes(mode) ? mode : allowedModes[0]
  const maxQty = Math.min(10, typeof event.seatsLeft === 'number' ? event.seatsLeft || 0 : 10)
  const bookingClosed = event.bookingClosed || event.isPast

  async function handleBook() {
    setError('')
    if (!customerName.trim() || customerName.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!/^[6-9]\d{9}$/.test(customerMobile)) {
      setError('Please enter a valid 10-digit mobile number (starts with 6-9).')
      return
    }
    if (quantity < 1) {
      setError('Please select at least 1 ticket.')
      return
    }
    if (typeof event.seatsLeft === 'number' && quantity > event.seatsLeft) {
      setError(`Only ${event.seatsLeft} seat(s) left for this event.`)
      return
    }
    if (!accepted) {
      setError('Please accept the non-refundable & non-cancellable policy to continue.')
      return
    }

    setBusy(true)
    try {
      const booking = await bookEvent(event.slug, {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerMobile,
        mode: effectiveMode,
        quantity,
      })

      if (!booking.razorpayOrderId) {
        if (booking.status === 'confirmed') {
          router.push(`/events/confirmation/${booking.bookingId}`)
          return
        }
        throw new Error('Payment could not be initialized. Please try again.')
      }

      await loadRazorpayScript()
      const rzp = new window.Razorpay!({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: booking.amount,
        currency: booking.currency || 'INR',
        name: 'Soil Goddess',
        description: `Event booking ${booking.bookingNumber}`,
        order_id: booking.razorpayOrderId,
        handler: async function (response: RazorpayResponse) {
          const sigKey = `sas_evsig_${booking.bookingId}`
          try {
            sessionStorage.setItem(sigKey, JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }))
          } catch {
            /* storage unavailable — verification still runs here as fallback */
          }

          const confirmUrl = `/events/confirmation/${booking.bookingId}`
          try {
            await verifyEventBooking({
              bookingId: booking.bookingId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            })
            try { sessionStorage.removeItem(sigKey) } catch {}
          } catch {
            /* verification failed on client — confirmation page will retry via sessionStorage sig */
          }
          // Always navigate to confirmation page (either already verified or will verify there)
          window.location.href = confirmUrl
        },
        modal: {
          ondismiss: function () {
            setBusy(false)
            if (booking.razorpayOrderId) {
              setTimeout(() => {
                fetchEventBooking(booking.bookingId)
                  .then(existing => {
                    if (existing.paymentStatus === 'paid') {
                      router.push(`/events/confirmation/${existing.id}`)
                    }
                  })
                  .catch(() => {})
              }, 1200)
            }
          },
        },
        prefill: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          contact: customerMobile,
        },
        theme: { color: '#8B1A2B' },
      })
      rzp.open()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  const priceTotal = Number(event.price) * quantity

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <section className="relative overflow-hidden border-b border-[#D9B86E]/40 py-12 lg:py-16" style={{ background: 'linear-gradient(160deg,#5A1827 0%,#8B1A2B 55%,#5A1827 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {event.imageUrl ? (
              <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl md:w-72">
                <img src={resolveImageUrl(event.imageUrl)} alt={event.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-48 w-full shrink-0 items-center justify-center rounded-2xl bg-[#300D14] md:w-72">
                <CalendarDays className="h-14 w-14 text-[#E8C87A]" strokeWidth={1.3} />
              </div>
            )}
            <div className="flex-1">
              <p className="font-montserrat mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#E8C87A]">Soil Goddess Event</p>
              <h1 className="font-serif text-3xl font-bold text-[#FAF6EE] lg:text-4xl">{event.name}</h1>
              <div className="font-sans mt-4 space-y-1.5 text-sm text-[#F3E7D3]/90">
                <p className="flex items-center gap-2"><CalendarDays size={14} className="text-[#E8C87A]" /> {formatEventDateTime(event.eventDate, event.startTime)} – {formatTime12h(event.endTime)}</p>
                {event.mode !== 'offline' && <p className="flex items-center gap-2"><Video size={14} className="text-[#E8C87A]" /> Join live on Zoom</p>}
                {event.mode !== 'online' && event.venueAddress && <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-[#E8C87A]" /> {event.venueAddress}</p>}
                {typeof event.seatsLeft === 'number' && (
                  <p className="flex items-center gap-2"><Users size={14} className="text-[#E8C87A]" /> {event.seatsLeft > 0 ? `${event.seatsLeft} seat${event.seatsLeft === 1 ? '' : 's'} left` : 'Sold out'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 lg:px-6 py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            <EventGallery
              images={event.images}
              eventName={event.name}
              coverImageUrl={event.imageUrl}
            />

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#300D14]">About this event</h2>
              <p className="font-sans mt-4 whitespace-pre-line text-sm leading-7 text-[#5A4A3F]">{event.description || 'No description provided yet.'}</p>
            </div>

            <EventVideoPlayer
              videoUrl={event.videoUrl}
              eventName={event.name}
              posterImageUrl={event.imageUrl}
            />
          </div>

          <aside className="h-fit rounded-2xl border border-[#D9B86E]/60 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="font-serif text-xl font-bold text-[#300D14]">Book your spot</h2>

            {bookingClosed ? (
              <div className="mt-6 rounded-xl border border-[#D9B86E]/50 bg-[#F6EED8]/60 p-6 text-center">
                <Lock className="mx-auto mb-3 h-8 w-8 text-[#8A6D4B]" strokeWidth={1.5} />
                <p className="font-montserrat text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A6D4B]">Booking Closed</p>
                <p className="font-sans mt-2 text-xs text-[#7A6065]">{event.isPast ? 'This event has already started.' : 'Bookings closed 1 hour before the event start time.'}</p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {event.mode === 'both' && (
                  <div>
                    <p className="font-montserrat mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6D4B]">How will you attend?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMode('offline')}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors ${effectiveMode === 'offline' ? 'border-[var(--burgundy)] bg-[var(--burgundy)] text-[#E8C87A]' : 'border-[#D9B86E]/70 bg-[#F6EED8]/50 text-[#5A1827] hover:bg-[#F6EED8]'}`}
                      >
                        <MapPin size={14} /> In-person
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('online')}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors ${effectiveMode === 'online' ? 'border-[var(--burgundy)] bg-[var(--burgundy)] text-[#E8C87A]' : 'border-[#D9B86E]/70 bg-[#F6EED8]/50 text-[#5A1827] hover:bg-[#F6EED8]'}`}
                      >
                        <Video size={14} /> Online (Zoom)
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="font-montserrat mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6D4B]">Tickets</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={quantity <= 1 || maxQty === 0}
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="h-9 w-9 rounded-lg border border-[#D9B86E]/70 bg-[#F6EED8]/60 text-lg font-bold text-[#5A1827] disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center font-serif text-lg font-bold text-[#300D14]">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= maxQty || maxQty === 0}
                      onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                      className="h-9 w-9 rounded-lg border border-[#D9B86E]/70 bg-[#F6EED8]/60 text-lg font-bold text-[#5A1827] disabled:opacity-40"
                    >
                      +
                    </button>
                    <span className="font-sans ml-auto text-xs text-[#7A6065]">₹{Number(event.price).toFixed(2)} / ticket</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6D4B]" />
                    <input
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      className="w-full rounded-lg border border-[#D9B86E]/70 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--burgundy)]"
                    />
                  </div>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6D4B]" />
                    <input
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      type="email"
                      placeholder="Email address"
                      className="w-full rounded-lg border border-[#D9B86E]/70 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--burgundy)]"
                    />
                  </div>
                  <div className="relative">
                    <Smartphone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6D4B]" />
                    <input
                      value={customerMobile}
                      onChange={e => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      className="w-full rounded-lg border border-[#D9B86E]/70 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--burgundy)]"
                    />
                  </div>
                </div>

                <div className="border-t border-[#D9B86E]/50 pt-4">
                  <div className="flex items-center justify-between font-sans text-sm">
                    <span className="text-[#7A6065]">{quantity} × ₹{Number(event.price).toFixed(2)}</span>
                    <span className="font-serif text-xl font-bold text-[var(--burgundy)]">₹{priceTotal.toFixed(2)}</span>
                  </div>
                  <p className="font-sans mt-1 text-[11px] text-[#8A6D4B]">
                    {effectiveMode === 'online' ? 'Paid confirmation unlocks the Zoom link.' : 'Your unique entry QR is sent to your email on payment.'}
                  </p>
                  <div className="mt-4 rounded-lg border border-[#8B1A2B]/30 bg-[#8B1A2B]/5 p-3.5">
                    <p className="flex items-start gap-2 text-[11px] leading-5 text-[#8B1A2B]">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" />
                      <span><strong>Non-refundable &amp; non-cancellable.</strong> Once paid, your booking is final — no refunds, cancellations, or reschedules on this booking.</span>
                    </p>
                    <label className="mt-2.5 flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={e => setAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded accent-[var(--burgundy)]"
                      />
                      <span className="text-[11px] text-[#5A4A3F]">I understand and accept this policy.</span>
                    </label>
                  </div>
                  {error && <p className="font-sans mt-3 rounded-lg bg-[#8B1A2B]/10 px-3 py-2 text-xs text-[#8B1A2B]">{error}</p>}
                  <button
                    type="button"
                    onClick={handleBook}
                    disabled={busy || maxQty === 0 || !accepted}
                    className="font-sans mt-4 w-full rounded-lg bg-[var(--burgundy)] py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-[#E8C87A] transition-colors hover:bg-[#6E1220] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? 'Processing…' : `Book Now · ₹${priceTotal.toFixed(2)}`}
                  </button>
                  <p className="font-sans mt-3 text-center text-[10px] text-[#8A6D4B]">Secure payments via Razorpay</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}