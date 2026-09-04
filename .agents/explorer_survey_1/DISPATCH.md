# Dispatch: Explorer Survey 1 (Backend & Database)

Target: Database models, migrations, and backend controllers for Soil Goddess Event Management.
Scope:
- Read c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md
- Investigate backend/node/src/database/models/event.model.ts (and related types/interfaces)
- Investigate database migrations in backend/node (migration setup, existing events table migration, runner)
- Investigate backend/node/src/modules/admin/controllers/event.controller.ts (validation schemas, createEvent, updateEvent)
- Investigate backend/node/src/modules/events/events.controller.ts (getEventBySlug, listEvents, public endpoints)
- Investigate media upload endpoints in backend/node (upload endpoints, multer config, image/video upload support)
- Document current behavior, missing columns, required schema changes, API request/response contracts, and TypeScript build requirements.
- Write findings to c:\sts-projects\sasilk\.agents\explorer_survey_1\report.md and handoff.md.

## 2026-09-03T12:35:29Z
You are Explorer Survey 1 (Backend & Database).
Your working directory: c:\sts-projects\sasilk\.agents\explorer_survey_1
Your dispatch instructions: c:\sts-projects\sasilk\.agents\explorer_survey_1\DISPATCH.md
Original user request: c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md

Investigate:
1. Database models & schema: backend/node/src/database/models/event.model.ts, migrations, sequelize configs. Check current columns, types, and how `images` (JSON array of strings) and `videoUrl` (VARCHAR(512), nullable) should be added.
2. Migrations: check existing migrations in backend/node. Determine how to write a safe migration that adds `images` and `videoUrl` to `events` table if missing without breaking existing rows.
3. Admin controller: backend/node/src/modules/admin/controllers/event.controller.ts. Check validation schema (Joi / Zod / Yup / custom), `createEvent`, `updateEvent` logic.
4. Storefront controller: backend/node/src/modules/events/events.controller.ts. Check `getEventBySlug`, `listEvents` - ensure `images` and `videoUrl` are returned.
5. Media upload support: check how file uploads work in backend/node (e.g. routes/upload.routes.ts, multer, cloudinary/local storage) to see if video file upload is supported or needed.

Write your detailed findings and architectural recommendations to c:\sts-projects\sasilk\.agents\explorer_survey_1\report.md and your handoff summary to c:\sts-projects\sasilk\.agents\explorer_survey_1\handoff.md.
Report back when complete.
