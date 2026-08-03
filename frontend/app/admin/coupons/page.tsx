'use client'

import { useEffect, useState } from 'react'
import { fetchResource, createResource, updateResource, deleteResource, fetchCouponUsages, type CouponData, type CouponUsageData } from '@/lib/services/admin.service'
import { Percent, Plus, Edit, Trash2, Search, ChevronDown, ChevronRight } from 'lucide-react'

const emptyForm = { code: '', type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping', value: 0, minCartValue: 0, maxDiscount: 0, usageLimit: 0, perUserLimit: 1, active: true, description: '' }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponData[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [usages, setUsages] = useState<CouponUsageData[]>([])
  const [usagesLoading, setUsagesLoading] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)

  const load = () => {
    setLoading(true)
    fetchResource<CouponData>('coupons', page, 20)
      .then(res => { setCoupons(res.items); setTotalPages(res.totalPages) })
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const resetAddForm = () => { setAddForm(emptyForm); setShowAddForm(false) }

  const handleAdd = async () => {
    try {
      await createResource<CouponData>('coupons', addForm)
      resetAddForm()
      load()
    } catch (err) { alert(err instanceof Error ? err.message : 'Create failed') }
  }

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return
    try {
      await deleteResource('coupons', id)
      load()
    } catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
  }

  const toggleExpand = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    setUsagesLoading(true)
    try {
      const res = await fetchCouponUsages(id)
      setUsages(res.items)
    } catch { setUsages([]) }
    setUsagesLoading(false)
  }

  const filtered = search
    ? coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || (c.description?.toLowerCase().includes(search.toLowerCase())))
    : coupons

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Discounts & Coupons</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage promotional codes, percentage discounts, and usage limits.</p>
        </div>
        <button 
          onClick={() => { resetAddForm(); setShowAddForm(!showAddForm) }} 
          className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/20 text-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {showAddForm ? <ChevronDown className="h-4 w-4" /> : <Plus className="h-4 w-4 stroke-[3]" />}
          <span>{showAddForm ? 'Close Form' : 'Add Coupon'}</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create New Coupon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input type="text" value={addForm.code} onChange={e => setAddForm({ ...addForm, code: e.target.value.toUpperCase() })} placeholder="Code (e.g. WELCOME10)" className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase" />
            <select value={addForm.type} onChange={e => setAddForm({ ...addForm, type: e.target.value as 'percentage' | 'fixed' | 'free_shipping' })} className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
            <input type="number" value={addForm.value} onChange={e => setAddForm({ ...addForm, value: Number(e.target.value) })} placeholder="Value" className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <input type="number" value={addForm.minCartValue} onChange={e => setAddForm({ ...addForm, minCartValue: Number(e.target.value) })} placeholder="Min Cart Value (₹)" className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <input type="number" value={addForm.maxDiscount} onChange={e => setAddForm({ ...addForm, maxDiscount: Number(e.target.value) })} placeholder="Max Discount (0 = none)" className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <input type="number" value={addForm.usageLimit} onChange={e => setAddForm({ ...addForm, usageLimit: Number(e.target.value) })} placeholder="Usage Limit (0 = unlimited)" className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <input type="number" value={addForm.perUserLimit} onChange={e => setAddForm({ ...addForm, perUserLimit: Number(e.target.value) })} placeholder="Per User Limit" className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <input type="text" value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} placeholder="Description (optional)" className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={addForm.active} onChange={e => setAddForm({ ...addForm, active: e.target.checked })} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4" /> Active Status
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10">Save Coupon</button>
            <button onClick={resetAddForm} className="px-5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Floating White Card Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupons by code or description..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading coupons...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No coupons found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="px-4 py-3.5"></th>
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5 text-right">Value</th>
                  <th className="px-4 py-3.5 text-right">Min Cart</th>
                  <th className="px-4 py-3.5 text-right">Max Discount</th>
                  <th className="px-4 py-3.5 text-right">Used / Limit</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggleExpand(coupon.id)} className="p-1 text-slate-400 hover:text-blue-600 rounded-lg">
                        {expandedId === coupon.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggleExpand(coupon.id)} className="font-mono font-black text-blue-600 hover:underline">{coupon.code}</button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 capitalize">{coupon.type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-slate-800">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : coupon.type === 'free_shipping' ? '—' : `₹${Number(coupon.value).toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-600">₹{Number(coupon.minCartValue).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-600">{coupon.maxDiscount ? `₹${Number(coupon.maxDiscount).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-500">{coupon.usedCount} / {coupon.usageLimit ?? '∞'}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${coupon.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => toggleExpand(coupon.id)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(coupon.id, coupon.code)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
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
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors">Previous</button>
            <span className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
          </div>
        )}
      </div>

      {/* Usage History Panel */}
      {expandedId && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-800 text-sm">Coupon Usage History</div>
          {usagesLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading usage records...</div>
          ) : usages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No usage records found for this coupon.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3 text-right">Discount</th>
                    <th className="px-6 py-3 text-right">Order Total</th>
                    <th className="px-6 py-3 text-right">Used At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usages.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-800">#{u.Order?.orderNumber || u.orderId}</td>
                      <td className="px-6 py-3 text-slate-600 font-medium">{u.customerEmail || '—'}</td>
                      <td className="px-6 py-3 text-right font-bold text-emerald-600">₹{Number(u.discountAmount).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-bold text-slate-800">₹{Number(u.Order?.grandTotal).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right text-slate-400 text-xs font-medium">{new Date(u.usedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

