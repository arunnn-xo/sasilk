import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Video, Pencil, Trash2, Ticket, Plus } from 'lucide-react'
import { apiFetch } from '../services/api'

type EventRow = {
  id: number
  name: string
  slug: string
  eventDate: string
  startTime: string
  endTime: string
  price: string | number
  mode: 'offline' | 'online' | 'both'
  venueAddress: string | null
  zoomLink: string | null
  capacity: number | null
  isActive: boolean | number
  paidBookings?: number
}

function fmtDateTime(event: EventRow) {
  return `${event.eventDate} · ${event.startTime} – ${event.endTime}`
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch<{ events: EventRow[] }>('/admin/events?includePast=true')
      setEvents(res.events ?? [])
    } catch (err: any) {
      setError(err?.message || 'Could not load events.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this event? This cannot be undone.')) return
    setDeleting(id)
    try {
      await apiFetch(`/admin/events/${id}`, { method: 'DELETE' })
      await load()
    } catch (err: any) {
      window.alert(err?.message || 'Delete failed.')
    } finally {
      setDeleting(null)
    }
  }

  function ModeBadge({ mode }: { mode: EventRow['mode'] }) {
    if (mode === 'both') return <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">In-person + Online</span>
    if (mode === 'offline') return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"><MapPin size={12} /> In-person</span>
    return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700"><Video size={12} /> Online</span>
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Events</h1>
          <p className="text-sm text-gray-500">Create events customers can book via “Book Now”.</p>
        </div>
        <Link
          to="/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#8B1A2B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6E1220]"
        >
          <Plus size={16} /> New Event
        </Link>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No events yet. Create your first event.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Paid Seats</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{event.name}</p>
                    <p className="text-xs text-gray-400">{event.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmtDateTime(event)}</td>
                  <td className="px-4 py-3"><ModeBadge mode={event.mode} /></td>
                  <td className="px-4 py-3 font-semibold text-gray-800">₹{Number(event.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {event.capacity ? `${event.paidBookings ?? 0} / ${event.capacity}` : `${event.paidBookings ?? 0}`}
                  </td>
                  <td className="px-4 py-3">
                    {Number(event.isActive) ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Active</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/events/${event.id}/bookings`}
                        title="Bookings"
                        className="rounded-lg p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Ticket size={16} />
                      </Link>
                      <Link
                        to={`/events/${event.id}`}
                        title="Edit"
                        className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        disabled={deleting === event.id}
                        onClick={() => handleDelete(event.id)}
                        title="Delete"
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}