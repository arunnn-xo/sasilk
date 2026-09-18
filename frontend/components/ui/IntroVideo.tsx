'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SkipForward } from 'lucide-react'
import {
  fetchIntroVideoConfig,
  type IntroVideoConfig,
} from '@/lib/services/storefront.service'

const SEEN_KEY = 'sas_intro_seen'
const DISMISS_FADE_DURATION_MS = 700
const WATCHDOG_TIMEOUT_MS = 12000

export interface IntroVideoProps {
  initialConfig?: IntroVideoConfig | null
}

export default function IntroVideo({ initialConfig }: IntroVideoProps = {}) {
  const [isClient, setIsClient] = useState(false)
  const [config, setConfig] = useState<IntroVideoConfig | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const configRef = useRef<IntroVideoConfig | null>(null)
  const dismissStartedRef = useRef(false)
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null)
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Keep configRef synchronized with latest config state
  useEffect(() => {
    configRef.current = config
  }, [config])

  // SSR hydration guard
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Unified dismiss handler with smooth fade-out and session storage marking
  const handleDismiss = useCallback(() => {
    if (dismissStartedRef.current) return
    dismissStartedRef.current = true

    // Begin fade-out exit animation
    setLeaving(true)

    // Mark session storage seen flag if configured
    if (configRef.current?.showOncePerSession) {
      try {
        sessionStorage.setItem(SEEN_KEY, 'true')
      } catch {
        // Ignore storage exceptions in restricted environments
      }
    }

    // Cancel watchdog safety timer if active
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current)
      watchdogTimerRef.current = null
    }

    // Wait for fade-out transition duration, then unmount completely
    dismissTimerRef.current = setTimeout(() => {
      setMounted(false)
    }, DISMISS_FADE_DURATION_MS)
  }, [])

  // Clean up all pending timers on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current)
      }
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current)
      }
    }
  }, [])

  // Fetch or validate intro video configuration on component mount
  useEffect(() => {
    let cancelled = false

    if (initialConfig !== undefined) {
      if (
        !initialConfig ||
        !initialConfig.enabled ||
        !initialConfig.videoUrl ||
        !initialConfig.videoUrl.trim()
      ) {
        return
      }
      if (initialConfig.showOncePerSession) {
        try {
          if (sessionStorage.getItem(SEEN_KEY)) {
            return
          }
        } catch {
          // Ignore storage exceptions
        }
      }
      setConfig(initialConfig)
      setMounted(true)
      return
    }

    fetchIntroVideoConfig()
      .then((cfg) => {
        if (cancelled) return
        // Suppression condition 1: disabled or missing videoUrl
        if (!cfg || !cfg.enabled || !cfg.videoUrl || !cfg.videoUrl.trim()) {
          return
        }
        // Suppression condition 2: show once per session and already seen
        if (cfg.showOncePerSession) {
          try {
            if (sessionStorage.getItem(SEEN_KEY)) {
              return
            }
          } catch {
            // Ignore storage exceptions
          }
        }
        // Valid configuration: activate overlay
        setConfig(cfg)
        setMounted(true)
      })
      .catch(() => {
        // Network or fetch failure: suppress immediately with zero layout shift
      })

    return () => {
      cancelled = true
    }
  }, [initialConfig])

  // Lock body scroll while intro overlay is actively displayed
  useEffect(() => {
    if (!mounted || leaving) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [mounted, leaving])

  // Safety watchdog timer: prevent user from being trapped if media stalls indefinitely
  useEffect(() => {
    if (!mounted || leaving) return

    watchdogTimerRef.current = setTimeout(() => {
      handleDismiss()
    }, WATCHDOG_TIMEOUT_MS)

    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current)
        watchdogTimerRef.current = null
      }
    }
  }, [mounted, leaving, handleDismiss])

  // Autoplay attempt with mobile policy compliance and rejection fallback
  useEffect(() => {
    if (!mounted || !config) return

    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.playsInline = true

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy rejected playback — dismiss immediately so user is not blocked
        handleDismiss()
      })
    }
  }, [mounted, config, handleDismiss])

  const handleCanPlay = useCallback(() => {
    setLoading(false)
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setElapsedTime(videoRef.current.currentTime || 0)
    }
  }, [])

  // Zero layout shift & SSR guard: return null if not mounted on client
  if (typeof window === 'undefined' || !isClient || !mounted || !config) {
    return null
  }

  const skipAfterSeconds = config.skipAfterSeconds ?? 0
  const isSkipEnabled = config.skipEnabled !== false
  const canSkip = isSkipEnabled && (skipAfterSeconds <= 0 || elapsedTime >= skipAfterSeconds)
  const remainingSeconds = Math.max(1, Math.ceil(skipAfterSeconds - elapsedTime))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Intro video"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-700 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={config.videoUrl}
        poster={config.posterUrl || undefined}
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlay={handleCanPlay}
        onLoadedData={handleCanPlay}
        onPlaying={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleDismiss}
        onError={handleDismiss}
      />

      {/* Buffering / Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none transition-opacity duration-300">
          <div className="h-12 w-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 select-none">
            Loading
          </p>
        </div>
      )}

      {/* Skip Control */}
      {isSkipEnabled && (
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6 md:right-8 md:top-8 z-10">
          {canSkip ? (
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-black/50 hover:bg-black/70 active:bg-black/90 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer select-none"
              aria-label="Skip intro video"
            >
              <SkipForward className="h-4 w-4 sm:h-[17px] sm:w-[17px]" aria-hidden="true" />
              <span>Skip</span>
            </button>
          ) : (
            <div
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs sm:text-sm font-medium text-white/70 backdrop-blur-md select-none pointer-events-none"
              aria-live="polite"
            >
              <span>Skip in {remainingSeconds}s</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
