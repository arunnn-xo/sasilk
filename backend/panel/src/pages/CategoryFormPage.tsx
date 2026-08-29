import { FormEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, FolderTree, Loader2, ArrowLeft, Save, Sparkles } from 'lucide-react'
import { createResource, updateResource } from '../services/api'
import type { ResourceConfig } from '../app/resources'
import { resources } from '../app/resources'
import FieldWithTooltip from '../components/FieldWithTooltip'

const config: ResourceConfig = resources.find(r => r.api === 'categories')!

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

const SectionCard = ({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) => (
  <div className="rounded-xl border border-[var(--line)] bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
    <div className="border-b border-[var(--line)] bg-[#FCFBF9] px-6 py-4 flex items-center gap-2">
      {icon && <span className="text-[var(--burgundy)]">{icon}</span>}
      <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--gold)]">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
)

export default function CategoryFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const queryClient = useQueryClient()

  const isEdit = Boolean(id)
  const stateItem = (location.state as { item?: Record<string, unknown> } | null)?.item || null

  const editItem = isEdit ? stateItem || null : null

  const isLoadingItem = isEdit && !stateItem

  const [name, setName] = useState(editItem ? String(editItem.name || '') : '')

  const [headerMode, setHeaderMode] = useState<'hidden' | 'normal' | 'highlighted'>(
    editItem
      ? Boolean(editItem.headerHighlight) ? 'highlighted'
        : Boolean(editItem.navVisible) ? 'normal'
        : 'hidden'
      : 'hidden'
  )

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (editItem && !touched.initialized) {
      setName(String(editItem.name || ''))
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
      if (isEdit && id) return updateResource(config.api, id, payload)
      return createResource(config.api, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', config.api] })
      navigate(config.path, { state: { successMsg: `Category ${isEdit ? 'updated' : 'created'} successfully.` } })
    },
    onError: (err: Error) => {
      setServerError(err.message || 'Unable to save category.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  })

  const getSlug = () => {
    const nameSlug = slugify(name.trim())
    return `collections-for-${nameSlug}`
  }

  const validateAll = () => {
    const errors: Record<string, string> = {}
    const trimmedName = name.trim()
    if (!trimmedName) errors.name = 'Please enter a category name'
    else if (trimmedName.length < 2) errors.name = 'Name must be at least 2 characters'
    else if (trimmedName.length > 140) errors.name = 'Name cannot exceed 140 characters'
    return errors
  }

  const allErrors = validateAll()
  const isValid = Object.keys(allErrors).length === 0

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const submit = (e?: FormEvent) => {
    if (e) e.preventDefault()
    setServerError('')
    setTouched({ name: true })
    if (!isValid) {
      const firstError = document.querySelector('.text-red-600')
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const payload: Record<string, unknown> = {
      name: name.trim(),
      navVisible: headerMode !== 'hidden',
      headerHighlight: headerMode === 'highlighted',
    }
    if (isEdit && editItem) {
      payload.section = editItem.section
      payload.slug = editItem.slug
      payload.href = editItem.href
      payload.imageUrl = editItem.imageUrl ?? null
      payload.tag = editItem.tag ?? ''
      payload.homeVisible = editItem.homeVisible ?? true
      payload.active = editItem.active ?? true
      payload.sortOrder = editItem.sortOrder ?? 0
      payload.parentId = editItem.parentId ?? null
      payload.metadata = editItem.metadata ?? null
    } else {
      const slug = getSlug()
      payload.section = 'collections-for'
      payload.slug = slug
      payload.href = `/collections/${slug}`
    }
    saveMutation.mutate(payload)
  }

  if (isLoadingItem) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
        <p className="text-sm font-semibold text-[var(--muted)]">Loading category…</p>
      </div>
    )
  }

  const getInputClass = (field: string) => {
    const baseClass = 'w-full rounded-lg border border-[var(--line)] bg-[#F9FAFB] px-4 py-2.5 text-[15px] text-[var(--text)] outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-[var(--burgundy)] focus:ring-4 focus:ring-[var(--burgundy-soft)]'
    if (touched[field] && allErrors[field]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-100`
    }
    return baseClass
  }

  return (
    <form onSubmit={submit} className="relative pb-24 max-w-7xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 -mx-4 mb-8 flex items-center justify-between border-b border-[var(--line)] bg-[#FCFBF9]/90 px-4 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(config.path)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-[var(--line)] text-[var(--muted)] transition-colors hover:bg-[var(--burgundy-soft)] hover:text-[var(--burgundy)] hover:border-[var(--burgundy-soft)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">{isEdit ? 'Edit Category' : 'Add New Category'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(config.path)}
            className="admin-btn-secondary"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="admin-btn-primary"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Save Category'}
          </button>
        </div>
      </div>

      {serverError && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">
          {serverError}
        </div>
      )}

      {saveMutation.isError && !serverError && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">
          {saveMutation.error instanceof Error ? saveMutation.error.message : 'Unable to save category.'}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <SectionCard title="Basic Information" icon={<FolderTree className="h-4 w-4" />}>
          <div className="space-y-5">
            <FieldWithTooltip label="Category Name" required characterCount={`${name.length}/140`}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g., Silk Sarees"
                className={getInputClass('name')}
                maxLength={140}
              />
              {touched.name && allErrors.name && (
                <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.name}</p>
              )}
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
      </div>
    </form>
  )
}
