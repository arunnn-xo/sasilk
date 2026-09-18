# Backend Survey Report: Requirement R1 (Storefront Dynamic Intro Video)

**Date**: 2026-09-18  
**Subagent**: Backend Survey Explorer  
**Workspace Root**: `c:\sts-projects\sasilk`  
**Target Module**: `backend/node`

---

## Executive Summary

The backend codebase in `backend/node` provides an established, unified pattern for database-backed application settings, multipart file/video uploads to Cloudinary, and public cached storefront endpoints. Requirement R1 can be implemented cleanly with minimal surface area and zero disruption to existing endpoints.

Specifically:
1. **Database & Settings**: A generic `settings` table already exists in MySQL with key-value pairs where `value` is stored as a JSON column. Adding the `intro_video_config` key requires adding validation in `settingsSchema` inside `resource.controller.ts` and in-memory caching/getters inside `settings.service.ts`.
2. **Video Upload to Cloudinary**: The endpoint `POST /api/admin/uploads/video` is **already implemented and mounted** in `admin.routes.ts` and `upload.controller.ts`, handling MP4, WebM, and MOV uploads up to 50MB directly streaming to Cloudinary folder `sasilk/videos`.
3. **Public Storefront Endpoint & Caching**: The public endpoint `GET /api/storefront/intro-video` should be mounted in `storefront.routes.ts` and served from `catalog.controller.ts` via the cached getter in `settings.service.ts`. Cache invalidation should be wired into `createResource`, `updateResource`, and `deleteResource` in `resource.controller.ts`.
4. **TypeScript & Compilation**: The backend uses TypeScript with `"module": "NodeNext"`. All relative imports require `.js` extensions.

---

## 1. Database Schema & Settings Management

### 1.1 How Settings are Stored in the Database

#### Model Definition
Location: `backend/node/src/models/index.ts` (lines 303–320)
```typescript
export const Setting = sequelize.define('Setting', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  value: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      const raw = this.getDataValue('value') as unknown
      if (typeof raw === 'string') {
        try { return JSON.parse(raw) } catch { return raw }
      }
      return raw
    },
    set(value: unknown) {
      this.setDataValue('value', value)
    },
  },
}, { tableName: 'settings' })
```

#### Migration Definition
Location: `backend/node/src/database/migrate.ts` (lines 329–334)
```typescript
await createTableIfMissing(qi, 'settings', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  value: { type: DataTypes.JSON, allowNull: true },
  ...timestamps,
})
```

#### Key Characteristics
- Table name: `settings`
- Columns:
  - `id`: `INT UNSIGNED AUTO_INCREMENT PRIMARY KEY`
  - `key`: `VARCHAR(120) NOT NULL UNIQUE`
  - `value`: `JSON NULLABLE` (auto-parsed into JS object via getter)
  - `created_at`: `DATETIME`
  - `updated_at`: `DATETIME`
- Existing keys observed in seed (`seed.ts` lines 205–245) and controllers:
  - `'company_info'`
  - `'shipping_config'`
  - `'guest_discount_popup'`
  - `'home_new_arrivals_config'`
  - `'storefront_stats'`

### 1.2 Settings Management & Routing

In `backend/node/src/modules/admin/controllers/resource.controller.ts`:
- Settings are treated as a generic admin resource registered in `resourceConfig['settings']` (lines 259–265):
  ```typescript
  settings: {
    model: Setting,
    entity: 'setting',
    writable: ['key', 'value'],
    defaultOrder: [['key', 'ASC']],
    validationSchema: settingsSchema,
  },
  ```
- Endpoints serving this in `admin.routes.ts`:
  - `GET /api/admin/settings` -> `listResource` (returns list of all settings)
  - `POST /api/admin/settings` -> `createResource`
  - `GET /api/admin/settings/:id` -> `getResourceById`
  - `PUT /api/admin/settings/:id` -> `updateResource`
  - `DELETE /api/admin/settings/:id` -> `deleteResource`

### 1.3 Zod Validation Pattern

In `backend/node/src/modules/admin/controllers/resource.controller.ts` (lines 80–112):
```typescript
export const settingsSchema = z.object({
  key: z.string().min(1, 'Setting key is required.').max(120),
  value: z.record(z.any()),
  // Key-specific validation
}).superRefine((data, ctx) => {
  if (data.key === 'shipping_config') {
    const v = data.value
    if (typeof v.freeShippingEnabled !== 'boolean') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value', 'freeShippingEnabled'], message: 'freeShippingEnabled must be a boolean.' })
    }
    if (typeof v.freeShippingThreshold !== 'number' || v.freeShippingThreshold < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value', 'freeShippingThreshold'], message: 'freeShippingThreshold must be a non-negative number.' })
    }
  }
  // ... other key validations ...
})
```

