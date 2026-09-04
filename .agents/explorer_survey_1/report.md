# Technical Investigation & Architectural Report: Backend & Database
**Milestone**: Multiple Gallery Images & Video Glimpse for Soil Goddess Events  
**Investigator**: Explorer Survey 1 (Backend & Database)  
**Date**: 2026-09-03  
**Working Directory**: `c:\sts-projects\sasilk`

---

## 1. Executive Summary

This investigation analyzed the backend architecture, Sequelize models, database migration pipeline, admin and storefront controllers, and media upload subsystem in `backend/node` to support multiple gallery images (`images`) and an optional video glimpse (`videoUrl`) for Soil Goddess events.

### Core Discoveries:
1. **Model Architecture (`backend/node/src/models/index.ts`)**:
   - The `Event` model is defined at line 502 using `sequelize.define('Event', { ... })`.
   - It currently has `imageUrl: { type: DataTypes.STRING(255), allowNull: true, field: 'image_url' }`.
   - Adding `images` (`DataTypes.JSON`, nullable, default `[]`) with getter/setter parsing and `videoUrl` (`DataTypes.STRING(512)`, nullable, field `video_url`) is completely aligned with existing models (such as `art_wave_items` and `orders`).
2. **Migrations Pipeline (`backend/node/src/database/migrate.ts`)**:
   - Migrations are orchestrated via `runMigrations()`, which executes automatically on every server boot (`server.ts:12`) as well as via `npm run db:migrate`.
   - `migrate.ts` already contains an idempotent helper `safeAddColumn(table, col, def)`.
   - Safe migration requires:
     a. Adding `images` and `video_url` to the table schema inside `createTableIfMissing(qi, 'events', ...)` for new installs.
     b. Adding `safeAddColumn('events', 'images', ...)` and `safeAddColumn('events', 'video_url', ...)` for existing databases.
3. **Admin Controller (`backend/node/src/modules/admin/controllers/event.controller.ts`)**:
   - Uses **Zod** (`z.object({...})`) for `eventSchema`.
   - `eventSchema` must be updated to accept `images` (`z.array(z.string().max(1000)).optional().nullable().default([])`) and `videoUrl` (`z.string().max(512).optional().nullable().default(null)`).
   - `createEvent` and `updateEvent` pass `parsed.data` directly into `Event.create` and `event.update(data)`. With `eventSchema` updated, both fields will persist seamlessly.
4. **Storefront Controller (`backend/node/src/modules/events/events.controller.ts`)**:
   - **Crucial Architectural Catch**: `toPublicEvent(plain)` (lines 50-67) explicitly constructs an allow-listed DTO object and currently omits any undeclared fields. Even if database columns exist, `listEvents` and `getEventBySlug` will **NOT** return `images` and `videoUrl` to public clients unless `toPublicEvent` is updated.
   - Updating `toPublicEvent` to include `images` and `videoUrl` with fallback logic guarantees zero regression for legacy records.
5. **Media Upload Support**:
   - `POST /api/admin/uploads/video` is **ALREADY fully implemented** in `upload.controller.ts:80` and `admin.routes.ts:130-155`. It supports MP4, WebM, OGG, and QuickTime up to 50MB.
   - `POST /api/admin/uploads` already supports images up to 5MB (JPEG, PNG, WebP) with Sharp optimization.
   - Admin Panel API (`backend/panel/src/services/api.ts`) already exposes `uploadVideo(file)` and `uploadImage(file)`.
   - No new upload endpoints or multer changes are required; both file uploads and external video URLs (YouTube, Vimeo) are supported.

---

## 2. Database Models & Schema Investigation

### Location: `backend/node/src/models/index.ts`
- **Current Definition** (Lines 502-518):
```typescript
export const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  imageUrl: { type: DataTypes.STRING(255), allowNull: true, field: 'image_url' },
  eventDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'event_date' },
  startTime: { type: DataTypes.STRING(10), allowNull: false, field: 'start_time' },
  endTime: { type: DataTypes.STRING(10), allowNull: false, field: 'end_time' },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  mode: { type: DataTypes.ENUM('offline', 'online', 'both'), allowNull: false, defaultValue: 'both' },
  venueAddress: { type: DataTypes.TEXT, allowNull: true, field: 'venue_address' },
  zoomLink: { type: DataTypes.STRING(512), allowNull: true, field: 'zoom_link' },
  capacity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
  deletedAt: { type: DataTypes.DATE, allowNull: true, field: 'deleted_at' },
}, { tableName: 'events', paranoid: true })
```

