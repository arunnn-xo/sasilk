# Project: Soil Goddess Event Management Enhancement (Multiple Gallery Images & Video Glimpse)

## Architecture
- **Backend Runtime & ORM**: Node.js v20+, TypeScript 5.5.3, Express 4.19.2, Sequelize 6.37.3 (MySQL), Zod 3.23.8, Multer 1.4.5.
- **Admin Panel**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, React Router 6.
- **Storefront**: Next.js 14.2.3 (App Router / Pages), React 18, TypeScript, Tailwind CSS.
- **Data Flow**:
  1. Admin Panel (`EventFormPage.tsx`):
     - Multiple image gallery uploader: accepts multi-file uploads via `uploadImage(file)` (`POST /api/admin/uploads`), builds ordered `images: string[]` array, sets/indicates primary cover `imageUrl`.
     - Video glimpse: URL input or video file upload via `uploadVideo(file)` (`POST /api/admin/uploads/video`), renders live embedded preview (YouTube, Vimeo, HTML5 video).
     - Persists payload to `POST /api/admin/events` or `PUT /api/admin/events/:id`.
  2. Backend Database & API (`backend/node`):
     - Migration (`migrate.ts`): safely adds `images` (JSON) and `video_url` (VARCHAR(512)) columns to `events` table if missing.
     - Model (`models/index.ts`): Sequelize `Event` model defines `images` (DataTypes.JSON with array getter/setter) and `videoUrl` (DataTypes.STRING(512), field: 'video_url').
     - Admin controller (`admin/controllers/event.controller.ts`): validates `images` and `videoUrl` via Zod `eventSchema`, persists them, and auto-populates `imageUrl` from `images[0]` if missing.
     - Storefront controller (`events/events.controller.ts`): serializes `images` and `videoUrl` in `toPublicEvent`, ensuring legacy events with only `imageUrl` gracefully fallback to `images: [imageUrl]`.
  3. Storefront Display (`frontend`):
     - Type contract (`storefront.service.ts`): `EventItem` extended with `images?: string[] | null` and `videoUrl?: string | null`.
     - Multi-Image Gallery (`EventGallery.tsx`): responsive interactive gallery placed above "About this event" with high-res active viewport, prev/next arrows, thumbnail switcher strip, full-screen lightbox, touch-friendly mobile carousel. Single-image fallback renders clean hero without controls; zero-image gracefully omitted.
     - Event Highlights & Video Player (`EventVideoPlayer.tsx`): responsive 16:9 player placed below "About this event" supporting YouTube, Vimeo, and direct/uploaded MP4/WebM videos. Gracefully hidden (zero voids) if `videoUrl` is null/empty.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Event Model Schema Extension | Add `images` (JSON array) and `videoUrl` (VARCHAR(512)) to Sequelize Event model | M1 | ORIGINAL_REQUEST R1 | DONE (Verified) |
| 2 | Safe Migration Pipeline | Idempotent `safeAddColumn` for `images` and `video_url` in `migrate.ts` | M1 | ORIGINAL_REQUEST R1 | DONE (Verified) |
| 3 | Admin Event Controller Validation & Persistence | Extend Zod `eventSchema`, persist `images` & `videoUrl`, auto-fallback `imageUrl` | M1 | ORIGINAL_REQUEST R2 | DONE (Verified) |
| 4 | Storefront Event Controller DTO Serialization | Include `images` and `videoUrl` in `toPublicEvent` with legacy fallback | M1 | ORIGINAL_REQUEST R2 | DONE (Verified) |
| 5 | Admin Multiple Image Gallery Uploader | Thumbnail grid, cover selector, delete button, multi-file upload, URL fallback | M2 | ORIGINAL_REQUEST R3 | DONE (Verified) |
| 6 | Admin Optional Video Glimpse Section | Dedicated URL/upload input with live embedded preview (YouTube, Vimeo, HTML5) | M2 | ORIGINAL_REQUEST R3 | DONE (Verified) |
| 7 | Storefront Type Contract Extension | Add `images` and `videoUrl` to `EventItem` in `storefront.service.ts` | M3 | ORIGINAL_REQUEST R4 | DONE (Verified) |
| 8 | Storefront Interactive Multi-Image Gallery | Thumbnail-switched gallery, carousel, lightbox, luxury aesthetic, graceful fallback | M3 | ORIGINAL_REQUEST R4 | DONE (Verified) |
| 9 | Storefront Responsive Video Glimpse Player | Dedicated "Event Highlights & Glimpses" section, 16:9 player, zero voids if absent | M3 | ORIGINAL_REQUEST R4 | DONE (Verified) |
| 10 | Legacy Event Non-Regression Guarantee | Existing events without gallery images or video load, display, and save seamlessly | M1, M2, M3 | ORIGINAL_REQUEST Acceptance Criteria | DONE (Verified) |
| 11 | End-to-End Build & Integrity Verification | Zero-error builds in `backend/node`, `backend/panel`, `frontend` + forensic audit | M4 | ORIGINAL_REQUEST Acceptance Criteria | DONE (Verified) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Backend Schema, Migrations & APIs | `models/index.ts`, `migrate.ts`, admin & storefront event controllers | none | DONE (Verified) |
| 2 | M2: Admin Panel Event Form Multi-Image & Video | `EventFormPage.tsx` gallery uploader & video glimpse preview | M1 | DONE (Verified) |
| 3 | M3: Storefront Event Showcase Gallery & Video | `storefront.service.ts`, `EventGallery.tsx`, `EventVideoPlayer.tsx`, `EventDetail.tsx` | M1 | DONE (Verified) |
| 4 | M4: System Verification, Full Builds & Audit | `npm run build` in all 3 apps, empirical testing & forensic audit | M1, M2, M3 | DONE (Gate: PASS) |