When validation fails, `error-handler.ts` catches `ZodError` and returns:
```json
{
  "message": "Validation failed",
  "issues": [
    {
      "code": "custom",
      "path": ["value", "videoUrl"],
      "message": "videoUrl is required when intro video is enabled."
    }
  ]
}
```
In `backend/panel/src/services/api.ts` (lines 79–88), the admin panel extracts `issue.message` and shows it inline or as a toast notification.

### 1.4 Specification for `intro_video_config`

#### Data Shape Requirements
- `enabled`: `boolean`
- `videoUrl`: `string` (valid URL or path; non-empty string when `enabled` is `true`)
- `posterUrl`: optional `string` (defaults to `''`)
- `skipEnabled`: `boolean` (default: `true`)
- `skipAfterSeconds`: `number` (default: `0`, min: `0`, max: `30`)
- `showOncePerSession`: `boolean` (default: `true`)

#### Proposed Zod Refinement for `settingsSchema`
In `backend/node/src/modules/admin/controllers/resource.controller.ts`:
```typescript
  if (data.key === 'intro_video_config') {
    const v = data.value
    if (typeof v.enabled !== 'boolean') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value', 'enabled'], message: 'enabled must be a boolean.' })
    }
    if (v.enabled && (typeof v.videoUrl !== 'string' || !v.videoUrl.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value', 'videoUrl'], message: 'videoUrl is required when intro video is enabled.' })
    }
    if (v.videoUrl !== undefined && typeof v.videoUrl !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value', 'videoUrl'], message: 'videoUrl must be a string.' })
    }
    if (v.posterUrl !== undefined && v.posterUrl !== null && typeof v.posterUrl !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value', 'posterUrl'], message: 'posterUrl must be a string.' })
    }
    if (v.skipEnabled !== undefined && typeof v.skipEnabled !== 'boolean') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value', 'skipEnabled'], message: 'skipEnabled must be a boolean.' })
    }
    if (v.skipAfterSeconds !== undefined && (typeof v.skipAfterSeconds !== 'number' || v.skipAfterSeconds < 0 || v.skipAfterSeconds > 30)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value', 'skipAfterSeconds'], message: 'skipAfterSeconds must be a number between 0 and 30.' })
    }
    if (v.showOncePerSession !== undefined && typeof v.showOncePerSession !== 'boolean') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value', 'showOncePerSession'], message: 'showOncePerSession must be a boolean.' })
    }
  }
```

#### Settings Service Implementation
In `backend/node/src/services/settings.service.ts`:
```typescript
export interface IntroVideoConfig {
  enabled: boolean
  videoUrl: string
  posterUrl?: string
  skipEnabled: boolean
  skipAfterSeconds: number
  showOncePerSession: boolean
}

const defaultIntroVideoConfig: IntroVideoConfig = {
  enabled: false,
  videoUrl: '',
  posterUrl: '',
  skipEnabled: true,
  skipAfterSeconds: 0,
  showOncePerSession: true,
}

let cachedIntroVideoConfig: IntroVideoConfig | null = null

export async function getIntroVideoConfig(): Promise<IntroVideoConfig> {
  if (cachedIntroVideoConfig) return cachedIntroVideoConfig
  const setting = await Setting.findOne({ where: { key: 'intro_video_config' } })
  if (!setting) return defaultIntroVideoConfig
  const value = (setting.get('value') as Record<string, unknown>) || {}
  cachedIntroVideoConfig = {
    enabled: Boolean(value.enabled),
    videoUrl: typeof value.videoUrl === 'string' ? value.videoUrl.trim() : defaultIntroVideoConfig.videoUrl,
    posterUrl: typeof value.posterUrl === 'string' ? value.posterUrl.trim() : defaultIntroVideoConfig.posterUrl,
    skipEnabled: value.skipEnabled !== undefined ? Boolean(value.skipEnabled) : defaultIntroVideoConfig.skipEnabled,
    skipAfterSeconds: typeof value.skipAfterSeconds === 'number'
      ? Math.min(30, Math.max(0, value.skipAfterSeconds))
      : defaultIntroVideoConfig.skipAfterSeconds,
    showOncePerSession: value.showOncePerSession !== undefined
      ? Boolean(value.showOncePerSession)
      : defaultIntroVideoConfig.showOncePerSession,
  }
  return cachedIntroVideoConfig
}

export function invalidateIntroVideoCache() {
  cachedIntroVideoConfig = null
}
```

#### Invalidation Wiring in `resource.controller.ts`
Import `invalidateIntroVideoCache` in `resource.controller.ts` (line 33) and invoke in 3 locations:
1. `createResource` (around line 584):
   ```typescript
   if (settingKey === 'intro_video_config') {
     invalidateIntroVideoCache()
   }
   ```