### Proposed Schema Extension:
```typescript
  // Gallery images array (JSON)
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    field: 'images',
    get(this: any) {
      const raw = this.getDataValue('images') as unknown
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw)
          return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : [])
        } catch {
          return []
        }
      }
      return Array.isArray(raw) ? raw : (raw ? [raw] : [])
    },
    set(this: any, value: unknown) {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          this.setDataValue('images', Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []))
          return
        } catch {
          this.setDataValue('images', value ? [value] : [])
          return
        }
      }
      this.setDataValue('images', Array.isArray(value) ? value : (value ? [value] : []))
    },
  },

  // Optional video glimpse URL (upload path or external streaming link)
  videoUrl: {
    type: DataTypes.STRING(512),
    allowNull: true,
    field: 'video_url',
  },
```

### Technical Justifications:
1. **JSON Type in MySQL**:
   Sequelize handles `DataTypes.JSON` by serializing JavaScript objects/arrays to JSON strings when writing to MySQL.
   On retrieval, depending on mysql2 driver settings or Sequelize versions, JSON columns can occasionally be returned as strings. The custom getter/setter guarantees that application code always receives a clean `string[]` and avoids `TypeError: event.images.map is not a function`.
2. **`video_url` VARCHAR(512)**:
   Matches the `video_url` column definition in `art_wave_items` (line 496) and `zoom_link` (line 514). 512 characters is ample for both local paths (`/uploads/abc123.mp4`) and long streaming links (`https://www.youtube.com/watch?v=...` or Vimeo embed parameters).

---

## 3. Database Migrations Investigation

### Location: `backend/node/src/database/migrate.ts`
- **Current Setup**:
  - `migrate.ts` defines `runMigrations()` exported and called in `server.ts:12`.
  - `safeAddColumn` helper (lines 20-23):
    ```typescript
    const safeAddColumn = async (table: string, col: string, def: any) => {
      const qi = sequelize.getQueryInterface()
      try { await qi.addColumn(table, col, def) } catch { /* column already exists */ }
    }
    ```
  - `events` table creation occurs at lines 789-806:
    ```typescript
    await createTableIfMissing(qi, 'events', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(180), allowNull: false },
      slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      image_url: { type: DataTypes.STRING(255), allowNull: true },
      event_date: { type: DataTypes.DATEONLY, allowNull: false },
      // ...
    })
    ```

### Safe Migration Strategy:
1. **In `migrate.ts`**:
   - Update `createTableIfMissing(qi, 'events', ...)` definition to include:
     ```typescript
     images: { type: DataTypes.JSON, allowNull: true },
     video_url: { type: DataTypes.STRING(512), allowNull: true },
     ```
   - Right after line 808 (`await safeAddIndex('events', 'idx_events_active', ['is_active'])`), add:
     ```typescript
     await safeAddColumn('events', 'images', { type: DataTypes.JSON, allowNull: true })
     await safeAddColumn('events', 'video_url', { type: DataTypes.STRING(512), allowNull: true })
     ```
2. **Why this guarantees safety**:
   - `createTableIfMissing` does not run if table exists (`if (await tableExists(queryInterface, tableName)) return`).
   - `safeAddColumn` executes `ALTER TABLE events ADD COLUMN images JSON NULL` and `ALTER TABLE events ADD COLUMN video_url VARCHAR(512) NULL`.
   - If the columns already exist, the error is safely caught and ignored.
   - All existing rows receive `NULL` without table locks, downtime, or data truncation.
   - Running `npm run db:migrate` or restarting the server applies the migration automatically.

---

## 4. Admin Event Controller Investigation

### Location: `backend/node/src/modules/admin/controllers/event.controller.ts`

### Current Validation Schema (Lines 10-23):
```typescript
export const eventSchema = z.object({
  name: z.string().min(2, 'Event name is required.').max(180),
  description: z.string().max(5000).optional().default(''),
  imageUrl: z.string().max(255).optional().nullable().default(null),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date (YYYY-MM-DD) is required.'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid start time (HH:MM) is required.'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid end time (HH:MM) is required.'),
  price: z.coerce.number().min(0).max(10000000),
  mode: z.enum(['offline', 'online', 'both']),
  venueAddress: z.string().max(2000).optional().nullable().default(null),
  zoomLink: z.string().url('Valid Zoom link is required.').max(512).optional().nullable().default(null),
  capacity: z.coerce.number().int().positive().optional().nullable().default(null),
  isActive: z.boolean().optional().default(true),
})
```

