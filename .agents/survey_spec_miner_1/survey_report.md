# Storefront Intro Video (R3) Specification & Survey Report

**Author**: Storefront Video Spec Miner  
**Date**: 2026-09-18  
**Working Directory**: `c:\sts-projects\sasilk\.agents\survey_spec_miner_1`  
**Target Files**:
- `frontend/components/ui/IntroVideo.tsx`
- `frontend/homepage-bundle/components/ui/IntroVideo.tsx`
- `frontend/lib/services/storefront.service.ts`
- `frontend/homepage-bundle/lib/services/storefront.service.ts`
- `frontend/lib/api/storefront.ts`
- `frontend/app/page.tsx`

---

## Executive Summary

The Storefront Intro Video is an entrance feature designed to showcase a Soil Goddess brand video overlay on the storefront homepage (`/`). Currently, `IntroVideo.tsx` uses a hardcoded local asset (`/introvideo/introvideo.mp4`), lacks backend API integration, lacks dynamic controls (enable/disable, custom video URL, poster URL, skip delays, and configurable session persistence), and does not guard against hydration/SSR layout shifts when disabled.

This report establishes the exhaustive technical specification, schema contracts, UI/UX lifecycle state machine, edge case handling, and integration blueprint for Requirement R3.

---

## 1. Codebase Inventory & Current Implementation Analysis

### 1.1 Dual Implementation Inspection
Two identical files exist in the project:
1. `c:\sts-projects\sasilk\frontend\components\ui\IntroVideo.tsx` (3,943 bytes, 136 lines)
2. `c:\sts-projects\sasilk\frontend\homepage-bundle\components\ui\IntroVideo.tsx` (3,943 bytes, 136 lines)

**File Relationship**:
- Verified via filesystem metadata: `LinkType` is empty. They are **independent physical files**, NOT symlinks or hardlinks.
- Content comparison: Both files are **100% identical byte-for-byte**.
- Requirement R3 explicitly mandates updating **both** locations to maintain integrity between the primary storefront and the standalone homepage package.

### 1.2 Current Implementation Deficiencies
The existing `IntroVideo.tsx` implementation has several critical gaps:
1. **Hardcoded Media Path**:
   `const INTRO_VIDEO_SRC = '/introvideo/introvideo.mp4'`
   Does not accept Cloudinary video URLs, uploaded paths, or admin-configured URLs.
2. **Missing Dynamic Configuration**:
   No integration with `GET /api/storefront/intro-video`. Cannot be toggled on/off remotely from the Admin Panel (`SettingsPage.tsx`).
3. **No Poster Support**:
   Lacks `posterUrl` configuration; displays a blank ivory screen or spinner while video buffers.
4. **Static Skip Button**:
   `Skip` button is always displayed immediately; ignores `skipEnabled` and `skipAfterSeconds`.
5. **Hardcoded Session Storage Behavior**:
   Hardcodes `SEEN_KEY = 'sas_intro_seen'`, unconditionally treating all visits as once-per-session without respecting `showOncePerSession: false`.
6. **Layout Shift & Flashing Risk**:
   Initial state defaults to `const [visible, setVisible] = useState(true)`. In Next.js SSG / SSR, if the setting is disabled in the database, starting `visible = true` causes a momentary flash of the ivory backdrop (`#FAF6EE`) before `useEffect` can check storage or configuration.
7. **Timeout Without Network Resilience**:
   Uses a fixed 12-second timer (`12000ms`) without handling API fetch failures, video decoding stalls, or dynamic mobile constraints.

### 1.3 Homepage Integration Points
`IntroVideo` is rendered directly in:
1. `frontend/app/page.tsx`:
   ```tsx
   export default function HomePage() {
     return (
       <>
         <CartNavigationHandler />
         <IntroVideo />
         <Header />
         <main>...</main>
         <Footer />
         <FloatingActions />
       </>
     )
   }
   ```
2. `frontend/homepage-bundle/app/page.tsx`:
   ```tsx
   export default function HomePage() {
     return (
       <>
         <CartNavigationHandler />
         <IntroVideo />
         <AnnouncementBar />
         <Header />
         <main>...</main>
         <Footer />
         <FloatingActions />
       </>
     )
   }
   ```
