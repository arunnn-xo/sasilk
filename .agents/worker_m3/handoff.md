# Handoff Report — Milestone 3: Storefront Dynamic Intro Video & Seamless Playback

**Agent**: Storefront Worker M3 (`worker_m3`)  
**Date**: 2026-09-18  
**Recipient**: Orchestrator (`adf61df8-cd40-43cb-869c-b206dde43fe5`)  

---

## 1. Observation

### 1.1 Files Modified Under Exclusive Ownership
1. `frontend/lib/services/storefront.service.ts`
   - Added interface `IntroVideoConfig`:
     ```typescript
     export interface IntroVideoConfig {
       enabled: boolean
       videoUrl: string
       posterUrl?: string
       skipEnabled: boolean
       skipAfterSeconds: number
       showOncePerSession: boolean
     }
     ```
   - Added constant `DEFAULT_INTRO_VIDEO_CONFIG` and alias `defaultIntroVideoConfig`:
     ```typescript
     export const DEFAULT_INTRO_VIDEO_CONFIG: IntroVideoConfig = {
       enabled: false,
       videoUrl: '',
       posterUrl: '',
       skipEnabled: true,
       skipAfterSeconds: 0,
       showOncePerSession: true,
     }
     export const defaultIntroVideoConfig: IntroVideoConfig = DEFAULT_INTRO_VIDEO_CONFIG
     ```
   - Added async function `fetchIntroVideoConfig(): Promise<IntroVideoConfig>` with defensive 3500ms abort controller, JSON fallback, and robust schema sanitization.

2. `frontend/homepage-bundle/lib/services/storefront.service.ts`
   - Added identical `IntroVideoConfig`, `DEFAULT_INTRO_VIDEO_CONFIG`, `defaultIntroVideoConfig`, and `fetchIntroVideoConfig()` definitions to maintain cross-bundle contract compatibility.

3. `frontend/components/ui/IntroVideo.tsx`
   - Implemented dynamic intro video component:
     - `'use client'` directive with client-side hydration guard `isClient`.
     - Zero Layout Shift: returns `null` during SSR, during config fetch, if disabled (`config.enabled === false`), if `videoUrl` is empty, or if already seen in session (`config.showOncePerSession && sessionStorage.getItem('sas_intro_seen')`).
     - Overlay Container: `<div role="dialog" aria-modal="true" aria-label="Intro video" className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-700 ...">` preserving selector compatibility for `GuestDiscountPopup.tsx`.
     - Autoplay compliance: programmatic `video.muted = true`, `video.playsInline = true`, and catches rejected play promises to trigger `handleDismiss()` immediately rather than trapping users.
     - Smooth loading spinner with gold/white aesthetic displayed while buffering.
     - Skip button state machine:
       - If `skipEnabled === true` and `skipAfterSeconds > 0` with `elapsedTime < skipAfterSeconds`: renders non-clickable countdown badge (`Skip in {remainingSeconds}s`).
       - When `elapsedTime >= skipAfterSeconds` (or if `skipAfterSeconds === 0`): renders clickable button with `SkipForward` icon and accessible focus/hover styling.
       - If `skipEnabled === false`: omits skip controls completely.
     - Dismiss Transition & Session Marking:
       - Sets `leaving = true` applying `opacity-0 pointer-events-none` over 700ms.
       - Sets `sessionStorage.setItem('sas_intro_seen', 'true')` when `config.showOncePerSession === true`.
       - Body scroll lock restored on dismissal/unmount.
       - 12-second watchdog safety timer prevents infinite stalling on network delays.

4. `frontend/homepage-bundle/components/ui/IntroVideo.tsx`
   - Synchronized byte-for-byte with `frontend/components/ui/IntroVideo.tsx` (verified via `git diff --no-index` producing zero differences).

### 1.2 Verification Commands & Results
- **Git Diff Verification**:
  ```
  git diff --no-index frontend/components/ui/IntroVideo.tsx frontend/homepage-bundle/components/ui/IntroVideo.tsx
  -> Exit code 0 (0 differences)
  ```
- **Frontend Production Build**:
  ```
  npm run build (in frontend/)
  -> Exit code 0
  -> Compiled successfully
  -> Linting and checking validity of types ... passed
  -> Generating static pages (23/23) ... passed
  ```
- **Backend Intro Video Test Suite**:
  ```
  npx tsx scripts/test-intro-video.ts (in backend/node/)
  -> 65 / 65 passed (0 failed) across all 4 tiers
  ```

---

## 2. Logic Chain

1. **Contract Alignment**:
   `PROJECT.md § Interface Contracts` and `DISPATCH.md` require `IntroVideoConfig`, `DEFAULT_INTRO_VIDEO_CONFIG`, and `fetchIntroVideoConfig()` to be accessible in both `frontend/lib/services/storefront.service.ts` and `frontend/homepage-bundle/lib/services/storefront.service.ts`. Adding these exports ensures full contract parity across both bundles.

2. **Zero Layout Shift / SSR Guard**:
   In Next.js App Router, `app/page.tsx` is prerendered statically. If the intro video component rendered a container or default backdrop before knowing whether the intro video was active in the database, disabled sites would flicker an empty overlay. By returning `null` when unmounted, during SSR, or when disabled/empty/seen, the homepage renders instantaneously with zero layout shift.

3. **Autoplay Policy Handling**:
   Mobile browsers (WebKit iOS, Chrome Android) enforce strict autoplay policies. If a browser rejects programmatic `.play()`, catching the rejection and executing `handleDismiss()` prevents the user from being trapped on a frozen screen.

4. **Countdown Skip & Accessibility**:
   The `skipAfterSeconds` configuration prevents immediate skipping if desired by the merchant. Calculating remaining seconds from video `currentTime` provides users with visible feedback before unlocking the skip button. Retaining `aria-label="Intro video"` ensures `GuestDiscountPopup.tsx` can continue querying `document.querySelector('[aria-label="Intro video"]')` to prevent overlapping modals.

5. **Session Isolation**:
   Writing `'true'` to `sessionStorage` under `sas_intro_seen` persists state across the active browser tab session without leaking across independent browser sessions.

---

## 3. Caveats

- In `frontend/homepage-bundle/`, independent `npm run build` is not runnable standalone due to external relative module imports (e.g. `@/lib/api/storefront`) belonging to the root Next.js app architecture. The main storefront application `frontend/` builds cleanly with exit code 0 and bundles both components.
- No other caveats.

---

## 4. Conclusion

Milestone 3 is complete, fully functional, and verified:
- Storefront service contracts and fetchers are exported correctly in both packages.
- `IntroVideo.tsx` delivers zero layout shift, seamless session suppression, countdown skip controls, loading indicators, autoplay rejection recovery, and 700ms smooth fade-out exit transitions.
- All code modifications were restricted exclusively to assigned files.
- `frontend` Next.js production build passed with 0 errors across all 23 routes.

---

## 5. Verification Method

To independently verify this milestone:

1. **Verify Bundle Parity**:
   ```bash
   git diff --no-index frontend/components/ui/IntroVideo.tsx frontend/homepage-bundle/components/ui/IntroVideo.tsx
   ```
   *Expected result*: No output, exit code 0.

2. **Verify Frontend Build**:
   ```bash
   cd frontend && npm run build
   ```
   *Expected result*: Exit code 0, 23/23 routes compiled successfully.

3. **Verify Automated Intro Video Test Suite**:
   ```bash
   cd backend/node && npx tsx scripts/test-intro-video.ts
   ```
   *Expected result*: 65/65 tests passed (100% success).
