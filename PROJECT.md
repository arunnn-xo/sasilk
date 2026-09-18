# Project: Dynamic Storefront Intro Video Configuration & Seamless Playback

## Architecture
- **Backend**: Node.js v20+, TypeScript (NodeNext), Express 4.19.2, Sequelize 6.37.3 (MySQL), Zod 3.23.8, Multer 1.4.5, Cloudinary.
- **Admin Panel**: React 18, Vite, TypeScript, Tailwind CSS, TanStack React Query, Lucide React.
- **Storefront**: Next.js 14.2.3, React 18, TypeScript, Tailwind CSS.
- **Data Flow**:
  1. Admin Panel (`SettingsPage.tsx`):
     - Admin toggles "Enable Intro Video", sets video URL or uploads MP4/WebM (up to 50MB) via `POST /api/admin/uploads/video` directly to Cloudinary `sasilk/videos`.
     - Admin configures `posterUrl` (optional), `skipEnabled` (boolean), `skipAfterSeconds` (0-30s), and `showOncePerSession` (boolean).
     - Live embedded video preview player (`<video controls playsInline>`) displays immediate playback before saving.
     - Form validates video URL when enabled and disables save button while invalid or uploading.
     - Submits payload to `POST /api/admin/settings` or `PUT /api/admin/settings/:id` under key `intro_video_config`.
  2. Backend Database & API (`backend/node`):
     - `Setting` model (`settings` table) persists JSON `value` for key `intro_video_config`.
     - `resource.controller.ts` validates payload against Zod schema and calls `invalidateIntroVideoCache()`.
     - `settings.service.ts` provides cached getter `getIntroVideoConfig()` and invalidator `invalidateIntroVideoCache()`.
     - `catalog.controller.ts` serves public `GET /api/storefront/intro-video` exposing active sanitized config.
  3. Storefront Display (`frontend`):
     - `storefront.service.ts` fetches `GET /api/storefront/intro-video` via `fetchIntroVideoConfig()`.
     - `IntroVideo.tsx` (in both `frontend/components/ui/` and `frontend/homepage-bundle/components/ui/`) dynamically renders:
       - Immediate zero-void return `null` if disabled, URL empty, or `sessionStorage.getItem('sas_intro_seen')` exists.
       - If enabled: full-screen overlay (`aria-label="Intro video"`), autoplay (muted), smooth loading spinner, skip button with countdown timer, and smooth fade-out exit transition.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Settings Model & Service Extension | Add `IntroVideoConfig` type, default config, `getIntroVideoConfig()` with in-memory caching, and `invalidateIntroVideoCache()` | M1 | ORIGINAL_REQUEST R1 | DONE (Verified) |
| 2 | Admin Settings Zod Validation | Strict Zod validation in `resource.controller.ts` for `intro_video_config` with required video URL when enabled | M1 | ORIGINAL_REQUEST R1 | DONE (Verified) |
| 3 | Cache Invalidation Wiring | Wire `invalidateIntroVideoCache()` into `createResource`, `updateResource`, and `deleteResource` | M1 | ORIGINAL_REQUEST R1 | DONE (Verified) |
| 4 | Public Storefront Intro Video Endpoint | Expose `GET /api/storefront/intro-video` in `storefront.routes.ts` & `catalog.controller.ts` | M1 | ORIGINAL_REQUEST R1 | DONE (Verified) |
| 5 | Video Upload Multer Error Handling | Ensure 50MB video uploads work smoothly and error messages reflect 50MB limit | M1 | ORIGINAL_REQUEST R1 | DONE (Verified) |
| 6 | Admin Intro Video Card & Controls | Add Soil Goddess styled card in `SettingsPage.tsx` with master toggle, skip toggle, showOnce toggle, and skipAfterSeconds | M2 | ORIGINAL_REQUEST R2 | DONE (Verified) |
| 7 | Admin Dual-Mode Video Upload & URL Input | Direct MP4/WebM upload via `uploadVideo` + external video URL text input | M2 | ORIGINAL_REQUEST R2 | DONE (Verified) |
| 8 | Admin Live Embedded Video Player Preview | Embedded `<video>` preview rendering active video with controls, poster, and fallback | M2 | ORIGINAL_REQUEST R2 | DONE (Verified) |
| 9 | Admin Validation & Reactive Save States | Inline error display and disabled save button when enabled without video URL or while uploading | M2 | ORIGINAL_REQUEST R2 | DONE (Verified) |
| 10 | Admin Persistence & Reload Integrity | Persist settings to database via settings API and reload cleanly on page refresh | M2 | ORIGINAL_REQUEST R2 | DONE (Verified) |
| 11 | Storefront Service Type Contract | Add `IntroVideoConfig` type and `fetchIntroVideoConfig()` in `storefront.service.ts` | M3 | ORIGINAL_REQUEST R3 | DONE (Verified) |
| 12 | Storefront Zero Layout Shift & Suppression | Instant site entrance (return `null`) when disabled, empty URL, or session seen | M3 | ORIGINAL_REQUEST R3 | DONE (Verified) |
| 13 | Storefront Fullscreen Overlay & Autoplay | Fullscreen overlay with `aria-label="Intro video"`, muted autoplay, poster, spinner | M3 | ORIGINAL_REQUEST R3 | DONE (Verified) |
| 14 | Storefront Skip Timer & Countdown | Skip button respecting `skipEnabled` and countdown delay `skipAfterSeconds` | M3 | ORIGINAL_REQUEST R3 | DONE (Verified) |
| 15 | Storefront Fade-Out & Session Persistence | Smooth fade-out exit transition and `sessionStorage.setItem('sas_intro_seen', 'true')` | M3 | ORIGINAL_REQUEST R3 | DONE (Verified) |
| 16 | Storefront Bundle Synchronization | Synchronize `frontend/components/ui/IntroVideo.tsx` and `frontend/homepage-bundle/components/ui/IntroVideo.tsx` | M3 | ORIGINAL_REQUEST R3 | DONE (Verified) |
| 17 | E2E Automated Test Suite | Requirement-driven automated tests covering all 4 tiers of intro video features | M-E2E | ORIGINAL_REQUEST AC | DONE (Verified) |
| 18 | Full System Build & Forensic Integrity | 0 error builds in `backend/node`, `backend/panel`, `frontend` + clean forensic audit | M4 | ORIGINAL_REQUEST AC | DONE (Verified) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Schema, Service & Storefront API | `settings.service.ts`, `resource.controller.ts`, `catalog.controller.ts`, `storefront.routes.ts`, `error-handler.ts` | none | DONE (Verified) |
| M2 | Admin Panel Management & Live Preview | `backend/panel/src/pages/SettingsPage.tsx` | M1 | DONE (Verified) |
| M3 | Storefront Dynamic Intro Video & Playback | `frontend/components/ui/IntroVideo.tsx`, `frontend/homepage-bundle/components/ui/IntroVideo.tsx`, `storefront.service.ts` | M1 | DONE (Verified) |
| M-E2E | E2E Testing Track | `TEST_INFRA.md`, automated test harness & test suite | M1 | DONE (Verified) |
| M4 | System Verification, Build & Forensic Audit | Pass 100% E2E tests, TypeScript builds in all 3 apps, adversarial review & forensic audit | M1, M2, M3, M-E2E | DONE (Gate: PASS) |

