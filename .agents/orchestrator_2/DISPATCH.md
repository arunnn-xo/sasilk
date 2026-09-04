# Dispatch Log

## 2026-09-03T12:33:41Z

Enhance the Soil Goddess Event Management system to allow administrators to add multiple gallery images and an optional video glimpse for events, and display them seamlessly with an interactive gallery and video player on the storefront event details page.

Requirements:
- R1. Database Schema & Event Model:
  Extend `events` table and Sequelize `Event` model (`backend/node/src/database/models/event.model.ts` or equivalent) to support:
  * `images` (JSON array of image URL strings) preserving order for multiple gallery images alongside primary `imageUrl`.
  * `videoUrl` (`VARCHAR(512)`, nullable) for optional video glimpse URL (supports uploaded video files or external streaming links such as YouTube/Vimeo).
  Ensure migrations safely add these columns if missing without breaking existing event records.
- R2. Backend Admin & Storefront API:
  Update `eventSchema` in `backend/node/src/modules/admin/controllers/event.controller.ts` to accept optional `images` and optional `videoUrl`.
  Ensure `createEvent` and `updateEvent` persist `images` and `videoUrl`.
  Ensure public storefront event endpoints (`getEventBySlug`, `listEvents` in `backend/node/src/modules/events/events.controller.ts`) return `images` and `videoUrl`.
- R3. Admin Panel Event Form (`backend/panel/src/pages/EventFormPage.tsx`):
  * Multiple Image Gallery Uploader: Allow uploading and managing multiple gallery images (with thumbnail grid preview, "+ Add Image" button, individual remove button, and primary cover selection).
  * Optional Video Glimpse Section: Dedicated field for video glimpse (upload video file or paste video URL) with live embedded player preview so administrators can preview before publishing.
- R4. Storefront Event Detail Showcase (`frontend/components/events/EventDetail.tsx` and related components):
  * Interactive Multi-Image Gallery: If multiple images exist, render an elegant thumbnail-switched gallery or touch-friendly carousel matching the Soil Goddess luxury aesthetic.
  * Event Highlights & Video Glimpse Player: If `videoUrl` is present, display a dedicated "Event Highlights & Glimpses" section below "About this event" with a responsive video player.
- Acceptance Criteria & Integrity:
  * Existing events without gallery images or videos load and save without regression.
  * When an event has a video glimpse, the player renders responsively and plays smoothly; if absent, section is gracefully hidden.
  * Verification builds: `npm run build` in `backend/node`, `backend/panel`, and `frontend` must all pass with 0 errors.
  * All rules: Always provide full updated code (never partial snippets), clean commit-ready code, keep components responsive across mobile, tablet, laptop, and desktop.
