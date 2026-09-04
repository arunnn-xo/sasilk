# Dispatch: Worker M1 (Backend Schema, Migrations & APIs)

## Mission
Implement Requirement R1 and R2 for the Soil Goddess Event Management enhancement project in `backend/node`.

## Input References
- Original Request: `c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md`
- Project Architecture & Scope: `c:\sts-projects\sasilk\PROJECT.md`
- Explorer Survey 1 Report: `c:\sts-projects\sasilk\.agents\explorer_survey_1\report.md`
- Explorer Survey 1 Handoff: `c:\sts-projects\sasilk\.agents\explorer_survey_1\handoff.md`

## Exclusive File Ownership
You exclusively own and may edit ONLY these 4 files:
1. `backend/node/src/models/index.ts`
2. `backend/node/src/database/migrate.ts`
3. `backend/node/src/modules/admin/controllers/event.controller.ts`
4. `backend/node/src/modules/events/events.controller.ts`

## Detailed Implementation Steps
1. In `backend/node/src/models/index.ts`:
   - Extend `Event` model definition (around line 507) to add `images` (`DataTypes.JSON`, default `[]`, robust getter/setter parsing array of strings) and `videoUrl` (`DataTypes.STRING(512)`, allowNull: true, field: 'video_url').
2. In `backend/node/src/database/migrate.ts`:
   - Update `createTableIfMissing(qi, 'events', ...)` to include `images` and `video_url`.
   - In `runMigrations()`, call `safeAddColumn('events', 'images', ...)` and `safeAddColumn('events', 'video_url', ...)`.
3. In `backend/node/src/modules/admin/controllers/event.controller.ts`:
   - Update `eventSchema` Zod validation to accept optional `images` (array of strings) and optional `videoUrl` (nullable string up to 512 chars).
   - In `createEvent` and `updateEvent`, normalize empty `videoUrl` to `null`.
   - Ensure fallback: if `!data.imageUrl && data.images?.length`, set `data.imageUrl = data.images[0]`. If `data.imageUrl && (!data.images || !data.images.length)`, set `data.images = [data.imageUrl]`.
   - Ensure `images` and `videoUrl` are persisted to the database.
4. In `backend/node/src/modules/events/events.controller.ts`:
   - In `toPublicEvent(plain, now)`, include `images` and `videoUrl`.
   - Provide legacy fallback: `images = rawImages.length > 0 ? rawImages : (plain.imageUrl ? [plain.imageUrl] : [])`.
   - Ensure `videoUrl: plain.videoUrl || null`.

## Verification Commands
1. Run `npm run db:migrate` in `c:\sts-projects\sasilk\backend\node` to ensure migrations execute safely without breaking existing records.
2. Run `npm run build` in `c:\sts-projects\sasilk\backend\node` to verify TypeScript builds with 0 errors.

## Mandatory Rules
- Always provide full updated code (no partial snippets or placeholders).
- Keep code clean, commit-ready, scalable, and maintainable.
- DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your report to `c:\sts-projects\sasilk\.agents\worker_m1_2\handoff.md` and send a message back when complete.

## 2026-09-03T12:48:19Z
You are Worker M1 (Backend Schema, Migrations & APIs).
Your working directory: c:\sts-projects\sasilk\.agents\worker_m1_2
Your dispatch instructions: c:\sts-projects\sasilk\.agents\worker_m1_2\DISPATCH.md
Original user request: c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md
Project architecture: c:\sts-projects\sasilk\PROJECT.md

Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement:
1. Extend `Event` model in `backend/node/src/models/index.ts` with `images` (DataTypes.JSON with robust getter/setter array parsing) and `videoUrl` (DataTypes.STRING(512), field: 'video_url').
2. Update database migration in `backend/node/src/database/migrate.ts`: add `images` and `video_url` to `createTableIfMissing` for `events`, and add `safeAddColumn('events', 'images', ...)` and `safeAddColumn('events', 'video_url', ...)` in `runMigrations()`.
3. Update `backend/node/src/modules/admin/controllers/event.controller.ts`: extend `eventSchema` Zod validation, handle persistence of `images` and `videoUrl`, auto-fallback `imageUrl` from `images[0]`.
4. Update `backend/node/src/modules/events/events.controller.ts`: include `images` and `videoUrl` in `toPublicEvent` with legacy fallback for single `imageUrl`.
5. Run `npm run db:migrate` in `backend/node` and verify migration execution.
6. Run `npm run build` in `backend/node` and verify 0 TypeScript errors.

Write your report to c:\sts-projects\sasilk\.agents\worker_m1_2\handoff.md and notify me when complete.
