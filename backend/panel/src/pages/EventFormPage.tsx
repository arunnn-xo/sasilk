import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Upload,
  ImageIcon,
  Video,
  Star,
  Trash2,
  Plus,
  X,
  Loader2,
  Link as LinkIcon,
  Film,
} from 'lucide-react'
import { apiFetch, resolveImageUrl, uploadImage, uploadVideo } from '../services/api'

type EventFormState = {
  name: string
  description: string
  imageUrl: string
  images: string[]
  videoUrl: string
  eventDate: string
  startTime: string
  endTime: string
  price: string
  mode: 'offline' | 'online' | 'both'
  venueAddress: string
  zoomLink: string
  capacity: string
  isActive: boolean
}

const emptyForm: EventFormState = {
  name: '',
  description: '',
  imageUrl: '',
  images: [],
  videoUrl: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  price: '0',
  mode: 'both',
  venueAddress: '',
  zoomLink: '',
  capacity: '',
  isActive: true,
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

function to12h(hhmm: string): { hour: number; minute: string; meridiem: 'AM' | 'PM' } {
  const [h = 18, m = '00'] = (hhmm || '18:00').split(':').map(v => Number(v))
  return { hour: (h % 12) || 12, minute: String(m).padStart(2, '0'), meridiem: h >= 12 ? 'PM' : 'AM' }
}

function to24h(hour: number, minute: string, meridiem: 'AM' | 'PM'): string {
  let h = hour % 12
  if (meridiem === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${minute}`
}

function TimeField({ value, onChange }: { value: string; onChange: (hhmm: string) => void; id: string }) {
  const t = to12h(value)
  return (
    <div className="flex items-center gap-1.5">
      <select
        aria-label="Hour"
        value={t.hour}
        onChange={e => onChange(to24h(Number(e.target.value), t.minute, t.meridiem))}
        className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none focus:border-[#8B1A2B]"
      >
        {HOURS.map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-xs text-gray-400">:</span>
      <select
        aria-label="Minute"
        value={t.minute}
        onChange={e => onChange(to24h(t.hour, e.target.value, t.meridiem))}
        className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none focus:border-[#8B1A2B]"
      >
        {MINUTES.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => onChange(to24h(t.hour, t.minute, 'AM'))}
          className={`rounded-t-md border px-2 py-1 text-xs font-bold transition-colors ${
            t.meridiem === 'AM'
              ? 'border-[#8B1A2B] bg-[#8B1A2B] text-white'
              : 'border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => onChange(to24h(t.hour, t.minute, 'PM'))}
          className={`rounded-b-md border px-2 py-1 text-xs font-bold transition-colors ${
            t.meridiem === 'PM'
              ? 'border-[#8B1A2B] bg-[#8B1A2B] text-white'
              : 'border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          PM
        </button>
      </div>
    </div>
  )
}

type ParsedVideo =
  | { type: 'youtube'; embedUrl: string; label: string }
  | { type: 'vimeo'; embedUrl: string; label: string }
  | { type: 'direct'; directUrl: string; label: string }

function parseVideoSource(rawUrl: string): ParsedVideo | null {
  const trimmed = (rawUrl || '').trim()
  if (!trimmed) return null

  // YouTube matchers
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i)
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
      label: 'YouTube Video',
    }
  }

  // Vimeo matchers
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)|player\.vimeo\.com\/video\/)(\d+)/i)
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      label: 'Vimeo Video',
    }
  }

  // Direct video URL or uploaded file path
  return {
    type: 'direct',
    directUrl: resolveImageUrl(trimmed),
    label: 'Direct Video Stream',
  }
}

export default function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<EventFormState>(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Gallery state
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [manualImageUrl, setManualImageUrl] = useState('')
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Video state
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState('')
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    apiFetch<{ event: any }>(`/admin/events/${id}`)
      .then(res => {
        const e = res.event ?? {}
        const evImages = Array.isArray(e.images) && e.images.length > 0
          ? e.images.filter((u: any): u is string => typeof u === 'string' && u.trim().length > 0)
          : (e.imageUrl ? [e.imageUrl] : [])
        const primaryCover = e.imageUrl || (evImages.length > 0 ? evImages[0] : '')

        setForm({
          name: e.name ?? '',
          description: e.description ?? '',
          imageUrl: primaryCover,
          images: evImages,
          videoUrl: e.videoUrl ?? '',
          eventDate: e.eventDate ?? '',
          startTime: e.startTime ?? '',
          endTime: e.endTime ?? '',
          price: String(e.price ?? 0),
          mode: e.mode ?? 'both',
          venueAddress: e.venueAddress ?? '',
          zoomLink: e.zoomLink ?? '',
          capacity: e.capacity ? String(e.capacity) : '',
          isActive: Boolean(e.isActive),
        })
      })
      .catch((err: any) => setError(err?.message || 'Could not load event.'))
      .finally(() => setLoading(false))
  }, [id])

  function update<K extends keyof EventFormState>(key: K, value: EventFormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // ─── Image Gallery Handlers ─────────────────────────────────────────────
  async function handleImageFiles(files: FileList | File[]) {
    setUploadError('')
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    const invalidType = fileArray.find(f => !allowed.includes(f.type))
    if (invalidType) {
      setUploadError(`File "${invalidType.name}" is not supported. Only JPEG, PNG, and WebP images are allowed.`)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
      return
    }

    const oversized = fileArray.find(f => f.size > 5 * 1024 * 1024)
    if (oversized) {
      setUploadError(`File "${oversized.name}" exceeds the 5 MB limit.`)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
      return
    }

    setUploadingImages(true)
    setUploadProgress(`Uploading 1 of ${fileArray.length}...`)

    const uploadedPaths: string[] = []

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}: ${file.name}...`)
      try {
        const data = await uploadImage(file, 'event-card')
        if (data?.file?.path) {
          uploadedPaths.push(data.file.path)
        }
      } catch (err: any) {
        setUploadError(prev => (prev ? `${prev}. ` : '') + `Failed to upload "${file.name}": ${err?.message || 'Upload error'}`)
      }
    }

    if (uploadedPaths.length > 0) {
      setForm(prev => {
        const nextImages = [...prev.images, ...uploadedPaths]
        const nextCover = prev.imageUrl || uploadedPaths[0] || ''
        return {
          ...prev,
          images: nextImages,
          imageUrl: nextCover,
        }
      })
    }

    setUploadingImages(false)
    setUploadProgress('')
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  function handleAddImageUrl() {
    const url = manualImageUrl.trim()
    if (!url) return

    if (form.images.includes(url)) {
      setUploadError('This image URL is already in the gallery.')
      return
    }

    setForm(prev => {
      const nextImages = [...prev.images, url]
      const nextCover = prev.imageUrl || url
      return {
        ...prev,
        images: nextImages,
        imageUrl: nextCover,
      }
    })
    setManualImageUrl('')
    setUploadError('')
  }

  function removeImage(indexToRemove: number) {
    const removedUrl = form.images[indexToRemove]
    const nextImages = form.images.filter((_, i) => i !== indexToRemove)
    const nextCover = form.imageUrl === removedUrl ? (nextImages[0] || '') : form.imageUrl
    setForm(prev => ({
      ...prev,
      images: nextImages,
      imageUrl: nextCover,
    }))
  }

  function setAsCover(imgUrl: string) {
    setForm(prev => ({
      ...prev,
      imageUrl: imgUrl,
    }))
  }

  // ─── Video Handlers ─────────────────────────────────────────────────────
  async function handleVideoFile(file: File) {
    setVideoUploadError('')
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowed.includes(file.type)) {
      setVideoUploadError('Only MP4, WebM, and QuickTime (.mov) video files are supported.')
      if (videoInputRef.current) videoInputRef.current.value = ''
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setVideoUploadError('Video file must be under 50 MB. For larger files, paste a YouTube or Vimeo link.')
      if (videoInputRef.current) videoInputRef.current.value = ''
      return
    }

    setUploadingVideo(true)
    try {
      const data = await uploadVideo(file)
      if (data?.file?.path) {
        update('videoUrl', data.file.path)
      }
    } catch (err: any) {
      setVideoUploadError(err?.message || 'Video upload failed.')
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  function handleClearVideo() {
    update('videoUrl', '')
    setVideoUploadError('')
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  // ─── Save Handler ───────────────────────────────────────────────────────
  async function handleSave() {
    setError('')
    if (form.name.trim().length < 2) {
      setError('Event name is required.')
      return
    }
    if (!form.eventDate) {
      setError('Event date is required.')
      return
    }
    if (!form.startTime || !form.endTime) {
      setError('Start and end times are required.')
      return
    }
    if (form.endTime <= form.startTime) {
      setError('End time must be after the start time.')
      return
    }
    if (new Date(`${form.eventDate}T${form.startTime}:00`) <= new Date()) {
      setError('Event start must be in the future.')
      return
    }
    if (['offline', 'both'].includes(form.mode) && !form.venueAddress.trim()) {
      setError('Venue address is required for in-person events.')
      return
    }
    if (['online', 'both'].includes(form.mode) && !form.zoomLink.trim()) {
      setError('Zoom link is required for online events.')
      return
    }

    const primaryCover = form.imageUrl.trim() || (form.images.length > 0 ? form.images[0] : null)

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: primaryCover,
      images: form.images,
      videoUrl: form.videoUrl.trim() || null,
      eventDate: form.eventDate,
      startTime: form.startTime,
      endTime: form.endTime,
      price: Number(form.price || 0),
      mode: form.mode,
      venueAddress: ['offline', 'both'].includes(form.mode) ? form.venueAddress.trim() : null,
      zoomLink: ['online', 'both'].includes(form.mode) ? form.zoomLink.trim() : null,
      capacity: form.capacity ? Number(form.capacity) : null,
      isActive: form.isActive,
    }

    setSaving(true)
    try {
      if (isEdit) {
        await apiFetch(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(body) })
      } else {
        await apiFetch('/admin/events', { method: 'POST', body: JSON.stringify(body) })
      }
      navigate('/events')
    } catch (err: any) {
      setError(err?.message || 'Save failed.')
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#8B1A2B] focus:ring-1 focus:ring-[#8B1A2B]'
  const labelCls = 'mb-1 block text-xs font-semibold text-gray-600'
  const parsedVideo = parseVideoSource(form.videoUrl)

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <button
        type="button"
        onClick={() => navigate('/events')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={16} /> Back to Events
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-800">{isEdit ? 'Edit Event' : 'New Event'}</h1>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
      ) : (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          {/* Event Title */}
          <div>
            <label className={labelCls}>Event name *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. Saree Styling Masterclass"
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={`${inputCls} min-h-[120px]`}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="What is this event about?"
            />
          </div>

          {/* ─── Multiple Image Gallery Card ───────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-[#8B1A2B]" />
                  <h2 className="text-sm font-bold text-gray-800">Event Gallery & Cover Photos</h2>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {form.images.length} {form.images.length === 1 ? 'image' : 'images'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Upload multiple photos. The primary cover image will be displayed on event cards and banners.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={uploadingImages}
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B1A2B] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#6E1220] disabled:opacity-50"
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Add Images
                    </>
                  )}
                </button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={event => {
                    const files = event.target.files
                    if (files && files.length > 0) handleImageFiles(files)
                  }}
                />
              </div>
            </div>

            {/* Upload Progress feedback */}
            {uploadingImages && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                <Loader2 size={14} className="animate-spin text-blue-600" />
                <span>{uploadProgress || 'Uploading images to server...'}</span>
              </div>
            )}

            {/* Error message */}
            {uploadError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {uploadError}
              </div>
            )}

            {/* Thumbnail Grid */}
            {form.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {form.images.map((img, index) => {
                  const isCover = img === form.imageUrl || (!form.imageUrl && index === 0)
                  return (
                    <div
                      key={`${img}-${index}`}
                      className={`group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all ${
                        isCover ? 'border-[#8B1A2B] ring-2 ring-[#8B1A2B]/20' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                        <img
                          src={resolveImageUrl(img)}
                          alt={`Event gallery image ${index + 1}`}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Top action overlay */}
                        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1.5 bg-gradient-to-b from-black/60 to-transparent">
                          {isCover ? (
                            <span className="inline-flex items-center gap-1 rounded bg-[#8B1A2B] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              <Star size={10} className="fill-white" /> Primary Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAsCover(img)}
                              className="inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#8B1A2B]"
                              title="Set as primary cover"
                            >
                              <Star size={10} /> Set Cover
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white shadow-sm transition hover:bg-red-700"
                            title="Remove image"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Card Caption / URL hint */}
                      <div className="p-2 text-left">
                        <span className="block truncate text-[10px] text-gray-500" title={img}>
                          #{index + 1} {img}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center transition hover:border-[#8B1A2B]"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <ImageIcon size={20} />
                </div>
                <p className="text-sm font-semibold text-gray-700">No images added yet</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Click here to upload photos or use the URL input below (JPEG, PNG, WebP — max 5 MB).
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#8B1A2B] hover:underline"
                >
                  <Upload size={13} /> Select photos from computer
                </button>
              </div>
            )}

            {/* Manual URL Input Fallback */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <label className={labelCls}>Or Add Image by URL</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={e => setManualImageUrl(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddImageUrl()
                      }
                    }}
                    placeholder="https://example.com/images/masterclass.jpg"
                    className={`${inputCls} pl-8`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={!manualImageUrl.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Plus size={14} /> Add URL
                </button>
              </div>
            </div>
          </div>

          {/* ─── Video Glimpse Section ──────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-[#8B1A2B]" />
                  <h2 className="text-sm font-bold text-gray-800">Video Glimpse (Optional)</h2>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Upload an MP4/WebM reel or paste a YouTube/Vimeo link to give visitors an engaging preview.
                </p>
              </div>

              {form.videoUrl && (
                <button
                  type="button"
                  onClick={handleClearVideo}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  <X size={13} /> Clear Video
                </button>
              )}
            </div>

            {/* Video Inputs */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Film size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.videoUrl}
                    onChange={e => update('videoUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or uploaded path"
                    className={`${inputCls} pl-8`}
                  />
                </div>

                <button
                  type="button"
                  disabled={uploadingVideo}
                  onClick={() => videoInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#8B1A2B] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6E1220] disabled:opacity-50"
                >
                  {uploadingVideo ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Upload Video
                    </>
                  )}
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleVideoFile(file)
                  }}
                />
              </div>

              {videoUploadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {videoUploadError}
                </div>
              )}

              {/* Video Live Preview */}
              <div className="mt-3">
                <span className="mb-2 block text-xs font-semibold text-gray-600">Live Video Preview</span>

                {parsedVideo ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-black shadow-sm">
                    {parsedVideo.type === 'youtube' || parsedVideo.type === 'vimeo' ? (
                      <div className="relative aspect-video w-full">
                        <iframe
                          src={parsedVideo.embedUrl}
                          title="Event Video Preview"
                          className="h-full w-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video w-full flex items-center justify-center bg-black">
                        <video
                          key={parsedVideo.directUrl}
                          controls
                          playsInline
                          preload="metadata"
                          src={parsedVideo.directUrl}
                          className="h-full w-full max-h-80 object-contain"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    <div className="flex items-center justify-between bg-gray-900 px-3 py-1.5 text-xs text-white">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Film size={13} className="text-[#8B1A2B]" />
                        {parsedVideo.label}
                      </span>
                      <span className="truncate max-w-xs text-[11px] text-gray-400">
                        {form.videoUrl}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <Film size={20} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No video added yet</p>
                    <p className="mt-0.5 text-xs text-gray-500 max-w-md">
                      Provide a glimpse reel for your masterclass. Paste a YouTube or Vimeo link above, or upload an MP4/WebM video (max 50 MB).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Date & Times */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Date *</label>
              <input
                type="date"
                className={inputCls}
                value={form.eventDate}
                onChange={e => update('eventDate', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Start time *</label>
              <TimeField id="startTime" value={form.startTime} onChange={v => update('startTime', v)} />
            </div>
            <div>
              <label className={labelCls}>End time *</label>
              <TimeField id="endTime" value={form.endTime} onChange={v => update('endTime', v)} />
            </div>
          </div>

          {/* Price & Capacity */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.price}
                onChange={e => update('price', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Capacity (optional)</label>
              <input
                type="number"
                min="1"
                className={inputCls}
                value={form.capacity}
                onChange={e => update('capacity', e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className={labelCls}>Mode *</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {(['offline', 'online', 'both'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update('mode', mode)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-semibold capitalize transition-colors ${
                    form.mode === mode
                      ? 'border-[#8B1A2B] bg-[#8B1A2B] text-white'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {mode === 'both' ? 'Both' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Venue Address for offline / both */}
          {['offline', 'both'].includes(form.mode) && (
            <div>
              <label className={labelCls}>Venue address *</label>
              <textarea
                className={`${inputCls} min-h-[80px]`}
                value={form.venueAddress}
                onChange={e => update('venueAddress', e.target.value)}
                placeholder="Full venue address…"
              />
            </div>
          )}

          {/* Zoom link for online / both */}
          {['online', 'both'].includes(form.mode) && (
            <div>
              <label className={labelCls}>Zoom meeting link *</label>
              <input
                className={inputCls}
                value={form.zoomLink}
                onChange={e => update('zoomLink', e.target.value)}
                placeholder="https://zoom.us/j/…"
              />
            </div>
          )}

          {/* Active status */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => update('isActive', e.target.checked)}
              className="h-4 w-4 accent-[#8B1A2B]"
            />
            Event is live on the storefront
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingImages || uploadingVideo}
              className="inline-flex items-center gap-2 rounded-lg bg-[#8B1A2B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6E1220] disabled:opacity-50"
            >
              <Save size={15} /> {saving ? 'Saving…' : 'Save Event'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}