2. `updateResource` (around line 746):
   ```typescript
   if (settingKey === 'intro_video_config') {
     invalidateIntroVideoCache()
   }
   ```
3. `deleteResource` (around line 831):
   ```typescript
   if (settingKey === 'intro_video_config') {
     invalidateIntroVideoCache()
   }
   ```

---

## 2. Cloudinary Video Upload Endpoint Analysis

### 2.1 Existing Route & Controller Status
- **Endpoint**: `POST /api/admin/uploads/video`
- **Current Status**: **Already implemented and active.**
- **Route registration**: `backend/node/src/modules/admin/admin.routes.ts` (line 142):
  ```typescript
  router.post('/uploads/video', uploadVideo.single('file'), asyncHandler(uploadVideoFile))
  ```
- **Multer Middleware**: `admin.routes.ts` (lines 117–128):
  ```typescript
  const uploadVideo = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
      if (allowed.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new AppError(422, 'Only MP4, WebM, and MOV video files are allowed.'))
      }
    },
  })
  ```
- **Controller function**: `backend/node/src/modules/admin/controllers/upload.controller.ts` (lines 36–48):
  ```typescript
  export const uploadVideoFile = async (req: Request, res: Response) => {
    if (!req.file) throw new AppError(422, 'Video file is required.')

    const result = await uploadBufferToCloudinary(req.file.buffer, 'sasilk/videos')

    res.status(201).json({
      file: {
        filename: result.public_id,
        originalName: req.file.originalname,
        path: result.secure_url,
      },
    })
  }
  ```

### 2.2 Cloudinary Service Integration
Location: `backend/node/src/services/cloudinary.service.ts`
- `uploadBufferToCloudinary(buffer: Buffer, folder = 'sasilk')`:
  Uses `cloudinary.uploader.upload_stream` with `{ folder, resource_type: 'auto' }`.
- When called with folder `'sasilk/videos'`, Cloudinary detects the video stream and places the asset under `sasilk/videos`.
- Resolves with `{ secure_url, public_id, width, height }`.
- Credentials resolution (`getCloudinaryConfig()`):
  Uses `process.env.CLOUDINARY_CLOUD_NAME`, `process.env.CLOUDINARY_API_KEY`, `process.env.CLOUDINARY_API_SECRET` with built-in fallbacks.

### 2.3 Notable Observations on Video Upload
1. **Error Handler Message for File Size**:
   In `backend/node/src/middleware/error-handler.ts` (lines 6–10):
   ```typescript
   const multerMessages: Record<string, string> = {
     LIMIT_FILE_SIZE: 'File size exceeds the 5 MB limit.',
     LIMIT_FILE_COUNT: 'Too many files.',
     LIMIT_UNEXPECTED_FILE: 'Unexpected file field.',
   }
   ```
   If a user uploads a video larger than 50MB, multer generates a `LIMIT_FILE_SIZE` error code, which `error-handler.ts` maps to `'File size exceeds the 5 MB limit.'`.
   *Recommendation*: Adjust this message to `'File size exceeds the allowed limit.'` or `'File size exceeds limit.'` so video uploads (>50MB) do not receive an inaccurate 5MB error message.
2. **Frontend Admin Panel Integration**:
   `backend/panel/src/services/api.ts` (lines 217–225) already has a matching function:
   ```typescript
   export async function uploadVideo(file: File) {
     const formData = new FormData()
     formData.append('file', file)
     return apiFetch<{ file: { filename: string; originalName: string; path: string } }>('/admin/uploads/video', {
       method: 'POST',
       body: formData,
       timeoutMs: 60000,
     })
   }
   ```
   This gives a 60-second timeout appropriate for 50MB uploads.

---

## 3. Public Storefront Intro Video Endpoint & Caching

### 3.1 Route Mounting
- Route module: `backend/node/src/modules/storefront/storefront.routes.ts`
- Mount tree:
  - `app.ts` (line 100): `app.use('/api', routes)`
  - `routes/index.ts` (line 21): `router.use('/storefront', storefrontRoutes)`
  - `storefront.routes.ts` (line 57–58):
    ```typescript
    router.get('/shipping-config', asyncHandler(catalogController.getShippingConfiguration))
    router.get('/guest-discount-popup', asyncHandler(catalogController.getGuestDiscountPopupConfiguration))
    ```
- **Exact mounting location for intro video**:
  In `storefront.routes.ts`:
  ```typescript
  router.get('/intro-video', asyncHandler(catalogController.getIntroVideoConfiguration))
  ```
  Resulting URL: `GET /api/storefront/intro-video`.

