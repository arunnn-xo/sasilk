# Handoff Report: Admin Panel Survey (Requirement R2)

**Agent**: Admin Panel Survey Explorer  
**Date**: 2026-09-18  
**Working Directory**: `c:\sts-projects\sasilk\.agents\survey_explorer_2`  
**Report Document**: `c:\sts-projects\sasilk\.agents\survey_explorer_2\survey_report.md`  

---

## 1. Observation

1. **`SettingsPage.tsx` Structure**:
   - `backend/panel/src/pages/SettingsPage.tsx:11-14`:
     ```typescript
     const { data: listData, isLoading: isFetching } = useQuery({
       queryKey: ['resource', 'settings'],
       queryFn: () => listResource('settings'),
     })
     ```
   - Lines 16–20: Existing shipping setting is retrieved via:
     `const existingShipping = listData?.items?.find((i: any) => i.key === 'shipping_config')`
   - Lines 42–60: Shipping setting mutation sends:
     `{ key: 'shipping_config', value: { freeShippingEnabled, freeShippingThreshold: freeShippingEnabled ? threshold : 0 } }`
     Using `PUT /admin/settings/${existingShipping.id}` if existing, or `POST /admin/settings` if new.
   - Lines 22–30 & 71–97: Contains unrendered state and mutation for `home_new_arrivals_config`.
   - Lines 122–214: Only renders the "Shipping Status" header (`Truck` icon) and Free Shipping form card.

2. **Styling and Tokens (Soil Goddess Aesthetic)**:
   - `backend/panel/src/styles/globals.css:9-22`:
     Root CSS variables defined: `--bg: #FDFBF7`, `--panel: #ffffff`, `--panel-strong: #FAF6EE`, `--text: #1F080D`, `--muted: #7A6065`, `--line: #EFE8DA`, `--gold: #8B6B1F`, `--gold-accent: #D9B86E`, `--burgundy: #6B1A2A`, `--burgundy-dark: #300D14`, `--burgundy-soft: #FBF7F8`.
   - `globals.css:85-115`: `.admin-btn-primary` uses gradient `#6B1A2A` to `#300D14`, gold border `rgba(217, 184, 110, 0.4)`, font weight 700.
   - `backend/panel/src/components/GuestDiscountPopupSettings.tsx:80-90`: Uses card container `bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EFE8DA] space-y-6` with header icon `flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBF7F8] text-[#6B1A2A] border border-[#D9B86E]/40` and inner panel `rounded-2xl border border-[#EFE8DA] bg-[#FAF6EE]/50 p-6 space-y-5`.

3. **Existing Upload Helpers**:
   - `backend/panel/src/services/api.ts:217-225`:
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
   - `backend/panel/src/services/api.ts:42-56`: `resolveImageUrl(value: unknown)` normalizes external, relative, Cloudinary, and blob URLs.
   - `backend/panel/src/pages/ResourceShared.tsx:167-180`: `validateVideoFile(file: File)` checks against `ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']` and `MAX_VIDEO_SIZE = 50 * 1024 * 1024` (50MB).

4. **Existing Video Preview Pattern**:
   - `backend/panel/src/pages/EventFormPage.tsx:310-343` and `640-752`:
     - Hidden `<input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" />` triggered by "Upload Video" button.
     - Side-by-side or stacked URL text input with film icon.
     - Live preview player rendering `<video key={directUrl} controls playsInline preload="metadata" src={resolveImageUrl(videoUrl)} className="h-full w-full max-h-80 object-contain" />`.
     - Empty state dashed placeholder when no video is selected.

5. **Controls and Validation Requirements**:
   - `c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md:13-30`:
     - Key: `intro_video_config`.
     - Fields: `enabled` (boolean), `videoUrl` (string), `posterUrl` (optional string), `skipEnabled` (boolean, default true), `skipAfterSeconds` (number, default 0, max 30), `showOncePerSession` (boolean, default true).
     - Save button must be disabled while uploading or when enabled and `videoUrl` is empty/invalid.
     - Settings must persist to database and reload accurately on page refresh.

6. **Build Constraints**:
   - `backend/panel/package.json:8`: `"build": "tsc --noEmit && vite build"`.
   - `backend/panel/tsconfig.json:10`: `"strict": true`.

---

## 2. Logic Chain

1. **Settings Persistence & Fetching Pattern**:
   - From Observation 1, settings are managed uniformly as rows in the `Setting` table via `/admin/settings`.
   - Adding `intro_video_config` follows the exact same pattern: querying `listResource('settings')`, finding `item.key === 'intro_video_config'`, and mutating via `POST /admin/settings` or `PUT /admin/settings/:id`.
   - Because `queryClient.invalidateQueries({ queryKey: ['resource', 'settings'] })` is triggered on success, and the query is re-executed on page refresh, settings persist across refreshes without extra plumbing.

