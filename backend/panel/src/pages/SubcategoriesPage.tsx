import { FormEvent, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, Edit3, Eye, EyeOff, FolderTree, Image as ImageIcon, ListTree, Loader2, Plus, Save, Sparkles, Trash2 } from 'lucide-react'
import { createResource, deleteResource, getResource, listResource, resolveImageUrl, updateResource, uploadImage } from '../services/api'
import { validateImageFile } from './ResourceShared'
import FieldWithTooltip from '../components/FieldWithTooltip'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[₹]/g, 'rs')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function buildCategoryOptions(categories: any[], excludeId: number | null) {
  const byParent = new Map<number | null, any[]>()
  for (const c of categories) {
    const key = c.parentId ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(c)
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => String(a.section).localeCompare(String(b.section)) || a.id - b.id)
  }
  const excluded = new Set<number>()
  if (excludeId != null) {
    const stack = [excludeId]
    while (stack.length) {
      const id = stack.pop()!
      excluded.add(id)
      for (const c of byParent.get(id) || []) stack.push(c.id)
    }
  }
  const options: { id: number; label: string; depth: number }[] = []
  const walk = (parentKey: number | null, depth: number) => {
    for (const c of byParent.get(parentKey) || []) {
      if (excluded.has(c.id)) continue
      options.push({ id: c.id, label: c.section ? `[${c.section}] ${c.name}` : c.name, depth })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return options
}

const SectionCard = ({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) => (
  <div className="rounded-xl border border-[var(--line)] bg-white shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
    <div className="border-b border-[var(--line)] bg-[#FCFBF9] px-6 py-4 flex items-center gap-2">
      {icon && <span className="text-[var(--burgundy)]">{icon}</span>}
      <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--gold)]">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
)

type SubcategoriesPageProps = {
  level?: 'sub' | 'child'
}

