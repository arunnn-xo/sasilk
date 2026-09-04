import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, MapPin, Video, Users } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import { fetchEvents, type EventItem } from '@/lib/services/storefront.service'
import { resolveImageUrl } from '@/lib/api/client'
import { formatEventDateTime } from '@/lib/utils/eventFormat'

export const metadata: Metadata = {
  title: 'Events | Soil Goddess',
  description: 'Book Soil Goddess events — in-person and online (Zoom). Reserve your spot before it fills up.',
}

function ModePill({ mode }: { mode: EventItem['mode'] }) {
  if (mode === 'both') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-[#8B1A2B]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--burgundy)]">In-person + Online</span>
  }
  if (mode === 'offline') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-[#2E7D5B]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2E7D5B]"><MapPin size={11} /> In-person</span>
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-[#2B4C9B]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2B4C9B]"><Video size={11} /> Online (Zoom)</span>
}

export default async function EventsPage() {
  let events: EventItem[] = []
  let error = ''
  try {
    events = await fetchEvents()
  } catch (err: any) {
    error = err?.message || 'Could not load events.'
  }

  const upcoming = events.filter(e => !e.isPast)
  const past = events.filter(e => e.isPast)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FDFBF7]">
        <section className="relative overflow-hidden border-b border-[#D9B86E]/40 py-14 lg:py-20 text-center" style={{ background: 'linear-gradient(160deg,#5A1827 0%,#8B1A2B 55%,#5A1827 100%)' }}>
          <div className="mx-auto max-w-3xl px-6">
            <p className="font-montserrat mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-[#E8C87A]">Soil Goddess</p>
            <h1 className="font-serif text-3xl lg:text-5xl font-bold text-[#FAF6EE]">Upcoming Events</h1>
            <p className="font-sans mt-4 text-sm text-[#F3E7D3]/85">Join us in person or live on Zoom. Bookings close 1 hour before the event start time.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 lg:px-6 py-12 lg:py-16">
          {error && (
            <p className="font-sans rounded-lg border border-[#D9B86E]/60 bg-white p-4 text-sm text-[#7A6065]">{error}</p>
          )}

          {!error && upcoming.length === 0 && past.length === 0 && (
            <div className="rounded-2xl border border-[#D9B86E]/50 bg-white p-14 text-center">
              <CalendarDays className="mx-auto mb-4 h-12 w-12 text-[#BF9A4B]" strokeWidth={1.4} />
              <h2 className="font-serif text-2xl font-bold text-[#300D14]">No events right now</h2>
              <p className="font-sans mt-2 text-sm text-[#7A6065]">Check back soon — we will announce new events here.</p>
              <Link href="/" className="font-sans mt-6 inline-block rounded-full bg-[var(--burgundy)] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#E8C87A] hover:opacity-90 no-underline">Back to Home</Link>
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map(event => (
                <article key={event.id} className="group flex flex-col overflow-hidden rounded-2xl border border-[#D9B86E]/50 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
                  <div className="relative h-44 overflow-hidden bg-[#F6EED8]">
                    {event.imageUrl ? (
                      <img src={resolveImageUrl(event.imageUrl)} alt={event.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(135deg,#8B1A2B,#5A1827)' }}>
                        <CalendarDays className="h-12 w-12 text-[#E8C87A]" strokeWidth={1.3} />
                      </div>
                    )}
                    <div className="absolute left-3 top-3"><ModePill mode={event.mode} /></div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-montserrat text-[10px] font-bold uppercase tracking-[0.2em] text-[#BF9A4B]">{formatEventDateTime(event.eventDate, event.startTime)}</p>
                    <h2 className="font-serif mt-1.5 text-xl font-bold leading-snug text-[#300D14]">{event.name}</h2>
                    {event.mode !== 'online' && event.venueAddress && (
                      <p className="font-sans mt-1 flex items-start gap-1 text-xs text-[#7A6065]"><MapPin size={12} className="mt-0.5 shrink-0" /> {event.venueAddress}</p>
                    )}
                    {event.mode !== 'offline' && event.zoomLink && (
                      <p className="font-sans mt-1 flex items-center gap-1 text-xs text-[#7A6065]"><Video size={12} /> Live on Zoom</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div>
                        <p className="font-sans text-[11px] uppercase tracking-wider text-[#7A6065]">Entry</p>
                        <p className="font-serif text-lg font-bold text-[var(--burgundy)]">₹{Number(event.price).toFixed(2)}</p>
                      </div>
                      {event.bookingClosed ? (
                        <span className="font-sans rounded-full bg-[#EEE7D8] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#7A6065]">Booking Closed</span>
                      ) : (
                        <Link href={`/events/${event.slug}`} className="font-sans rounded-full bg-[var(--burgundy)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#E8C87A] transition-colors hover:bg-[#6E1220] no-underline">Book Now</Link>
                      )}
                    </div>
                    {typeof event.seatsLeft === 'number' && (
                      <p className="font-sans mt-2 text-[10px] text-[#8A6D4B]"><Users size={10} className="mr-1 inline" /> {event.seatsLeft > 0 ? `${event.seatsLeft} seat${event.seatsLeft === 1 ? '' : 's'} left` : 'Sold out'}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="mt-16">
              <h2 className="font-serif mb-5 text-2xl font-bold text-[#300D14]">Past Events</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map(event => (
                  <div key={event.id} className="flex items-center justify-between rounded-xl border border-[#D9B86E]/40 bg-white/70 px-4 py-3 opacity-80">
                    <div>
                      <p className="font-serif font-bold text-[#300D14]">{event.name}</p>
                      <p className="font-sans text-xs text-[#7A6065]">{formatEventDateTime(event.eventDate, event.startTime)}</p>
                    </div>
                    <span className="font-montserrat rounded-full bg-[#EEE7D8] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#7A6065]">Ended</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}