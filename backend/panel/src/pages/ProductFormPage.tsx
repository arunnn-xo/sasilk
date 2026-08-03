import { FormEvent, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Image as ImageIcon,
  Layers, Loader2, Package, Sparkles, Tag, Text as TextIcon, ArrowLeft, Save, Info, Palette,
  Plus, X
} from 'lucide-react'
import { createResource, getResource, listResource, resolveImageUrl, updateResource, uploadImage } from '../services/api'
import { isSvgUrl, validateImageFile } from './ResourceShared'
import type { ResourceConfig } from '../app/resources'
import { resources } from '../app/resources'
import FieldWithTooltip from '../components/FieldWithTooltip'
import PreviewCard from '../components/PreviewCard'

const config: ResourceConfig = resources.find(r => r.api === 'products')!
const catConfig: ResourceConfig = resources.find(r => r.api === 'categories')!

const GST_OPTIONS = [
  { value: '0', label: '0% (Nil-rated / exempt)' },
  { value: '5', label: '5% (SGST 2.5% + CGST 2.5%)' },
  { value: '12', label: '12% (SGST 6% + CGST 6%)' },
  { value: '18', label: '18% (SGST 9% + CGST 9%)' },
  { value: '28', label: '28% (SGST 14% + CGST 14%)' },
]

type ProductAudience = 'women' | 'kids' | 'men' | 'unisex'

const AUDIENCE_OPTIONS: Array<{ value: ProductAudience; label: string; helper: string }> = [
  { value: 'women', label: 'Women', helper: 'Sarees, kurta sets, dupattas and women wear' },
  { value: 'kids', label: 'Kids', helper: 'Age-based sizing for boys and girls' },
  { value: 'men', label: 'Men', helper: 'Standard men apparel sizes' },
  { value: 'unisex', label: 'Unisex', helper: 'Common apparel/accessory sizing' },
]

function coerceAudience(value: unknown): ProductAudience {
  const audience = String(value || '').toLowerCase()
  if (audience === 'kids' || audience === 'boys' || audience === 'girls') return 'kids'
  if (audience === 'men') return 'men'
  if (audience === 'unisex') return 'unisex'
  return 'women'
}

const SIZE_PRESETS: Record<ProductAudience, string[]> = {
  women: ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  men: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
  kids: ['0-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-10Y', '10-12Y', '12-14Y'],
  unisex: ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'],
}

function detectAudienceFromCategory(catData: { items?: any[] } | undefined, categoryId: string): ProductAudience {
  if (!categoryId || !catData?.items) return 'women'
  const cat = catData.items.find((c: any) => String(c.id) === categoryId)
  return coerceAudience(cat?.section || '')
}

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

