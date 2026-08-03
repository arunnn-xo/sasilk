'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  fetchResource, createResource, updateResource, deleteResource,
  fetchCategoryTree, reorderCategories, toggleCategoryNav, duplicateCategory,
  type CategoryData, type CategoryTreeNode,
} from '@/lib/services/admin.service'
import NavPreviewModal from '@/components/admin/NavPreviewModal'
import {
  Tags, Plus, Edit, Trash2, Search, ChevronDown, ChevronRight,
  Eye, EyeOff, ArrowUp, ArrowDown, Copy, X, Save, FileJson,
} from 'lucide-react'

const emptyForm = {
  section: '', name: '', tag: '', description: '',
  navVisible: false, homeVisible: false, sortOrder: 0,
  imageUrl: '', parentId: null as number | null,
  isHot: false, isSale: false, active: true,
}

function metadataFromForm(form: typeof emptyForm) {
  const m: Record<string, unknown> = {}
  if (form.isHot) m.isHot = true
  if (form.isSale) m.isSale = true
  return Object.keys(m).length > 0 ? m : null
}

const depthColors = ['text-slate-800', 'text-blue-600', 'text-amber-600']
const depthBgColors = ['bg-slate-50 border-slate-200/80', 'bg-blue-50/80 border-blue-100', 'bg-amber-50/80 border-amber-100']
const depthBadgeColors = ['bg-slate-200 text-slate-700', 'bg-blue-100 text-blue-700', 'bg-amber-100 text-amber-700']

