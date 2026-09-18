# Handoff Report - Storefront Video Spec Miner (R3)

## 1. Observation
- **Dual Implementation Files**:
  - `frontend/components/ui/IntroVideo.tsx` (136 lines, 3,943 bytes).
  - `frontend/homepage-bundle/components/ui/IntroVideo.tsx` (136 lines, 3,943 bytes).
  - Filesystem inspection confirmed both files have empty `LinkType` (independent physical files, not symlinks). They are 100% identical byte-for-byte.
- **Homepage Integration**:
  - `frontend/app/page.tsx` (lines 4, 20): Renders `<IntroVideo />` directly above `<Header />` inside the root `<HomePage />` server component.
  - `frontend/homepage-bundle/app/page.tsx` (lines 5, 21): Renders `<IntroVideo />` directly above `<AnnouncementBar />` inside the root `<HomePage />` component.
  - No props are passed to `<IntroVideo />`.
- **Cross-Component Dependencies**:
  - `frontend/components/layout/GuestDiscountPopup.tsx` (line 150): Specifically queries `document.querySelector('[aria-label="Intro video"]')` to delay popup display until the intro video is dismissed. The intro overlay container MUST retain `aria-label="Intro video"`.
- **API & Service Architecture**:
  - Public endpoint `GET /api/storefront/intro-video` exposes sanitized settings: `{ enabled, videoUrl, posterUrl, skipEnabled, skipAfterSeconds, showOncePerSession }`.
  - In `frontend`, `lib/api/client.ts` uses `apiFetch` with base URL `http://localhost:5005/api` and Next.js rewrites `/api/:path*`.
  - In `frontend/homepage-bundle`, `lib/api/client.ts` does not exist; instead `lib/api.ts` and `lib/services/storefront.service.ts` exist.
- **Compilation**:
  - `npm run build` executed in `frontend`: Exit code 0, 23/23 static pages generated successfully, route `/` prerendered statically (`○ (Static)`).

## 2. Logic Chain
1. Because `HomePage` is statically prerendered at build time (`○ (Static)`), `IntroVideo.tsx` must guard against SSR execution (`typeof window === 'undefined'`) by returning `null` on server renders to avoid hydration mismatches and prevent rendering empty video containers in static HTML.
2. Because `IntroVideo.tsx` exists in both `frontend/components/ui/` and `frontend/homepage-bundle/components/ui/`, both files must remain synchronized and identical.
3. Because `frontend/homepage-bundle` lacks `lib/api/client.ts`, exporting `IntroVideoConfig` and `fetchIntroVideoConfig()` from both `frontend/lib/services/storefront.service.ts` and `frontend/homepage-bundle/lib/services/storefront.service.ts` allows `IntroVideo.tsx` to maintain an identical import statement (`@/lib/services/storefront.service`) without breaking either project.
4. Because `GuestDiscountPopup` polls for `[aria-label="Intro video"]`, maintaining that exact attribute on the root overlay container is mandatory to prevent simultaneous modal popups.
5. Because mobile browsers (iOS WebKit and Android Chrome) prohibit unmuted programmatic autoplay, `<video>` must be configured with `muted`, `playsInline`, and `autoPlay`, and `video.play().catch(...)` must fall back immediately to `enterSite()` to prevent the user from being locked on an unplayable screen.
6. Because `skipAfterSeconds` can be greater than 0, the skip button must track elapsed playback time (`onTimeUpdate`) and display a countdown ("Skip in Xs") before transforming into an active, clickable "Skip" button.
7. If `showOncePerSession` is true, the component must mark `sessionStorage.setItem('sas_intro_seen', 'true')` upon entering the site, and suppress rendering if this key exists on subsequent page visits.

## 3. Caveats
- Backend implementation of `intro_video_config` in `settings.service.ts` and `GET /api/storefront/intro-video` is being built concurrently by the Backend Spec Miner / Implementer. Frontend service and component logic must defend against missing or empty API responses by providing sensible fallback defaults (`DEFAULT_INTRO_VIDEO_CONFIG` with `enabled: false`).
- In `homepage-bundle`, direct `npm run build` currently fails due to unrelated external imports in `HeroSection.tsx` and `HomeComponents.tsx`. The main `frontend` build is completely passing (0 errors).

## 4. Conclusion
The specification for Requirement R3 is fully mapped, verified against codebase references, and ready for implementation.
- Contract: `IntroVideoConfig` with fields `enabled`, `videoUrl`, `posterUrl`, `skipEnabled`, `skipAfterSeconds`, `showOncePerSession`.
- Key files to update:
  1. `frontend/lib/services/storefront.service.ts` & `frontend/homepage-bundle/lib/services/storefront.service.ts`
  2. `frontend/components/ui/IntroVideo.tsx` & `frontend/homepage-bundle/components/ui/IntroVideo.tsx`
- Complete feature matrix, schema details, edge case behaviors, and lifecycle rules are documented in `survey_report.md`.

## 5. Verification Method
1. Inspect files:
   - `frontend/components/ui/IntroVideo.tsx`
   - `frontend/homepage-bundle/components/ui/IntroVideo.tsx`
   - `frontend/lib/services/storefront.service.ts`
   - `frontend/homepage-bundle/lib/services/storefront.service.ts`
2. Test Next.js build:
   ```bash
   cd frontend
   npm run build
   ```
   Must pass with 0 errors.
3. Test edge case assertions:
   - `enabled === false`: Overlay returns `null`, site entrance is instantaneous.
   - `sessionStorage.getItem('sas_intro_seen')`: Overlay returns `null` when `showOncePerSession === true`.
   - `skipAfterSeconds > 0`: Countdown badge displays until elapsed time reached.
