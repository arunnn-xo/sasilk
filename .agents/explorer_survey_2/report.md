# Architectural Investigation Report: Explorer Survey 2 (Admin Panel Event Form)

## Executive Summary
This report analyzes `backend/panel/src/pages/EventFormPage.tsx` and related services in `backend/panel/src/services/api.ts` to implement Requirement R3: Multiple Image Gallery Uploader and Optional Video Glimpse Section with live preview.

## Key Discoveries
1. **API Upload Services are Ready**:
   - `uploadImage(file: File)` in `api.ts` uploads images to `POST /admin/uploads`.
   - `uploadVideo(file: File)` in `api.ts` uploads videos to `POST /admin/uploads/video`.
   - Both return `{ file: { path: string, ... } }`.
2. **Current Form Architecture**:
   - `EventFormPage.tsx` holds local state `form: EventFormState`.
   - When editing an existing event, `apiFetch<{ event: any }>(/admin/events/:id)` populates `form`.
   - On save, `apiFetch(/admin/events[/:id], { method: 'POST' | 'PUT', body: JSON.stringify(payload) })` sends payload.
3. **Required Upgrades**:
   - Add `images: string[]` and `videoUrl: string` to `EventFormState`.
   - Multi-image gallery with thumbnail grid, cover indicator, "Set as Cover" action, delete action, "+ Add Images" multi-file picker, and "+ Add Image URL" input.
   - Video glimpse field with URL text input, upload video button, remove video button, and live embedded preview supporting YouTube, Vimeo, and direct video files.
