# Original User Request

## Initial Request — 2026-08-31T15:09:19+05:30

This is a single self-contained fix; keep it small and focused.

Sync and optimize "The Art of Weaving" video section across the Next.js storefront and Vite admin panel so that uploaded brand videos autoplay seamlessly in a muted loop with smooth controls, and streamline the admin panel form by renaming "Art Wave" to "The Art of Weaving" and removing unnecessary options (such as manual mediaType and sortOrder).

Working directory: C:\sts-projects\sasilk
Integrity mode: development

## Requirements

### R1. Admin Panel "The Art of Weaving" Management (`backend/panel`)
- In `src/app/resources.ts`, update the sidebar menu label and page title from "Art Wave" to "The Art of Weaving" with the Film/Video or Palette icon.
- Streamline the form fields in `resources.ts` specifically for video presentation:
  - Video Upload / URL (`videoUrl`, kind: `video`, required)
  - Cover / Poster Image (`imageUrl`, kind: `image`, optional poster for video preview)
  - Title (`title`, text)
  - Subtitle & Description (`subtitle`, `description`, optional caption)
  - Active toggle (`active`, boolean)
  - Remove redundant fields (`mediaType`, `sortOrder`) so admins do not have confusing duplicate dropdowns.
- Ensure the admin form saves and edits videos cleanly to the `art-wave` API endpoint.

### R2. Frontend "The Art of Weaving" Video Playback (`frontend/components/home/HomeComponents.tsx`)
- In `ArtWaveSection`, update the video player to automatically load the active video configured from the admin panel.
- Implement seamless muted loop autoplay with clean play/pause toggle and sound control buttons.
- Keep the luxury boutique styling: decorative gold ornamental borders, custom pillar framing, and Playfair Display typography.
- Ensure responsive video display across mobile, tablet, laptop, and desktop without layout distortion.

## Acceptance Criteria

### Admin Panel
- [ ] Sidebar displays "The Art of Weaving" instead of "Art Wave".
- [ ] Admin form presents clean, dedicated fields: Video Upload, Poster Image, Title, Description, and Active toggle.
- [ ] Redundant `mediaType` and `sortOrder` options are removed from the form and list view.
- [ ] Video files upload and save properly without validation errors.

### Frontend Storefront
- [ ] Homepage "The Art of Weaving" section automatically fetches and autoplays the active video in a muted loop.
- [ ] Video player includes intuitive play/pause and unmute controls.
- [ ] Decorative pillars and luxury gold accents render cleanly around the video container across all screen sizes.

## Follow-up — 2026-09-02T10:33:16+05:30

This is a single self-contained fix; keep it small and focused.

Build a static Single Product Detail Page showcase with 2 realistic, complete demo silk saree products for an upcoming client review meeting.

Working directory: c:/sts-projects/sasilk/frontend
Integrity mode: demo

## Requirements

### R1. Static Product Detail Page Showcase
Configure the single product detail page (`/products/[slug]` and `/p/[slug]`) so that all product visual elements render reliably and with high aesthetic quality:
- Multi-image gallery with thumbnail switcher and zoom preview
- Saree details and technical specifications table (Pure Silk Mark, Zari Type, Weave Origin, Saree Length 5.5m + 0.8m Blouse, Care Instructions)
- Price with original price and discount badge (e.g. ₹28,500, ₹34,000, 16% OFF)
- Quantity selector, "Add to Bag", and "Buy Now" CTAs
- Reusable Trust Badges (100% Authentic Handloom, Free Insured Shipping, 7-Day Easy Exchange)
- Customer reviews section and related products carousel

### R2. Two Complete Demo Showcase Products
Create 2 complete, rich demo saree mock datasets in the frontend:
1. **Royal Kanchipuram Bridal Silk Saree** (`slug: royal-kanchipuram-bridal-silk-saree`)
   - Crimson Red & Gold Korvai border, pure zari temple motif pallu
   - Price: ₹28,500 (MSRP: ₹34,000)
