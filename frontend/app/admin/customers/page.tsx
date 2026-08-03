'use client'

import { Fragment, useEffect, useState } from 'react'
import { fetchResource, updateResource, type CustomerData } from '@/lib/services/admin.service'
import { Users, Search, ChevronDown, ChevronRight } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<CustomerData>>({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetchResource<CustomerData>('customers', page, 20)
      .then(res => { setCustomers(res.items); setTotalPages(res.totalPages) })
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleExpand = (customer: CustomerData) => {
    if (expandedId === customer.id) {
      setExpandedId(null)
    } else {
      setExpandedId(customer.id)
      setEditForm({ name: customer.name, email: customer.email, mobile: customer.mobile, status: customer.status, emailVerified: customer.emailVerified })
    }
  }

  const handleSave = async (id: number) => {
    setSaving(true)
    try {
      await updateResource<CustomerData>('customers', id, editForm)
      load()
      setExpandedId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const filtered = search
    ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
    : customers

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Customer Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">View registered customer accounts, contact info, and status.</p>
        </div>
      </div>

      {/* Floating White Card Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer name or email..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading customer directory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No customers found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Mobile</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Email Verified</th>
                  <th className="px-4 py-3.5 text-right">Joined</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(customer => (
                  <Fragment key={customer.id}>
                    <tr className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => handleExpand(customer)}>
                      <td className="px-4 py-4 font-bold text-slate-800">{customer.name}</td>
                      <td className="px-4 py-4 text-slate-600 font-medium">{customer.email}</td>
                      <td className="px-4 py-4 text-slate-500 font-medium">{customer.mobile || '—'}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full capitalize ${
                          customer.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>{customer.status}</span>
                      </td>
                      <td className="px-4 py-4">
                        {customer.emailVerified ? (
                          <span className="text-emerald-600 font-black text-sm">&#10003; Verified</span>
                        ) : (
                          <span className="text-rose-400 font-medium text-xs">Unverified</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-slate-400 text-xs font-medium">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-right">
                        {expandedId === customer.id ? <ChevronDown className="h-4 w-4 text-blue-600 ml-auto" /> : <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />}
                      </td>
                    </tr>
                    {expandedId === customer.id && (
                      <tr key={`${customer.id}-edit`}>
                        <td colSpan={7} className="px-6 py-5 bg-slate-50/90 border-b border-slate-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Name</label>
                              <input type="text" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Email</label>
                              <input type="email" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Mobile</label>
                              <input type="text" value={editForm.mobile || ''} onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Status</label>
                              <select value={editForm.status || 'active'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                            <div className="flex items-end pb-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                                <input type="checkbox" checked={editForm.emailVerified || false} onChange={e => setEditForm(f => ({ ...f, emailVerified: e.target.checked }))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4" />
                                Email Verified
                              </label>
                            </div>
                            <div className="flex items-end justify-end gap-2 pb-2">
                              <button onClick={() => setExpandedId(null)} className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                              <button onClick={() => handleSave(customer.id)} disabled={saving} className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition shadow-md shadow-blue-500/10">{saving ? 'Saving...' : 'Save Changes'}</button>
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