### Proposed `eventSchema` Update:
```typescript
export const eventSchema = z.object({
  name: z.string().min(2, 'Event name is required.').max(180),
  description: z.string().max(5000).optional().default(''),
  imageUrl: z.string().max(255).optional().nullable().default(null),
  images: z
    .array(z.string().max(1000))
    .optional()
    .nullable()
    .default([])
    .transform(v => (Array.isArray(v) ? v : [])),
  videoUrl: z
    .string()
    .max(512, 'Video URL cannot exceed 512 characters.')
    .optional()
    .nullable()
    .default(null)
    .transform(v => (v && v.trim() ? v.trim() : null)),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date (YYYY-MM-DD) is required.'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid start time (HH:MM) is required.'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid end time (HH:MM) is required.'),
  price: z.coerce.number().min(0).max(10000000),
  mode: z.enum(['offline', 'online', 'both']),
  venueAddress: z.string().max(2000).optional().nullable().default(null),
  zoomLink: z.string().url('Valid Zoom link is required.').max(512).optional().nullable().default(null),
  capacity: z.coerce.number().int().positive().optional().nullable().default(null),
  isActive: z.boolean().optional().default(true),
})
```

### `createEvent` & `updateEvent` Handling:
- In `createEvent` (lines 89-110):
  ```typescript
  const eventData = { ...parsed.data }
  // Fallback: If primary imageUrl is empty but gallery images exist, use first gallery image
  if (!eventData.imageUrl && eventData.images && eventData.images.length > 0) {
    eventData.imageUrl = eventData.images[0]
  }
  const event = await Event.create({
    ...eventData,
    slug: await uniqueSlug(parsed.data.name),
  })
  ```
- In `updateEvent` (lines 112-139):
  ```typescript
  const data: any = { ...parsed.data }
  if (data.images && (!data.imageUrl || !data.imageUrl.trim()) && data.images.length > 0) {
    data.imageUrl = data.images[0]
  }
  // ...
  await event.update(data)
  ```
- In `getEvent` (lines 83-87):
  Uses `Event.findByPk(req.params.id)`. Automatically returns `images` and `videoUrl`.
- In `listEvents` (lines 62-81):
  Uses `Event.findAll({ ... })` and maps with `e.get({ plain: true })`. Automatically includes `images` and `videoUrl`.

---

## 5. Storefront Controller Investigation

### Location: `backend/node/src/modules/events/events.controller.ts`

