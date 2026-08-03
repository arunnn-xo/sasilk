import { FormEvent, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, Flag, Loader2, Plus } from 'lucide-react'
import { createResource, listResource, resolveImageUrl, updateResource, uploadImage } from '../services/api'
import { validateImageFile, isSvgUrl } from './ResourceShared'
import type { ResourceConfig } from '../app/resources'
import { resources } from '../app/resources'

const config: ResourceConfig = resources.find(r => r.api === 'banners')!

export default function BannerFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const queryClient = useQueryClient()

  const isEdit = Boolean(id)
  const stateItem = (location.state as { item?: Record<string, unknown> } | null)?.item || null

  const { data: listData, isLoading: isFetchingList } = useQuery({
    queryKey: ['resource', config.api],
    queryFn: () => listResource(config.api),
  })

  const editItem = isEdit
    ? stateItem || listData?.items?.find((i: any) => String(i.id) === id) || null
    : null

  const isLoadingItem = (isEdit && !stateItem && isFetchingList)

  // Form State
  const [placement, setPlacement] = useState(editItem ? String(editItem.placement || '') : 'home_hero')
  const [title, setTitle] = useState(editItem ? String(editItem.title || '') : '')
  const [subtitle, setSubtitle] = useState(editItem ? String(editItem.subtitle || '') : '')
  const [imageUrl, setImageUrl] = useState(editItem ? String(editItem.imageUrl || '') : '')
  const [ctaLabel, setCtaLabel] = useState(editItem ? String(editItem.ctaLabel || '') : '')
  const [ctaUrl, setCtaUrl] = useState(editItem ? String(editItem.ctaUrl || '') : '')
  const [sortOrder, setSortOrder] = useState(editItem ? String(editItem.sortOrder || '') : '')
  const [active, setActive] = useState(editItem ? Boolean(editItem.active) : true)

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  // Image Upload State
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (editItem && !touched.initialized) {
      setPlacement(String(editItem.placement || 'home_hero'))
      setTitle(String(editItem.title || ''))
      setSubtitle(String(editItem.subtitle || ''))
      setImageUrl(String(editItem.imageUrl || ''))
      setCtaLabel(String(editItem.ctaLabel || ''))
      setCtaUrl(String(editItem.ctaUrl || ''))
      setSortOrder(String(editItem.sortOrder || ''))
      setActive(Boolean(editItem.active ?? true))
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
      navigate(config.path, { state: { successMsg: `Banner ${isEdit ? 'updated' : 'created'} successfully.` } })
    },
  })

  const validate = () => {
    const errors: Record<string, string> = {}
    
    if (!placement) errors.placement = 'Please select a banner placement.'

    const trimmedTitle = title.trim()
    if (trimmedTitle) {
      if (trimmedTitle.length < 3) errors.title = 'Title must be at least 3 characters long.'
      else if (trimmedTitle.length > 100) errors.title = 'Title cannot exceed 100 characters.'
    }

    const trimmedSubtitle = subtitle.trim()
    if (trimmedSubtitle.length > 500) errors.subtitle = 'Subtitle cannot exceed 500 characters.'

    if (!imageUrl) errors.imageUrl = 'Banner image is required.'

    const trimmedCtaLabel = ctaLabel.trim()
    const trimmedCtaUrl = ctaUrl.trim()

    if (trimmedCtaLabel.length > 50) errors.ctaLabel = 'CTA Label cannot exceed 50 characters.'

    if (trimmedCtaUrl) {
      try {
        new URL(trimmedCtaUrl)
      } catch {
        // basic fallback check if URL constructor fails but it might be a relative path
        if (!trimmedCtaUrl.startsWith('/') && !trimmedCtaUrl.startsWith('#')) {
          errors.ctaUrl = 'Please enter a valid URL.'
        }
      }
    }

    if (trimmedCtaLabel && !trimmedCtaUrl) {
      errors.ctaUrl = 'CTA URL is required when CTA Label is provided.'
    }
    if (trimmedCtaUrl && !trimmedCtaLabel) {
      errors.ctaLabel = 'CTA Label is required when CTA URL is provided.'
    }

    if (!sortOrder) {
      errors.sortOrder = 'Sort order is required.'
    } else if (!/^\d+$/.test(sortOrder)) {
      errors.sortOrder = 'Only numeric values are allowed.'
    } else {
      const num = parseInt(sortOrder, 10)
      if (num <= 0) {
        errors.sortOrder = 'Sort order must be greater than 0.'
      } else if (listData?.items) {
        const exists = listData.items.some((i: any) => 
          i.sortOrder === num && String(i.id) !== id
        )
        if (exists) {
          errors.sortOrder = 'This sort order is already in use.'
        }
      }
    }
    return errors
  }

  const errors = validate()
  const isValid = Object.keys(errors).length === 0

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  // Determine image dimensions based on placement
  const dimensionHint = placement === 'home_hero' ? 'banner-hero' : 'banner-other'
  const dimensionLabel = placement === 'home_hero' 
    ? 'Recommended: 1920×700px, wide panoramic ratio (approx. 21:9). Keep text/faces in the center. Minimum: 1200×450px.' 
    : 'Recommended: 1200×400px. Minimum: 800×300px.'

  async function handleFile(file: File) {
    setUploadError('')
    const clientCheck = await validateImageFile(file, dimensionHint)
    if (!clientCheck.valid) {
      setUploadError(clientCheck.reason)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setUploading(true)
    try {
      const data = await uploadImage(file, dimensionHint)
      setImageUrl(data.file.path)
      setTouched(prev => ({ ...prev, imageUrl: true }))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched({ placement: true, title: true, subtitle: true, imageUrl: true, ctaLabel: true, ctaUrl: true, sortOrder: true })
    
    // Auto-scroll to first error
    if (!isValid) {
      setTimeout(() => {
        const firstError = document.querySelector('.error-border')
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      return
    }

    const payload = {
      placement,
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      imageUrl,
      ctaLabel: ctaLabel.trim() || null,
      ctaUrl: ctaUrl.trim() || null,
      sortOrder: parseInt(sortOrder, 10),
      active,
    }
    saveMutation.mutate(payload)
  }

  if (isLoadingItem) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
        <p className="text-sm font-semibold text-[var(--muted)]">Loading…</p>
      </div>
    )
  }

  const getInputClass = (field: string, baseClass = "admin-input rounded w-full transition-colors duration-200") => {
    if (touched[field] && errors[field]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500 error-border`
    }
    return baseClass
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(config.path)}
          className="inline-flex items-center gap-2 rounded border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {config.title}</span>
        </button>
      </div>

      <section className="admin-card overflow-hidden rounded-lg">
        <div className="border-b border-[var(--line)] bg-gradient-to-r from-[var(--burgundy-soft)]/40 to-transparent px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--gold)] text-white">
              {isEdit ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--burgundy)]">
                {config.eyebrow}
              </p>
              <h1 className="font-display text-2xl font-semibold text-[var(--gold)] md:text-3xl">
                {isEdit ? 'Update' : 'Create'} Banner
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Placement */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[14px] font-bold uppercase tracking-widest text-[var(--muted)]">
                Placement <span className="text-red-400">*</span>
              </label>
              <select
                value={placement}
                onChange={e => setPlacement(e.target.value)}
                onBlur={() => handleBlur('placement')}
                className={getInputClass('placement')}
              >
                <option value="">Select placement...</option>
                <option value="home_hero">Home Hero</option>
              </select>
              {touched.placement && errors.placement && (
                <p className="text-xs font-semibold text-red-600">{errors.placement}</p>
              )}
            </div>

            {/* Title */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between items-end">
                <label className="block text-[14px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Title
                </label>
                <span className={`text-[10px] font-semibold ${title.length > 100 ? 'text-red-500' : 'text-[var(--muted)]'}`}>
                  {title.length}/100
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => handleBlur('title')}
                placeholder="Enter banner title"
                className={getInputClass('title')}
              />
              {touched.title && errors.title && (
                <p className="text-xs font-semibold text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Subtitle */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between items-end">
                <label className="block text-[14px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Subtitle
                </label>
                <span className={`text-[10px] font-semibold ${subtitle.length > 500 ? 'text-red-500' : 'text-[var(--muted)]'}`}>
                  {subtitle.length}/500
                </span>
              </div>
              <textarea
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                onBlur={() => handleBlur('subtitle')}
                placeholder="Enter banner subtitle"
                className={getInputClass('subtitle', "admin-input rounded w-full min-h-[100px] transition-colors duration-200")}
              />
              {touched.subtitle && errors.subtitle && (
                <p className="text-xs font-semibold text-red-600">{errors.subtitle}</p>
              )}
            </div>

            {/* Banner Image */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-[14px] font-bold uppercase tracking-widest text-[var(--muted)]">
                Banner Image <span className="text-red-400">*</span>
              </label>
              
              <div className={touched.imageUrl && errors.imageUrl ? 'error-border rounded-lg' : ''}>
                {imageUrl ? (
                  <div className="relative mb-2 overflow-hidden rounded border border-[var(--line)]">
                    <div className="flex items-center justify-center bg-[var(--panel-strong)]" style={{ minHeight: '12rem' }}>
                      <img
                        src={resolveImageUrl(imageUrl)!}
                        alt="Preview"
                        className={`w-full max-h-80 ${isSvgUrl(imageUrl) ? 'object-contain p-4' : 'object-contain'}`}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] bg-[var(--panel-strong)] px-3 py-2">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                        className="rounded border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)] disabled:opacity-50"
                      >
                        {uploading ? 'Uploading…' : 'Change Image'}
                      </button>
                      <span className="truncate text-[10px] text-[var(--muted)]">{imageUrl}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className={`flex w-full cursor-pointer flex-col items-center gap-2 rounded border-2 border-dashed bg-[var(--panel-strong)] px-4 py-8 text-center transition-colors disabled:opacity-50 ${
                      uploadError || (touched.imageUrl && errors.imageUrl) ? 'border-red-400' : 'border-[var(--line)] hover:border-[var(--burgundy)]'
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--burgundy)]" />
                    ) : (
                      <>
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                          Click to Upload Image
                        </span>
                        <span className="text-[10px] text-[var(--muted)]/60">JPG, JPEG, PNG, WEBP, SVG — Max 5 MB</span>
                        <span className="text-[10px] font-semibold text-[var(--burgundy)]">{dimensionLabel}</span>
                      </>
                    )}
                  </button>
                )}
                
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={event => {
                    const file = event.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </div>

              {uploadError && (
                <p className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {uploadError}
                </p>
              )}
              {touched.imageUrl && errors.imageUrl && !uploadError && (
                <p className="text-xs font-semibold text-red-600">{errors.imageUrl}</p>
              )}
            </div>

            {/* CTA Label */}
            <div className="space-y-2">
              <label className="block text-[14px] font-bold uppercase tracking-widest text-[var(--muted)]">
                CTA Label
              </label>
              <input
                type="text"
                value={ctaLabel}
                onChange={e => setCtaLabel(e.target.value)}
                onBlur={() => handleBlur('ctaLabel')}
                placeholder="Shop Now"
                className={getInputClass('ctaLabel')}
              />
              {touched.ctaLabel && errors.ctaLabel && (
                <p className="text-xs font-semibold text-red-600">{errors.ctaLabel}</p>
              )}
            </div>

            {/* CTA URL */}
            <div className="space-y-2">
              <label className="block text-[14px] font-bold uppercase tracking-widest text-[var(--muted)]">
                CTA URL
              </label>
              <input
                type="text"
                value={ctaUrl}
                onChange={e => setCtaUrl(e.target.value)}
                onBlur={() => handleBlur('ctaUrl')}
                placeholder="https://example.com"
                className={getInputClass('ctaUrl')}
              />
              {touched.ctaUrl && errors.ctaUrl && (
                <p className="text-xs font-semibold text-red-600">{errors.ctaUrl}</p>
              )}
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="block text-[14px] font-bold uppercase tracking-widest text-[var(--muted)]">
                Sort Order <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                onBlur={() => handleBlur('sortOrder')}
                placeholder="Enter display order"
                className={getInputClass('sortOrder')}
              />
              {touched.sortOrder && errors.sortOrder && (
                <p className="text-xs font-semibold text-red-600">{errors.sortOrder}</p>
              )}
            </div>

            {/* Active */}
            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex h-[42px] items-center gap-3 rounded border border-[var(--line)] bg-[var(--panel-strong)] px-4 cursor-pointer hover:bg-[var(--burgundy-soft)] transition-colors">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="h-4 w-4 accent-[#520001] cursor-pointer"
                />
                <span className="text-sm font-semibold text-[var(--text)]">Active</span>
              </label>
            </div>

          </div>

          {saveMutation.isError && (
            <div className="mt-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {saveMutation.error instanceof Error ? saveMutation.error.message : 'Unable to save item.'}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(config.path)}
              className="rounded border border-[var(--line)] px-5 py-2.5 text-sm font-bold text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || saveMutation.isPending || uploading}
              className="inline-flex items-center justify-center gap-2 rounded bg-[var(--gold)] px-6 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saveMutation.isPending ? 'Saving…' : isEdit ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