## Interface Contracts

### 1. `IntroVideoConfig` Contract
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

### 2. Default Configuration
```typescript
export const defaultIntroVideoConfig: IntroVideoConfig = {
  enabled: false,
  videoUrl: '',
  posterUrl: '',
  skipEnabled: true,
  skipAfterSeconds: 0,
  showOncePerSession: true,
}
```

### 3. Backend Zod Validation Schema (`backend/node/src/modules/admin/controllers/resource.controller.ts`)
```typescript
if (data.key === 'intro_video_config') {
  const val = data.value as any
  if (typeof val?.enabled !== 'boolean') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'enabled must be a boolean', path: ['value', 'enabled'] })
  }
  if (val?.enabled && (!val.videoUrl || typeof val.videoUrl !== 'string' || !val.videoUrl.trim())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'videoUrl is required when intro video is enabled', path: ['value', 'videoUrl'] })
  }
  if (val?.videoUrl !== undefined && typeof val.videoUrl !== 'string') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'videoUrl must be a string', path: ['value', 'videoUrl'] })
  }
  if (val?.posterUrl !== undefined && val?.posterUrl !== null && typeof val.posterUrl !== 'string') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'posterUrl must be a string', path: ['value', 'posterUrl'] })
  }
  if (val?.skipEnabled !== undefined && typeof val.skipEnabled !== 'boolean') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'skipEnabled must be a boolean', path: ['value', 'skipEnabled'] })
  }
  if (val?.skipAfterSeconds !== undefined) {
    const num = Number(val.skipAfterSeconds)
    if (isNaN(num) || num < 0 || num > 30) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'skipAfterSeconds must be a number between 0 and 30', path: ['value', 'skipAfterSeconds'] })
    }
  }
  if (val?.showOncePerSession !== undefined && typeof val.showOncePerSession !== 'boolean') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'showOncePerSession must be a boolean', path: ['value', 'showOncePerSession'] })
  }
}
```

### 4. Public Storefront Endpoint API
- **Route**: `GET /api/storefront/intro-video`
- **Response**: `200 OK`
```json
{
  "enabled": false,
  "videoUrl": "",
  "posterUrl": "",
  "skipEnabled": true,
  "skipAfterSeconds": 0,
  "showOncePerSession": true
}
```

## Code Layout
- `backend/node/src/services/settings.service.ts` — In-memory caching, getters, and invalidator for intro video config.
- `backend/node/src/modules/admin/controllers/resource.controller.ts` — Settings Zod schema validation & cache invalidation hooks.
- `backend/node/src/modules/storefront/controllers/catalog.controller.ts` — Storefront public intro video controller.
- `backend/node/src/modules/storefront/storefront.routes.ts` — Route registration for `GET /intro-video`.
- `backend/node/src/middleware/error-handler.ts` — Multer upload limit error handling.
- `backend/panel/src/pages/SettingsPage.tsx` — Admin panel intro video settings card with live preview & upload.
- `frontend/lib/services/storefront.service.ts` — Storefront service API fetcher.
- `frontend/components/ui/IntroVideo.tsx` — Storefront dynamic fullscreen intro video overlay component.
- `frontend/homepage-bundle/lib/services/storefront.service.ts` — Homepage bundle storefront service contract.
- `frontend/homepage-bundle/components/ui/IntroVideo.tsx` — Homepage bundle intro video component.
