'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Gift, Sparkles, ArrowRight } from 'lucide-react'

import { useAuth } from '@/components/auth/AuthContext'
import { fetchGuestDiscountPopupConfig, type GuestDiscountPopupConfig } from '@/lib/api/storefront'

const SHOW_DELAY_MS = 2500
const STORAGE_KEY = 'sas_guest_popup_dismissed'
const MAX_VIDEO_CHECK_RETRIES = 8 // 8 * 1500ms = 12 seconds max waiting for intro video
const VIDEO_CHECK_INTERVAL_MS = 1500

// Module-level config cache and promise deduplication to prevent redundant network fetches across route changes
let cachedConfig: GuestDiscountPopupConfig | null = null
let fetchConfigPromise: Promise<GuestDiscountPopupConfig> | null = null

function getGuestPopupConfig(): Promise<GuestDiscountPopupConfig> {
  if (cachedConfig) {
    return Promise.resolve(cachedConfig)
  }
  if (!fetchConfigPromise) {
    fetchConfigPromise = fetchGuestDiscountPopupConfig()
      .then(config => {
        cachedConfig = config
        fetchConfigPromise = null
        return config
      })
      .catch(err => {
        fetchConfigPromise = null
        throw err
      })
  }
  return fetchConfigPromise
}

function isSuppressedPath(path: string | null): boolean {
  if (!path) return false
  return (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/account') ||
    path.startsWith('/checkout') ||
    path.startsWith('/order-confirmation') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')
  )
}

function isSessionDismissed(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return false
  }
}