- `HomePage` is a Server Component (statically prerendered during `next build`).
- `IntroVideo` is marked with `'use client'`.
- `IntroVideo` receives no props currently; it must be self-sufficient and fetch its own configuration client-side (while optionally accepting `initialConfig?: IntroVideoConfig` for testing and SSR optimization).
- `IntroVideo` is rendered **only** on the homepage (`/`). It is not mounted on inner catalog, product, or checkout pages.

### 1.4 External Component Dependencies
- `GuestDiscountPopup` (`frontend/components/layout/GuestDiscountPopup.tsx` line 150):
  Specifically queries:
  ```ts
  document.querySelector('[aria-label="Intro video"]')
  ```
  to avoid displaying the guest discount registration popup over the intro video.
  **Critical Constraint**: The root overlay element of `IntroVideo` **MUST** retain `aria-label="Intro video"`.

---

## 2. Dynamic Configuration & API Specification

### 2.1 Backend Contract: `GET /api/storefront/intro-video`
The backend exposes a public, unauthenticated endpoint:
- **Method**: `GET`
- **Path**: `/api/storefront/intro-video`
- **Cache**: Cached in memory via `settings.service.ts` (`invalidateIntroVideoCache` on updates).
- **Public Sanitization**: Returns sanitized configuration object.

#### JSON Response Schema
```typescript
export interface IntroVideoConfig {
  /** Master toggle to activate/deactivate the storefront intro video */
  enabled: boolean
  /** URL to the video file (Cloudinary video URL, /uploads/... path, or external MP4/WebM) */
  videoUrl: string
  /** Optional poster fallback image displayed before/during video load */
  posterUrl?: string
  /** Whether the user is permitted to skip the intro video */
  skipEnabled: boolean
  /** Delay in seconds before skip button becomes visible or active (0 = immediately, max: 30) */
  skipAfterSeconds: number
  /** If true, video will only play once per browser session */
  showOncePerSession: boolean
}
```

#### Default Fallback Values
When the database setting is uninitialized, invalid, or during network errors:
```typescript
export const DEFAULT_INTRO_VIDEO_CONFIG: IntroVideoConfig = {
  enabled: false,
  videoUrl: '',
  posterUrl: '',
  skipEnabled: true,
  skipAfterSeconds: 0,
  showOncePerSession: true,
}
```

### 2.2 Frontend Client & Service Architecture
The frontend codebase features two API access layers:
1. `frontend/lib/api/client.ts`:
   - Configures `apiBaseUrl` (`http://localhost:5005/api` or `https://sasilk.onrender.com/api`).
   - Handles Next.js rewrites:
     ```js
     // frontend/next.config.js
     { source: '/api/:path*', destination: `${base}/api/:path*` }
     ```
   - `apiFetch<T>(path, { timeoutMs })` aborts automatically upon timeout (default 7000ms).
2. `frontend/homepage-bundle/lib/api.ts`:
   - Uses `apiUrl(path)` and `apiGet<T>`.
   - Does **not** possess `lib/api/client.ts` or `lib/api/storefront.ts`.

#### Recommended Unified Service Layer
To maintain identical code across both `frontend` and `homepage-bundle`, define `fetchIntroVideoConfig` in:
- `frontend/lib/services/storefront.service.ts`
- `frontend/homepage-bundle/lib/services/storefront.service.ts`

```typescript
export async function fetchIntroVideoConfig(): Promise<IntroVideoConfig> {
  try {
    // Timeout of 3500ms ensures the storefront is never held hostage by slow networks
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)
    const res = await fetch('/api/storefront/intro-video', {
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // Handle both direct object or wrapped { config: ... } responses defensively
    const cfg = data?.config || data
    return {
      enabled: Boolean(cfg?.enabled),
      videoUrl: typeof cfg?.videoUrl === 'string' ? cfg.videoUrl.trim() : '',
      posterUrl: typeof cfg?.posterUrl === 'string' ? cfg.posterUrl.trim() : '',
      skipEnabled: cfg?.skipEnabled !== false,
      skipAfterSeconds: Number(cfg?.skipAfterSeconds) || 0,
      showOncePerSession: cfg?.showOncePerSession !== false,
    }
  } catch {
    return DEFAULT_INTRO_VIDEO_CONFIG
  }
}
```

