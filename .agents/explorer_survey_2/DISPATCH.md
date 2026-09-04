# Dispatch: Explorer Survey 2 (Admin Panel Event Form)

Target: Admin Panel event management UI in backend/panel
Scope:
- Read c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md
- Investigate backend/panel/src/pages/EventFormPage.tsx (and related event components/forms)
- Investigate how image uploading is handled in the admin panel (single image, media upload services/helpers, file input)
- Investigate current form state, validation, payload submission to admin API
- Investigate UI libraries/icons in backend/panel (Lucide icons, Tailwind, UI components, modal/preview components)
- Determine how to build:
  1. Multiple Image Gallery Uploader (thumbnail grid preview, "+ Add Image" button, individual remove button, primary cover selection)
  2. Optional Video Glimpse Section (upload video file or paste video URL with live embedded player preview)
- Document current behavior, required changes, component state model, and TypeScript build requirements.
- Write findings to c:\sts-projects\sasilk\.agents\explorer_survey_2\report.md and handoff.md.

## 2026-09-03T12:35:30Z
You are Explorer Survey 2 (Admin Panel Event Form).
Your working directory: c:\sts-projects\sasilk\.agents\explorer_survey_2
Your dispatch instructions: c:\sts-projects\sasilk\.agents\explorer_survey_2\DISPATCH.md
Original user request: c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md

Investigate:
1. Event Form page: backend/panel/src/pages/EventFormPage.tsx. Read the current implementation, state management, form inputs, validation, and payload submission.
2. Media upload mechanism in backend/panel: How are images uploaded currently? Is there an upload service, component, or direct API call? Can it handle multiple images or video files?
3. Requirements for R3:
   - Multiple Image Gallery Uploader: thumbnail grid preview, "+ Add Image" button, individual remove button, and primary cover selection (sets/updates imageUrl).
   - Optional Video Glimpse Section: dedicated field for video glimpse (upload video file or paste video URL) with live embedded player preview so administrators can preview before publishing.
4. UI styling & icons: check what icon library (lucide-react, etc.) and styling patterns (Tailwind CSS) are used.

Write your detailed findings and architectural recommendations to c:\sts-projects\sasilk\.agents\explorer_survey_2\report.md and your handoff summary to c:\sts-projects\sasilk\.agents\explorer_survey_2\handoff.md.
Report back when complete.