2. **Design System Consistency**:
   - From Observation 2, `SettingsPage.tsx` must align with the Soil Goddess design language used across the panel.
   - The card styling should adopt `bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EFE8DA]` with burgundy (`#6B1A2A`) / gold (`#D9B86E`) accents, matching `GuestDiscountPopupSettings.tsx` and `.admin-btn-primary`.

3. **Dual Upload / URL Input**:
   - From Observation 3 and 4, `uploadVideo(file)` already exists and handles `POST /admin/uploads/video`.
   - Adapting the pattern from `EventFormPage.tsx` allows the admin to either upload an MP4/WebM file directly (up to 50MB) or enter an external video URL.
   - `resolveImageUrl(videoUrl)` ensures both Cloudinary URLs (`https://res.cloudinary.com/...`) and direct uploads are correctly formatted for playback.

4. **Live Preview Player**:
   - From Observation 4, an HTML5 `<video controls playsInline>` element keyed by the resolved video URL provides zero-dependency, instantaneous preview for MP4 and WebM videos.
   - Adding poster support (`poster={resolveImageUrl(posterUrl)}`) accurately reflects the storefront fallback display.

5. **Form Validation & Button States**:
   - From Observation 5, validation can be derived reactively:
     - `isInvalid = enabled && (!videoUrl.trim() || !isValidUrl(videoUrl))`
     - `isSkipInvalid = skipEnabled && (isNaN(skipNum) || skipNum < 0 || skipNum > 30)`
     - `isSaveDisabled = saveIntroVideo.isPending || uploadingVideo || isInvalid || isSkipInvalid`
   - This ensures the admin cannot persist invalid configurations.

---

## 3. Caveats

- **Existing Unrendered Code**: `SettingsPage.tsx` contains state and handlers for `home_new_arrivals_config` that were never rendered in the JSX. When updating `SettingsPage.tsx`, we should keep the existing Shipping card working, add the Intro Video card, and optionally render the New Arrivals card if appropriate, without breaking any existing shipping functionality.
- **Backend Dependency**: The admin panel relies on `/admin/uploads/video` accepting MP4/WebM files and streaming them to Cloudinary (Requirement R1). If the backend is not yet updated for video streaming, the panel's file upload will fail until R1 is implemented; however, external URL entry will function independently.

---

## 4. Conclusion

Requirement R2 can be implemented smoothly with zero breaking changes to existing settings.
1. **Component**: Add a dedicated "Intro Video Configuration" card into `SettingsPage.tsx` (or as a modular component `backend/panel/src/components/IntroVideoSettings.tsx` rendered in `SettingsPage.tsx`).
2. **Controls**:
   - Master toggle: "Enable Intro Video"
   - Dual-mode video input: "Upload Video" button (via `uploadVideo` and hidden file input for MP4/WebM up to 50MB) + URL text input.
   - Optional poster image input with upload support.
   - Embedded responsive live preview player (`<video controls playsInline>`).
   - Toggles for "Allow Skip" (`skipEnabled`) and "Show Once Per Session" (`showOncePerSession`).
   - Numeric input for `skipAfterSeconds` (0 to 30s).
3. **Validation**: Disable Save button when uploading, when enabled without a valid URL, or when skip seconds are out of bounds. Display clear inline errors.
4. **Persistence**: Saves to `intro_video_config` key via standard settings API and invalidates React Query cache.

---

## 5. Verification Method

1. **Inspect Survey Report**:
   - Review `c:\sts-projects\sasilk\.agents\survey_explorer_2\survey_report.md` for complete technical details and code structures.
2. **Type Check & Compilation**:
   - Once implemented, run in `backend/panel`:
     ```powershell
     npm run build
     ```
   - Must pass with 0 errors (`tsc --noEmit && vite build`).
3. **Interactive Validation Checklist**:
   - Navigate to Admin Panel `/settings`.
   - Verify Intro Video card renders with Soil Goddess aesthetic.
   - Toggle "Enable Intro Video" ON without a URL: Save button is disabled, inline error indicates video URL is required.
   - Enter a valid MP4 URL or upload a test MP4: Live preview player loads and plays video.
   - Set skip delay to 5s, verify validation constraints (0-30).
   - Save settings: Confirmation "Saved successfully!" displays.
   - Refresh the page (`F5`): All settings reload accurately from the database.