export default function AdminCategoriesPage() {
  const pathname = usePathname()
  const [tree, setTree] = useState<CategoryTreeNode[]>([])
  const [flatList, setFlatList] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showNavPreview, setShowNavPreview] = useState(false)
  const [error, setError] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickParentId, setQuickParentId] = useState<number | null>(null)
  const [quickName, setQuickName] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [treeRes, listRes] = await Promise.all([
        fetchCategoryTree(),
        fetchResource<CategoryData>('categories', 1, 200),
      ])
      setTree(treeRes.tree)
      setFlatList(listRes.items)
    } catch {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const allExpanded = useMemo(() => {
    const ids = new Set<number>()
    const collect = (nodes: CategoryTreeNode[]) => {
      for (const n of nodes) {
        if (n.children.length > 0) {
          ids.add(n.id)
          collect(n.children)
        }
      }
    }
    collect(tree)
    return ids
  }, [tree])

  const expandAll = () => setExpandedIds(new Set(allExpanded))
  const collapseAll = () => setExpandedIds(new Set())

  const selected = useMemo(() => {
    if (!selectedId) return null
    const find = (nodes: CategoryTreeNode[]): CategoryTreeNode | null => {
      for (const n of nodes) {
        if (n.id === selectedId) return n
        if (n.children.length > 0) {
          const found = find(n.children)
          if (found) return found
        }
      }
      return null
    }
    return find(tree)
  }, [tree, selectedId])

  const select = useCallback((id: number | null) => {
    setSelectedId(id)
    if (id === null) {
      setForm(emptyForm)
      return
    }
    const cat = flatList.find(c => c.id === id)
    if (!cat) return
    const meta = cat.metadata || {}
    setForm({
      section: cat.section ?? '',
      name: cat.name,
      tag: cat.tag ?? '',
      description: cat.description ?? '',
      navVisible: cat.navVisible,
      homeVisible: cat.homeVisible,
      sortOrder: cat.sortOrder,
      imageUrl: cat.imageUrl ?? '',
      parentId: cat.parentId,
      isHot: meta.isHot === true,
      isSale: meta.isSale === true,
      active: cat.active,
    })
  }, [flatList])

  const parentOptions = useMemo(() => {
    const excluded = new Set<number>()
    if (selectedId) {
      excluded.add(selectedId)
      const addChildren = (pid: number) => {
        for (const c of flatList) {
          if (c.parentId === pid && !excluded.has(c.id)) {
            excluded.add(c.id)
            addChildren(c.id)
          }
        }
      }
      addChildren(selectedId)
    }
    const result: { id: number; name: string; depth: number }[] = []
    const walk = (nodes: CategoryTreeNode[], depth: number) => {
      for (const n of nodes) {
        if (excluded.has(n.id)) continue
        result.push({ id: n.id, name: n.name, depth })
        walk(n.children, depth + 1)
      }
    }
    walk(tree, 0)
    return result
  }, [tree, flatList, selectedId])

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        section: form.section || null,
        name: form.name,
        tag: form.tag || null,
        description: form.description || null,
        navVisible: form.navVisible,
        homeVisible: form.homeVisible,
        sortOrder: form.sortOrder,
        imageUrl: form.imageUrl || null,
        parentId: form.parentId,
        active: form.active,
        metadata: metadataFromForm(form),
      }
      if (selectedId && selected) {
        await updateResource('categories', selectedId, payload)
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return
    if (!confirm(`Delete "${selected?.name}" and all its subcategories?`)) return
    setError('')
    try {
      await deleteResource('categories', selectedId)
      setSelectedId(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handleToggleNav = async (id: number) => {
    try {
      await toggleCategoryNav(id)
      await load()
    } catch { /* ignore */ }
  }

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateCategory(id)
      await load()
    } catch { /* ignore */ }
  }

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const cat = flatList.find(c => c.id === id)
    if (!cat) return
    const siblings = flatList
      .filter(c => c.parentId === cat.parentId && c.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = siblings.findIndex(c => c.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === siblings.length - 1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const items = siblings.map((c, i) => ({
      id: c.id,
      sortOrder: i === idx ? siblings[swapIdx].sortOrder : i === swapIdx ? siblings[idx].sortOrder : c.sortOrder,
      parentId: c.parentId,
    }))
    try {
      await reorderCategories(items)
      await load()
    } catch { /* ignore */ }
  }

  const handleQuickAdd = async () => {
    if (!quickName.trim()) return
    setSaving(true)
    try {
      await createResource('categories', {
        name: quickName,
        parentId: quickParentId,
        navVisible: false,
        homeVisible: false,
        sortOrder: 0,
        active: true,
      })
      setQuickName('')
      setShowQuickAdd(false)
      setQuickParentId(null)
      await load()
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredTree = useMemo(() => {
    if (!search) return tree
    const q = search.toLowerCase()
    const matches = (n: CategoryTreeNode) =>
      n.name.toLowerCase().includes(q) ||
      (!!n.tag && n.tag.toLowerCase().includes(q)) ||
      (!!n.section && n.section.toLowerCase().includes(q))
    const filter = (nodes: CategoryTreeNode[]): CategoryTreeNode[] =>
      nodes.flatMap(n => {
        const children = filter(n.children)
        if (matches(n) || children.length > 0) {
          return [{ ...n, children }] as CategoryTreeNode[]
        }
        return []
      })
    return filter(tree)
  }, [tree, search])

  const renderNode = (node: CategoryTreeNode, depth: number): JSX.Element => {
    const isSelected = selectedId === node.id
    const isExpanded = expandedIds.has(node.id)
    const hasChildren = node.children.length > 0
    const depthClass = depthColors[Math.min(depth, 2)]
    const bgClass = depthBgColors[Math.min(depth, 2)]
    const badgeColor = depthBadgeColors[Math.min(depth, 2)]

    const meta = (node.metadata || {}) as Record<string, unknown>

    return (
      <div key={node.id}>
        <div
          onClick={() => select(node.id)}
          className={`group flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all border ${
            isSelected
              ? 'border-[#c9a96e] bg-[#c9a96e]/5 shadow-sm'
              : 'border-transparent hover:border-gold hover:bg-burgundy'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <button
            onClick={e => { e.stopPropagation(); toggleExpand(node.id) }}
            className={`p-0.5 rounded transition ${hasChildren ? 'text-gold hover:text-gold' : 'invisible'}`}
          >
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>

          <span className={`text-xs font-bold ${badgeColor} w-5 h-5 rounded-full flex items-center justify-center`}>
            {depth + 1}
          </span>

          <span className={`text-sm font-semibold flex-1 ${depthClass}`}>
            {node.name}
          </span>

          {node.tag && (
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${badgeColor}`}>
              {node.tag}
            </span>
          )}

          {meta.isHot === true && <span className="text-xs" title="Hot">🔥</span>}
          {meta.isSale === true && <span className="text-xs" title="Sale">🏷️</span>}

          {node.productCount > 0 && (
            <span className="text-[10px] text-gold font-mono">{node.productCount}</span>
          )}

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <button
              onClick={e => { e.stopPropagation(); handleToggleNav(node.id) }}
              className={`p-1 rounded hover:bg-burgundy transition ${node.navVisible ? 'text-emerald-600' : 'text-gold'}`}
              title={node.navVisible ? 'Visible in nav' : 'Hidden from nav'}
            >
              {node.navVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleReorder(node.id, 'up') }}
              className="p-1 rounded hover:bg-burgundy text-gold hover:text-gold"
              title="Move up"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleReorder(node.id, 'down') }}
              className="p-1 rounded hover:bg-burgundy text-gold hover:text-gold"
              title="Move down"
            >
              <ArrowDown className="h-3 w-3" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleDuplicate(node.id) }}
              className="p-1 rounded hover:bg-burgundy text-gold hover:text-gold"
              title="Duplicate"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              onClick={e => {
                e.stopPropagation()
                setQuickParentId(node.id)
                setShowQuickAdd(true)
              }}
              className="p-1 rounded hover:bg-burgundy text-gold hover:text-gold"
              title="Add subcategory"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading && tree.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gold">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Category Tree</h1>
          <p className="text-sm text-slate-400 mt-0.5">Organize store hierarchy, tags, and navigation visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNavPreview(true)}
            className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm"
          >
            <FileJson className="h-4 w-4 text-blue-600" />
            Nav Preview
          </button>
          <button
            onClick={() => { setSelectedId(null); setShowQuickAdd(true); setQuickParentId(null); setQuickName('') }}
            className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/20 text-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Add Top-Level
          </button>
        </div>
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

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
          />
        </div>
        <button onClick={expandAll} className="px-4 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          Expand All
        </button>
        <button onClick={collapseAll} className="px-4 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          Collapse All
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Quick Add Inline */}
      {showQuickAdd && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-4">
          <div className="flex items-center gap-3">
            <input
              type="text" value={quickName} onChange={e => setQuickName(e.target.value)}
              placeholder={`Category name${quickParentId ? ' (subcategory)' : ''}...`}
              className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(); if (e.key === 'Escape') setShowQuickAdd(false) }}
            />
            <button
              onClick={handleQuickAdd}
              disabled={saving || !quickName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Category'}
            </button>
            <button
              onClick={() => setShowQuickAdd(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {quickParentId && (
            <div className="mt-2 text-xs text-slate-500">
              Will be added under: <strong>{flatList.find(c => c.id === quickParentId)?.name}</strong>
            </div>
          )}
        </div>
      )}

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel — Tree */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
              Navigation Tree ({flatList.length} categories)
            </div>
            {filteredTree.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm font-medium">
                {search ? 'No categories match your search.' : 'No categories yet. Click "Add Top-Level" to create one.'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTree.map(node => renderNode(node, 0))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Detail */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
            {!selected ? (
              <div className="text-center py-16 text-slate-400">
                <Tags className="h-10 w-10 mx-auto mb-3 opacity-30 text-blue-500" />
                <p className="text-sm font-semibold">Select a category to view or edit details</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-800 truncate">{selected.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(selected.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => select(null)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Basic Info</label>
                    <div className="space-y-2">
                      <input
                        type="text" value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Name"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Description (for collection pages)"
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      />
                    </div>
                  </div>

                  {/* Display Settings */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Display Settings</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text" value={form.section}
                        onChange={e => setForm({ ...form, section: e.target.value })}
                        placeholder="Section"
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <input
                        type="text" value={form.tag}
                        onChange={e => setForm({ ...form, tag: e.target.value })}
                        placeholder="Badge tag"
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <input
                        type="number" value={form.sortOrder}
                        onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
                        placeholder="Sort order"
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <select
                        value={form.parentId ?? ''}
                        onChange={e => setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">No Parent (Top Level)</option>
                        {parentOptions.map(o => (
                          <option key={o.id} value={o.id}>
                            {'\u00A0\u00A0'.repeat(o.depth)}{o.depth > 0 ? '↳ ' : ''}{o.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Image URL</label>
                    <input
                      type="text" value={form.imageUrl}
                      onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="/uploads/category-image.jpg"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-xs"
                    />
                  </div>

                  {/* Toggles */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Visibility & Status</label>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                        <span>Show in Navigation Menu</span>
                        <input
                          type="checkbox" checked={form.navVisible}
                          onChange={e => setForm({ ...form, navVisible: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4"
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                        <span>Show on Home Page</span>
                        <input
                          type="checkbox" checked={form.homeVisible}
                          onChange={e => setForm({ ...form, homeVisible: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4"
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                        <span>Active</span>
                        <input
                          type="checkbox" checked={form.active}
                          onChange={e => setForm({ ...form, active: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Badges */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Badges</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox" checked={form.isHot}
                          onChange={e => setForm({ ...form, isHot: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4"
                        />
                        <span>🔥 Hot</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox" checked={form.isSale}
                          onChange={e => setForm({ ...form, isSale: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4"
                        />
                        <span>🏷️ Sale</span>
                      </label>
                    </div>
                  </div>

                  {/* Product Count */}
                  <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs font-semibold text-slate-600 border border-slate-100 flex items-center justify-between">
                    <span>Products in this category:</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{selected.productCount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setQuickParentId(selected.id)
                        setShowQuickAdd(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Sub
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !form.name.trim()}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-blue-500/10"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NavPreviewModal open={showNavPreview} onClose={() => setShowNavPreview(false)} />
    </div>
  )
}

