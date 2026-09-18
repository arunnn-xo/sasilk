import { FormEvent, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Check,
  Film,
  Image as ImageIcon,
  Info,
  Loader2,
  Package,
  Sparkles,
  Truck,
  Upload,
  Video,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  apiFetch,
  createResource,
  listResource,
  resolveImageUrl,
  updateResource,
  uploadImage,
  uploadVideo,
} from '../services/api'

export default function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Retrieve settings list
  const { data: listData, isLoading: isFetching } = useQuery({
    queryKey: ['resource', 'settings'],
    queryFn: () => listResource('settings'),
  })

  // ─── Existing Shipping Configuration ──────────────────────────────────────
  const existingShipping = listData?.items?.find((i: any) => i.key === 'shipping_config')
  const shippingValue = (existingShipping?.value || {}) as Record<string, any>

  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('')

  const existingNewArrivals = listData?.items?.find((i: any) => i.key === 'home_new_arrivals_config')
  const newArrivalsValue = (existingNewArrivals?.value || {}) as Record<string, any>

  const [newArrivalsEnabled, setNewArrivalsEnabled] = useState(false)
  const [newArrivalsLimit, setNewArrivalsLimit] = useState('')
  const [newArrivalsTouched, setNewArrivalsTouched] = useState(false)

  const newArrivalsLimitNum = parseInt(newArrivalsLimit, 10)
  const newArrivalsLimitValid = !isNaN(newArrivalsLimitNum) && newArrivalsLimitNum >= 1 && newArrivalsLimitNum <= 12

  // ─── Intro Video Configuration State ──────────────────────────────────────
  const existingIntroVideo = listData?.items?.find((i: any) => i.key === 'intro_video_config') as
    | { id?: number | string; key?: string; value?: Record<string, any> }
    | undefined
  const introVideoValue = (existingIntroVideo?.value || {}) as Record<string, any>

  const [introEnabled, setIntroEnabled] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [skipEnabled, setSkipEnabled] = useState(true)
  const [skipAfterSeconds, setSkipAfterSeconds] = useState(0)
  const [showOncePerSession, setShowOncePerSession] = useState(true)

  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [isUploadingPoster, setIsUploadingPoster] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState('')
  const [posterUploadError, setPosterUploadError] = useState('')
  const [videoPlaybackError, setVideoPlaybackError] = useState('')

  const videoInputRef = useRef<HTMLInputElement>(null)
  const posterInputRef = useRef<HTMLInputElement>(null)

  // ─── State Synchronization ────────────────────────────────────────────────
  useEffect(() => {
    if (!isFetching) {
      // Sync Shipping
      setFreeShippingEnabled(Boolean(shippingValue.freeShippingEnabled))
      setFreeShippingThreshold(shippingValue.freeShippingThreshold ? String(shippingValue.freeShippingThreshold) : '')

      // Sync New Arrivals
      setNewArrivalsEnabled(Boolean(newArrivalsValue.enabled))
      setNewArrivalsLimit(newArrivalsValue.limit != null ? String(newArrivalsValue.limit) : '4')

      // Sync Intro Video Config
      if (existingIntroVideo?.value) {
        setIntroEnabled(Boolean(introVideoValue.enabled))
        setVideoUrl(typeof introVideoValue.videoUrl === 'string' ? introVideoValue.videoUrl : '')
        setPosterUrl(typeof introVideoValue.posterUrl === 'string' ? introVideoValue.posterUrl : '')
        setSkipEnabled(introVideoValue.skipEnabled !== undefined ? Boolean(introVideoValue.skipEnabled) : true)
        setSkipAfterSeconds(
          introVideoValue.skipAfterSeconds !== undefined && !isNaN(Number(introVideoValue.skipAfterSeconds))
            ? Math.min(30, Math.max(0, Number(introVideoValue.skipAfterSeconds)))
            : 0
        )
        setShowOncePerSession(
          introVideoValue.showOncePerSession !== undefined ? Boolean(introVideoValue.showOncePerSession) : true
        )
      }
    }
  }, [isFetching, existingShipping, existingNewArrivals, existingIntroVideo])

  // ─── Shipping Mutation ────────────────────────────────────────────────────
  const saveShipping = useMutation({
    mutationFn: async () => {
      const threshold = Number(freeShippingThreshold) || 0
      const body = {
        key: 'shipping_config',
        value: {
          freeShippingEnabled,
          freeShippingThreshold: freeShippingEnabled ? threshold : 0,
        },
      }
      if (existingShipping?.id) {
        return apiFetch(`/admin/settings/${existingShipping.id}`, { method: 'PUT', body: JSON.stringify(body) })
      }
      return apiFetch('/admin/settings', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'settings'] })
    },
  })

  useEffect(() => {
    if (saveShipping.isSuccess) {
      const timer = setTimeout(() => {
        saveShipping.reset()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveShipping.isSuccess, saveShipping])

  // ─── New Arrivals Mutation ────────────────────────────────────────────────
  const saveNewArrivals = useMutation({
    mutationFn: async () => {
      const body = {
        key: 'home_new_arrivals_config',
        value: {
          enabled: newArrivalsEnabled,
          limit: parseInt(newArrivalsLimit, 10) || 4,
        },
      }
      if (existingNewArrivals?.id) {
        return apiFetch(`/admin/settings/${existingNewArrivals.id}`, { method: 'PUT', body: JSON.stringify(body) })
      }
      return apiFetch('/admin/settings', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'settings'] })
    },
  })

  useEffect(() => {
    if (saveNewArrivals.isSuccess) {
      const timer = setTimeout(() => {
        saveNewArrivals.reset()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveNewArrivals.isSuccess, saveNewArrivals])

  // ─── Intro Video Mutation ─────────────────────────────────────────────────
  const saveIntroVideo = useMutation({
    mutationFn: async () => {
      const payload = {
        key: 'intro_video_config',
        value: {
          enabled: introEnabled,
          videoUrl: videoUrl.trim(),
          posterUrl: posterUrl.trim(),
          skipEnabled,
          skipAfterSeconds: Math.min(30, Math.max(0, Number(skipAfterSeconds) || 0)),
          showOncePerSession,
        },
      }
      if (existingIntroVideo?.id) {
        return updateResource('settings', existingIntroVideo.id, payload)
      }
      return createResource('settings', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'settings'] })
    },
  })

  useEffect(() => {
    if (saveIntroVideo.isSuccess) {
      const timer = setTimeout(() => {
        saveIntroVideo.reset()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveIntroVideo.isSuccess, saveIntroVideo])

  // ─── Upload Handlers ──────────────────────────────────────────────────────
  async function handleVideoUpload(file: File) {
    setVideoUploadError('')
    setVideoPlaybackError('')
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowed.includes(file.type)) {
      setVideoUploadError('Only MP4, WebM, and QuickTime (.mov) video files are supported.')
      if (videoInputRef.current) videoInputRef.current.value = ''
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setVideoUploadError('Video file must be under 50 MB.')
      if (videoInputRef.current) videoInputRef.current.value = ''
      return
    }

    setIsUploadingVideo(true)
    try {
      const data = await uploadVideo(file)
      if (data?.file?.path) {
        setVideoUrl(data.file.path)
      }
    } catch (err: any) {
      setVideoUploadError(err?.message || 'Failed to upload video.')
    } finally {
      setIsUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  async function handlePosterUpload(file: File) {
    setPosterUploadError('')
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setPosterUploadError('Only JPG, PNG, and WebP images are supported for the poster.')
      if (posterInputRef.current) posterInputRef.current.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setPosterUploadError('Poster image must be under 10 MB.')
      if (posterInputRef.current) posterInputRef.current.value = ''
      return
    }

    setIsUploadingPoster(true)
    try {
      const data = await uploadImage(file)
      if (data?.file?.path) {
        setPosterUrl(data.file.path)
      }
    } catch (err: any) {
      setPosterUploadError(err?.message || 'Failed to upload poster image.')
    } finally {
      setIsUploadingPoster(false)
      if (posterInputRef.current) posterInputRef.current.value = ''
    }
  }

  // ─── Validation Helpers ───────────────────────────────────────────────────
  const isVideoUrlValid = videoUrl.trim().length > 0
  const isSkipSecondsValid = !isNaN(skipAfterSeconds) && skipAfterSeconds >= 0 && skipAfterSeconds <= 30
  const isIntroFormValid = (!introEnabled || isVideoUrlValid) && isSkipSecondsValid
  const isSaveIntroDisabled =
    saveIntroVideo.isPending ||
    isUploadingVideo ||
    isUploadingPoster ||
    (introEnabled && !isVideoUrlValid) ||
    !isSkipSecondsValid

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    saveShipping.mutate()
  }

  function handleNewArrivalsSubmit(e: FormEvent) {
    e.preventDefault()
    setNewArrivalsTouched(true)
    if (!newArrivalsLimitValid) return
    saveNewArrivals.mutate()
  }

  function handleIntroVideoSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isIntroFormValid || isUploadingVideo || isUploadingPoster) return
    saveIntroVideo.mutate()
  }

  const effectiveThreshold = freeShippingEnabled ? Number(freeShippingThreshold) || 0 : 0
  const isFreeForAll = freeShippingEnabled && effectiveThreshold === 0

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy)]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[var(--burgundy)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* ─── Shipping Status Card ────────────────────────────────────────── */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--burgundy)]/10 text-[var(--burgundy)]">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Shipping Status</h1>
            <p className="text-sm text-gray-500">Manage free shipping configuration</p>
          </div>
        </div>

        {/* Current Status Banner */}
        <div
          className={`mb-6 rounded-lg border p-4 ${
            freeShippingEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className={`mt-0.5 h-4 w-4 shrink-0 ${freeShippingEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className={`text-sm font-semibold ${freeShippingEnabled ? 'text-green-800' : 'text-gray-700'}`}>
                {freeShippingEnabled ? 'Free Shipping is Enabled' : 'Free Shipping is Disabled'}
              </p>
              {freeShippingEnabled && (
                <p className="mt-1 text-sm text-green-700">
                  {isFreeForAll
                    ? 'All orders get free shipping — no minimum amount required.'
                    : `Orders at or above ₹${effectiveThreshold.toLocaleString('en-IN')} get free shipping.`}
                </p>
              )}
              {!freeShippingEnabled && (
                <p className="mt-1 text-sm text-gray-500">
                  Customers will see shipping charges calculated at checkout.
                </p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={freeShippingEnabled}
                onChange={e => setFreeShippingEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[var(--burgundy)] focus:ring-[var(--burgundy)]"
              />
              <span className="text-sm font-medium text-gray-700">Enable Free Shipping</span>
            </label>

            {freeShippingEnabled && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Minimum Order Amount for Free Shipping (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={freeShippingThreshold}
                  onChange={e => setFreeShippingThreshold(e.target.value)}
                  placeholder="0 for free shipping on all orders"
                  className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--burgundy)] focus:ring-1 focus:ring-[var(--burgundy)]/30"
                />
                <p className="mt-2 text-xs text-amber-700">
                  {effectiveThreshold === 0
                    ? 'Set to 0 — all orders will get free shipping regardless of cart value.'
                    : `Set to ₹${effectiveThreshold.toLocaleString('en-IN')} — orders below this amount will see normal shipping charges.`}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={saveShipping.isPending} className="admin-btn-primary">
              {saveShipping.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Settings
            </button>
            {saveShipping.isSuccess && <span className="text-sm text-green-600 font-medium">Saved!</span>}
            {saveShipping.isError && <span className="text-sm text-red-500">{saveShipping.error.message}</span>}
          </div>
        </form>
      </div>

      {/* ─── Storefront Intro Video Card (Soil Goddess Aesthetic) ───────── */}
      <form
        onSubmit={handleIntroVideoSubmit}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EFE8DA] space-y-6"
      >
        {/* Card Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBF7F8] text-[#6B1A2A] border border-[#D9B86E]/40 shadow-sm shrink-0">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1F080D]">Storefront Intro Video</h2>
            <p className="text-xs sm:text-sm text-[#7A6065]">
              Configure dynamic full-screen intro video with live preview and skip controls.
            </p>
          </div>
        </div>

        {/* Status Indicator Banner */}
        <div
          className={`rounded-xl border p-4 transition ${
            introEnabled
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
              : 'border-[#EFE8DA] bg-[#FAF6EE]/40 text-[#7A6065]'
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className={`mt-0.5 h-4 w-4 shrink-0 ${introEnabled ? 'text-emerald-600' : 'text-[#7A6065]'}`} />
            <div className="text-xs">
              <p className="font-semibold text-sm">
                {introEnabled ? 'Storefront Intro Video is Active' : 'Storefront Intro Video is Disabled'}
              </p>
              <p className="mt-0.5">
                {introEnabled
                  ? 'Visitors entering the storefront will see the cinematic fullscreen intro video.'
                  : 'Storefront entrance is immediate without intro video overlay.'}
              </p>
            </div>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-[#EFE8DA] bg-[#FAF6EE]/50 p-4">
          <div>
            <label htmlFor="master-intro-toggle" className="text-sm font-bold text-[#1F080D] cursor-pointer block">
              Enable Storefront Intro Video
            </label>
            <p className="text-xs text-[#7A6065] mt-0.5">
              Master switch to activate or deactivate the intro video on the storefront.
            </p>
          </div>
          <button
            id="master-intro-toggle"
            type="button"
            role="switch"
            aria-checked={introEnabled}
            onClick={() => setIntroEnabled(!introEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6B1A2A] ${
              introEnabled ? 'bg-[#6B1A2A]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                introEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Dual-Mode Video Upload & URL Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6065]">
            Video Source (MP4 / WebM / QuickTime) *
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={videoUrl}
                onChange={e => {
                  setVideoUrl(e.target.value)
                  setVideoUploadError('')
                  setVideoPlaybackError('')
                }}
                placeholder="https://res.cloudinary.com/... or /introvideo/introvideo.mp4"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium outline-none transition focus:ring-2 focus:ring-[#6B1A2A]/20 ${
                  introEnabled && !isVideoUrlValid
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-[#EFE8DA] bg-white focus:border-[#6B1A2A]'
                }`}
              />
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl('')
                    setVideoUploadError('')
                    setVideoPlaybackError('')
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600 transition"
                  title="Clear video URL"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isUploadingVideo}
                onClick={() => videoInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9B86E]/60 bg-[#FAF4E8] px-4 py-2.5 text-sm font-semibold text-[#6B1A2A] shadow-sm transition hover:bg-[#F2E8D5] disabled:opacity-50"
              >
                {isUploadingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload Video</span>
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
                  if (file) handleVideoUpload(file)
                }}
              />
            </div>
          </div>
          <p className="text-xs text-[#7A6065]">
            Supports direct video uploads up to 50MB (streamed to Cloudinary) or any external video URL.
          </p>
          {videoUploadError && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1">
              <Info className="h-3.5 w-3.5 shrink-0" />
              {videoUploadError}
            </p>
          )}
          {introEnabled && !isVideoUrlValid && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Video URL is required when intro video is enabled.
            </p>
          )}
        </div>

        {/* Poster Image Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6065]">
            Poster Image (Optional Fallback)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={posterUrl}
                onChange={e => {
                  setPosterUrl(e.target.value)
                  setPosterUploadError('')
                }}
                placeholder="https://res.cloudinary.com/.../poster.webp or /images/intro-poster.jpg"
                className="w-full rounded-xl border border-[#EFE8DA] bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#6B1A2A] focus:ring-2 focus:ring-[#6B1A2A]/20"
              />
              {posterUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPosterUrl('')
                    setPosterUploadError('')
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600 transition"
                  title="Clear poster URL"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isUploadingPoster}
                onClick={() => posterInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EFE8DA] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F080D] shadow-sm transition hover:bg-[#FAF6EE] disabled:opacity-50"
              >
                {isUploadingPoster ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#6B1A2A]" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 text-[#7A6065]" />
                    <span>Upload Poster</span>
                  </>
                )}
              </button>
              <input
                ref={posterInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handlePosterUpload(file)
                }}
              />
            </div>
          </div>
          <p className="text-xs text-[#7A6065]">
            Displayed while video is loading or buffering, and as the thumbnail preview.
          </p>
          {posterUploadError && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1">
              <Info className="h-3.5 w-3.5 shrink-0" />
              {posterUploadError}
            </p>
          )}
        </div>

        {/* Embedded Live Video Player Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#7A6065]">
              Live Video Player Preview
            </span>
            {videoUrl && (
              <span className="text-[11px] font-medium text-[#7A6065] truncate max-w-xs">
                {videoUrl.startsWith('http') ? 'External / Cloudinary Stream' : 'Uploaded Video Asset'}
              </span>
            )}
          </div>

          {videoUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-[#EFE8DA] bg-black/5 p-1">
              <video
                key={resolveImageUrl(videoUrl)}
                controls
                playsInline
                preload="metadata"
                src={resolveImageUrl(videoUrl)}
                poster={posterUrl ? resolveImageUrl(posterUrl) : undefined}
                className="w-full max-h-80 object-contain rounded-xl border border-[#EFE8DA] bg-black/5"
                onError={() => setVideoPlaybackError('Unable to load or decode video preview from this URL.')}
                onLoadedData={() => setVideoPlaybackError('')}
              />
              {videoPlaybackError && (
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    {videoPlaybackError} Check that the video URL is reachable and encoded in MP4 (H.264) or WebM.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#EFE8DA] bg-[#FAF6EE]/40 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7A6065]/50 shadow-sm border border-[#EFE8DA] mb-3">
                <Film className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-[#1F080D]">No Video Selected</p>
              <p className="mt-1 text-xs text-[#7A6065] max-w-md">
                Upload an MP4 or WebM video file (up to 50MB) or enter a video URL above to preview the full playback
                experience.
              </p>
            </div>
          )}
        </div>

        {/* Playback & Behavior Controls */}
        <div className="rounded-xl border border-[#EFE8DA] bg-[#FAF6EE]/50 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A6065]">
            Playback & Behavior Controls
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Allow Skip Toggle */}
            <div className="flex items-start justify-between gap-3 rounded-lg border border-[#EFE8DA] bg-white p-4">
              <div>
                <label htmlFor="toggle-skip" className="text-sm font-semibold text-[#1F080D] cursor-pointer block">
                  Allow Skip
                </label>
                <p className="text-xs text-[#7A6065] mt-0.5">
                  Allow visitors to skip the intro video at any time or after the countdown.
                </p>
              </div>
              <button
                id="toggle-skip"
                type="button"
                role="switch"
                aria-checked={skipEnabled}
                onClick={() => setSkipEnabled(!skipEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6B1A2A] ${
                  skipEnabled ? 'bg-[#6B1A2A]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    skipEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Once Per Session Toggle */}
            <div className="flex items-start justify-between gap-3 rounded-lg border border-[#EFE8DA] bg-white p-4">
              <div>
                <label htmlFor="toggle-session" className="text-sm font-semibold text-[#1F080D] cursor-pointer block">
                  Show Once Per Session
                </label>
                <p className="text-xs text-[#7A6065] mt-0.5">
                  Play only on the visitor's first page load. Subsequent visits bypass intro.
                </p>
              </div>
              <button
                id="toggle-session"
                type="button"
                role="switch"
                aria-checked={showOncePerSession}
                onClick={() => setShowOncePerSession(!showOncePerSession)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6B1A2A] ${
                  showOncePerSession ? 'bg-[#6B1A2A]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showOncePerSession ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Skip After (seconds) */}
          {skipEnabled && (
            <div className="rounded-lg border border-[#EFE8DA] bg-white p-4">
              <label htmlFor="skip-seconds" className="mb-1 block text-sm font-semibold text-[#1F080D]">
                Skip After (seconds)
              </label>
              <p className="text-xs text-[#7A6065] mb-2.5">
                Set to 0 for immediate skip access. If set greater than 0 (max 30s), a countdown will show before visitors can skip.
              </p>
              <div className="flex items-center gap-3">
                <input
                  id="skip-seconds"
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={skipAfterSeconds}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10)
                    setSkipAfterSeconds(isNaN(val) ? 0 : val)
                  }}
                  className={`w-32 rounded-xl border px-3.5 py-2 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-[#6B1A2A]/20 ${
                    !isSkipSecondsValid
                      ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                      : 'border-[#EFE8DA] bg-white focus:border-[#6B1A2A]'
                  }`}
                />
                <span className="text-sm font-medium text-[#7A6065]">seconds (0 – 30)</span>
              </div>
              {!isSkipSecondsValid && (
                <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Skip delay must be a number between 0 and 30 seconds.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Validation & Save Button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaveIntroDisabled}
            className="admin-btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveIntroVideo.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save Intro Video Settings
          </button>
          {saveIntroVideo.isSuccess && (
            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Settings saved successfully!
            </span>
          )}
          {saveIntroVideo.isError && (
            <span className="text-sm font-semibold text-red-600">
              {saveIntroVideo.error instanceof Error ? saveIntroVideo.error.message : 'Failed to save settings.'}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
