'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  fetchResourceItem, updateResource, createResource, deleteResource,
  fetchProductVariants, createProductVariant, updateProductVariant,
  deleteProductVariant, setDefaultVariant,
  fetchResource, type ProductData, type VariantData, type CategoryData,
} from '@/lib/services/admin.service'
import { ArrowLeft, Save, Package, Plus, Trash2, Star, FolderPlus, X } from 'lucide-react'

type CategoryNode = CategoryData & { children: CategoryNode[] }

function getBreadcrumb(cats: CategoryData[], id: number | null): string {
  if (!id) return ''
  const parts: string[] = []
  let current = cats.find(c => c.id === id)
  while (current) {
    parts.unshift(current.name)
    current = current.parentId ? cats.find(c => c.id === current!.parentId) : undefined
  }
  return parts.join(' → ')
}

function buildTree(cats: CategoryData[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>()
  const roots: CategoryNode[] = []
  for (const cat of cats) {
    map.set(cat.id, { ...cat, children: [] })
  }
  for (const cat of cats) {
    const node = map.get(cat.id)!
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node)
    } else if (!cat.parentId) {
      roots.push(node)
    }
  }
  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder)
    nodes.forEach(n => sortNodes(n.children))
  }
  sortNodes(roots)
  return roots
}

function renderOptions(nodes: CategoryNode[], depth: number): JSX.Element[] {
  return nodes.flatMap(node => [
    <option key={node.id} value={node.id}>
      {'\u00A0\u00A0'.repeat(depth)}{depth > 0 ? '↳ ' : ''}{node.name}
    </option>,
    ...renderOptions(node.children, depth + 1),
  ])
}