## Interface Contracts

### Event Model & API Payload Contract
```typescript
interface EventAttributes {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null         // field: 'image_url' (primary cover image)
  images: string[]                // field: 'images' (JSON array of gallery image URLs)
  videoUrl: string | null         // field: 'video_url' (VARCHAR(512), optional video glimpse)
  eventDate: string
  startTime: string
  endTime: string
  price: number
  mode: 'offline' | 'online' | 'both'
  venueAddress: string | null
  zoomLink: string | null
  capacity: number | null
  isActive: boolean
}
```

### Admin Event Controller Zod Schema (`backend/node/src/modules/admin/controllers/event.controller.ts`)
```typescript
export const eventSchema = z.object({
  name: z.string().min(2, 'Name is required.').max(180),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string().trim().min(1)).optional().default([]),
  videoUrl: z.string().trim().max(512).optional().nullable(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD.'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:MM.'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be HH:MM.'),
  price: z.coerce.number().min(0, 'Price cannot be negative.'),
  mode: z.enum(['offline', 'online', 'both']),
  venueAddress: z.string().optional().nullable(),
  zoomLink: z.string().optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})
```

### Storefront DTO Serialization (`backend/node/src/modules/events/events.controller.ts`)
```typescript
function toPublicEvent(plain: any, now = new Date()): Record<string, unknown> {
  const window = bookingWindowFor(plain, now)
  const rawImages = Array.isArray(plain.images) ? plain.images : []
  const images = rawImages.length > 0 ? rawImages : (plain.imageUrl ? [plain.imageUrl] : [])
  return {
    id: plain.id,
    name: plain.name,
    slug: plain.slug,
    description: plain.description,
    imageUrl: plain.imageUrl,
    images,
    videoUrl: plain.videoUrl || null,
    eventDate: plain.eventDate,
    startTime: plain.startTime,
    endTime: plain.endTime,
    price: Number(plain.price),
    mode: plain.mode,
    venueAddress: plain.venueAddress,
    capacity: plain.capacity,
    ...window,
  }
}
```

### Storefront Service Type Contract (`frontend/lib/services/storefront.service.ts`)
```typescript
export type EventItem = {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  images?: string[] | null
  videoUrl?: string | null
  eventDate: string
  startTime: string
  endTime: string
  price: number
  mode: 'offline' | 'online' | 'both'
  venueAddress: string | null
  zoomLink: string | null
  capacity: number | null
  seatsLeft?: number
  isUpcoming: boolean
  isPast: boolean
  bookingClosed: boolean
  closesAt: string
}
```

## Code Layout
- `backend/node/src/models/index.ts` — Sequelize Event model with `images` and `videoUrl`.
- `backend/node/src/database/migrate.ts` — Safe database migration adding `images` and `video_url` columns.
- `backend/node/src/modules/admin/controllers/event.controller.ts` — Admin event validation & persistence.
- `backend/node/src/modules/events/events.controller.ts` — Public event DTO serialization.
- `backend/panel/src/pages/EventFormPage.tsx` — Admin event form with multi-image gallery uploader & video glimpse preview.
- `frontend/lib/services/storefront.service.ts` — Storefront event types.
- `frontend/components/events/EventGallery.tsx` — Interactive storefront multi-image gallery.
- `frontend/components/events/EventVideoPlayer.tsx` — Responsive storefront video player with zero voids when absent.
- `frontend/components/events/EventDetail.tsx` — Storefront event detail showcase page integrating gallery and video.