### The DTO Serialization Issue:
Lines 50-67 define `toPublicEvent`:
```typescript
function toPublicEvent(plain: any, now = new Date()): Record<string, unknown> {
  const window = bookingWindowFor(plain, now)
  return {
    id: plain.id,
    name: plain.name,
    slug: plain.slug,
    description: plain.description,
    imageUrl: plain.imageUrl,
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
**CRITICAL**: `images` and `videoUrl` are omitted in `toPublicEvent`. Since `listEvents` (line 78) and `getEventBySlug` (line 92) return `pub = toPublicEvent(plain)`, neither the list endpoint nor the detail endpoint would expose `images` and `videoUrl` unless this function is updated!

### Proposed `toPublicEvent` Implementation:
```typescript
function toPublicEvent(plain: any, now = new Date()): Record<string, unknown> {
  const window = bookingWindowFor(plain, now)

  // Normalize images: ensure array of strings
  let images: string[] = []
  if (Array.isArray(plain.images)) {
    images = plain.images.filter((img: unknown) => typeof img === 'string' && img.trim().length > 0)
  } else if (typeof plain.images === 'string') {
    try {
      const parsed = JSON.parse(plain.images)
      if (Array.isArray(parsed)) {
        images = parsed.filter((img: unknown) => typeof img === 'string' && img.trim().length > 0)
      }
    } catch {
      images = []
    }
  }

  // Graceful fallback: if images is empty but imageUrl exists, include imageUrl
  if (images.length === 0 && plain.imageUrl) {
    images = [plain.imageUrl]
  }

  return {
    id: plain.id,
    name: plain.name,
    slug: plain.slug,
    description: plain.description,
    imageUrl: plain.imageUrl || (images[0] ?? null),
    images,
    videoUrl: plain.videoUrl ?? null,
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

### Benefits:
- Guarantees `images` is always an array of string URLs (`string[]`).
- Guarantees `videoUrl` is either a non-empty string or `null`.
- Legacy events created with only `imageUrl` will automatically present `images: [imageUrl]`, ensuring smooth multi-image gallery rendering without missing images.

---

## 6. Media Upload Support & Architecture

### Existing Upload Infrastructure Analysis:
1. **Controller (`backend/node/src/modules/admin/controllers/upload.controller.ts`)**:
   - `uploadFile` (line 16): Handles image uploads, runs Sharp dimension checking / optimization, saves to `uploads/`, returns:
     ```json
     {
       "file": {
         "filename": "<hash>.jpg",
         "originalName": "hero.jpg",
         "path": "/uploads/<hash>.jpg",
         "dimensions": { "width": 1200, "height": 800 }
       }
     }
     ```
   - `uploadVideoFile` (line 80):
     ```typescript
     export const uploadVideoFile = async (req: Request, res: Response) => {
       if (!req.file) throw new AppError(422, 'Video file is required.')
       res.status(201).json({
         file: {
           filename: req.file.filename,
           originalName: req.file.originalname,
           path: `/uploads/${req.file.filename}`,
         },
       })
     }
     ```
   - `deleteUploadedFile` (line 67): Handles cleanup of files in `uploads/`.

2. **Routes & Multer Config (`backend/node/src/modules/admin/admin.routes.ts`)**:
   - Image Multer (`upload`): Max 5MB, JPEG/PNG/WebP.
   - Video Multer (`uploadVideo`): Max 50MB, MP4/WebM/OGG/QuickTime.
   - Routes:
     - `POST /api/admin/uploads` -> `upload.single('file')` -> `uploadFile`
     - `POST /api/admin/uploads/video` -> `uploadVideo.single('file')` -> `uploadVideoFile`
     - `DELETE /api/admin/uploads/:filename` -> `deleteUploadedFile`

3. **Admin Panel Client (`backend/panel/src/services/api.ts`)**:
   - `uploadImage(file, dimensionHint)`: Calls `POST /admin/uploads`.
   - `uploadVideo(file)`: Calls `POST /admin/uploads/video`.
   - `deleteUpload(filename)`: Calls `DELETE /admin/uploads/${filename}`.

4. **Static File Serving & Cross-Origin (`backend/node/src/app.ts`)**:
   - Served via `app.use('/uploads', ..., express.static('uploads'))`.
   - `helmet` is configured with `crossOriginResourcePolicy: { policy: 'cross-origin' }`, allowing the frontend and admin panel to load images and stream uploaded video files smoothly without CORS/CORP blockage.

### Conclusion on Video & Media Upload:
**No backend upload modifications are required.** The infrastructure already supports video uploads up to 50MB and image uploads up to 5MB. In the Admin Panel, the event form can directly use `uploadImage` for each gallery image and `uploadVideo` (or a text input for external YouTube/Vimeo URLs) for `videoUrl`.

---

## 7. Frontend & Admin Panel Contract Impact

### Storefront Contract (`frontend/lib/services/storefront.service.ts`):
Current `EventItem` type:
```typescript
export type EventItem = {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
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
Needs extension:
```typescript
  images: string[]
  videoUrl: string | null
```

### Admin Panel Contract (`backend/panel/src/pages/EventFormPage.tsx`):
Current `EventFormState`:
```typescript
type EventFormState = {
  name: string
  description: string
  imageUrl: string
  eventDate: string
  startTime: string
  endTime: string
  price: string
  mode: 'offline' | 'online' | 'both'
  venueAddress: string
  zoomLink: string
  capacity: string
  isActive: boolean
}
```
Needs extension:
```typescript
  images: string[]
  videoUrl: string
```

---

## 8. Concrete Implementation Plan for Implementer Agent

| Step | File | Action |
|------|------|--------|
| **1. Model** | `backend/node/src/models/index.ts` | Add `images` (DataTypes.JSON with array getter/setter) and `videoUrl` (DataTypes.STRING(512), field `video_url`) to `Event` model. |
| **2. Migration** | `backend/node/src/database/migrate.ts` | 1. Update `events` table creation schema to include `images` and `video_url`.<br>2. Add `safeAddColumn('events', 'images', ...)` and `safeAddColumn('events', 'video_url', ...)` right after index creation. |
| **3. Admin Controller** | `backend/node/src/modules/admin/controllers/event.controller.ts` | Update `eventSchema` to validate `images` (array of strings, default `[]`) and `videoUrl` (nullable string, default `null`). Ensure `imageUrl` fallbacks to `images[0]` if omitted. |
| **4. Storefront Controller** | `backend/node/src/modules/events/events.controller.ts` | Update `toPublicEvent` to include `images` and `videoUrl` in the returned DTO, with fallback to `[plain.imageUrl]` if `images` is empty. |
