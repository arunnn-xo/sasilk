## 2026-09-18T05:05:44Z

You are the Storefront Video Spec Miner.
Your working directory is: c:\sts-projects\sasilk\.agents\survey_spec_miner_1
Workspace root: c:\sts-projects\sasilk
Authoritative request: c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md

Your mission:
Survey and extract precise specifications for the Storefront Intro Video in `frontend` for Requirement R3:
1. Inspect `frontend/components/ui/IntroVideo.tsx` and `frontend/homepage-bundle/components/ui/IntroVideo.tsx`:
   - What is the current implementation of `IntroVideo.tsx` in both locations? Are they identical or linked?
   - Where and how is `IntroVideo` rendered on the storefront homepage (e.g., `frontend/app/page.tsx` or `frontend/pages/index.tsx`)?
2. Dynamic Configuration & API Integration:
   - How does frontend currently fetch data from the backend? Inspect `frontend/lib/services/storefront.service.ts` or API utilities.
   - What contract does `GET /api/storefront/intro-video` provide?
   - How should the component fetch this configuration on initial load?
3. Playback, Overlay & UI Behavior:
   - Exact conditions under which intro video does NOT render (immediate site entrance with zero layout shift):
     - `enabled === false`
     - `videoUrl` missing/empty
     - `showOncePerSession === true` AND `sessionStorage.getItem('sas_intro_seen')` exists
     - Network error or API failure fallback
   - If enabled:
     - Fullscreen video overlay styling, z-index, background, loading spinner
     - Autoplay (muted) handling, mobile autoplay restrictions / fallback
     - Smooth fade-out exit transition when ended, skipped, or on error
     - Skip button behavior: `skipEnabled`, `skipAfterSeconds` countdown/delay before appearing or enabling skip
     - Responsive sizing across mobile, tablet, laptop, desktop
     - Marking session: `sessionStorage.setItem('sas_intro_seen', 'true')`
4. Compilation:
   - Check build requirements (`npm run build` in `frontend`).

Write your comprehensive specifications and evidence report to:
`c:\sts-projects\sasilk\.agents\survey_spec_miner_1\survey_report.md`
and write a standard handoff report to `c:\sts-projects\sasilk\.agents\survey_spec_miner_1\handoff.md`.
Notify orchestrator via send_message when done.