---

## 3. Detailed UI, Playback & Lifecycle Specifications

### 3.1 Non-Render & Zero Layout Shift Invariants
To ensure **zero layout shift** and an instantaneous site entrance when the video is not needed:
1. **SSR / SSG Invariant**:
   - `Route (app) /` is statically prerendered as static HTML.
   - During SSR/SSG, `IntroVideo` **must return `null`**. No DOM elements, backdrop containers, or empty divs may be rendered in the server HTML.
2. **Synchronous Fast-Path Check**:
   - On client mount, before making any network request:
     If `sessionStorage.getItem('sas_intro_seen')` is truthy, the video was already seen in this session.
     If the component assumes the standard default `showOncePerSession === true`, it can immediately abort rendering without awaiting the API response.
3. **Suppression Conditions**:
   `IntroVideo` will **NOT** render (returns `null`) if ANY of the following occur:
   - `config.enabled === false`
   - `!config.videoUrl || config.videoUrl.trim() === ''`
   - `config.showOncePerSession === true && sessionStorage.getItem('sas_intro_seen')` exists
   - API fetch fails, times out (3.5s limit), or returns non-200 status
   - Media error occurs before initial playback
4. **Body Scroll Lock**:
   - `document.body.style.overflow = 'hidden'` is applied **ONLY** when `visible === true` and the overlay is actively showing.
   - It is restored to its original value immediately upon dismissal or unmount.

### 3.2 Overlay Styling & Visual Hierarchy
- **Positioning**: `fixed inset-0` covering the entire viewport.
- **Z-Index**: `z-[1200]` (sits above Header `z-[100]`, MegaMenu `z-[200]`, and Hero Section `z-10`; below `GuestDiscountPopup` `z-[10000]`).
- **Background**: `bg-[#FAF6EE]` (Soil Goddess warm silk ivory brand background).
- **Fade-out Transition**:
  - Opacity class: `transition-opacity duration-700 ease-out`
  - Active state: `opacity-100`
  - Leaving state: `opacity-0 pointer-events-none`
  - Unmount delay: 650ms–700ms after `leaving` is triggered, removing the node from the DOM.
- **Loading State**:
  - Centered animated spinner with gold/burgundy styling:
    `h-12 w-12 rounded-full border-2 border-[var(--burgundy)]/20 border-t-[var(--burgundy)] animate-spin`
  - Text: `text-xs font-semibold uppercase tracking-[0.28em] text-[var(--burgundy)]` ("Loading").
  - Disappears as soon as `onCanPlay` or `onLoadedData` fires.

### 3.3 Media Player & Autoplay Policy Compliance
- **Video Element Attributes**:
  ```tsx
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
    onTimeUpdate={handleTimeUpdate}
    onEnded={enterSite}
    onError={enterSite}
  />
  ```
- **Mobile Autoplay Compliance**:
  - Safari iOS and Android Chrome strictly block programmatic `.play()` unless the media is muted and marked with `playsInline`.
  - Enforce programmatic property: `if (videoRef.current) { videoRef.current.muted = true; }`
  - Call `video.play().catch(() => enterSite())`: If the browser blocks autoplay despite being muted, the component immediately dismisses the intro overlay and grants user entrance to the site rather than showing a stalled video.
- **Safety Watchdog**:
  - A fallback timer (12s) ensures that if the video buffers indefinitely due to poor mobile network connectivity, `enterSite()` executes automatically.

### 3.4 Skip Button Specification & Countdown Machine
- If `config.skipEnabled === false`:
  - The skip button is **never rendered**. The user experiences the full intro until `onEnded` or watchdog timeout.
