import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, QrCode, UserCheck, Clock } from 'lucide-react'
import { apiFetch } from '../services/api'

type BookingRow = {
  id: number
  bookingNumber?: string
  customerName?: string
  customerEmail?: string
  customerMobile?: string
  quantity?: number | string
  total?: number | string
  paymentStatus?: string
  checkedIn?: boolean | number
  checkInAt?: string | null
  qrToken?: string
  mode?: string
}

export default function EventBookingsPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<{ name?: string; price?: number | string } | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const statusQuery = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const [evRes, bkRes] = await Promise.all([
        apiFetch<{ event: any }>(`/admin/events/${eventId}`),
        apiFetch<{ bookings: BookingRow[] }>(`/admin/events/${eventId}/bookings${statusQuery}`),
      ])
      setEvent(evRes.event)
      setBookings(bkRes.bookings ?? [])
    } catch (err: any) {
      setError(err?.message || 'Could not load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) load()
  }, [eventId, statusFilter])

  async function handleCheckIn(booking: BookingRow) {
    const name = booking.customerName || booking.customerEmail || `#${booking.id}`
    if (!window.confirm(`Check in ${name}?`)) return
    try {
      await apiFetch(`/admin/events/${eventId}/checkin`, { method: 'POST', body: JSON.stringify({ qrToken: booking.qrToken }) })
      await load()
    } catch (err: any) {
      window.alert(err?.message || 'Check-in failed.')
    }
  }

  function statusBadge(status?: string) {
    const s = String(status ?? '').toUpperCase()
    const map: Record<string, string> = {
      PAID: 'bg-green-100 text-green-700',
      PENDING: 'bg-amber-100 text-amber-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-600',
    }
    return (
      <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
        {s}
      </span>
    )
  }

  function ModeTag({ mode }: { mode?: string }) {
    if (mode === 'online') return <span className="ml-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-600">Online</span>
    if (mode === 'offline') return <span className="ml-1.5 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-600">In-person</span>
    return null
  }

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => navigate('/events')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{event?.name ?? 'Event Bookings'}</h1>
          <p className="text-sm text-gray-500">
            {bookings.length} booking{bookings.length === 1 ? '' : 's'}
            {event?.price ? ` · ₹${Number(event.price).toFixed(2)} each` : ''}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Payment status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8B1A2B]"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <QrCode className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No bookings for this event yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => {
                const isCheckedIn = Boolean(b.checkedIn)
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gray-700">{b.bookingNumber}</p>
                      <ModeTag mode={b.mode} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{b.customerName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{b.customerEmail}</p>
                      <p className="text-xs text-gray-400">{b.customerMobile}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.quantity ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{b.total ? `₹${Number(b.total).toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3">{statusBadge(b.paymentStatus)}</td>
                    <td className="px-4 py-3">
                      {isCheckedIn ? (
                        <span className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-indigo-600">
                          <CheckCircle2 size={14} /> Checked in
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not checked in</span>
                      )}
                      {b.checkInAt ? (
                        <span className="mt-0.5 flex items-center gap-0.5 text-[11px] text-gray-400">
                          <Clock size={11} /> {new Date(b.checkInAt).toLocaleString()}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.customerMobile && (
                          <a
                            href={`https://wa.me/${(b.customerMobile.replace(/\D/g, '').startsWith('91') ? b.customerMobile.replace(/\D/g, '') : `91${b.customerMobile.replace(/\D/g, '')}`)}?text=${encodeURIComponent(
                              `🌿 *Soil Goddess* — Booking Confirmation 🌿\n\n` +
                              `Hello *${b.customerName || 'Valued Guest'}*,\n` +
                              `Thank you for registering with us! Your booking for *${event?.name || 'Soil Goddess Event'}* is confirmed.\n\n` +
                              `📋 *Booking Ref:* ${b.bookingNumber}\n` +
                              `🎟️ *Seats:* ${b.quantity ?? 1}\n` +
                              `💰 *Amount Paid:* ${b.total ? `₹${Number(b.total).toFixed(2)}` : 'FREE'}\n` +
                              (b.qrToken ? `✦ *Pass ID:* ${b.qrToken}\n` : '') +
                              `\nNeed assistance? Reply to this message directly.\n*Team Soil Goddess*`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#20bd5a] shadow-sm transition-all"
                            title="Send WhatsApp confirmation from Admin WhatsApp to Customer"
                          >
                            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            WhatsApp
                          </a>
                        )}

                        {(() => {
                          const isCheckedIn = Boolean(b.checkedIn)
                          const canCheckIn = Boolean(b.qrToken) && String(b.paymentStatus).toLowerCase() === 'paid'
                          if (isCheckedIn) {
                            return <span className="text-xs font-semibold text-indigo-600">Done</span>
                          }
                          if (!canCheckIn) {
                            return <span className="text-xs text-gray-300">—</span>
                          }
                          return (
                            <button
                              type="button"
                              onClick={() => handleCheckIn(b)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                            >
                              <UserCheck size={14} /> Check in
                            </button>
                          )
                        })()}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}