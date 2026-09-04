'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, AlertCircle, MapPin, Video, CalendarDays, RotateCw } from 'lucide-react'
import { fetchEventBooking, verifyEventBooking, type BookingDetail } from '@/lib/services/storefront.service'
import { formatEventDateTime } from '@/lib/utils/eventFormat'

type SigData = {
  razorpayPaymentId: string
  razorpayOrderId: string
  razorpaySignature: string
}

const sigKey = (bookingId: number) => `sas_evsig_${bookingId}`

export default function BookingConfirmation({ bookingId }: { bookingId: number }) {
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [error, setError] = useState('')
  const [stalled, setStalled] = useState(false)

  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    let attempt = 0
    let sig: SigData | null = null

    try {
      const raw = sessionStorage.getItem(sigKey(bookingId))
      if (raw) sig = JSON.parse(raw)
    } catch {
      sig = null
    }

    // Hard fallback: if still loading after 15s, show stalled UI
    const hardTimeout = setTimeout(() => {
      if (!stopped) setStalled(true)
    }, 15000)

    const poll = async () => {
      if (stopped) return
      attempt += 1
      try {
        let data = await fetchEventBooking(bookingId)

        // Already paid — show confirmation immediately
        if (data.paymentStatus === 'paid') {
          clearTimeout(hardTimeout)
          try { sessionStorage.removeItem(sigKey(bookingId)) } catch { /* ignore */ }
          if (!stopped) {
            setStalled(false)
            setBooking(data)
          }
          return
        }

        // Still pending — if we have sig data from Razorpay, verify now
        if (data.paymentStatus === 'pending' && sig) {
          try {
            await verifyEventBooking({ bookingId, ...sig })
            sig = null
            try { sessionStorage.removeItem(sigKey(bookingId)) } catch {}
            if (stopped) return
            // Re-fetch after verify
            data = await fetchEventBooking(bookingId)
            if (!stopped) {
              clearTimeout(hardTimeout)
              // Show as paid even if DB hasn't reflected yet (optimistic)
              setStalled(false)
              setBooking({ ...data, paymentStatus: 'paid' })
            }
            return
          } catch {
            sig = null
            /* verify failed or already verified — continue polling */
          }
        }

        if (stopped) return
        // Still pending after verify attempt — show booking, keep polling
        setBooking(data)
        if (attempt > 5) setStalled(true)
        const delay = attempt <= 3 ? 1500 : Math.min(3000 + attempt * 400, 7000)
        timer = setTimeout(poll, delay)
      } catch (err: any) {
        if (stopped) return
        if (attempt > 2) {
          setError(err?.message || 'Could not connect to server. Please check your connection and try again.')
        }
        if (attempt > 4) {
          setStalled(true)
          return
        }
        timer = setTimeout(poll, 3000)
      }
    }

    poll()
    return () => {
      stopped = true
      clearTimeout(timer)
      clearTimeout(hardTimeout)
    }
  }, [bookingId])

  if (stalled) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#FDFBF7] px-6">
        <div className="max-w-md rounded-2xl border border-[#D9B86E]/50 bg-white p-10 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#8B1A2B]" strokeWidth={1.5} />
          <h1 className="font-serif text-2xl font-bold text-[#300D14]">Still confirming your booking…</h1>
          <p className="font-sans mt-3 text-sm leading-6 text-[#7A6065]">
            Your payment is taking longer than usual to confirm. Don&apos;t worry — if payment succeeded, a confirmation
            email with your QR / Zoom link has been sent to your inbox, and paid bookings also appear under{' '}
            <strong>My Account → Event Bookings</strong>.
          </p>
          <p className="font-sans mt-3 text-xs text-[#8A6D4B]">This page keeps checking automatically in the background.</p>
          <button
            type="button"
            onClick={() => { setStalled(false); window.location.reload() }}
            className="font-sans mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--burgundy)] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#E8C87A] no-underline"
          >
            <RotateCw size={14} /> Refresh Now
          </button>
        </div>
      </main>
    )
  }

  if (!booking && !error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#BF9A4B]" />
          <p className="font-sans text-sm text-[#7A6065]">Confirming your booking…</p>
        </div>
      </main>
    )
  }

  if (error || !booking) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#FDFBF7] px-6">
        <div className="max-w-md rounded-2xl border border-[#D9B86E]/50 bg-white p-10 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#8B1A2B]" strokeWidth={1.5} />
          <h1 className="font-serif text-2xl font-bold text-[#300D14]">Booking not found</h1>
          <p className="font-sans mt-2 text-sm text-[#7A6065]">{error}</p>
          <Link href="/events" className="font-sans mt-6 inline-block rounded-full bg-[var(--burgundy)] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#E8C87A] no-underline">Browse Events</Link>
        </div>
      </main>
    )
  }

  const isPaid = booking.paymentStatus === 'paid'
  const pending = booking.paymentStatus === 'pending'

  return (
    <main className="min-h-[70vh] bg-[#FDFBF7] py-12 lg:py-16">
      <div className="mx-auto max-w-2xl px-4 lg:px-6">
        {isPaid ? (
          <div className="rounded-2xl border border-[#D9B86E]/60 bg-white p-8 shadow-sm">
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-[#2E7D5B]" strokeWidth={1.5} />
              <h1 className="font-serif text-3xl font-bold text-[#300D14]">Booking Confirmed!</h1>
              <p className="font-sans mt-2 text-sm text-[#7A6065]">Booking #{booking.bookingNumber}</p>
            </div>

            {booking.event && (
              <div className="mt-6 rounded-lg bg-[#F6EED8]/60 p-4">
                <p className="font-serif text-lg font-bold text-[#300D14]">{booking.event.name}</p>
                <p className="font-sans mt-1 flex items-center gap-2 text-sm text-[#5A4A3F]">
                  <CalendarDays size={14} className="text-[#8A6D4B]" /> {formatEventDateTime(booking.event.eventDate, booking.event.startTime)} – {booking.event.endTime}
                </p>
              </div>
            )}

            {booking.mode === 'offline' && booking.qrImage && (
              <div className="mt-8 text-center">
                <p className="font-montserrat mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#8A6D4B]">Your entry QR</p>
                <div className="inline-block rounded-2xl border-2 border-[#D9B86E] bg-white p-4">
                  <img src={booking.qrImage} alt="Event entry QR" className="h-56 w-56" />
                </div>
                <p className="font-sans mx-auto mt-4 max-w-sm text-xs leading-5 text-[#7A6065]">
                  Show this QR at the venue entrance. Staff will scan it for check-in. It has also been emailed to you.
                </p>
                {booking.event?.venueAddress && (
                  <p className="font-sans mt-3 flex items-center justify-center gap-1.5 text-xs text-[#5A4A3F]"><MapPin size={13} className="text-[#8A6D4B]" /> {booking.event.venueAddress}</p>
                )}
              </div>
            )}

            {booking.mode === 'online' && booking.zoomLink && (
              <div className="mt-8 rounded-xl border border-[#2B4C9B]/30 bg-[#2B4C9B]/5 p-6 text-center">
                <p className="font-montserrat mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#2B4C9B]">Your Zoom access</p>
                <Video className="mx-auto mb-2 h-8 w-8 text-[#2B4C9B]" strokeWidth={1.5} />
                <a
                  href={booking.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans inline-block rounded-lg bg-[#2B4C9B] px-8 py-3.5 text-sm font-bold text-white no-underline hover:opacity-90"
                >
                  Join Event on Zoom
                </a>
                <p className="font-sans mt-4 break-all text-xs text-[#5A4A3F]">{booking.zoomLink}</p>
                <p className="font-sans mt-2 text-[11px] text-[#7A6065]">The link has also been emailed to you. Use the same email from your booking.</p>
              </div>
            )}

            {/* Instant WhatsApp Ticket Button */}
            <div className="mt-6 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 p-4 text-center">
              <p className="font-sans text-xs text-[#1F513F] font-medium mb-3">
                📱 Booking details & entry ticket are also ready on WhatsApp:
              </p>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🌿 *Soil Goddess* — Booking Confirmation 🌿\n\n` +
                  `Hello *${booking.customerName || 'Valued Guest'}*,\n` +
                  `Your booking for *${booking.event?.name || 'Masterclass'}* is confirmed!\n\n` +
                  `📋 *Booking Ref:* ${booking.bookingNumber}\n` +
                  `📅 *Date & Time:* ${booking.event ? formatEventDateTime(booking.event.eventDate, booking.event.startTime) : ''}\n` +
                  `🎟️ *Seats:* ${booking.quantity || 1}\n` +
                  (booking.mode === 'offline' && booking.event?.venueAddress ? `📍 *Venue:* ${booking.event.venueAddress}\n` : '') +
                  (booking.mode === 'online' && booking.zoomLink ? `🔗 *Zoom Link:* ${booking.zoomLink}\n` : '') +
                  `\nWe look forward to hosting you! ✨\n*Team Soil Goddess*`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] px-6 py-3 text-xs sm:text-sm font-bold text-white no-underline transition-all shadow-sm hover:shadow active:scale-[0.98]"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                Receive / Open Ticket in WhatsApp
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-center">
              <Link href="/events" className="font-sans rounded-lg border border-[#D9B86E]/70 bg-[#F6EED8]/50 py-2.5 text-xs font-bold uppercase tracking-widest text-[#5A1827] no-underline">More Events</Link>
              <Link href="/" className="font-sans rounded-lg bg-[var(--burgundy)] py-2.5 text-xs font-bold uppercase tracking-widest text-[#E8C87A] no-underline">Back to Home</Link>
            </div>
          </div>
        ) : pending ? (
          <div className="rounded-2xl border border-[#D9B86E]/60 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#BF9A4B]" />
            <h1 className="font-serif text-2xl font-bold text-[#300D14]">Confirming payment…</h1>
            <p className="font-sans mt-2 text-sm text-[#7A6065]">We are waiting for your payment confirmation. This page refreshes automatically.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#D9B86E]/60 bg-white p-10 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#8B1A2B]" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl font-bold text-[#300D14]">Payment not completed</h1>
            <p className="font-sans mt-2 text-sm text-[#7A6065]">Your booking was not confirmed. You can try booking again from the events page.</p>
            <Link href="/events" className="font-sans mt-6 inline-block rounded-full bg-[var(--burgundy)] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#E8C87A] no-underline">Browse Events</Link>
          </div>
        )}
      </div>
    </main>
  )
}