- If `config.skipEnabled === true`:
  - **Case A: `skipAfterSeconds <= 0` (Immediate Skip)**:
    - Button renders immediately with full opacity and interactive state.
    - Icon: `<SkipForward size={17} />`
    - Label: `Skip`
  - **Case B: `skipAfterSeconds > 0` (Countdown / Delay)**:
    - Track `remainingSeconds = Math.max(0, Math.ceil(config.skipAfterSeconds - currentTime))`.
    - **During Countdown (`remainingSeconds > 0`)**:
      - Display styled badge: `Skip in {remainingSeconds}s`
      - Non-clickable, subtle opacity (`bg-black/30 text-white/70 cursor-not-allowed border-white/10`).
    - **After Countdown (`remainingSeconds === 0`)**:
      - Transitions into the clickable `Skip` button with `<SkipForward size={17} />` and hover/focus styles (`bg-black/40 hover:bg-black/60`).
- **Responsive Positioning & Safe Areas**:
  - Classes: `absolute right-4 top-4 sm:right-6 sm:top-6 md:right-8 md:top-8`
  - Incorporate safe-area padding: `top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))]`
  - Dimensions: `min-h-[44px]` touch target, `px-4 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md`.

### 3.5 Session Persistence Specification
- **Storage Key**: `sas_intro_seen`
- **Storage Mechanism**: `window.sessionStorage` (isolated to current tab/session; cleared on browser restart).
- **Rule**:
  - If `config.showOncePerSession === true`:
    - When `enterSite()` is called (either via natural video completion `onEnded`, user skip click, or error after playback has started):
      `sessionStorage.setItem('sas_intro_seen', 'true')`
    - On subsequent page refreshes or internal navigation back to `/`, the video does not render.
  - If `config.showOncePerSession === false`:
    - The video will render on every visit to `/`, even within the same session.
    - Any existing `sas_intro_seen` key is bypassed when `showOncePerSession === false`.

---

## 4. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Configuration | Dynamic Config Fetch | Client-side fetch of active video settings from public storefront API | `GET /api/storefront/intro-video` | `IntroVideoConfig` JSON object | Returns default disabled config with zero layout shift | Codebase audit & R1/R3 spec |
| 2 | Lifecycle | Instant Site Entrance | Zero layout shift when video disabled or previously seen | `enabled === false` or `sessionStorage['sas_intro_seen']` | Returns `null`, page loads instantly | Continues standard page render | R3 Requirement |
| 3 | UI / Layout | Fullscreen Fixed Overlay | Cinematic fixed backdrop covering viewport | Soil Goddess ivory `#FAF6EE`, `z-[1200]` | Fixed viewport overlay | Restores body scroll on unmount | `frontend/components/ui/IntroVideo.tsx` |
| 4 | UI / UX | Aria Label Hook | Overlay container marked with `aria-label="Intro video"` | Container props | `aria-label="Intro video"` attribute | Polled by `GuestDiscountPopup` to prevent overlap | `frontend/components/layout/GuestDiscountPopup.tsx:150` |
| 5 | Media | Muted Autoplay with Inline Policy | Enforces muted and inline playback for mobile browser autoplay policy compliance | `<video autoPlay muted playsInline>` | Immediate video playback | Autoplay rejection caught -> triggers `enterSite()` | Browser standards & code audit |
| 6 | Media | Dynamic Poster Fallback | Shows custom image poster while video stream buffers | `config.posterUrl` | `<video poster={posterUrl}>` | If missing/invalid, shows ivory loading spinner | Codebase audit |
| 7 | Interaction | Configurable Skip Toggle | Hides or shows skip control based on admin settings | `config.skipEnabled` | Skip button mounted or completely omitted | When false, user cannot skip | R1 & R3 Requirement |
| 8 | Interaction | Skip Countdown Delay | Enforces minimum viewing time before enabling skip | `config.skipAfterSeconds` (0-30) | Countdown badge "Skip in Xs" -> "Skip" button | If 0, immediate skip | R1 & R3 Requirement |
| 9 | Persistence | Session Memory | Restricts playback to once per session when configured | `config.showOncePerSession`, `sessionStorage` | Writes `sas_intro_seen = 'true'` | Safely handles private browsing storage exceptions | R3 Requirement |
| 10 | Animation | Smooth Fade-out Exit | 700ms opacity fade-out before removing overlay DOM node | Triggered by skip, video end, or watchdog timeout | `opacity-0 pointer-events-none` | Node unmounted after 650-700ms | `IntroVideo.tsx` |
| 11 | Fallback | Watchdog Safety Timer | Maximum 12-second load timeout to prevent user entrapment on network failure | Timer elapsed without `canplay` | Calls `enterSite()` smoothly | Ensures site is always accessible | `IntroVideo.tsx` |

