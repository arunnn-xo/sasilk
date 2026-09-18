# Original User Request

## 2026-09-18T05:04:13Z

Make the storefront intro video fully dynamic, configurable from the Admin Panel Settings page, and validated end-to-end with live preview, Cloudinary video upload, and smooth storefront playback.

Working directory: c:\sts-projects\sasilk
Integrity mode: development

## Requirements

### R1. Database Schema & Backend API
- Create a dedicated setting configuration key `intro_video_config` managed via `settings.service.ts` and `resource.controller.ts` with Zod validation schema:
  - `enabled`: boolean toggle.
  - `videoUrl`: string (valid Cloudinary video URL, MP4/WebM URL, or uploaded path).
  - `posterUrl`: optional string (image poster fallback).
  - `skipEnabled`: boolean (default: true).
  - `skipAfterSeconds`: number (default: 0 for immediate skip, max: 30).
  - `showOncePerSession`: boolean (default: true).
- Provide backend caching and cache invalidation (`invalidateIntroVideoCache`).
- Ensure video upload endpoint (`/admin/uploads/video`) handles MP4 and WebM uploads up to 50MB directly to Cloudinary (`sasilk/videos`).
- Expose public endpoint `GET /api/storefront/intro-video` returning the active sanitized configuration.

### R2. Admin Panel Management (`SettingsPage.tsx`)
- In `backend/panel/src/pages/SettingsPage.tsx`, add a dedicated "Intro Video Configuration" card matching the Soil Goddess aesthetic:
  - Toggle switch for Enable / Disable Intro Video.
  - Video uploader: support uploading video file directly or entering an external video URL.
  - Embedded live video player preview showing how the video will play before saving.
  - Toggles for "Allow Skip" and "Show Once Per Session".
  - Validation: when enabled, require a valid video URL with inline error messages and disable save button while invalid or uploading.

### R3. Storefront Dynamic Intro Video (`IntroVideo.tsx`)
- Update `frontend/components/ui/IntroVideo.tsx` (and `frontend/homepage-bundle/components/ui/IntroVideo.tsx`):
  - Dynamically fetch config from the backend storefront API.
  - If `enabled` is false, or `videoUrl` is missing, or `showOncePerSession` is true and `sessionStorage.getItem('sas_intro_seen')` exists: do NOT render anything (immediate site entrance with zero layout shift).
  - If enabled: render full-screen video overlay with autoplay (muted), smooth loading spinner, and responsive sizing.
  - Implement smooth fade-out exit transition when ended, skipped, or on network error.
  - Honor `skipEnabled` and `skipAfterSeconds`.

## Acceptance Criteria

### Admin Panel Management
- [ ] Admin can toggle intro video on/off in `SettingsPage.tsx`.
- [ ] Admin can upload an MP4/WebM video or paste a video URL; preview player renders inside the form.
- [ ] Saving is validated: empty or invalid video URLs are blocked with clear feedback when enabled.
- [ ] Settings persist to database and reload accurately when refreshing the admin panel.

### Storefront Experience
- [ ] Storefront fetches intro video config dynamically; if disabled, homepage loads instantly without intro screen.
- [ ] When enabled, video plays smoothly with fallback handling for autoplay restrictions and network delays.
- [ ] Skip button functions smoothly and dismisses video with fade transition.
- [ ] Session persistence (`showOncePerSession`) works as configured.

### Build & Integrity
- [ ] Backend TypeScript build (`npm run build` in `backend/node`) passes with 0 errors.
- [ ] Admin Panel build (`npm run build` in `backend/panel`) passes with 0 errors.
- [ ] Frontend Next.js build (`npm run build` in `frontend`) passes with 0 errors.
