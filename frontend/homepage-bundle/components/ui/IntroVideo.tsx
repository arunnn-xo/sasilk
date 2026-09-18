'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, SkipForward, Volume2, VolumeX } from 'lucide-react'
import {
  fetchIntroVideoConfig,
  type IntroVideoConfig,
} from '@/lib/services/storefront.service'

const SEEN_KEY = 'sas_intro_seen'
const DISMISS_FADE_DURATION_MS = 700
// Watchdog fires only after video starts playing, giving plenty of time
const WATCHDOG_TIMEOUT_MS = 45000

export interface IntroVideoProps {
  initialConfig?: IntroVideoConfig | null
}

export default function IntroVideo({ initialConfig }: IntroVideoProps = {}) {
  const [isClient, setIsClient] = useState(false)
  const [config, setConfig] = useState<IntroVideoConfig | null>(null)
  const [mounted, setMounted] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // Video playback state
  const [videoReady, setVideoReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Autoplay policy: browser may block autoplay on mobile → show "Tap to play" CTA
  const [needsUserGesture, setNeedsUserGesture] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const configRef = useRef<IntroVideoConfig | null>(null)
  const dismissStartedRef = useRef(false)
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null)
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasPlayedRef = useRef(false)

  // Keep configRef synchronized with latest config state
  useEffect(() => {
    configRef.current = config
  }, [config])

  // SSR hydration guard
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Dismiss with optional session marking control
  const handleDismiss = useCallback((markAsSeen = true) => {
    if (dismissStartedRef.current) return
    dismissStartedRef.current = true

    setLeaving(true)

    // Only mark seen if the video was actually shown to the user
    if (markAsSeen && configRef.current?.showOncePerSession) {
      try {
        sessionStorage.setItem(SEEN_KEY, 'true')
      } catch {
        // Ignore storage exceptions in restricted environments
      }
    }

    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current)
      watchdogTimerRef.current = null
    }

    dismissTimerRef.current = setTimeout(() => {
      setMounted(false)
    }, DISMISS_FADE_DURATION_MS)
  }, [])

  // Clean up all pending timers on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current)
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
          if (sessionStorage.getItem(SEEN_KEY)) return
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
        if (!cfg || !cfg.enabled || !cfg.videoUrl || !cfg.videoUrl.trim()) return
        if (cfg.showOncePerSession) {
          try {
            if (sessionStorage.getItem(SEEN_KEY)) return
          } catch {
            // Ignore storage exceptions
          }
        }
        setConfig(cfg)
        setMounted(true)
      })
      .catch(() => {
        // Network or fetch failure: suppress gracefully
      })

    return () => {
      cancelled = true
    }
  }, [initialConfig])

  // Lock body scroll while intro overlay is displayed
  useEffect(() => {
    if (!mounted || leaving) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [mounted, leaving])

  // Watchdog timer: only start AFTER video begins playing
  // This ensures the "Tap to Play" CTA is never auto-dismissed
  useEffect(() => {
    if (!isPlaying || leaving) return

    watchdogTimerRef.current = setTimeout(() => {
      handleDismiss()
    }, WATCHDOG_TIMEOUT_MS)

    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current)
        watchdogTimerRef.current = null
      }
    }
  }, [isPlaying, leaving, handleDismiss])

  // Autoplay attempt — muted first for policy compliance
  useEffect(() => {
    if (!mounted || !config || !videoRef.current) return

    const video = videoRef.current
    video.muted = true
    video.playsInline = true

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setNeedsUserGesture(false)
          hasPlayedRef.current = true
        })
        .catch(() => {
          // Browser blocked autoplay (common on mobile without user gesture) →
          // Show "Tap to Watch" CTA instead of instantly dismissing
          setNeedsUserGesture(true)
        })
    }
  }, [mounted, config])

  // User-initiated play (from "Tap to Watch" button)
  const handleUserPlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    // Try with sound first
    video.muted = false
    setIsMuted(false)
    video
      .play()
      .then(() => {
        setNeedsUserGesture(false)
        hasPlayedRef.current = true
      })
      .catch(() => {
        // Fall back to muted play
        video.muted = true
        setIsMuted(true)
        video.play()
          .then(() => {
            setNeedsUserGesture(false)
            hasPlayedRef.current = true
          })
          .catch(() => {
            // Truly can't play — dismiss without marking session as seen
            handleDismiss(false)
          })
      })
  }, [handleDismiss])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }, [])

  const handleCanPlay = useCallback(() => {
    setVideoReady(true)
  }, [])

  const handlePlaying = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setElapsedTime(videoRef.current.currentTime || 0)
    }
  }, [])

  const handleVideoError = useCallback(() => {
    // If video never played, dismiss without marking session as seen
    handleDismiss(hasPlayedRef.current)
  }, [handleDismiss])

  // SSR & mount guard
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
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video element — always rendered so it can preload */}
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
        onPlaying={handlePlaying}
        onWaiting={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => handleDismiss()}
        onError={handleVideoError}
      />

      {/* "Tap to Watch" overlay — shown when autoplay is blocked by the browser */}
      {needsUserGesture && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
          {/* Poster as blurred background */}
          {config.posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.posterUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
          )}

          <div className="relative flex flex-col items-center gap-5 text-center px-6">
            <button
              type="button"
              onClick={handleUserPlay}
              className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-2 border-white/60 bg-white/10 backdrop-blur-md shadow-2xl hover:bg-white/20 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Play intro video"
            >
              <Play className="h-9 w-9 sm:h-10 sm:w-10 text-white fill-white ml-1" aria-hidden="true" />
            </button>
            <p className="text-sm sm:text-base font-semibold text-white/90 tracking-wide select-none">
              Tap to watch
            </p>
          </div>

          {/* Skip button on the tap-to-watch screen */}
          {isSkipEnabled && (
            <button
              type="button"
              onClick={() => handleDismiss(false)}
              className="absolute right-4 top-4 sm:right-6 sm:top-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-black/50 hover:bg-black/70 px-4 py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Skip intro video"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
              <span>Skip</span>
            </button>
          )}
        </div>
      )}

      {/* Buffering Spinner — visible while video loads after play is triggered */}
      {!needsUserGesture && !videoReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none transition-opacity duration-300 z-10">
          <div className="h-12 w-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 select-none">
            Loading
          </p>
        </div>
      )}

      {/* Mute / Unmute — bottom-left, visible when playing */}
      {!needsUserGesture && isPlaying && (
        <div className="absolute left-4 bottom-6 sm:left-6 z-10">
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 hover:bg-black/70 backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-white" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4 text-white" aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      {/* Skip Control — top-right corner */}
      {!needsUserGesture && isSkipEnabled && (
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6 md:right-8 md:top-8 z-10">
          {canSkip ? (
            <button
              type="button"
              onClick={() => handleDismiss()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-black/50 hover:bg-black/70 active:bg-black/90 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer select-none"
              aria-label="Skip intro video"
            >
              <SkipForward className="h-4 w-4 sm:h-[17px] sm:w-[17px]" aria-hidden="true" />
              <span>Skip</span>
            </button>
          ) : (
            isPlaying && (
              <div
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs sm:text-sm font-medium text-white/70 backdrop-blur-md select-none pointer-events-none"
                aria-live="polite"
              >
                <span>Skip in {remainingSeconds}s</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