export default function AdminProductForm({ productId, isNew }: { productId: number; isNew: boolean }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', code: '', slug: '', type: '', description: '',
    category: '', categoryId: '', price: '', originalPrice: '', stockQty: '',
    imageUrl: '', color: '', gender: '', ageGroup: '',
    status: 'active', gstRate: '5',
    featured: false, isNew: false, hasVariants: false,
  })
  const [variants, setVariants] = useState<VariantData[]>([])
  const [allCategories, setAllCategories] = useState<CategoryData[]>([])
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddName, setQuickAddName] = useState('')
  const [quickAddParent, setQuickAddParent] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchResource<CategoryData>('categories', 1, 100)
      .then(res => setAllCategories(res.items))
      .catch(() => {})
  }, [])

  const categoryTree = useMemo(() => buildTree(allCategories), [allCategories])

  useEffect(() => {
    if (isNew) return
    Promise.all([
      fetchResourceItem<ProductData>('products', productId),
      fetchProductVariants(productId),
    ]).then(([productRes, variantsRes]) => {
      const p = productRes.item
      setForm({
        name: p.name, code: p.code || '', slug: p.slug, type: p.type || '', description: p.description || '',
        category: p.category || '', categoryId: p.categoryId ? String(p.categoryId) : '',
        price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '',
        stockQty: String(p.stockQty), imageUrl: p.imageUrl || '', color: p.color || '', gender: p.gender || '',
        ageGroup: p.ageGroup || '', status: p.status, gstRate: String(p.gstRate),
        featured: p.featured, isNew: p.isNew, hasVariants: p.hasVariants,
      })
      setVariants(variantsRes.items)
    }).catch(err => setError(err instanceof Error ? err.message : 'Load failed'))
      .finally(() => setLoading(false))
  }, [productId, isNew])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (!val) {
      setForm(p => ({ ...p, categoryId: '', category: '' }))
      return
    }
    const cat = allCategories.find(c => c.id === Number(val))
    setForm(p => ({ ...p, categoryId: val, category: cat ? cat.name : '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { categoryId: _, ...rest } = form
      const body = {
        ...rest,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stockQty: Number(form.stockQty),
        gstRate: Number(form.gstRate),
      }
      if (isNew) {
        await createResource<ProductData>('products', body)
      } else {
        await updateResource<ProductData>('products', productId, body)
      }
      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this product permanently?')) return
    try {
      await deleteResource('products', productId)
      router.push('/admin/products')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const addVariant = async () => {
    try {
      const res = await createProductVariant(productId, {
        variantType: 'color', label: 'New Variant', stockQty: 0, status: 'active',
      })
      setVariants(p => [...p, res.item])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create variant')
    }
  }

  const updateVariant = async (variantId: number, field: string, value: unknown) => {
    setVariants(p => p.map(v => v.id === variantId ? { ...v, [field]: value } : v))
    try {
      const v = variants.find(v => v.id === variantId)
      await updateProductVariant(productId, variantId, { ...v, [field]: value })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const removeVariant = async (variantId: number) => {
    if (!confirm('Delete this variant?')) return
    try {
      await deleteProductVariant(productId, variantId)
      setVariants(p => p.filter(v => v.id !== variantId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const makeDefault = async (variantId: number) => {
    try {
      await setDefaultVariant(productId, variantId)
      setVariants(p => p.map(v => ({ ...v, isDefault: v.id === variantId })))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to set default')
    }
  }

  if (loading) return <div className="p-8 text-center text-gold">Loading...</div>

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gold hover:text-gold mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-[#c9a96e]" />
          <h1 className="text-2xl font-bold text-gold">{isNew ? 'New Product' : 'Edit Product'}</h1>
        </div>
        {!isNew && (
          <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700 font-medium">Delete</button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-burgundy rounded-xl border border-gold p-5 space-y-4">
          <h2 className="font-semibold text-gold">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gold mb-1">Name *</label>
              <input value={form.name} onChange={set('name')} required className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-xs font-medium text-gold">Category</label>
                <button type="button" onClick={() => setShowQuickAdd(p => !p)} className="text-xs text-[#c9a96e] hover:text-[#ba9a5e] font-medium flex items-center gap-0.5">
                  <FolderPlus className="h-3 w-3" /> {showQuickAdd ? 'Cancel' : 'Quick Add'}
                </button>
              </div>
              <select
                value={form.categoryId}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40"
              >
                <option value="">No Category</option>
                {renderOptions(categoryTree, 0)}
              </select>
              {form.categoryId && (
                <p className="text-xs text-gold mt-1">
                  {getBreadcrumb(allCategories, Number(form.categoryId))}
                </p>
              )}
              {showQuickAdd && (
                <div className="mt-2 p-3 bg-burgundy rounded-lg border border-gold space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gold">New Category</span>
                    <button type="button" onClick={() => setShowQuickAdd(false)} className="text-gold hover:text-gold">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <input
                    value={quickAddName}
                    onChange={e => setQuickAddName(e.target.value)}
                    placeholder="Category name"
                    className="w-full px-2.5 py-1.5 border border-gold rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40"
                  />
                  <select
                    value={quickAddParent}
                    onChange={e => setQuickAddParent(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gold rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40"
                  >
                    <option value="">Top-level (no parent)</option>
                    {renderOptions(categoryTree, 0)}
                  </select>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!quickAddName.trim() || addingCategory}
                      onClick={async () => {
                        setAddingCategory(true)
                        try {
                          const res = await createResource<CategoryData>('categories', {
                            name: quickAddName.trim(),
                            parentId: quickAddParent ? Number(quickAddParent) : null,
                            section: null,
                            slug: '',
                            href: '',
                            description: null,
                            imageUrl: null,
                            tag: null,
                            navVisible: true,
                            homeVisible: false,
                            sortOrder: 0,
                            active: true,
                            metadata: null,
                          })
                          setAllCategories(p => [...p, res.item])
                          setForm(p => ({ ...p, categoryId: String(res.item.id), category: res.item.name }))
                          setQuickAddName('')
                          setQuickAddParent('')
                          setShowQuickAdd(false)
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Failed to create category')
                        } finally {
                          setAddingCategory(false)
                        }
                      }}
                      className="px-3 py-1.5 bg-[#c9a96e] hover:bg-[#ba9a5e] text-[#1e1e2f] rounded text-xs font-semibold transition disabled:opacity-50"
                    >
                      {addingCategory ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Code</label>
              <input value={form.code} onChange={set('code')} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Slug</label>
              <input value={form.slug} onChange={set('slug')} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Type</label>
              <input value={form.type} onChange={set('type')} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Status</label>
              <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40">
                <option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gold mb-1">Description</label>
              <textarea value={form.description} onChange={set('description')} rows={3} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
          </div>
        </div>

        <div className="bg-burgundy rounded-xl border border-gold p-5 space-y-4">
          <h2 className="font-semibold text-gold">Pricing & Stock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Price *</label>
              <input type="number" value={form.price} onChange={set('price')} required className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Original Price</label>
              <input type="number" value={form.originalPrice} onChange={set('originalPrice')} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Stock Qty</label>
              <input type="number" value={form.stockQty} onChange={set('stockQty')} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">GST Rate (%)</label>
              <input type="number" value={form.gstRate} onChange={set('gstRate')} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Image URL</label>
              <input value={form.imageUrl} onChange={set('imageUrl')} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gold mb-1">Color</label>
              <input value={form.color} onChange={set('color')} className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40" />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gold"><input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} /> Featured</label>
            <label className="flex items-center gap-2 text-sm text-gold"><input type="checkbox" checked={form.isNew} onChange={e => setForm(p => ({ ...p, isNew: e.target.checked }))} /> New Arrival</label>
          </div>
        </div>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#c9a96e] hover:bg-[#ba9a5e] text-[#1e1e2f] px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Product'}
        </button>
      </form>

      {!isNew && (
        <div className="mt-8 bg-burgundy rounded-xl border border-gold p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gold">Variants ({variants.length})</h2>
            <button onClick={addVariant} className="inline-flex items-center gap-1 text-sm text-[#c9a96e] hover:text-[#ba9a5e] font-medium">
              <Plus className="h-4 w-4" /> Add Variant
            </button>
          </div>
          {variants.length === 0 ? (
            <p className="text-sm text-gold">No variants yet.</p>
          ) : (
            <div className="space-y-3">
              {variants.map(v => (
                <div key={v.id} className="flex items-center gap-3 p-3 bg-burgundy rounded-lg">
                  {v.imageUrl && <img src={v.imageUrl} alt="" className="w-10 h-12 rounded object-cover bg-burgundy" />}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input value={v.label} onChange={e => updateVariant(v.id, 'label', e.target.value)} className="px-2 py-1 border border-gold rounded text-xs" />
                    <input value={v.sku || ''} onChange={e => updateVariant(v.id, 'sku', e.target.value)} placeholder="SKU" className="px-2 py-1 border border-gold rounded text-xs" />
                    <input value={v.price || ''} type="number" onChange={e => updateVariant(v.id, 'price', e.target.value ? Number(e.target.value) : null)} placeholder="Price" className="px-2 py-1 border border-gold rounded text-xs" />
                    <input value={v.stockQty} type="number" onChange={e => updateVariant(v.id, 'stockQty', Number(e.target.value))} className="px-2 py-1 border border-gold rounded text-xs" />
                  </div>
                  <button onClick={() => makeDefault(v.id)} title="Set as default" className={`p-1.5 rounded ${v.isDefault ? 'text-[#c9a96e]' : 'text-gold hover:text-gold'}`}><Star className="h-4 w-4" fill={v.isDefault ? 'currentColor' : 'none'} /></button>
                  <button onClick={() => removeVariant(v.id)} className="p-1.5 text-gold hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