export default function ProductFormPage() {
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

  const { data: editQueryData, isLoading: isFetchingEditItem } = useQuery({
    queryKey: ['resource', config.api, id],
    queryFn: () => getResource(config.api, id as string),
    enabled: isEdit && !!id,
  })

  const { data: catData } = useQuery({
    queryKey: ['resource', catConfig.api],
    queryFn: () => listResource(catConfig.api, 1, 1000),
  })

  const fetchedItem = editQueryData?.item as Record<string, unknown> | undefined
  const editItem = isEdit
    ? stateItem || fetchedItem || listData?.items?.find((i: any) => String(i.id) === id) || null
    : null

  const isLoadingItem = isEdit && !stateItem && (isFetchingList || isFetchingEditItem)

  // ─── Product fields (identity only — no price/stock) ─────────
  const [name, setName] = useState(editItem ? String(editItem.name || '') : '')
  const [slug, setSlug] = useState(editItem ? String(editItem.slug || '') : '')
  const [description, setDescription] = useState(editItem ? String(editItem.description || '') : '')
  const [category, setCategory] = useState(editItem ? String(editItem.category || '') : '')
  const [imageUrl, setImageUrl] = useState(editItem ? String(editItem.imageUrl || '') : '')
  const [featured, setFeatured] = useState(editItem ? Boolean(editItem.featured) : false)
  const [isNew, setIsNew] = useState(editItem ? Boolean(editItem.isNew) : false)
  const [isBestSeller, setIsBestSeller] = useState(editItem ? Boolean(editItem.isBestSeller) : false)
  const [enableBackInStockNotify, setEnableBackInStockNotify] = useState(editItem ? Boolean(editItem.enableBackInStockNotify) : false)
  const [weightKg, setWeightKg] = useState(editItem ? String(editItem.weightKg ?? '') : '')
  const [lengthCm, setLengthCm] = useState(editItem ? String(editItem.lengthCm ?? '') : '')
  const [breadthCm, setBreadthCm] = useState(editItem ? String(editItem.breadthCm ?? '') : '')
  const [heightCm, setHeightCm] = useState(editItem ? String(editItem.heightCm ?? '') : '')
  const [washCare, setWashCare] = useState(editItem ? String((editItem.metadata as any)?.washCare || '') : '')
  const [audience, setAudience] = useState<ProductAudience>(
    coerceAudience(editItem?.gender)
  )
  const [selectedParentId, setSelectedParentId] = useState('')
  const [selectedChildId, setSelectedChildId] = useState('')
  const [selectedChildCategoryId, setSelectedChildCategoryId] = useState('')

  // ─── First Variant fields (create mode only) ────────────────
  const [variantColorName, setVariantColorName] = useState('')
  const [variantColorHex, setVariantColorHex] = useState('#000000')
  const [variantSku, setVariantSku] = useState('')
  const [variantPrice, setVariantPrice] = useState('')
  const [variantOriginalPrice, setVariantOriginalPrice] = useState('')
  const [variantStockQty, setVariantStockQty] = useState('0')
  const [variantLowStock, setVariantLowStock] = useState('10')
  const [variantGstRate, setVariantGstRate] = useState('5')
  const [variantSize, setVariantSize] = useState('')
  const [variantSizeInput, setVariantSizeInput] = useState('')

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [variantImageUrl, setVariantImageUrl] = useState('')
  const variantFileRef = useRef<HTMLInputElement>(null)
  const [variantUploading, setVariantUploading] = useState(false)
  const [variantUploadError, setVariantUploadError] = useState('')
  const [variantGallery, setVariantGallery] = useState<string[]>([])
  const galleryFileRef = useRef<HTMLInputElement>(null)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryUploadError, setGalleryUploadError] = useState('')
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (editItem) {
      setName(String(editItem.name || ''))
      setSlug(String(editItem.slug || ''))
      setDescription(String(editItem.description || ''))
      setCategory(String(editItem.category || ''))
      setImageUrl(String(editItem.imageUrl || ''))
      setFeatured(Boolean(editItem.featured))
      setIsNew(Boolean(editItem.isNew))
      setIsBestSeller(Boolean(editItem.isBestSeller))
      setEnableBackInStockNotify(Boolean(editItem.enableBackInStockNotify))
      setWeightKg(editItem.weightKg != null ? String(editItem.weightKg) : '')
      setLengthCm(editItem.lengthCm != null ? String(editItem.lengthCm) : '')
      setBreadthCm(editItem.breadthCm != null ? String(editItem.breadthCm) : '')
      setHeightCm(editItem.heightCm != null ? String(editItem.heightCm) : '')
      setWashCare(String((editItem.metadata as any)?.washCare || ''))
      setAudience(coerceAudience(editItem.gender))
      setSlugManuallyEdited(true)
      setTouched({ initialized: true })
    }
  }, [editItem])

  // Initialize parent/sub/child from saved categoryId when catData loads
  const [deletedCategory, setDeletedCategory] = useState(false)
  useEffect(() => {
    if (editItem && catData?.items) {
      const savedCatId = String(editItem.categoryId || '')
      if (!savedCatId) return
      const catMap = new Map(catData.items.map((c: any) => [String(c.id), c]))
      const savedCat = catMap.get(savedCatId)
      if (savedCat) {
        setDeletedCategory(false)
        const chain: string[] = []
        let cur: any = savedCat
        while (cur && cur.parentId && catMap.get(String(cur.parentId))) {
          chain.unshift(String(cur.id))
          cur = catMap.get(String(cur.parentId))
        }
        setSelectedParentId(String(cur?.id ?? savedCat.id))
        setSelectedChildId(chain[0] ?? '')
        setSelectedChildCategoryId(chain[1] ?? '')
      } else {
        setDeletedCategory(true)
      }
    }
  }, [editItem, catData])

  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(slugify(name))
    }
  }, [name, slugManuallyEdited])

  // Sync category name from parent/sub/child selection
  useEffect(() => {
    const effectiveId = selectedChildCategoryId || selectedChildId || selectedParentId
    if (effectiveId && catData?.items) {
      const cat = catData.items.find((c: any) => String(c.id) === effectiveId)
      setCategory(cat ? String(cat.name || '') : '')
    } else {
      setCategory('')
    }
  }, [selectedParentId, selectedChildId, selectedChildCategoryId, catData])

  const effectiveCategoryId = selectedChildCategoryId || selectedChildId || selectedParentId

  // ─── Save mutation (product + auto-create first variant) ─────
  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (isEdit && id) {
        return updateResource(config.api, id, payload)
      }
      const productResult = await createResource(config.api, payload)
      return productResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', config.api] })
      if (isEdit) {
        navigate(config.path, { state: { successMsg: 'Product updated successfully.' } })
      } else {
        navigate('/stock', { state: { successMsg: 'Product & default variant created successfully.' } })
      }
    },
    onError: (err: Error) => {
      setServerError(err.message || 'Unable to save product.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  })

  const subCategories = selectedParentId
    ? (catData?.items || [])
        .filter((c: any) => String(c.parentId) === selectedParentId && c.active !== false)
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    : []

  const childCategories = selectedChildId
    ? (catData?.items || [])
        .filter((c: any) => String(c.parentId) === selectedChildId && c.active !== false)
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    : []

  const hasParentSelected = !!selectedParentId
  const noSubcategories = hasParentSelected && subCategories.length === 0
  const needsSubcategory = hasParentSelected && subCategories.length > 0

  const validateAll = () => {
    const errors: Record<string, string> = {}
    const trimmedName = name.trim()
    if (!trimmedName) errors.name = 'Please enter a product name'
    else if (trimmedName.length < 3) errors.name = 'Name must be at least 3 characters'
    else if (trimmedName.length > 45) errors.name = 'Name cannot exceed 45 characters'

    if (!effectiveCategoryId) errors.categoryId = 'Please select a category'
    else if (!isEdit && noSubcategories) errors.categoryId = 'This category has no subcategories. Create one first.'
    else if (!isEdit && needsSubcategory && !selectedChildId) errors.categoryId = 'Please select both category and subcategory'

    if (!isEdit && !imageUrl) {
      errors.imageUrl = 'Please upload at least one product image'
    }
    if (isEdit && !imageUrl && editItem?.imageUrl) {
      errors.imageUrl = 'Product image cannot be removed. Upload a new one or cancel.'
    }

    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = 'Slug must be lowercase alphanumeric with hyphens only'
    }

    if (!description.trim()) errors.description = 'Please enter a description'
    if (!washCare.trim()) errors.washCare = 'Please enter wash care instructions'

    if (!isEdit) {
      if (!variantColorName.trim()) errors.variantColorName = 'Please enter a color name'
      if (!variantSku.trim()) errors.variantSku = 'Please enter a SKU code'
      if (!variantPrice || isNaN(Number(variantPrice)) || Number(variantPrice) <= 0) {
        errors.variantPrice = 'Please enter a valid selling price (greater than 0)'
      }
      if (!variantOriginalPrice || isNaN(Number(variantOriginalPrice)) || Number(variantOriginalPrice) <= 0) {
        errors.variantOriginalPrice = 'Please enter a valid MRP'
      } else if (Number(variantOriginalPrice) < Number(variantPrice)) {
        errors.variantOriginalPrice = 'MRP must be >= selling price'
      }
      if (!variantStockQty || isNaN(parseInt(variantStockQty, 10)) || parseInt(variantStockQty, 10) < 0) {
        errors.variantStockQty = 'Please enter a valid stock quantity'
      }
      if (!variantSize.trim()) {
        errors.variantSize = 'Please enter a size'
      }
      if (!variantImageUrl) errors.variantImageUrl = 'Please upload a variant image'
      if (variantGallery.length === 0) errors.variantGallery = 'Please add at least one gallery image'
    }

    if (!weightKg.trim() || isNaN(Number(weightKg)) || Number(weightKg) <= 0) errors.weightKg = 'Please enter parcel weight'
    if (!lengthCm.trim() || isNaN(Number(lengthCm)) || Number(lengthCm) <= 0) errors.lengthCm = 'Please enter parcel length'
    if (!breadthCm.trim() || isNaN(Number(breadthCm)) || Number(breadthCm) <= 0) errors.breadthCm = 'Please enter parcel breadth'
    if (!heightCm.trim() || isNaN(Number(heightCm)) || Number(heightCm) <= 0) errors.heightCm = 'Please enter parcel height'

    return errors
  }

  const allErrors = validateAll()
  const isValid = Object.keys(allErrors).length === 0

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  async function handleFile(file: File) {
    setUploadError('')
    const clientCheck = await validateImageFile(file, 'product-card')
    if (!clientCheck.valid) {
      setUploadError(clientCheck.reason)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setUploading(true)
    try {
      const data = await uploadImage(file, 'product-card')
      setImageUrl(data.file.path)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleVariantFile(file: File) {
    setVariantUploadError('')
    const clientCheck = await validateImageFile(file, 'product-card')
    if (!clientCheck.valid) {
      setVariantUploadError(clientCheck.reason)
      if (variantFileRef.current) variantFileRef.current.value = ''
      return
    }
    setVariantUploading(true)
    try {
      const data = await uploadImage(file, 'product-card')
      setVariantImageUrl(data.file.path)
    } catch (err) {
      setVariantUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setVariantUploading(false)
      if (variantFileRef.current) variantFileRef.current.value = ''
    }
  }

  async function handleVariantGalleryFile(file: File) {
    setGalleryUploadError('')
    const clientCheck = await validateImageFile(file, 'product-card')
    if (!clientCheck.valid) {
      setGalleryUploadError(clientCheck.reason)
      if (galleryFileRef.current) galleryFileRef.current.value = ''
      return
    }
    setGalleryUploading(true)
    try {
      const data = await uploadImage(file, 'product-card')
      setVariantGallery(prev => [...prev, data.file.path])
    } catch (err) {
      setGalleryUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setGalleryUploading(false)
      if (galleryFileRef.current) galleryFileRef.current.value = ''
    }
  }

  const submit = (e?: FormEvent) => {
    if (e) e.preventDefault()
    setServerError('')
    setTouched(prev => ({
      ...prev,
      name: true, categoryId: true, imageUrl: true, audience: true,
      description: true, washCare: true,
      weightKg: true, lengthCm: true, breadthCm: true, heightCm: true,
      ...(!isEdit ? {
        variantColorName: true, variantPrice: true, variantStockQty: true,
        variantOriginalPrice: true, variantSize: true,
        variantSku: true, variantImageUrl: true, variantGallery: true,
      } : {}),
    }))

    if (!isValid) {
      const msgs = Object.values(allErrors).join('. ')
      setServerError(msgs || 'Please fix the highlighted errors.')
      const firstError = document.querySelector('.text-red-600')
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const payload: Record<string, unknown> = {
      name: name.trim(),
      slug: slug || slugify(name),
      description: description.trim() || null,
      category: category.trim() || null,
      categoryId: effectiveCategoryId ? Number(effectiveCategoryId) : null,
      ...(selectedChildId ? { parentCategoryId: Number(selectedParentId) } : {}),
      imageUrl: imageUrl || null,
      gender: audience,
      ageGroup: audience === 'kids' ? 'kids' : 'adult',
      featured,
      isNew,
      isBestSeller,
      enableBackInStockNotify,
      weightKg: weightKg !== '' ? Number(weightKg) : null,
      lengthCm: lengthCm !== '' ? Number(lengthCm) : null,
      breadthCm: breadthCm !== '' ? Number(breadthCm) : null,
      heightCm: heightCm !== '' ? Number(heightCm) : null,
      metadata: {
        ...(editItem?.metadata ? (editItem.metadata as Record<string, unknown>) : {}),
        washCare: washCare.trim() || null,
      },
    }

    if (!isEdit) {
      payload.price = variantPrice ? Number(variantPrice) : 0
      payload.originalPrice = variantOriginalPrice ? Number(variantOriginalPrice) : null
      payload.stockQty = parseInt(variantStockQty, 10) || 0
      payload.sortOrder = 0
      payload.hasVariants = true
      payload.variantType = 'color'
      payload.colorName = variantColorName.trim() || null
      payload.colorHex = variantColorName.trim() ? variantColorHex : null
      payload.size = variantSize.trim() || null
      payload.sizes = null
      payload.sizeStock = null
      payload.sku = variantSku.trim() || null
      payload.lowStockThreshold = parseInt(variantLowStock, 10) || 10
      payload.gstRate = variantGstRate !== '' ? Number(variantGstRate) : 5.00
      payload.variantImageUrl = variantImageUrl || null
      payload.variantImages = variantGallery
    }
    saveMutation.mutate(payload)
  }

  const parentCategories = (catData?.items || [])
    .filter((c: any) => !c.parentId && c.active !== false)
    .sort((a: any, b: any) => {
      if (a.section !== b.section) return String(a.section).localeCompare(String(b.section))
      return (a.sortOrder || 0) - (b.sortOrder || 0)
    })

  if (isLoadingItem) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
        <p className="text-sm font-semibold text-[var(--muted)]">Loading product…</p>
      </div>
    )
  }

  if (isEdit && !editItem && !isFetchingList) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--burgundy-soft)]">
          <Package className="h-7 w-7 text-[var(--burgundy)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--muted)]">Product not found.</p>
        <button
          type="button"
          onClick={() => navigate(config.path)}
          className="inline-flex items-center gap-2 rounded border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)]"
        >
          ← Back to Products
        </button>
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
            <h1 className="text-xl font-bold text-[var(--text)]">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            {isEdit && <p className="text-xs text-[var(--muted)] tracking-wider uppercase mt-0.5">{slug}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(config.path)}
            className="rounded px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => submit()}
            disabled={saveMutation.isPending || (!isEdit && noSubcategories)}
            className="inline-flex items-center gap-2 rounded bg-[var(--burgundy)] px-6 py-2.5 text-sm font-bold tracking-wide text-white transition-all hover:bg-[#430000] hover:shadow-md disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Product'}
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
          {saveMutation.error instanceof Error ? saveMutation.error.message : 'Unable to save product.'}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN - 2/3 */}
        <div className="lg:col-span-2">
           <SectionCard title="Basic Information" icon={<TextIcon className="h-4 w-4" />}>
              <div className="space-y-5">
                <FieldWithTooltip label="Product Name" required tooltip="The name shown to customers on the storefront">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Enter product name"
                    className={getInputClass('name')}
                    maxLength={45}
                  />
                  {touched.name && allErrors.name && (
                    <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.name}</p>
                  )}
                </FieldWithTooltip>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    onBlur={() => handleBlur('description')}
                    placeholder="Describe the product and its features…"
                    rows={5}
                    maxLength={2000}
                    className={`${getInputClass('description')} min-h-[120px] resize-y`}
                  />
                  {touched.description && allErrors.description && (
                    <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.description}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                    Wash Care & Maintenance <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={washCare}
                    onChange={e => setWashCare(e.target.value)}
                    onBlur={() => handleBlur('washCare')}
                    placeholder="Dry clean only. Do not bleach. Store in a cool, dry place…"
                    rows={3}
                    maxLength={500}
                    className={`${getInputClass('washCare')} min-h-[80px]`}
                  />
                  {touched.washCare && allErrors.washCare && (
                    <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.washCare}</p>
                  )}
                </div>
              </div>
           </SectionCard>

           <SectionCard title="Media" icon={<ImageIcon className="h-4 w-4" />}>
             <div className="space-y-2">
                <label className="block text-[14px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2">
                  Product Image <span className="text-red-400">*</span>
                </label>
                {imageUrl ? (
                  <div className="group relative overflow-hidden rounded-lg border border-[var(--line)] bg-[#F9FAFB]">
                    <div className="flex items-center justify-center p-4 min-h-[16rem]">
                      <img
                        src={resolveImageUrl(imageUrl)}
                        alt="Product Preview"
                        className={`w-full max-h-72 ${isSvgUrl(imageUrl) ? 'object-contain' : 'object-contain'}`}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-4 backdrop-blur-sm">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                        className="rounded bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text)] transition-colors hover:bg-gray-100 shadow-sm disabled:opacity-50"
                      >
                        {uploading ? 'Uploading…' : 'Change Image'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700 shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--line)] bg-[#F9FAFB] px-4 py-12 text-center transition-all hover:border-[var(--burgundy)] hover:bg-[var(--burgundy-soft)] disabled:opacity-50 group"
                  >
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy)]" />
                    ) : (
                      <>
                        <div className="rounded-full bg-white p-3 shadow-sm group-hover:text-[var(--burgundy)]">
                          <ImageIcon className="h-6 w-6 text-[var(--muted)] group-hover:text-[var(--burgundy)] transition-colors" />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-[var(--text)]">Click to Upload Main Image</span>
                          <span className="mt-1 block text-xs text-[var(--muted)]">JPG, PNG, WEBP, SVG — 800×1000px recommended</span>
                        </div>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
                {touched.imageUrl && allErrors.imageUrl && (
                  <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.imageUrl}</p>
                )}
                {uploadError && (
                  <p className="mt-1 text-xs font-semibold text-red-600">{uploadError}</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Product Audience" icon={<Layers className="h-4 w-4" />}>
             <div className="space-y-5">
               <FieldWithTooltip label="Audience" required tooltip="Controls the recommended size choices in the Variants Manager">
                 <div className="grid gap-3 sm:grid-cols-2">
                   {AUDIENCE_OPTIONS.map(option => {
                     const active = audience === option.value
                     return (
                       <button
                         key={option.value}
                         type="button"
                         onClick={() => {
                           setAudience(option.value)
                           setTouched(prev => ({ ...prev, audience: true }))
                         }}
                         className={`rounded-lg border p-3 text-left transition-colors ${
                           active
                             ? 'border-[var(--burgundy)] bg-[var(--burgundy-soft)] text-[var(--burgundy)]'
                             : 'border-[var(--line)] bg-[#F9FAFB] text-[var(--text)] hover:border-[var(--burgundy-soft)]'
                         }`}
                       >
                         <span className="block text-sm font-bold">{option.label}</span>
                         <span className="mt-1 block text-[11px] leading-4 text-[var(--muted)]">{option.helper}</span>
                       </button>
                     )
                   })}
                 </div>
                 {touched.audience && allErrors.audience && (
                   <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.audience}</p>
                 )}
               </FieldWithTooltip>

               <div className="rounded-lg border border-[var(--line)] bg-[#F9FAFB] p-4 text-xs leading-5 text-[var(--muted)]">
                 Product audience is saved on the product. Sizes, colors, stock, SKU, and variant images are managed from the Variants Manager after saving.
               </div>
             </div>
           </SectionCard>

           {/* ─── First Variant Section (CREATE mode) / Variants Manager (EDIT mode) ──── */}
           <SectionCard title={isEdit ? 'Variants' : 'First Variant'} icon={isEdit ? <Layers className="h-4 w-4" /> : <Palette className="h-4 w-4" />}>
             {isEdit ? (
               /* EDIT mode — show existing "Open Variants Manager" */
               <div className="flex flex-col items-center gap-4 py-8 text-center bg-[#F9FAFB] rounded-lg border border-dashed border-[var(--line)]">
                 <div className="rounded-full bg-white p-4 shadow-sm">
                   <Layers className="h-8 w-8 text-[var(--gold)]" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-[var(--text)]">
                     Manage colors, sizes, and stock variants
                   </p>
                   <p className="mt-1 text-xs text-[var(--muted)] max-w-md mx-auto">
                     Variants are managed in a dedicated section to allow for individual images, pricing, and stock keeping units.
                   </p>
                 </div>
                 <button
                   type="button"
                   onClick={() => navigate(`/variants?productId=${id}`)}
                   className="mt-2 inline-flex items-center gap-2 rounded bg-[var(--gold)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[var(--gold-soft)] hover:shadow-md"
                 >
                   <Layers className="h-4 w-4" />
                   Open Variants Manager
                 </button>
               </div>
             ) : (
               /* CREATE mode — inline first variant form */
               <div className="space-y-5">
                 <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                   <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                     <Info className="h-3.5 w-3.5 flex-shrink-0" />
                     Fill in the first variant details below. When you save, both the product and its first variant will be created together.
                   </p>
                 </div>

                  {/* ── Variant Identity ── */}
                  <div className="grid gap-4 sm:grid-cols-2">

                   <div className="space-y-1.5">
                      <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                        Color Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={variantColorName}
                        onChange={e => setVariantColorName(e.target.value)}
                        onBlur={() => handleBlur('variantColorName')}
                        placeholder="e.g. Cherry Red"
                        className={getInputClass('variantColorName')}
                      />
                      {touched.variantColorName && allErrors.variantColorName && (
                        <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantColorName}</p>
                      )}
                    </div>

                   <div className="space-y-1.5">
                      <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                        Color Hex <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={variantColorHex}
                          onChange={e => setVariantColorHex(e.target.value)}
                          className="h-[42px] w-14 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
                        />
                        <input
                          type="text"
                          value={variantColorHex}
                          onChange={e => setVariantColorHex(e.target.value)}
                          onBlur={() => handleBlur('variantColorHex')}
                          className={`${getInputClass('variantColorHex')} uppercase`}
                          placeholder="#FF0000"
                        />
                      </div>
                      {touched.variantColorHex && allErrors.variantColorHex && (
                        <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantColorHex}</p>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                        Size <span className="text-red-500">*</span>
                      </label>
                      {audience ? (
                        <div className="flex flex-wrap gap-2">
                          {SIZE_PRESETS[audience].map(size => {
                            const active = variantSize === size
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => { setVariantSize(active ? '' : size); setVariantSizeInput(''); handleBlur('variantSize') }}
                                className={`rounded-lg border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                  active
                                    ? 'border-violet-600 bg-violet-600 text-white'
                                    : 'border-[var(--line)] bg-[#F9FAFB] text-[var(--text)] hover:border-violet-300'
                                }`}
                              >
                                {size}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--muted)]">Select a category or set audience above to see size options.</p>
                      )}
                      {variantSize && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="inline-flex items-center gap-1 rounded bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                            {variantSize}
                            <button
                              type="button"
                              onClick={() => { setVariantSize(''); setVariantSizeInput(''); handleBlur('variantSize') }}
                              className="text-violet-400 hover:text-violet-700 leading-none"
                            >
                              ×
                            </button>
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={variantSizeInput}
                          onChange={e => setVariantSizeInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const trimmed = variantSizeInput.trim()
                              if (trimmed) { setVariantSize(trimmed); setVariantSizeInput(''); handleBlur('variantSize') }
                            }
                          }}
                          placeholder="Type and press Enter or click a preset above"
                          className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs outline-none focus:border-violet-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = variantSizeInput.trim()
                            if (trimmed) { setVariantSize(trimmed); setVariantSizeInput(''); handleBlur('variantSize') }
                          }}
                          className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      {touched.variantSize && allErrors.variantSize && (
                        <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantSize}</p>
                      )}
                    </div>

                   {/* SKU */}
                   <div className="space-y-1.5">
                     <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                       SKU Code <span className="text-red-400">*</span>
                     </label>
                     <input
                       type="text"
                       value={variantSku}
                       onChange={e => setVariantSku(e.target.value)}
                       onBlur={() => handleBlur('variantSku')}
                       placeholder="Unique SKU, e.g. TN-SAR-001-RED"
                       className={getInputClass('variantSku')}
                     />
                     {touched.variantSku && allErrors.variantSku && (
                       <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantSku}</p>
                     )}
                   </div>
                 </div>

                 {/* ── Price & Inventory ── */}
                 <div className="border-t border-[var(--line)] pt-4 mt-4">
                   <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
                     Price & Inventory
                   </p>
                   <div className="grid gap-4 sm:grid-cols-2">
                     <div className="space-y-1.5">
                       <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                         Selling Price (₹) *
                       </label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted)]">₹</span>
                         <input
                           type="number"
                           min="0"
                           step="0.01"
                           value={variantPrice}
                           onChange={e => setVariantPrice(e.target.value)}
                           onBlur={() => handleBlur('variantPrice')}
                           placeholder="0.00"
                           className={`${getInputClass('variantPrice')} !pl-9`}
                         />
                       </div>
                       {touched.variantPrice && allErrors.variantPrice && (
                         <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantPrice}</p>
                       )}
                     </div>

                     <div className="space-y-1.5">
                       <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                         MRP (₹) <span className="text-red-400">*</span>
                       </label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted)]">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variantOriginalPrice}
                            onChange={e => setVariantOriginalPrice(e.target.value)}
                            onBlur={() => handleBlur('variantOriginalPrice')}
                            placeholder="0.00"
                            className={`${getInputClass('variantOriginalPrice')} !pl-9`}
                          />
                        </div>
                        {touched.variantOriginalPrice && allErrors.variantOriginalPrice && (
                          <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantOriginalPrice}</p>
                        )}
                        {variantPrice && variantOriginalPrice && Number(variantOriginalPrice) > Number(variantPrice) && (
                          <p className="mt-1 text-xs font-semibold text-green-600">
                            You save ₹{(Number(variantOriginalPrice) - Number(variantPrice)).toLocaleString('en-IN')} ({Math.round((1 - Number(variantPrice) / Number(variantOriginalPrice)) * 100)}% OFF)
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                          Stock Qty <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variantStockQty}
                          onChange={e => setVariantStockQty(e.target.value)}
                          onBlur={() => handleBlur('variantStockQty')}
                          placeholder="0"
                          className={getInputClass('variantStockQty')}
                        />
                        {touched.variantStockQty && allErrors.variantStockQty && (
                          <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantStockQty}</p>
                        )}
                      </div>

                     <div className="space-y-1.5">
                       <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                         Low Stock Threshold <span className="text-red-400">*</span>
                       </label>
                       <input
                         type="number"
                         min="0"
                         value={variantLowStock}
                         onChange={e => setVariantLowStock(e.target.value)}
                         onBlur={() => handleBlur('variantLowStock')}
                         placeholder="10"
                         className={getInputClass('variantLowStock')}
                       />
                       {touched.variantLowStock && allErrors.variantLowStock && (
                         <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantLowStock}</p>
                       )}
                     </div>

                     <div className="space-y-1.5">
                       <label className="block text-[13px] font-bold uppercase tracking-widest text-[var(--muted)]">
                         GST Rate <span className="text-red-400">*</span>
                       </label>
                       <select
                         value={variantGstRate}
                         onChange={e => setVariantGstRate(e.target.value)}
                         onBlur={() => handleBlur('variantGstRate')}
                         className={getInputClass('variantGstRate')}
                       >
                         {GST_OPTIONS.map(opt => (
                           <option key={opt.value} value={opt.value}>{opt.label}</option>
                         ))}
                       </select>
                       {touched.variantGstRate && allErrors.variantGstRate && (
                         <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantGstRate}</p>
                       )}
                     </div>
                    </div>
                  </div>

                  {/* ── Variant Image ── */}
                  <div className="border-t border-[var(--line)] pt-4 mt-4">
                   <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
                     Variant Image <span className="text-red-400">*</span>
                   </p>
                    {variantImageUrl ? (
                      <div className="group relative overflow-hidden rounded-lg border border-[var(--line)] bg-[#F9FAFB]">
                        <div className="flex items-center justify-center p-4 min-h-[12rem]">
                          <img
                            src={resolveImageUrl(variantImageUrl)}
                            alt="Variant Preview"
                            className="w-full max-h-48 object-contain"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-4 backdrop-blur-sm">
                          <button
                            type="button"
                            disabled={variantUploading}
                            onClick={() => variantFileRef.current?.click()}
                            className="rounded bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text)] transition-colors hover:bg-gray-100 shadow-sm disabled:opacity-50"
                          >
                            {variantUploading ? 'Uploading…' : 'Change Image'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setVariantImageUrl('')}
                            className="rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700 shadow-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={variantUploading}
                        onClick={() => variantFileRef.current?.click()}
                        className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--line)] bg-[#F9FAFB] px-4 py-8 text-center transition-all hover:border-[var(--burgundy)] hover:bg-[var(--burgundy-soft)] disabled:opacity-50 group"
                      >
                        {variantUploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy)]" />
                        ) : (
                          <>
                            <div className="rounded-full bg-white p-3 shadow-sm group-hover:text-[var(--burgundy)]">
                              <ImageIcon className="h-6 w-6 text-[var(--muted)] group-hover:text-[var(--burgundy)] transition-colors" />
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-[var(--text)]">Upload Variant Image</span>
                              <span className="mt-1 block text-xs text-[var(--muted)]">JPG, PNG, WEBP, SVG — 800×1000px recommended</span>
                            </div>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={variantFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleVariantFile(file)
                      }}
                    />
                    {variantUploadError && (
                      <p className="mt-1 text-xs font-semibold text-red-600">{variantUploadError}</p>
                    )}
                    {touched.variantImageUrl && allErrors.variantImageUrl && (
                      <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.variantImageUrl}</p>
                    )}
                  </div>

                  {/* ── Variant Gallery (sub-images) ── */}
                  <div className="border-t border-[var(--line)] pt-4 mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
                      Variant Gallery <span className="text-red-400">*</span>
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {variantGallery.map((url, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-lg border border-[var(--line)] bg-[#F9FAFB]">
                          <img
                            src={resolveImageUrl(url)}
                            alt={`Gallery ${idx + 1}`}
                            className="h-28 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setVariantGallery(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute right-1 top-1 rounded bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {variantGallery.length < 7 && (
                        <button
                          type="button"
                          disabled={galleryUploading}
                          onClick={() => galleryFileRef.current?.click()}
                          className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[var(--line)] bg-[#F9FAFB] text-center transition-all hover:border-[var(--burgundy)] hover:bg-[var(--burgundy-soft)] disabled:opacity-50 group"
                        >
                          {galleryUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-[var(--burgundy)]" />
                          ) : (
                            <>
                              <Plus className="h-5 w-5 text-[var(--muted)] group-hover:text-[var(--burgundy)]" />
                              <span className="text-[10px] font-semibold text-[var(--muted)] group-hover:text-[var(--burgundy)]">Add</span>
                            </>
                          )}
                        </button>
                      )}
                      {galleryUploadError && (
                        <p className="col-span-3 mt-1 text-xs font-semibold text-red-600">{galleryUploadError}</p>
                      )}
                      {touched.variantGallery && allErrors.variantGallery && (
                        <p className="col-span-3 mt-1 text-xs font-semibold text-red-600">{allErrors.variantGallery}</p>
                      )}
                    </div>
                    <input
                      ref={galleryFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleVariantGalleryFile(file)
                      }}
                    />
                  </div>
                </div>
              )}
            </SectionCard>
         </div>

         {/* RIGHT COLUMN - 1/3 */}
        <div className="space-y-6">
           <SectionCard title="Categories" icon={<Tag className="h-4 w-4" />}>
             <div className="space-y-5">
               <FieldWithTooltip
                 label="Parent Category"
                 required
                 tooltip="Select the main category for this product"
               >
                 {parentCategories.length === 0 ? (
                   <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                     You need to create a category first. Go to Categories → Add New
                   </div>
                 ) : (
                    <select
                      value={selectedParentId}
                      onChange={e => {
                        setSelectedParentId(e.target.value)
                        setSelectedChildId('')
                        setSelectedChildCategoryId('')
                        setAudience(detectAudienceFromCategory(catData, e.target.value))
                      }}
                      onBlur={() => handleBlur('categoryId')}
                      className={getInputClass('categoryId')}
                    >
                      <option value="">— Select Category —</option>
                      {parentCategories.map((c: any) => (
                        <option key={c.id} value={String(c.id)}>
                          [{c.section}] {c.name}
                        </option>
                      ))}
                    </select>
                 )}
                 {touched.categoryId && allErrors.categoryId && (
                   <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.categoryId}</p>
                 )}
               </FieldWithTooltip>

                {subCategories.length > 0 && (
                  <FieldWithTooltip
                    label="Subcategory"
                    required
                    tooltip={`Required for new products${isEdit ? '' : '. Select a subcategory within the parent'}`}
                  >
                     <select
                       value={selectedChildId}
                       onChange={e => {
                         setSelectedChildId(e.target.value)
                         setSelectedChildCategoryId('')
                         if (e.target.value) {
                           setAudience(detectAudienceFromCategory(catData, e.target.value))
                         } else {
                           setAudience(detectAudienceFromCategory(catData, selectedParentId))
                         }
                       }}
                       onBlur={() => handleBlur('categoryId')}
                       className={getInputClass('categoryId')}
                     >
                       <option value="">— None (Use parent only) —</option>
                       {subCategories.map((c: any) => (
                         <option key={c.id} value={String(c.id)}>{c.name}</option>
                       ))}
                     </select>
                  </FieldWithTooltip>
                )}

                {childCategories.length > 0 && (
                  <FieldWithTooltip
                    label="Child Category"
                    tooltip="Optional. Select a child category within the subcategory if this product belongs to one."
                  >
                     <select
                       value={selectedChildCategoryId}
                       onChange={e => {
                         setSelectedChildCategoryId(e.target.value)
                         if (e.target.value) {
                           setAudience(detectAudienceFromCategory(catData, e.target.value))
                         } else {
                           setAudience(detectAudienceFromCategory(catData, selectedChildId))
                         }
                       }}
                       onBlur={() => handleBlur('categoryId')}
                       className={getInputClass('categoryId')}
                     >
                       <option value="">— None (Use subcategory only) —</option>
                       {childCategories.map((c: any) => (
                         <option key={c.id} value={String(c.id)}>{c.name}</option>
                       ))}
                     </select>
                  </FieldWithTooltip>
                )}

                {noSubcategories && !isEdit && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-semibold text-amber-700 mb-2">
                      This category has no subcategories. Create at least one subcategory before adding a product.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/subcategories/new?parentId=${selectedParentId}`)}
                      className="inline-flex items-center gap-1.5 rounded bg-[var(--burgundy)] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#430000]"
                    >
                      <Plus className="h-3 w-3" />
                      Create Subcategory
                    </button>
                  </div>
                )}
             </div>
           </SectionCard>

            <SectionCard title="Product Flags" icon={<Sparkles className="h-4 w-4" />}>
              <div className="space-y-4">
                 <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[#F9FAFB] p-4 cursor-pointer transition-colors hover:border-[var(--burgundy-soft)]">
                   <div>
                     <span className="block text-[13px] font-bold text-[var(--text)]">Featured Product</span>
                     <span className="block text-[11px] text-[var(--muted)]">Show in featured sections</span>
                   </div>
                   <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" style={{ backgroundColor: featured ? 'var(--burgundy)' : 'var(--line)' }}>
                     <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="peer sr-only" />
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${featured ? 'translate-x-6' : 'translate-x-1'}`} />
                   </div>
                 </label>

                  <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[#F9FAFB] p-4 cursor-pointer transition-colors hover:border-[var(--burgundy-soft)]">
                    <div>
                      <span className="block text-[13px] font-bold text-[var(--text)]">New Arrival</span>
                      <span className="block text-[11px] text-[var(--muted)]">Shows a "New" badge. Turning this on turns off Best Seller.</span>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" style={{ backgroundColor: isNew ? 'var(--burgundy)' : 'var(--line)' }}>
                      <input
                        type="checkbox"
                        checked={isNew}
                        onChange={e => {
                          setIsNew(e.target.checked)
                          if (e.target.checked) setIsBestSeller(false)
                        }}
                        className="peer sr-only"
                      />
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isNew ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[#F9FAFB] p-4 cursor-pointer transition-colors hover:border-[var(--burgundy-soft)]">
                    <div>
                      <span className="block text-[13px] font-bold text-[var(--text)]">Best Seller</span>
                      <span className="block text-[11px] text-[var(--muted)]">Shows a "Best Seller" badge. Turning this on turns off New Arrival.</span>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" style={{ backgroundColor: isBestSeller ? 'var(--burgundy)' : 'var(--line)' }}>
                      <input
                        type="checkbox"
                        checked={isBestSeller}
                        onChange={e => {
                          setIsBestSeller(e.target.checked)
                          if (e.target.checked) setIsNew(false)
                        }}
                        className="peer sr-only"
                      />
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isBestSeller ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </label>

                  {deletedCategory && (
                   <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                     <p className="text-xs font-semibold text-amber-700">
                       The previously saved category has been deleted. Please select a new category.
                     </p>
                   </div>
                 )}
              </div>
            </SectionCard>

            <SectionCard title="Shipping & Dimensions (for Shiprocket)" icon={<Package className="h-4 w-4" />}>
             <div className="rounded-lg border border-[var(--line)] bg-[#F9FAFB] p-4 mb-4">
               <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Parcel Dimensions</span>
               <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                 Used to calculate shipping charges via Shiprocket. Leave empty to use defaults (10×10×5 cm, 0.5 kg).
               </p>
             </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Weight (KG) <span className="text-red-400">*</span></label>
                   <input
                     type="text"
                     inputMode="decimal"
                     value={weightKg}
                     onChange={e => setWeightKg(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                     onBlur={() => handleBlur('weightKg')}
                     placeholder="0.5"
                     className={getInputClass('weightKg')}
                   />
                   {touched.weightKg && allErrors.weightKg && (
                     <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.weightKg}</p>
                   )}
                 </div>
                 <div className="space-y-1.5">
                   <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Length (CM) <span className="text-red-400">*</span></label>
                   <input
                     type="text"
                     inputMode="decimal"
                     value={lengthCm}
                     onChange={e => setLengthCm(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                     onBlur={() => handleBlur('lengthCm')}
                     placeholder="10"
                     className={getInputClass('lengthCm')}
                   />
                   {touched.lengthCm && allErrors.lengthCm && (
                     <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.lengthCm}</p>
                   )}
                 </div>
                 <div className="space-y-1.5">
                   <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Breadth (CM) <span className="text-red-400">*</span></label>
                   <input
                     type="text"
                     inputMode="decimal"
                     value={breadthCm}
                     onChange={e => setBreadthCm(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                     onBlur={() => handleBlur('breadthCm')}
                     placeholder="10"
                     className={getInputClass('breadthCm')}
                   />
                   {touched.breadthCm && allErrors.breadthCm && (
                     <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.breadthCm}</p>
                   )}
                 </div>
                 <div className="space-y-1.5">
                   <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Height (CM) <span className="text-red-400">*</span></label>
                   <input
                     type="text"
                     inputMode="decimal"
                     value={heightCm}
                     onChange={e => setHeightCm(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                     onBlur={() => handleBlur('heightCm')}
                     placeholder="5"
                     className={getInputClass('heightCm')}
                   />
                   {touched.heightCm && allErrors.heightCm && (
                     <p className="mt-1 text-xs font-semibold text-red-600">{allErrors.heightCm}</p>
                   )}
                 </div>
              </div>
           </SectionCard>

           <div className="space-y-2 sticky top-[100px]">
             <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] px-2">Storefront Preview</h4>
             <PreviewCard
               name={name || 'Your Product Name'}
               imageUrl={imageUrl}
               tag={isNew ? 'New' : isBestSeller ? 'Best Seller' : undefined}
             />
           </div>
        </div>
      </div>
    </form>
  )
}
