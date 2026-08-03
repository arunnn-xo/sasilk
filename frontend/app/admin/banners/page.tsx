'use client'

import { Fragment, useEffect, useState } from 'react'
import { fetchResource, createResource, updateResource, deleteResource, type BannerData } from '@/lib/services/admin.service'
import { Image as ImageIcon, Plus, Edit, Trash2, Search } from 'lucide-react'

const emptyForm = {
  placement: '',
  title: '',
  subtitle: '',
  imageUrl: '',
  ctaLabel: '',
  ctaUrl: '',
  sortOrder: 0,
  active: true,
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerData[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<BannerData>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<Partial<BannerData>>({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetchResource<BannerData>('banners', page, 20)
      .then(res => { setBanners(res.items); setTotalPages(res.totalPages) })
      .catch(() => setBanners([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleExpand = (banner: BannerData) => {
    if (expandedId === banner.id) {
      setExpandedId(null)
    } else {
      setExpandedId(banner.id)
      setEditForm({
        placement: banner.placement,
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        ctaLabel: banner.ctaLabel,
        ctaUrl: banner.ctaUrl,
        sortOrder: banner.sortOrder,
        active: banner.active,
      })
    }
  }

  const handleSave = async (id: number) => {
    setSaving(true)
    try {
      await updateResource<BannerData>('banners', id, editForm)
      load()
      setExpandedId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async () => {
    setSaving(true)
    try {
      await createResource<BannerData>('banners', addForm)
      load()
      setShowAddForm(false)
      setAddForm({ ...emptyForm })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this banner?')) return
    try {
      await deleteResource('banners', id)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const filtered = search
    ? banners.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.placement.toLowerCase().includes(search.toLowerCase()))
    : banners

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Banners & Hero Media</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage promotional sliders, hero graphics, and campaign banners.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/20 text-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>{showAddForm ? 'Close Form' : 'Add Banner'}</span>
        </button>
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">New Banner Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Placement</label>
              <input type="text" value={addForm.placement || ''} onChange={e => setAddForm(f => ({ ...f, placement: e.target.value }))} placeholder="e.g. hero_home" className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Title</label>
              <input type="text" value={addForm.title || ''} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Subtitle</label>
              <input type="text" value={addForm.subtitle || ''} onChange={e => setAddForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Image URL</label>
              <input type="text" value={addForm.imageUrl || ''} onChange={e => setAddForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">CTA Label</label>
              <input type="text" value={addForm.ctaLabel || ''} onChange={e => setAddForm(f => ({ ...f, ctaLabel: e.target.value }))} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">CTA URL</label>
              <input type="text" value={addForm.ctaUrl || ''} onChange={e => setAddForm(f => ({ ...f, ctaUrl: e.target.value }))} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Sort Order</label>
              <input type="number" value={addForm.sortOrder ?? 0} onChange={e => setAddForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={addForm.active || false} onChange={e => setAddForm(f => ({ ...f, active: e.target.checked }))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4" />
                Active
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowAddForm(false); setAddForm({ ...emptyForm }) }} className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition shadow-md shadow-blue-500/10">{saving ? 'Creating...' : 'Create Banner'}</button>
          </div>
        </div>
      )}

      {/* Floating White Card Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search banners by title or placement..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading banners...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No banners found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="px-4 py-3.5">Preview</th>
                  <th className="px-4 py-3.5">Placement</th>
                  <th className="px-4 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Subtitle</th>
                  <th className="px-4 py-3.5">Active</th>
                  <th className="px-4 py-3.5 text-right">Sort Order</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(banner => (
                  <Fragment key={banner.id}>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        {banner.imageUrl ? (
                          <img src={banner.imageUrl} alt="" className="w-20 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200/60 shadow-sm" />
                        ) : (
                          <div className="w-20 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><ImageIcon className="h-5 w-5" /></div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">{banner.placement}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800 truncate max-w-[180px]">{banner.title}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs max-w-[150px] truncate">{banner.subtitle || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${banner.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {banner.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-700">{banner.sortOrder}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleExpand(banner)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(banner.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === banner.id && (
                      <tr key={`${banner.id}-edit`}>
                        <td colSpan={7} className="px-6 py-5 bg-slate-50/90 border-b border-slate-200">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Placement</label>
                              <input type="text" value={editForm.placement || ''} onChange={e => setEditForm(f => ({ ...f, placement: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Title</label>
                              <input type="text" value={editForm.title || ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Subtitle</label>
                              <input type="text" value={editForm.subtitle || ''} onChange={e => setEditForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Image URL</label>
                              <input type="text" value={editForm.imageUrl || ''} onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">CTA Label</label>
                              <input type="text" value={editForm.ctaLabel || ''} onChange={e => setEditForm(f => ({ ...f, ctaLabel: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">CTA URL</label>
                              <input type="text" value={editForm.ctaUrl || ''} onChange={e => setEditForm(f => ({ ...f, ctaUrl: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Sort Order</label>
                              <input type="number" value={editForm.sortOrder ?? 0} onChange={e => setEditForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="flex items-end pb-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={editForm.active || false} onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4" />
                                Active
                              </label>
                            </div>
                            <div className="flex items-end justify-end gap-2 pb-2">
                              <button onClick={() => setExpandedId(null)} className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                              <button onClick={() => handleSave(banner.id)} disabled={saving} className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition shadow-md shadow-blue-500/10">{saving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors">Previous</button>
            <span className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}