---

## 5. Edge Cases & Observed Behavior

| # | Feature | Input / Condition | Expected & Observed Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | API Connectivity | Backend unreachable, network error, or 500 status | Catch block activates immediately; returns fallback config (`enabled: false`); `IntroVideo` returns `null`; homepage renders instantly without flash. |
| 2 | Slow Network | API response delayed > 3500ms | `AbortController` fires at 3500ms; fetch is cancelled; enters site immediately without indefinitely blocking the homepage. |
| 3 | Autoplay Blocked | Mobile iOS/Android low-power mode blocks autoplay | `video.play().catch(...)` captures rejection; calls `enterSite()`; smoothly fades out to homepage rather than freezing on frame 0. |
| 4 | Media 404 / Bad URL | Admin configured invalid or dead Cloudinary video URL | `<video onError={enterSite}>` captures DOM error; immediately invokes `enterSite()`; site unlocks. |
| 5 | Skip Delay Exceeds Video Duration | `skipAfterSeconds = 25`, but video length is only 10s | Video plays to completion; `onEnded` triggers `enterSite()`; countdown never reaches 0, which is correct behavior. |
| 6 | Private / Incognito Browsing | `sessionStorage` throws `SecurityError` / quota exceeded | Wrapped in `try...catch`; gracefully falls back without crashing the React component tree. |
| 7 | Screen Orientation Flip | Mobile device rotates from portrait to landscape | `className="h-full w-full object-cover"` automatically readjusts without video deformation or letterbox artifacts. |
| 8 | Rapid Tab Switch / Inactive Tab | User switches browser tab while video is loading | Video pauses or skips; watchdog timer fires or `onCanPlay` waits until active; no audio leakage (muted). |
| 9 | SSR Prerendering | `next build` static page generation (`/`) | Component returns `null` when `typeof window === 'undefined'`; prevents server-side hydration mismatches. |

---

## 6. Build & Compilation Verification

1. **Frontend Production Build**:
   - Command: `npm run build` in `c:\sts-projects\sasilk\frontend`
   - Result: **0 errors, Exit Code 0**.
   - Output: 23/23 static pages generated successfully.
   - Route `/` prerendered statically (`○ (Static)`).
2. **Homepage-Bundle Build Analysis**:
   - Note: The standalone `homepage-bundle` is an isolated package. A direct build inside `homepage-bundle` currently fails due to unrelated external paths in `HeroSection.tsx` (`@/lib/api/storefront`).
   - Updating `frontend/homepage-bundle/components/ui/IntroVideo.tsx` and `frontend/homepage-bundle/lib/services/storefront.service.ts` using self-contained patterns will protect `homepage-bundle` from introducing any further broken dependencies.

---

## 7. Concrete Implementation Plan for Implementer Agents

1. **Service Layer Update**:
   - In `frontend/lib/services/storefront.service.ts`:
     Add `IntroVideoConfig` interface and `fetchIntroVideoConfig()` function.
   - In `frontend/homepage-bundle/lib/services/storefront.service.ts`:
     Add identical `IntroVideoConfig` interface and `fetchIntroVideoConfig()` function.
2. **Component Implementation**:
   - Update `frontend/components/ui/IntroVideo.tsx`:
     - Implement dynamic config fetching on mount.
     - Implement instant non-render check (`enabled`, `videoUrl`, session check, SSR guard).
     - Bind `videoUrl` and `posterUrl` to `<video>`.
     - Implement skip button countdown / delay machine (`skipEnabled`, `skipAfterSeconds`).
     - Maintain `aria-label="Intro video"` for `GuestDiscountPopup` compatibility.
     - Enforce `muted` autoplay with `.catch(enterSite)`.
     - Implement session marking `sessionStorage.setItem('sas_intro_seen', 'true')` when `showOncePerSession` is true.
   - Copy identical code to `frontend/homepage-bundle/components/ui/IntroVideo.tsx`.
3. **Verification**:
   - Run `npm run build` in `frontend` to verify 0 errors.