export default function GuestDiscountPopup() {
  const { session, loading } = useAuth()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')

  const modalCardRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const isNavigatingRef = useRef(false)
  const hasTriggeredRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  const sessionRef = useRef(session)
  sessionRef.current = session

  const guestArrivalRef = useRef<number | null>(null)
  const configRef = useRef<GuestDiscountPopupConfig | null>(null)

  const dismiss = useCallback((navigating = false) => {
    if (navigating) {
      isNavigatingRef.current = true
    }
    setVisible(false)
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, '1')
      }
    } catch {
      // Ignore storage access errors in private/restricted browsing mode
    }
  }, [])

  // Route suppression: immediately hide popup if user navigates to auth or checkout routes or logs in
  useEffect(() => {
    if (isSuppressedPath(pathname) || session) {
      setVisible(false)
    }
  }, [pathname, session])

  // Timed popup evaluation and display management
  useEffect(() => {
    // If auth is still resolving or user is logged in, do not evaluate
    if (loading || session) {
      return
    }

    // If already dismissed in this session or already triggered, do nothing
    if (isSessionDismissed() || hasTriggeredRef.current) {
      return
    }

    if (guestArrivalRef.current === null) {
      guestArrivalRef.current = Date.now()
    }

    let active = true
    let videoRetries = 0

    const clearAllTimers = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current)
        videoTimerRef.current = null
      }
    }

    const checkAndShow = () => {
      if (!active) return

      // Abort if user logged in, dismissed, or popup already triggered
      if (sessionRef.current || isSessionDismissed() || hasTriggeredRef.current) {
        return
      }

      // Do not display if user is currently on a suppressed route
      if (isSuppressedPath(pathnameRef.current)) {
        return
      }

      // If intro video is active on the page, poll until it finishes (up to retry limit)
      if (
        typeof document !== 'undefined' &&
        document.querySelector('[aria-label="Intro video"]') &&
        videoRetries < MAX_VIDEO_CHECK_RETRIES
      ) {
        videoRetries += 1
        videoTimerRef.current = setTimeout(checkAndShow, VIDEO_CHECK_INTERVAL_MS)
        return
      }

      // If intro video is still present after max retries, do not force popup over it
      if (
        typeof document !== 'undefined' &&
        document.querySelector('[aria-label="Intro video"]')
      ) {
        return
      }

      hasTriggeredRef.current = true
      setVisible(true)
    }

    const startEvaluation = async () => {
      try {
        const config = await getGuestPopupConfig()
        if (!active) return

        const discountPercentage = Number(config?.discountPercentage)
        if (
          !config ||
          !config.enabled ||
          !Number.isFinite(discountPercentage) ||
          discountPercentage <= 0
        ) {
          return
        }

        configRef.current = config

        const template =
          typeof config.message === 'string' && config.message.trim()
            ? config.message
            : 'Register now and get {percentage}% OFF on your purchase!'
        const formattedMessage = template.replace(
          /\{percentage\}/g,
          String(discountPercentage),
        )

        setMessage(formattedMessage)

        // Calculate remaining delay from initial arrival so route changes accumulate time
        const elapsed = Date.now() - (guestArrivalRef.current || Date.now())
        const remainingDelay = Math.max(0, SHOW_DELAY_MS - elapsed)

        timerRef.current = setTimeout(checkAndShow, remainingDelay)
      } catch {
        // Graceful error handling - fail silently if backend config fetch fails
      }
    }

    startEvaluation()

    return () => {
      active = false
      clearAllTimers()
    }
  }, [loading, session])

  // Route change listener: if user navigates to an unsuppressed page after delay has passed, show popup
  useEffect(() => {
    if (loading || session || isSuppressedPath(pathname) || isSessionDismissed() || hasTriggeredRef.current) {
      return
    }

    if (!configRef.current || !message) {
      return
    }

    const elapsed = Date.now() - (guestArrivalRef.current || Date.now())
    if (elapsed >= SHOW_DELAY_MS) {
      // Intro video check and display
      if (
        typeof document !== 'undefined' &&
        document.querySelector('[aria-label="Intro video"]')
      ) {
        return
      }

      hasTriggeredRef.current = true
      setVisible(true)
    }
  }, [pathname, loading, session, message])

  // Accessibility: Focus trapping, Escape key, body scroll locking, and clean focus restoration
  useEffect(() => {
    if (!visible) return

    previousActiveElementRef.current = document.activeElement as HTMLElement | null

    // Auto-focus the close button or modal container for assistive technology
    const focusTimer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus()
      } else if (modalCardRef.current) {
        modalCardRef.current.focus()
      }
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss(false)
        return
      }

      if (e.key === 'Tab' && modalCardRef.current) {
        const focusables = modalCardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (focusables.length === 0) return

        const firstElement = focusables[0]
        const lastElement = focusables[focusables.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalCardRef.current.contains(document.activeElement)) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement || !modalCardRef.current.contains(document.activeElement)) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)

      // Only restore focus if the user dismissed in-place, not when navigating to another route
      if (
        !isNavigatingRef.current &&
        previousActiveElementRef.current &&
        previousActiveElementRef.current !== document.body &&
        typeof document !== 'undefined' &&
        document.body.contains(previousActiveElementRef.current) &&
        typeof previousActiveElementRef.current.focus === 'function'
      ) {
        previousActiveElementRef.current.focus()
      }
      isNavigatingRef.current = false
    }
  }, [visible, dismiss])

  if (!visible || !message) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-discount-heading"
      aria-describedby="guest-discount-message"
      style={{
        background: 'rgba(16, 8, 10, 0.70)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          dismiss(false)
        }
      }}
    >
      <div
        ref={modalCardRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="popup-anim relative w-full max-w-[460px] my-auto max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden rounded-2xl bg-[#FAF6EE] text-center shadow-2xl border border-[#D9B86E]/50 focus:outline-none"
      >
        {/* Top Gold Gradient Bar */}
        <div className="h-2 w-full shrink-0 bg-gradient-to-r from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold)]" />

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => dismiss(false)}
          aria-label="Close welcome discount offer"
          className="absolute right-3.5 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#1F080D]/5 text-[#7A6065] transition-colors hover:bg-[#6B1A2A] hover:text-[#FAF6EE] focus:outline-none focus:ring-2 focus:ring-[#D9B86E]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto px-6 pb-8 pt-7 sm:px-8 sm:pb-9 sm:pt-8 overscroll-contain">
          {/* Icon Badge */}
          <div className="mx-auto mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-[1.5px] border-[#D9B86E]/50 bg-[#6B1A2A]/5 text-[#6B1A2A] shadow-sm">
            <Gift className="h-8 w-8 sm:h-10 sm:w-10 text-[#6B1A2A]" strokeWidth={1.5} />
          </div>

          {/* Subtitle / Eyebrow */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#C29B57]" />
            <h2
              id="guest-discount-heading"
              className="text-[11px] font-bold tracking-[0.25em] text-[#C29B57] uppercase"
            >
              Exclusive Welcome Offer
            </h2>
            <Sparkles className="h-3.5 w-3.5 text-[#C29B57]" />
          </div>

          {/* Divider */}
          <div className="mx-auto my-3 h-[1px] w-20 bg-gradient-to-r from-transparent via-[#C29B57] to-transparent opacity-60" />

          {/* Main Offer Message */}
          <p
            id="guest-discount-message"
            className="mb-3 px-2 text-xl sm:text-2xl font-bold leading-snug text-[#1F080D]"
            style={{ fontFamily: 'Playfair Display, var(--font-heading), serif' }}
          >
            {message}
          </p>

          {/* Flow Explanation */}
          <p className="mb-6 px-3 text-xs sm:text-sm text-[#7A6065] leading-relaxed">
            Create an account or sign in to receive your welcome discount on your first order. Automatically applied at checkout — no coupon code required!
          </p>

          {/* Primary CTA */}
          <Link
            href="/register"
            onClick={() => dismiss(true)}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#6B1A2A] px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[#FAF6EE] shadow-md transition-all hover:bg-[#4A0F1C] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D9B86E] active:scale-[0.99]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Register Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            {/* Hover shine effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          </Link>

          {/* Secondary Actions */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-xs text-[#7A6065]">
              Already have an account?{' '}
              <Link
                href="/login"
                onClick={() => dismiss(true)}
                className="font-bold text-[#6B1A2A] hover:underline underline-offset-2 focus:outline-none focus:ring-1 focus:ring-[#6B1A2A] rounded-sm"
              >
                Log In
              </Link>
            </p>
            <button
              type="button"
              onClick={() => dismiss(false)}
              className="text-xs font-semibold uppercase tracking-wider text-[#A08E93] transition hover:text-[#1F080D] hover:underline underline-offset-4 focus:outline-none focus:ring-1 focus:ring-[#A08E93] rounded-sm"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