2. **Peacock Blue Handloom Soft Silk Saree** (`slug: peacock-blue-handloom-soft-silk-saree`)
   - Royal Peacock Blue & Antique Gold floral jaal
   - Price: ₹18,900 (MSRP: ₹22,500)

### R3. Offline / Static Demo Fallback
In frontend product fetching services (`frontend/lib/services/storefront.service.ts`), ensure that fetching `/products/[slug]` or list of products returns these complete demo products if backend API is unreachable, guaranteeing 100% uptime during the client review meeting.

## Acceptance Criteria

### Product Page Verification
- [ ] Navigating to `/products/royal-kanchipuram-bridal-silk-saree` renders the complete product detail page with image gallery, specs, price, and CTAs.
- [ ] Navigating to `/products/peacock-blue-handloom-soft-silk-saree` renders the complete peacock blue saree product detail page.
- [ ] Adding products to cart increments cart count correctly.
- [ ] Fully responsive on mobile, tablet, and desktop with zero layout shift or broken images.

### Build Verification
- [ ] `npm run build` in `frontend` passes with 0 errors.

## Follow-up — 2026-09-03T18:02:11+05:30

Enhance the Soil Goddess Event Management system to allow administrators to add multiple gallery images and an optional video glimpse for events, and display them seamlessly with an interactive gallery and video player on the storefront event details page.

Working directory: c:\sts-projects\sasilk
Integrity mode: development

## Requirements

### R1. Database Schema & Event Model
Extend the `events` table and Sequelize `Event` model to support:
- `images` (JSON array of image URL strings) preserving order for multiple gallery images alongside the primary `imageUrl`.
- `videoUrl` (`VARCHAR(512)`, nullable) for the optional video glimpse URL (supports uploaded video files or external streaming links such as YouTube/Vimeo).
Ensure migrations safely add these columns if missing without breaking existing event records.

### R2. Backend Admin & Storefront API
Update event controllers and validation schemas:
- Update `eventSchema` in `backend/node/src/modules/admin/controllers/event.controller.ts` to accept optional `images` (array of strings) and optional `videoUrl` (nullable string).
- Ensure `createEvent` and `updateEvent` persist `images` and `videoUrl`.
- Ensure public storefront event endpoints (`getEventBySlug`, `listEvents` in `backend/node/src/modules/events/events.controller.ts`) return `images` and `videoUrl`.

### R3. Admin Panel Event Form (`EventFormPage.tsx`)
Upgrade the Event Form in `backend/panel/src/pages/EventFormPage.tsx`:
- **Multiple Image Gallery Uploader**: Allow uploading and managing multiple gallery images (with thumbnail grid preview, "+ Add Image" button, individual remove button, and primary cover selection).
- **Optional Video Glimpse Section**: Provide a dedicated field for video glimpse (upload video file or paste video URL) with live embedded player preview so administrators can preview before publishing.

### R4. Storefront Event Detail Showcase (`EventDetail.tsx`)
Upgrade the event page in `frontend/components/events/EventDetail.tsx` and related components:
- **Interactive Multi-Image Gallery**: If multiple images exist, render an elegant thumbnail-switched gallery or touch-friendly carousel matching the Soil Goddess luxury aesthetic.
- **Event Highlights & Video Glimpse Player**: If `videoUrl` is present, display a dedicated "Event Highlights & Glimpses" section below "About this event" with a responsive video player.

## Acceptance Criteria

### Admin Panel Management
- [ ] Admin can upload and save multiple images for an event; thumbnails display with delete actions.
- [ ] Admin can optionally add a video glimpse (URL or upload) with preview in the form.
- [ ] Existing events without gallery images or videos load and save without regression.

### Storefront Experience
- [ ] Event details page (`/events/[slug]`) displays multiple gallery images with interactive switcher or carousel.
- [ ] When an event has a video glimpse, the video player renders responsively and plays smoothly.
- [ ] If an event has no video glimpse, the video section is gracefully hidden without empty voids.

### Build & Code Integrity
- [ ] Backend TypeScript build (`npm run build` in `backend/node`), Admin Panel build (`npm run build` in `backend/panel`), and Frontend Next.js build (`npm run build` in `frontend`) all pass with 0 errors.