export default function SubcategoriesPage({ level = 'sub' }: SubcategoriesPageProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const queryClient = useQueryClient()
  const isChild = level === 'child'
  const basePath = isChild ? 'child-categories' : 'subcategories'
  const isForm = Boolean(location.pathname.includes('/new') || location.pathname.includes('/edit'))
  const isEdit = Boolean(id)

  const stateItem = (location.state as { item?: Record<string, unknown> } | null)?.item || null

  const { data: catData } = useQuery({
    queryKey: ['resource', 'categories'],
    queryFn: () => listResource('categories', 1, 200),
  })

  const { data: editQueryData } = useQuery({
    queryKey: ['resource', 'categories', id],
    queryFn: () => getResource('categories', id as string),
    enabled: isEdit && !!id && !stateItem,
  })

  const { data: listData, isLoading: isListLoading, refetch } = useQuery({
    queryKey: ['resource', 'categories'],
    queryFn: () => listResource('categories', 1, 200),
    enabled: !isForm,
  })

  const fetchedItem = editQueryData?.item
  const editItem = isEdit ? stateItem || fetchedItem || null : null

  const searchParams = new URLSearchParams(location.search)
  const initialParentId = editItem
    ? String(editItem.parentId || '')
    : searchParams.get('parentId') || ''
  const [parentId, setParentId] = useState(initialParentId)
  const [name, setName] = useState(editItem ? String(editItem.name || '') : '')
  const [imageUrl, setImageUrl] = useState(editItem ? String(editItem.imageUrl || '') : '')
  const [headerMode, setHeaderMode] = useState<'hidden' | 'normal' | 'highlighted'>(
    editItem
      ? Boolean(editItem.headerHighlight) ? 'highlighted'
        : Boolean(editItem.navVisible) ? 'normal'
        : 'hidden'
      : 'normal'
  )
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null)
  const [deleteDialogError, setDeleteDialogError] = useState('')

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [serverError, setServerError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  useEffect(() => {
    if (editItem && !touched.initialized) {
      setParentId(String(editItem.parentId || ''))
      setName(String(editItem.name || ''))
      setImageUrl(String(editItem.imageUrl || ''))
      setHeaderMode(
        Boolean(editItem.headerHighlight) ? 'highlighted'
          : Boolean(editItem.navVisible) ? 'normal'
          : 'hidden'
      )
      setTouched({ initialized: true })
    }
  }, [editItem, touched.initialized])

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      if (isEdit && id) return updateResource('categories', id, payload)
      return createResource('categories', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'categories'] })
      navigate(`/${basePath}`, { state: { successMsg: `Category ${isEdit ? 'updated' : 'created'} successfully.` } })
    },
    onError: (err: Error) => {
      setServerError(err.message || 'Unable to save category.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (deleteId: string | number) => deleteResource('categories', deleteId),
    onSuccess: () => {
      setDeleteTarget(null)
      setDeleteDialogError('')
      setSuccessMsg('Category deleted successfully.')
      queryClient.invalidateQueries({ queryKey: ['resource', 'categories'] })
    },
    onError: (err: Error) => {
      // Keep dialog open — show error inside it
      setDeleteDialogError(err.message || 'Failed to delete this category.')
    },
  })

  // ─── List View ────────────────────────────────────────────────
  if (!isForm) {
    const allItems = listData?.items || []
    const categories = catData?.items || []
    const catMap = new Map(categories.map((c: any) => [c.id, c]))
    const depthOf = (itemId: any) => {
      let depth = 0
      let cur = catMap.get(itemId)
      while (cur && cur.parentId) { depth++; cur = catMap.get(cur.parentId) }
      return depth
    }
    const chainOf = (itemId: any) => {
      const chain: string[] = []
      let cur = catMap.get(itemId)
      while (cur && cur.parentId) {
        const p = catMap.get(cur.parentId)
        if (p) chain.unshift(p.name)
        cur = p
      }
      return chain
    }
    const items = allItems.filter((item: any) => item.parentId && (!isChild || depthOf(item.id) >= 2))

    return (
      <div className="space-y-6">
        <section className="admin-card rounded-lg p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--burgundy)]">
                {isChild ? 'Sub Category › Child Category' : 'Parent › Child Category'}
              </p>
              <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold text-[var(--gold)] md:text-4xl">
                <ListTree className="h-7 w-7 md:h-8 md:w-8" />
                {isChild ? 'Child Categories' : 'Sub Categories'}
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(`/${basePath}/new`)}
                className="mt-4 inline-flex items-center gap-2 rounded bg-[var(--gold)] px-4 py-2.5 text-sm font-bold text-white"
              >
                {isChild ? 'New Child Category' : 'New Sub Category'}
              </button>
            </div>
          </div>
        </section>

        {successMsg && (
          <div className="flex items-center gap-2 rounded border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}

        <section className="admin-card overflow-hidden rounded-lg">
          {isListLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy)]" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <ListTree className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No {isChild ? 'child categories' : 'sub categories'} found.</p>
              <button
                type="button"
                onClick={() => navigate(`/${basePath}/new`)}
                className="mt-4 inline-flex items-center gap-2 rounded bg-[var(--gold)] px-4 py-2.5 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                {isChild ? 'Create Child Category' : 'Create Sub Category'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--panel-strong)] text-[13.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    <tr>
                    <th className="w-10 border border-[var(--line)] px-2 py-3.5 text-center text-xs font-bold text-[var(--muted)]">S.No</th>
                    <th className="w-16 border border-[var(--line)] px-2 py-3.5 text-center text-xs font-bold text-[var(--muted)]">ID</th>
                    <th className="border border-[var(--line)] px-5 py-3.5 font-bold">{isChild ? 'Sub Category' : 'Category Name'}</th>
                    <th className="border border-[var(--line)] px-5 py-3.5 font-bold">{isChild ? 'Child Category' : 'Subcategory Name'}</th>
                    <th className="border border-[var(--line)] px-5 py-3.5 font-bold">Subcategory Image</th>
                    <th className="border border-[var(--line)] px-5 py-3.5 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => {
                    return (
                      <tr key={item.id} className="transition-colors hover:bg-[var(--burgundy-soft)]/20">
                        <td className="w-10 border border-[var(--line)] px-2 py-3.5 text-center text-xs font-bold text-[var(--muted)]">{idx + 1}</td>
                        <td className="w-16 border border-[var(--line)] px-2 py-3.5 text-center text-xs font-mono font-bold text-[var(--gold)]">{item.id}</td>
                        <td className="border border-[var(--line)] px-5 py-3.5 font-semibold">
                          {chainOf(item.id).join(' › ') || `#${item.parentId}`}
                        </td>
                        <td className="border border-[var(--line)] px-5 py-3.5" style={{ paddingLeft: `${16 + depthOf(item.id) * 18}px` }}>
                          {depthOf(item.id) > 0 && (
                            <span className="mr-1 text-xs text-[var(--muted)]">{depthOf(item.id) === 2 ? '↳ ' : '· '}</span>
                          )}
                          {item.name}
                        </td>
                        <td className="border border-[var(--line)] px-5 py-3.5">
                          {item.imageUrl ? (
                            <img src={resolveImageUrl(item.imageUrl)} alt="" className="h-10 w-8 rounded object-cover" />
                          ) : (
                            <span className="text-xs text-[var(--muted)]">—</span>
                          )}
                        </td>
                        <td className="border border-[var(--line)] px-5 py-3.5">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/${basePath}/edit/${item.id}`, { state: { item } })}
                              className="rounded border border-[var(--line)] p-2 text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)]"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="rounded border border-red-200 p-2 text-red-700 transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-[var(--burgundy)]">Delete Child Category</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Are you sure you want to delete <strong>{String(deleteTarget.name || '')}</strong>?
              </p>
              {deleteDialogError && (
                <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <span>{deleteDialogError}</span>
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setDeleteTarget(null); setDeleteDialogError('') }}
                  className="rounded border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--burgundy)]"
                >
                  {deleteDialogError ? 'Close' : 'Cancel'}
                </button>
                {!deleteDialogError && (
                  <button
                    type="button"
                    onClick={() => { setDeleteDialogError(''); deleteMutation.mutate(deleteTarget.id as string | number) }}
                    className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-bold text-white"
                  >
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Form View ────────────────────────────────────────────────
  const categories = catData?.items || []
  const allParentOptions = buildCategoryOptions(
    categories.filter((c: any) => c.active !== false),
    isEdit && id ? Number(id) : null
  )
  const parentCategoryOptions = allParentOptions.filter(o => (isChild ? o.depth === 1 : o.depth === 0))

  const getInputClass = (field: string) => {
    const base = 'w-full rounded-lg border border-[var(--line)] bg-[#F9FAFB] px-4 py-2.5 text-[15px] text-[var(--text)] outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-[var(--burgundy)] focus:ring-4 focus:ring-[var(--burgundy-soft)]'
    if (touched[field]) return `${base} border-red-500 focus:border-red-500 focus:ring-red-100`
    return base
  }

  const validateAll = () => {
    const errors: Record<string, string> = {}
    if (!parentId) errors.parentId = 'Please select a parent category'
    if (!name.trim()) errors.name = 'Name is required'
    if (!imageUrl) errors.imageUrl = 'Subcategory image is required'
    return errors
  }

  const allErrors = validateAll()
  const isValid = Object.keys(allErrors).length === 0

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  async function handleFile(file: File) {
    setUploadError('')
    const clientCheck = await validateImageFile(file, 'category-card')
    if (!clientCheck.valid) { setUploadError(clientCheck.reason); if (fileRef.current) fileRef.current.value = ''; return }
    setUploading(true)
    try {
      const data = await uploadImage(file, 'category-card')
      setImageUrl(data.file.path)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const getSlug = () => {
    const parent = categories.find((c: any) => String(c.id) === parentId)
    const sectionSlug = slugify(String(parent?.section || ''))
    const nameSlug = slugify(name.trim())
    return `${sectionSlug}-${nameSlug}`
  }

  const submit = (e?: FormEvent) => {
    if (e) e.preventDefault()
    setServerError('')
    setTouched({ parentId: true, name: true, imageUrl: true })
    if (!isValid) return

    const parent = categories.find((c: any) => String(c.id) === parentId)
    const slug = isEdit && editItem
      ? String(editItem.slug || '')
      : getSlug()
    const payload = {
      section: isEdit && editItem
        ? String(editItem.section || '')
        : (parent?.section || ''),
      parentId: parseInt(parentId, 10),
      name: name.trim(),
      slug,
      href: isEdit && editItem
        ? String(editItem.href || `/collections/${slug}`)
        : `/collections/${slug}`,
      imageUrl: imageUrl || null,
      tag: '',
      navVisible: headerMode !== 'hidden',
      headerHighlight: headerMode === 'highlighted',
      homeVisible: true,
    }
    saveMutation.mutate(payload)
  }

  return (
    <form key={location.pathname} onSubmit={submit} className="relative pb-24 max-w-4xl mx-auto">
      <div className="sticky top-0 z-40 -mx-4 mb-8 flex items-center justify-between border-b border-[var(--line)] bg-[#FCFBF9]/90 px-4 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(`/${basePath}`)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-[var(--line)] text-[var(--muted)] transition-colors hover:bg-[var(--burgundy-soft)] hover:text-[var(--burgundy)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-[var(--text)]">
            {isEdit ? `Edit ${isChild ? 'Child' : 'Sub'} Category` : `New ${isChild ? 'Child' : 'Sub'} Category`}
          </h1>
        </div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded bg-[var(--burgundy)] px-6 py-2.5 text-sm font-bold tracking-wide text-white transition-all hover:bg-[#430000] disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? 'Save Changes' : 'Save'}
        </button>
      </div>

      {serverError && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{serverError}</div>
      )}

      <SectionCard title={isChild ? 'Parent Sub Category' : 'Parent Category'} icon={<FolderTree className="h-4 w-4" />}>
        <FieldWithTooltip label={isChild ? 'Parent Sub Category' : 'Parent Category'} required>
          <select
            value={parentId}
            onChange={e => setParentId(e.target.value)}
            onBlur={() => handleBlur('parentId')}
            className={getInputClass('parentId')}
          >
            <option value="">— Select {isChild ? 'Sub Category' : 'Parent Category'} —</option>
            {parentCategoryOptions.map(o => (
              <option key={o.id} value={String(o.id)}>
                {'\u00A0\u00A0'.repeat(o.depth)}{o.depth > 0 ? '↳ ' : ''}{o.label}
              </option>
            ))}
          </select>
          {touched.parentId && allErrors.parentId && (
            <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.parentId}</p>
          )}
        </FieldWithTooltip>

        <div className="mt-5">
          <FieldWithTooltip label="Name" required>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="e.g., Bridal Sarees"
              className={getInputClass('name')}
              maxLength={140}
            />
            {touched.name && allErrors.name && <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.name}</p>}
          </FieldWithTooltip>
        </div>
      </SectionCard>

      <SectionCard title="Header Visibility" icon={<Eye className="h-4 w-4" />}>
        <div className="flex gap-3">
          {(['hidden', 'normal', 'highlighted'] as const).map(mode => (
            <button key={mode} type="button" onClick={() => setHeaderMode(mode)}
              className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer
                ${headerMode === mode
                  ? 'border-[var(--burgundy)] bg-[var(--burgundy-soft)] shadow-sm ring-2 ring-[var(--burgundy-soft)]'
                  : 'border-[var(--line)] bg-[#F9FAFB] hover:border-[var(--burgundy)] hover:shadow-sm'}`}
            >
              {mode === 'hidden' ? <EyeOff className="h-5 w-5 text-[var(--muted)]" />
                : mode === 'normal' ? <Eye className={`h-5 w-5 ${headerMode === mode ? 'text-[var(--burgundy)]' : 'text-[var(--muted)]'}`} />
                : <Sparkles className={`h-5 w-5 ${headerMode === mode ? 'text-[var(--burgundy)]' : 'text-[var(--muted)]'}`} />}
              <span className={`text-[13px] font-bold capitalize ${headerMode === mode ? 'text-[var(--burgundy)]' : 'text-[var(--text)]'}`}>
                {mode}
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Image" icon={<ImageIcon className="h-4 w-4" />}>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Image <span className="text-red-500">* Required</span></label>
        <div className={`space-y-2 ${touched.imageUrl && allErrors.imageUrl ? 'p-1 rounded-lg border-2 border-red-400 bg-red-50/30' : ''}`}>
          {imageUrl ? (
            <div className={`group relative overflow-hidden rounded-lg border ${touched.imageUrl && allErrors.imageUrl ? 'border-red-400' : 'border-[var(--line)]'}`}>
              <div className="flex items-center justify-center p-4 min-h-[10rem]">
                <img src={resolveImageUrl(imageUrl)} alt="" className="max-h-40 object-contain" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 backdrop-blur-sm">
                <button type="button" onClick={() => fileRef.current?.click()} className="rounded bg-white px-3 py-1.5 text-xs font-bold">Change</button>
                <button type="button" onClick={() => setImageUrl('')} className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white">Remove</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--line)] bg-[#F9FAFB] px-4 py-8 text-center hover:border-[var(--burgundy)] group">
              <ImageIcon className="h-6 w-6 text-[var(--muted)] group-hover:text-[var(--burgundy)]" />
              <span className="text-sm font-bold text-[var(--text)]">Upload Image</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          {uploadError && <p className="text-xs font-semibold text-red-600">{uploadError}</p>}
          {touched.imageUrl && allErrors.imageUrl && <p className="text-xs font-semibold text-red-600">{allErrors.imageUrl}</p>}
        </div>
      </SectionCard>
    </form>
  )
}
