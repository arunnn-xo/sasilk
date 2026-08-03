'use client'

import { useEffect, useState } from 'react'
import {
  fetchResource,
  fetchResourceItem,
  createResource,
  updateResource,
  deleteResource,
  type AnnouncementData,
} from '@/lib/services/admin.service'
import { Megaphone, Plus, Edit, Trash2, Search } from 'lucide-react'

const emptyForm = { text: '', linkUrl: '', sortOrder: 0, active: true, startsAt: '', endsAt: '' }
type FormState = typeof emptyForm

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementData[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const load = () => {
    setLoading(true)
    fetchResource<AnnouncementData>('announcements', page, 20)
      .then((res) => { setItems(res.items); setTotalPages(res.totalPages) })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const resetForm = () => { setForm(emptyForm); setEditingId(null) }

  const startEdit = async (id: number) => {
    try {
      const { item } = await fetchResourceItem<AnnouncementData>('announcements', id)
      setForm({
        text: item.text,
        linkUrl: item.linkUrl ?? '',
        sortOrder: item.sortOrder,
        active: item.active,
        startsAt: item.startsAt ?? '',
        endsAt: item.endsAt ?? '',
      })
      setEditingId(id)
    } catch {
      alert('Failed to load announcement')
    }
  }

  const handleSave = async () => {
    const payload = {
      text: form.text,
      linkUrl: form.linkUrl || null,
      sortOrder: form.sortOrder,
      active: form.active,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
    }
    try {
      if (editingId) {
        await updateResource<AnnouncementData>('announcements', editingId, payload)
      } else {
        await createResource<AnnouncementData>('announcements', payload)
      }
      resetForm()
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement? This cannot be undone.')) return
    try {
      await deleteResource('announcements', id)
      if (editingId === id) resetForm()
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const filtered = search
    ? items.filter((a) => a.text.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Announcements & Tickers</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage top bar announcements and promo notifications.</p>
        </div>
        {!editingId && (
          <button
            onClick={() => resetForm()}
            className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/20 text-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Add Announcement
          </button>
        )}
      </div>

      {/* Inline Form */}
      {(editingId || form.text) && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {editingId ? 'Edit Announcement' : 'New Announcement Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-400 mb-1">Announcement Text</label>
              <input
                type="text"
                value={form.text}
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                placeholder="e.g. Free shipping on orders over ₹1,999!"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Link URL (Optional)</label>
              <input
                type="text"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/shop/festive"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4"
                />
                <span className="text-sm font-semibold text-slate-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.text}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 disabled:opacity-50"
            >
              {editingId ? 'Update Announcement' : 'Create Announcement'}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Floating White Card Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading announcements...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No announcements found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="px-4 py-3.5">Text</th>
                  <th className="px-4 py-3.5">Link URL</th>
                  <th className="px-4 py-3.5 text-right">Sort Order</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-800 max-w-[280px] truncate">{a.text}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs max-w-[200px] truncate">{a.linkUrl || '—'}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-700">{a.sortOrder}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                          a.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {a.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startEdit(a.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

