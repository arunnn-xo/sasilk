# Handoff Report: Explorer Survey 2 (Admin Panel Event Form)
**Target**: Admin Panel Event Form (`backend/panel/src/pages/EventFormPage.tsx`, `backend/panel/src/services/api.ts`)
**Author**: Explorer Survey 2 (Synthesized from execution findings)
**Date**: 2026-09-03
**Type**: Hard (Task Complete)

---

## 1. Observation
1. **Target Component**:
   - `backend/panel/src/pages/EventFormPage.tsx` manages both new event creation (`/events/new`) and existing event editing (`/events/:id`).
   - `EventFormState` (lines 6-19) currently only tracks:
     `name, description, imageUrl, eventDate, startTime, endTime, price, mode, venueAddress, zoomLink, capacity, isActive`.
   - Lacks `images: string[]` (for ordered gallery thumbnails) and `videoUrl: string` (for video glimpse).
2. **Current Image Uploading**:
   - Lines 120-141 use a single hidden file input with `accept="image/*"` calling `uploadImage(file)` from `../services/api`.
   - Sets `update('imageUrl', res.file.path)`.
   - Displays only a single preview thumbnail box.
3. **Upload Infrastructure in Admin Panel**:
   - `backend/panel/src/services/api.ts`:
     - `uploadImage(file: File)` (line 201) -> `POST /admin/uploads` (accepts jpeg/png/webp, returns `{ file: { path, ... } }`).
     - `uploadVideo(file: File)` (line 211) -> `POST /admin/uploads/video` (accepts mp4/webm/ogg/mov up to 50MB, returns `{ file: { path, ... } }`).
   - Both upload services already exist and work with backend routes.
4. **Icons & Styling**:
   - Uses `lucide-react` (`Plus, Trash2, Video, Upload, ImageIcon, Star, Play, Check, X, ExternalLink`).
   - Styled with Tailwind CSS matching admin panel design system (wine/burgundy primary `#8B1A2B`, hover `#6E1220`, border `#D9B86E`/gray, clean card containers).

---

## 2. Logic Chain
1. **State Extension**:
   - Extend `EventFormState` with:
     ```typescript
     images: string[]
     videoUrl: string
     ```
   - When loading an existing event:
     ```typescript
     const loadedImages = Array.isArray(ev.images) && ev.images.length > 0
       ? ev.images
       : (ev.imageUrl ? [ev.imageUrl] : [])
     ```
   - When saving (`handleSave`), payload sends:
     ```typescript
     imageUrl: form.imageUrl || (form.images.length > 0 ? form.images[0] : null),
     images: form.images,
     videoUrl: form.videoUrl.trim() || null,
     ```
2. **Multiple Image Gallery Uploader**:
   - Render a thumbnail grid:
     - Each card displays the image preview via `resolveImageUrl(img)`.
     - Cover Badge / Button:
       - If `img === form.imageUrl`: Badge showing `Cover / Primary` in `#8B1A2B`.
       - If not cover: Button "Set as Cover" which sets `form.imageUrl = img`.
     - Remove Button:
       - Clicking removes `img` from `form.images`.
       - If removed image was the cover (`form.imageUrl === img`), update `form.imageUrl` to `newImages[0] || ''`.
     - "+ Add Images" button:
       - Hidden file input `<input type="file" multiple accept="image/*" />`.
       - Supports selecting multiple files at once.
       - Loops through files calling `uploadImage(f)`, appends returned paths to `form.images`.
       - If `form.imageUrl` is empty, sets the first uploaded image as `imageUrl`.
     - Manual URL Input:
       - Allow pasting an external image URL with "+ Add URL" button as a flexible alternative.
3. **Optional Video Glimpse Section**:
   - Section heading: "Video Glimpse (Optional)" with subtitle "Provide an event teaser, reel, or highlights glimpse".
   - Inputs:
     - URL text input for YouTube, Vimeo, or direct video link.
     - "Upload Video" button triggering `<input type="file" accept="video/mp4,video/webm,video/quicktime" />` calling `uploadVideo(file)`.
     - Clear/Remove button when video is present.
   - Live Embedded Video Preview:
     - If YouTube (e.g. `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID`, `youtube.com/embed/ID`):
       Renders `<iframe src="https://www.youtube.com/embed/${id}" className="w-full aspect-video rounded-lg" allowFullScreen />`.
     - If Vimeo (e.g. `vimeo.com/ID`):
       Renders `<iframe src="https://player.vimeo.com/video/${id}" className="w-full aspect-video rounded-lg" allowFullScreen />`.
     - If direct video file (uploaded `/uploads/...` or external `.mp4`/`.webm`):
       Renders `<video controls src={resolveImageUrl(form.videoUrl)} className="w-full aspect-video max-h-72 rounded-lg bg-black object-contain" />`.
     - If empty: shows a clean empty-state placeholder card ("No video added. Paste a YouTube/Vimeo link or upload an MP4/WebM teaser.").

---

## 3. Caveats
1. File size limit for uploaded video files is 50MB (governed by backend multer).
2. Existing events with only `imageUrl` must populate `images: [imageUrl]` when opened in the form so administrators can easily manage and add more gallery images.

---

## 4. Conclusion
All required upload APIs (`uploadImage` and `uploadVideo`) are already implemented in `api.ts`. Upgrading `backend/panel/src/pages/EventFormPage.tsx` with:
- Multiple Image Gallery Uploader (thumbnail grid, cover selection, delete button, multi-file upload)
- Optional Video Glimpse Section (URL or file upload with live interactive video player preview)
will satisfy Requirement R3 with zero regressions to existing event editing workflows.

---

## 5. Verification Method
1. `npm run build` in `backend/panel/` exits with code 0.
2. Open `/events/new` in admin panel:
   - Select multiple images -> verify thumbnails render in grid.
   - Click "Set as Cover" on 2nd image -> verify badge moves and `imageUrl` is set.
   - Click remove on 1st image -> verify removed.
   - Paste YouTube URL -> verify YouTube embed preview displays and plays.
   - Upload MP4 video -> verify HTML5 video preview displays and plays.
   - Save event -> verify API payload contains `images: [...]` and `videoUrl: "..."`.
3. Open existing event in `/events/:id` -> verify legacy event loads smoothly with `imageUrl` in gallery.
