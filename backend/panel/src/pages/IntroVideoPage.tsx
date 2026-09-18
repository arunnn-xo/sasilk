import { FormEvent, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Info,
  Loader2,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  createResource,
  listResource,
  resolveImageUrl,
  updateResource,
  uploadImage,
  uploadVideo,
} from '../services/api'

export default function IntroVideoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Retrieve settings list to fetch existing intro_video_config
  const { data: listData, isLoading: isFetching } = useQuery({
    queryKey: ['resource', 'settings'],
    queryFn: () => listResource('settings'),
  })

  const existingIntroVideo = listData?.items?.find((i: any) => i.key === 'intro_video_config') as
    | { id?: number | string; key?: string; value?: Record<string, any> }
    | undefined
  const introVideoValue = (existingIntroVideo?.value || {}) as Record<string, any>

  // Form states
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

  // Synchronize state when data is loaded
  useEffect(() => {
    if (!isFetching && existingIntroVideo?.value) {
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
  }, [isFetching, existingIntroVideo])

  // Save Mutation
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
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [saveIntroVideo.isSuccess, saveIntroVideo])

  // Video Upload Handler
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

  // Poster Upload Handler
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

  // Validation
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
    if (!isIntroFormValid || isUploadingVideo || isUploadingPoster) return
    saveIntroVideo.mutate()
  }

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy)]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[var(--burgundy)] self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D9B86E]/50 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#6B1A2A] shadow-sm transition hover:bg-[#FAF6EE] self-start sm:self-auto"
        >
          <span>Preview Storefront</span>
          <ExternalLink className="h-3.5 w-3.5 text-[#D9B86E]" />
        </a>
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-4 border-b border-[#EFE8DA] pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6B1A2A] text-white shadow-md shrink-0">
          <Film className="h-6 w-6 text-[#D9B86E]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#1F080D]">Storefront Intro Video</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${
                introEnabled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {introEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p className="text-sm text-[#7A6065] mt-1">
            Configure the cinematic full-screen welcome video that appears when visitors land on Soil Goddess.
          </p>
        </div>
      </div>

      {/* Status Notice Banner */}
      <div
        className={`rounded-2xl border p-5 transition ${
          introEnabled
            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
            : 'border-[#EFE8DA] bg-[#FAF6EE]/40 text-[#7A6065]'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <Info className={`mt-0.5 h-5 w-5 shrink-0 ${introEnabled ? 'text-emerald-600' : 'text-[#7A6065]'}`} />
          <div className="text-sm space-y-1">
            <p className="font-bold">
              {introEnabled ? 'Storefront Intro Video is Active' : 'Storefront Intro Video is Disabled'}
            </p>
            <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
              {introEnabled
                ? 'Visitors arriving at the storefront will be greeted with the immersive full-screen video overlay. They can skip according to the rules set below.'
                : 'The intro video is currently disabled. Visitors navigate directly to the homepage banner and content.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Configuration Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EFE8DA] space-y-7"
      >
        {/* Master Switch Card */}
        <div className="flex items-center justify-between rounded-xl border border-[#EFE8DA] bg-[#FAF6EE]/50 p-4 sm:p-5">
          <div>
            <label htmlFor="master-intro-toggle" className="text-sm font-bold text-[#1F080D] cursor-pointer block">
              Enable Storefront Intro Video
            </label>
            <p className="text-xs text-[#7A6065] mt-1">
              Master switch to activate or deactivate the welcome intro video on the storefront.
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

        {/* Video Source Input Section */}
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
                    <Loader2 className="h-4 w-4 animate-spin text-[#6B1A2A]" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-[#D9B86E]" />
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

        {/* Poster Image Section */}
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

        {/* Save Button */}
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
