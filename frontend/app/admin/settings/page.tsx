'use client'

import { useEffect, useState } from 'react'
import {
  fetchSettings,
  createSetting,
  updateSetting,
  deleteResource,
  type SettingData,
} from '@/lib/services/admin.service'
import { Settings, Plus, Edit, Trash2, Search } from 'lucide-react'

const emptyForm = { key: '', value: '' }
type FormState = typeof emptyForm

export default function AdminSettingsPage() {
  const [items, setItems] = useState<SettingData[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const load = () => {
    setLoading(true)
    fetchSettings(page, 50)
      .then((res) => { setItems(res.items); setTotalPages(res.totalPages) })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const resetForm = () => { setForm(emptyForm); setEditingId(null) }

  const startEdit = (item: SettingData) => {
    setForm({ key: item.key, value: JSON.stringify(item.value, null, 2) })
    setEditingId(item.id)
  }

  const parseValue = (raw: string): unknown => {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }

  const handleSave = async () => {
    const payload = { key: form.key, value: parseValue(form.value) }
    try {
      if (editingId) {
        await updateSetting(editingId, payload)
      } else {
        await createSetting(payload)
      }
      resetForm()
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this setting? This cannot be undone.')) return
    try {
      await deleteResource('settings', id)
      if (editingId === id) resetForm()
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const filtered = search
    ? items.filter((s) => s.key.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage key-value configurations and JSON store options.</p>
        </div>
        {!editingId && (
          <button
            onClick={() => resetForm()}
            className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/20 text-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Add Setting
          </button>
        )}
      </div>

      {/* Inline Form */}
      {(editingId || form.key) && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {editingId ? 'Edit Setting' : 'New Setting Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Key Name</label>
              <input
                type="text"
                value={form.key}
                onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                disabled={!!editingId}
                placeholder="e.g. shipping_methods"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Value (JSON Format)</label>
              <textarea
                rows={5}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.key}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 disabled:opacity-50"
            >
              {editingId ? 'Update Setting' : 'Create Setting'}
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
            placeholder="Search settings key..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading system configurations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No settings found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="px-4 py-3.5">Key</th>
                  <th className="px-4 py-3.5">Value</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-blue-600">{s.key}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs max-w-[420px] truncate font-mono bg-slate-50/50 rounded">
                      {JSON.stringify(s.value)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startEdit(s)}
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
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

