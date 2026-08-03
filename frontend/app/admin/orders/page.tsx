'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchOrderPipelineCounts, fetchOrderPipelineStage, type OrderData, type OrderPipelineCounts } from '@/lib/services/admin.service'
import { ShoppingBag, ChevronRight, Search } from 'lucide-react'

const stages = [
  { key: 'new', label: 'New', color: 'bg-blue-50 text-blue-700 border-blue-200/60' },
  { key: 'packing', label: 'Packing', color: 'bg-amber-50 text-amber-700 border-amber-200/60' },
  { key: 'dispatched', label: 'Dispatched', color: 'bg-purple-50 text-purple-700 border-purple-200/60' },
  { key: 'out-for-delivery', label: 'Out for Delivery', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/60' },
  { key: 'delivered', label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200/60' },
]

export default function AdminOrdersPage() {
  const [counts, setCounts] = useState<OrderPipelineCounts | null>(null)
  const [activeStage, setActiveStage] = useState('new')
  const [orders, setOrders] = useState<OrderData[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchOrderPipelineCounts().then(res => setCounts(res.counts)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchOrderPipelineStage(activeStage, page)
      .then(res => {
        setOrders(res.items)
        setTotalPages(res.totalPages)
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [activeStage, page])

  const filtered = search
    ? orders.filter(o => o.orderNumber.toLowerCase().includes(search.toLowerCase()) || (o.customerEmail?.toLowerCase().includes(search.toLowerCase())))
    : orders

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Orders Pipeline</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage customer purchases and fulfillment stages.</p>
        </div>
      </div>

      {/* Pipeline tabs */}
      <div className="flex flex-wrap gap-2.5">
        {stages.map(s => (
          <button
            key={s.key}
            onClick={() => { setActiveStage(s.key); setPage(1) }}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              activeStage === s.key 
                ? 'ring-2 ring-blue-500 shadow-md shadow-blue-500/10 ' + s.color 
                : s.color + ' opacity-75 hover:opacity-100 hover:shadow-sm'
            }`}
          >
            {s.label} {counts?.[s.key] !== undefined && `(${counts[s.key]})`}
          </button>
        ))}
      </div>

      {/* Search & Floating White Card Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No orders found for this stage.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="px-4 py-3.5">Order</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                  <th className="px-4 py-3.5 text-right">Date</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-800">#{order.orderNumber}</td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{order.customerEmail || '—'}</td>
                    <td className="px-4 py-4">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 capitalize">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-slate-800">₹{Number(order.grandTotal).toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-slate-400 text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                        View <ChevronRight className="h-3 w-3" />
                      </Link>
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
    </div>
  )
}

