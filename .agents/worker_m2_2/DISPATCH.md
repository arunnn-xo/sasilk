# Dispatch: Worker M2 (Admin Panel Event Form)

## Mission
Implement Requirement R3 for the Soil Goddess Event Management enhancement project in `backend/panel`.

## Input References
- Original Request: `c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md`
- Project Architecture & Scope: `c:\sts-projects\sasilk\PROJECT.md`
- Explorer Survey 2 Report: `c:\sts-projects\sasilk\.agents\explorer_survey_2\report.md`
- Explorer Survey 2 Handoff: `c:\sts-projects\sasilk\.agents\explorer_survey_2\handoff.md`

## Exclusive File Ownership
You exclusively own and may edit ONLY this file:
`backend/panel/src/pages/EventFormPage.tsx`

## Detailed Implementation Requirements
1. **Extend Form State**:
   - Add `images: string[]` (ordered array of gallery image URL strings) and `videoUrl: string` to `EventFormState` and `emptyForm`.
   - When loading an existing event in `load()`:
     ```typescript
     const evImages = Array.isArray(ev.images) && ev.images.length > 0
       ? ev.images
       : (ev.imageUrl ? [ev.imageUrl] : [])
     ```
     Ensure `images` is populated from `ev.images` (or fallback `[ev.imageUrl]`), and `videoUrl` is populated from `ev.videoUrl || ''`.
   - In `handleSave()`, construct payload with:
     ```typescript
     imageUrl: form.imageUrl || (form.images.length > 0 ? form.images[0] : null),
     images: form.images,
     videoUrl: form.videoUrl.trim() || null,
     ```
2. **Multiple Image Gallery Uploader**:
   - Provide a multiple-image gallery management card replacing/upgrading the old single-image banner.
   - Thumbnail Grid:
     - Show all images in `form.images` in a responsive grid.
     - Each card displays the thumbnail image (`resolveImageUrl(img)`).
     - Primary Cover indicator:
       - If `img === form.imageUrl`: Badge showing "Primary Cover" in luxury wine `#8B1A2B`.
       - If not primary cover: A clickable "Set as Cover" button/badge that sets `form.imageUrl = img`.
     - Remove button:
       - A delete/trash icon on each card that removes that image from `form.images`.
       - If the removed image was the cover (`form.imageUrl === img`), update `form.imageUrl` to the first remaining image `newImages[0] || ''`.
   - "+ Add Images" Button:
     - Hidden file input `<input type="file" multiple accept="image/*" />`.
     - When clicked, opens file picker allowing multiple image selection.
     - Iterates through selected files, calls `uploadImage(file)` for each, and appends the uploaded paths to `form.images`.
     - If `form.imageUrl` was empty, automatically sets the first uploaded image as `form.imageUrl`.
     - Provide visual upload spinner / uploading status.
   - Manual URL Input (Fallback):
     - An input allowing pasting an external image URL with an "+ Add URL" button to append to `form.images`.
3. **Optional Video Glimpse Section**:
   - Dedicated card/section below or adjacent to the gallery with title "Video Glimpse (Optional)" and description "Upload an MP4/WebM reel or paste a YouTube/Vimeo link".
   - Inputs:
     - Text input for Video URL (supports YouTube, Vimeo, direct MP4/WebM URL).
     - "Upload Video" button triggering `<input type="file" accept="video/mp4,video/webm,video/quicktime" />` calling `uploadVideo(file)`.
     - "Clear Video" button to reset `videoUrl` to `''`.
   - Live Embedded Video Preview:
     - If `form.videoUrl` is present:
       - YouTube: parses URLs (e.g. `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID`, `youtube.com/embed/ID`) and renders responsive `<iframe src="https://www.youtube.com/embed/${id}" className="w-full aspect-video rounded-lg" allowFullScreen />`.
       - Vimeo: parses URLs (`vimeo.com/ID`) and renders responsive `<iframe src="https://player.vimeo.com/video/${id}" className="w-full aspect-video rounded-lg" allowFullScreen />`.
       - Direct video / upload: renders `<video controls src={resolveImageUrl(form.videoUrl)} className="w-full aspect-video max-h-72 rounded-lg bg-black object-contain" />`.
     - If empty: displays a friendly empty state preview placeholder ("No video added yet. Add a teaser or glimpse video for your event.").
4. **Styling & Aesthetics**:
   - Match existing admin panel aesthetic (`#8B1A2B` primary brand, `#6E1220` hover, neutral borders, crisp typography, clean responsive cards).
   - Use Lucide icons: `Plus`, `Trash2`, `Upload`, `Video`, `ImageIcon`, `Star`, `Play`, `Check`, `X`.

## Verification Commands
1. Run `npm run build` in `c:\sts-projects\sasilk\backend\panel` to verify 0 TypeScript/Vite errors.
2. Confirm the updated code adheres to all user rules (provide FULL updated code, fully responsive mobile to desktop, no partial snippets).

## Mandatory Rules
- Always provide full updated code (no partial snippets or placeholders).
- DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your handoff report to `c:\sts-projects\sasilk\.agents\worker_m2_2\handoff.md` and send a message back when complete.

## 2026-09-03T12:59:00Z
You are Worker M2 (Admin Panel Event Form).
Your working directory: c:\sts-projects\sasilk\.agents\worker_m2_2
Your dispatch instructions: c:\sts-projects\sasilk\.agents\worker_m2_2\DISPATCH.md
Original user request: c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md
Project architecture: c:\sts-projects\sasilk\PROJECT.md

Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement:
1. Update `backend/panel/src/pages/EventFormPage.tsx` with:
   - Multiple Image Gallery Uploader: thumbnail grid preview, "+ Add Images" button (multi-file selection using `uploadImage` API), individual delete button, primary cover selection ("Set as Cover" updating `imageUrl`), and URL input fallback.
   - Optional Video Glimpse Section: field for video glimpse (upload video file via `uploadVideo` or paste video URL) with live embedded player preview (YouTube, Vimeo, or HTML5 `<video>` for uploaded/direct videos), and clear button.
   - Backward-compatible form loading for legacy events: populate `images = ev.images?.length ? ev.images : (ev.imageUrl ? [ev.imageUrl] : [])` and `videoUrl = ev.videoUrl || ''`.
   - On save, payload submits `imageUrl`, `images`, and `videoUrl`.
2. Run `npm run build` in `backend/panel` and verify 0 errors.
3. Ensure full updated code is written, adhering to all user rules (responsive on mobile, tablet, laptop, desktop).

Write your report to c:\sts-projects\sasilk\.agents\worker_m2_2\handoff.md and notify me when complete.