### 3.2 Controller Implementation
Location: `backend/node/src/modules/storefront/controllers/catalog.controller.ts`
Import `getIntroVideoConfig` from `../../../services/settings.service.js`.
Add export:
```typescript
export const getIntroVideoConfiguration = async (_req: Request, res: Response) => {
  const config = await getIntroVideoConfig()
  res.json({
    enabled: config.enabled,
    videoUrl: config.videoUrl,
    posterUrl: config.posterUrl || '',
    skipEnabled: config.skipEnabled,
    skipAfterSeconds: config.skipAfterSeconds,
    showOncePerSession: config.showOncePerSession,
  })
}
```

### 3.3 Caching Mechanism & Invalidation Flow
1. **Module-level memory cache variable** (`cachedIntroVideoConfig`) in `settings.service.ts`.
2. **Read**:
   - First request reads from MySQL `settings` table via `Setting.findOne({ where: { key: 'intro_video_config' } })`.
   - Result is sanitized, cached in memory, and returned.
   - Subsequent calls return from memory in `0ms`, avoiding database overhead on high storefront traffic.
3. **Write / Invalidation**:
   - When an admin saves or updates `intro_video_config` in `resource.controller.ts` (`createResource`, `updateResource`, `deleteResource`), `invalidateIntroVideoCache()` is called.
   - `cachedIntroVideoConfig` is set to `null`.
   - The next storefront request re-reads fresh data from the database.

---

## 4. Types, Compilation, and Error Handling

### 4.1 TypeScript Environment & Build Scripts
- `backend/node/package.json`:
  ```json
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "db:migrate": "tsx src/database/migrate.ts",
    "db:seed": "tsx src/database/seed.ts"
  }
  ```
- `backend/node/tsconfig.json`:
  - `"target": "ES2022"`
  - `"module": "NodeNext"`
  - `"moduleResolution": "NodeNext"`
  - `"strict": true`
  - `"rootDir": "src"`
  - `"outDir": "dist"`
- **Critical NodeNext Rule**: All internal module imports must end with `.js` (e.g., `import { getIntroVideoConfig } from '../../../services/settings.service.js'`).

### 4.2 Error Handling Pipeline
- Routes are wrapped with `asyncHandler(...)` from `src/utils/http.ts`.
- Uncaught errors flow into `src/middleware/error-handler.ts`:
  - `ZodError` -> `422` with detailed field-path issues array.
  - `AppError` -> status code and message.
  - `SequelizeUniqueConstraintError` -> `409` conflict.
  - Unhandled -> `500` internal server error.

---

## 5. Implementation Roadmap for R1 (Backend)

| Step | File | Action |
|------|------|--------|
| 1 | `backend/node/src/services/settings.service.ts` | Add `IntroVideoConfig` interface, `defaultIntroVideoConfig`, `cachedIntroVideoConfig`, `getIntroVideoConfig()`, and `invalidateIntroVideoCache()`. |
| 2 | `backend/node/src/modules/admin/controllers/resource.controller.ts` | Import `invalidateIntroVideoCache`. Add `intro_video_config` validation inside `settingsSchema.superRefine`. Add `invalidateIntroVideoCache()` triggers inside `createResource`, `updateResource`, and `deleteResource`. |
| 3 | `backend/node/src/modules/storefront/controllers/catalog.controller.ts` | Import `getIntroVideoConfig`. Export `getIntroVideoConfiguration(req, res)`. |
| 4 | `backend/node/src/modules/storefront/storefront.routes.ts` | Register `router.get('/intro-video', asyncHandler(catalogController.getIntroVideoConfiguration))`. |
| 5 | `backend/node/src/middleware/error-handler.ts` | (Recommended polish) Update `LIMIT_FILE_SIZE` message from `'File size exceeds the 5 MB limit.'` to `'File size exceeds the allowed limit.'` to avoid confusion on 50MB video uploads. |

---

## 6. Verification Plan

1. **Static / TypeScript Verification**:
   Verify types and module specifiers compile cleanly (`tsc -p tsconfig.json`).
2. **Endpoint Testing**:
   - `GET /api/storefront/intro-video`: Returns 200 with default config (`enabled: false, videoUrl: '', ...`).
   - `POST /api/admin/settings`: Saves `{ key: 'intro_video_config', value: { enabled: true, videoUrl: 'https://res.cloudinary.com/.../intro.mp4', skipEnabled: true, skipAfterSeconds: 5, showOncePerSession: true } }`. Returns 201.
   - `GET /api/storefront/intro-video`: Returns updated config immediately (cache refreshed).
   - Validation test: Submitting `{ enabled: true, videoUrl: '' }` returns 422 with issue message `"videoUrl is required when intro video is enabled."`. Submitting `{ skipAfterSeconds: 35 }` returns 422 `"skipAfterSeconds must be a number between 0 and 30."`.
   - `POST /api/admin/uploads/video`: Upload MP4/WebM video up to 50MB; verifies Cloudinary response with `path` containing `sasilk/videos`.
