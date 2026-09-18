## 2026-09-18T05:19:20Z

You are Storefront Worker M3 for Milestone 3: Storefront Dynamic Intro Video & Seamless Playback.
Your working directory is: c:\sts-projects\sasilk\.agents\worker_m3
Workspace root: c:\sts-projects\sasilk
Authoritative request: c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md
Project Blueprint: c:\sts-projects\sasilk\PROJECT.md
Survey report: c:\sts-projects\sasilk\.agents\survey_spec_miner_1\survey_report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership (files you own exclusively):
- `frontend/lib/services/storefront.service.ts`
- `frontend/homepage-bundle/lib/services/storefront.service.ts`
- `frontend/components/ui/IntroVideo.tsx`
- `frontend/homepage-bundle/components/ui/IntroVideo.tsx`

Your mission:
Implement Milestone 3 per `PROJECT.md § Interface Contracts` and `ORIGINAL_REQUEST.md R3`:
1. `storefront.service.ts` (in BOTH `frontend/lib/services/storefront.service.ts` AND `frontend/homepage-bundle/lib/services/storefront.service.ts`):
   - Export interface `IntroVideoConfig`:
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
   - Export `DEFAULT_INTRO_VIDEO_CONFIG`:
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
   - Export `fetchIntroVideoConfig(): Promise<IntroVideoConfig>`:
     - Fetches from `/api/storefront/intro-video` (or using `apiFetch`), falling back to `DEFAULT_INTRO_VIDEO_CONFIG` on any error or missing data.

2. `IntroVideo.tsx` (in BOTH `frontend/components/ui/IntroVideo.tsx` AND `frontend/homepage-bundle/components/ui/IntroVideo.tsx` - KEEP IDENTICAL):
   - `'use client'`
   - Guard against SSR: if `typeof window === 'undefined'`, return `null`.
   - Dynamic configuration: fetch `fetchIntroVideoConfig()` on component mount.
   - Zero Layout Shift / Suppression:
     - If `config.enabled === false` OR `!config.videoUrl?.trim()`: return `null`.
     - If `config.showOncePerSession === true` AND `sessionStorage.getItem('sas_intro_seen')`: return `null`.
     - If fetch fails or network error: return `null` immediately.
   - Active Overlay:
     - Root container MUST retain `aria-label="Intro video"` (`<div aria-label="Intro video" role="dialog" aria-modal="true" className={...}>`) so `GuestDiscountPopup.tsx` does not conflict.
     - Fullscreen overlay: `fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-700`.
     - Video tag:
       - `autoPlay muted playsInline preload="auto"`
       - `src={config.videoUrl}`
       - `poster={config.posterUrl || undefined}`
       - If `video.play()` is rejected by browser policy: call `handleDismiss()` immediately so user is not stuck.
       - `onEnded={handleDismiss}`
       - `onError={handleDismiss}`
     - Smooth loading spinner: displayed while video is buffering before playback starts.
     - Skip button:
       - If `config.skipEnabled`:
         - Track playback elapsed time via `onTimeUpdate`.
         - If `config.skipAfterSeconds > 0` and elapsed time < `skipAfterSeconds`: show countdown badge ("Skip in {remaining}s").
         - When elapsed time >= `skipAfterSeconds` (or if `skipAfterSeconds === 0`): show active clickable "Skip" button with SkipForward icon.
         - Clicking Skip calls `handleDismiss()`.
     - Smooth Dismiss Transition & Session Marking:
       - `handleDismiss`: sets fading state (`opacity-0 pointer-events-none`), waits 700ms, then sets unmounted state.
       - If `config.showOncePerSession === true`: sets `sessionStorage.setItem('sas_intro_seen', 'true')`.
     - Responsive sizing: mobile, tablet, laptop, desktop.

3. Verification:
   - Run `npm run build` in `frontend`. Must pass with 0 errors.

Write handoff report to `c:\sts-projects\sasilk\.agents\worker_m3\handoff.md` and send message to orchestrator upon completion.

## 2026-09-18T05:40:09Z
**Context**: Storefront Worker M3 Status
**Content**: Checking in on Milestone 3 progress and frontend build status.
**Action**: Please report your current progress and ETA.

