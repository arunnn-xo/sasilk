'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { fetchResource, deleteResource, type ProductData } from '@/lib/services/admin.service'
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react'

export default function AdminProductsPage() {
  const pathname = usePathname()
  const [products, setProducts] = useState<ProductData[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    fetchResource<ProductData>('products', page, 20)
      .then(res => { setProducts(res.items); setTotalPages(res.totalPages) })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteResource('products', id)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.code?.toLowerCase().includes(search.toLowerCase())))
    : products

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Product Catalog</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage products, inventory levels, and prices.</p>
        </div>

        {/* Primary Action Button (Pill shaped gold matching reference style) */}
        <Link 
          href="/admin/products/new" 
          className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/20 text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-1">
        <Link
          href="/admin/products"
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            pathname === '/admin/products'
              ? 'bg-blue-50 text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          Products Catalog
        </Link>
        <Link
          href="/admin/categories"
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            pathname === '/admin/categories'
              ? 'bg-blue-50 text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          Categories
        </Link>
      </div>

      {/* Floating White Card Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search products by title or code..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No products found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Price</th>
                  <th className="px-4 py-3.5 text-right">Stock</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-10 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200/60 shadow-sm" />
                        ) : (
                          <div className="w-10 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><Package className="h-5 w-5" /></div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 truncate max-w-[220px]">{product.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{product.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs font-semibold">{product.code || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs font-semibold">{product.category || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full capitalize ${
                        product.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                        product.status === 'draft' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>{product.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-slate-800">₹{Number(product.price).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-700">{product.stockQty}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/products/${product.id}`} className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
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

