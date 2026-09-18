# Admin Panel Survey Report: Requirement R2 (Intro Video Configuration)

**Date**: 2026-09-18  
**Author**: Admin Panel Survey Explorer  
**Target Scope**: `backend/panel` (Admin Panel frontend), `SettingsPage.tsx`, API client, video uploading, and live preview.  
**Authoritative Reference**: `c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md` (Requirement R2)

---

## 1. Executive Summary

This survey examines the Admin Panel codebase in `backend/panel` to specify the architecture, component design, data flow, validation rules, and styling for Requirement **R2: Admin Panel Management (`SettingsPage.tsx`)**.

### Core Findings:
1. **`SettingsPage.tsx` Architecture**: Currently renders a single card for Shipping Status (`shipping_config`) and contains unrendered logic for New Arrivals (`home_new_arrivals_config`). Settings are fetched via React Query (`useQuery` calling `listResource('settings')`) and persisted via `useMutation` executing POST/PUT against `/admin/settings`.
2. **Design System & Aesthetic**: The panel strictly adheres to the **Soil Goddess** brand palette: Burgundy (`#6B1A2A`, `#300D14`, `#FBF7F8`), Antique Gold (`#8B6B1F`, `#D9B86E`, `#FAF4E8`), and Warm Ivory (`#FAF6EE`, `#FDFBF7`, `#EFE8DA`) with `DM Sans` typography, `.admin-btn-primary` gradient buttons, and rounded-2xl border cards.
3. **Existing Upload Helpers**: Direct video uploading is already established in `services/api.ts` via `uploadVideo(file: File)` targeting `/admin/uploads/video`, with file validation helpers in `ResourceShared.tsx` (`validateVideoFile`) and a proven dual-input pattern (file upload + URL text input) in `EventFormPage.tsx`.
4. **Live Video Preview Player**: `EventFormPage.tsx` demonstrates a clean HTML5 embedded video player using `resolveImageUrl(videoUrl)` with controls, playback handling, and empty/error fallbacks.
5. **Form Controls & Validation**: Needs three toggles (`enabled`, `skipEnabled`, `showOncePerSession`), one bounded number input (`skipAfterSeconds` [0-30]), URL input, optional poster image input, client-side validation preventing submission of empty/invalid URLs when enabled, and button disable states during upload or invalidity.
6. **Compilation**: `backend/panel` uses Vite + React 18 + strict TypeScript (`tsc --noEmit && vite build`). All additions must strictly typecheck with zero errors.

---

## 2. In-Depth Inspection of `SettingsPage.tsx`

### 2.1 File Overview & Current Structure
- **File Path**: `c:\sts-projects\sasilk\backend\panel\src\pages\SettingsPage.tsx` (216 lines)
- **Component**: Default export `SettingsPage()`
- **Navigation Route**: `/settings` (defined in `backend/panel/src/app/App.tsx:129`, accessed via sidebar entry `{ path: '/settings', label: 'Shipping Status', Icon: Settings }` in `resources.ts:115`).
- **Existing Page Layout**:
  - Container: `mx-auto max-w-3xl px-4 py-8`
  - Back Button: Navigates back via `navigate(-1)`
  - Header: Icon container (`Truck` icon inside `bg-[var(--burgundy)]/10 text-[var(--burgundy)]`), Title `Shipping Status`, description `Manage free shipping configuration`.
  - Status Banner: Informational banner (`border-green-200 bg-green-50` when enabled, `border-gray-200 bg-gray-50` when disabled) detailing current shipping thresholds.
  - Form: Standard card `<form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">` with:
    - Checkbox toggle: `<input type="checkbox" checked={freeShippingEnabled} onChange={e => setFreeShippingEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[var(--burgundy)] focus:ring-[var(--burgundy)]" />`
    - Threshold numeric input (conditional when enabled).
    - Submit button with `.admin-btn-primary`, `<Loader2>` spinner when pending, and temporary "Saved!" confirmation (3s timeout).
- **Unrendered Logic in `SettingsPage.tsx`**:
  - Lines 22–30 and 71–97 define state (`newArrivalsEnabled`, `newArrivalsLimit`, `newArrivalsTouched`), a mutation (`saveNewArrivals`), and a submit handler (`handleNewArrivalsSubmit`) for `home_new_arrivals_config`, but lines 122–214 only render the Shipping Status card into the DOM.

### 2.2 Data Fetching, Persistence, and API Integration
- **React Query Hook**: `@tanstack/react-query` v5 (`useQuery`, `useMutation`, `useQueryClient`).
- **Fetch Query**:
  ```typescript
  const { data: listData, isLoading: isFetching } = useQuery({
    queryKey: ['resource', 'settings'],
    queryFn: () => listResource('settings'),
  })
  ```
  `listResource('settings')` sends `GET /admin/settings?page=1&perPage=20` via `apiFetch`.
  Returns `{ items: Array<{ id: number; key: string; value: Record<string, any>; createdAt: string; updatedAt: string }> }`.
- **Finding Specific Configuration**:
  ```typescript
  const existingIntroVideo = listData?.items?.find((i: any) => i.key === 'intro_video_config')
  const introVideoValue = (existingIntroVideo?.value || {}) as Record<string, any>
  ```
- **State Synchronization (`useEffect`)**:
  ```typescript
  useEffect(() => {
    if (!isFetching) {
      setIntroEnabled(Boolean(introVideoValue.enabled))
      setVideoUrl(introVideoValue.videoUrl || '')
      setPosterUrl(introVideoValue.posterUrl || '')
      setSkipEnabled(introVideoValue.skipEnabled !== undefined ? Boolean(introVideoValue.skipEnabled) : true)
      setSkipAfterSeconds(introVideoValue.skipAfterSeconds !== undefined ? String(introVideoValue.skipAfterSeconds) : '0')
      setShowOncePerSession(introVideoValue.showOncePerSession !== undefined ? Boolean(introVideoValue.showOncePerSession) : true)
    }
  }, [isFetching, existingIntroVideo])
  ```
- **Mutation & Persistence**:
  ```typescript
  const saveIntroVideo = useMutation({
    mutationFn: async () => {
      const body = {
        key: 'intro_video_config',
        value: {
          enabled: introEnabled,
          videoUrl: videoUrl.trim(),
          posterUrl: posterUrl.trim() || undefined,
          skipEnabled,
          skipAfterSeconds: Math.min(30, Math.max(0, parseInt(skipAfterSeconds, 10) || 0)),
          showOncePerSession,
        },
      }
      if (existingIntroVideo?.id) {
        return apiFetch(`/admin/settings/${existingIntroVideo.id}`, { method: 'PUT', body: JSON.stringify(body) })
      }
      return apiFetch('/admin/settings', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'settings'] })
    },
  })
  ```
- **Post-Save Feedback**:
  ```typescript
  useEffect(() => {
    if (saveIntroVideo.isSuccess) {
      const timer = setTimeout(() => saveIntroVideo.reset(), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveIntroVideo.isSuccess, saveIntroVideo])
  ```

### 2.3 Styling Tokens & Soil Goddess Brand Aesthetic
In `backend/panel/src/styles/globals.css` and `tailwind.config.js`:
- **Color Palette**:
  - `burgundy`:
    - `DEFAULT`: `#6B1A2A`
    - `dark`: `#300D14`
    - `light`: `#841920`
    - `soft`: `#FBF7F8`
  - `gold`:
    - `DEFAULT`: `#D9B86E` (Accent Gold for borders/icons)
    - `text / contrast`: `#8B6B1F`
    - `dark`: `#BF9A4B` / `#6B5215`
    - `soft`: `#FAF4E8`
  - `ivory`:
    - `DEFAULT`: `#FAF6EE` (`--panel-strong`)
    - `warm`: `#FDFBF7` (`--bg`)
    - `border`: `#EFE8DA` (`--line`)
  - `text`: `#1F080D` (`--text`), muted `#7A6065` (`--muted`)
- **Card Wrapper Tokens**:
  - Outer card: `bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EFE8DA] space-y-6`
  - Card Header icon: `flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBF7F8] text-[#6B1A2A] shadow-sm border border-[#D9B86E]/40`
  - Inner form container: `rounded-2xl border border-[#EFE8DA] bg-[#FAF6EE]/50 p-6 space-y-5`
- **Buttons**:
  - Primary button (`.admin-btn-primary`):
    `background-image: linear-gradient(135deg, #6B1A2A, #300D14); border: 1px solid rgba(217, 184, 110, 0.4); text-white font-bold px-5 py-2.5 rounded-lg shadow-sm hover:translate-y-[-1px]`
  - Secondary button (`.admin-btn-secondary`):
    `bg-white text-[#300D14] border border-[#EFE8DA] hover:bg-[#FAF6EE]`
- **Form Controls & Inputs**:
  - Inputs: `w-full rounded-xl border border-[#EFE8DA] bg-white px-3.5 py-2.5 text-sm text-[#1F080D] font-semibold outline-none transition focus:border-[#6B1A2A] focus:ring-2 focus:ring-[#6B1A2A]/20`
  - Labels: `mb-1.5 block text-xs font-bold text-[#7A6065] uppercase tracking-wider`
  - Switch Toggle:
    `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6B1A2A] ${enabled ? 'bg-[#6B1A2A]' : 'bg-gray-200'}`

---

## 3. Video Upload & URL Input Analysis

### 3.1 Existing Upload Services
In `backend/panel/src/services/api.ts`:
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

export async function uploadImage(file: File, dimensionHint?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (dimensionHint) {
    formData.append('dimensionRule', dimensionHint)
  }
  return apiFetch<{ file: { filename: string; originalName: string; path: string; dimensions?: { width: number; height: number } } }>('/admin/uploads', {
    method: 'POST',
    body: formData,
    timeoutMs: 30000,
  })
}
```

### 3.2 Client-Side Validation Rules
From `ResourceShared.tsx` lines 167–180:
```typescript
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50 MB

export function validateVideoFile(file: File): { valid: true } | { valid: false; reason: string } {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, reason: 'Only MP4 and WebM video files are allowed.' }
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return { valid: false, reason: 'Video file size must be under 50 MB.' }
  }
  return { valid: true }
}
```
*Note*: Per Requirement R1 & R2, the backend `/admin/uploads/video` endpoint directly streams MP4 and WebM files to Cloudinary (`sasilk/videos`) and returns the permanent Cloudinary video URL in `data.file.path`.

### 3.3 Proven Dual-Input Pattern in `EventFormPage.tsx`
`EventFormPage.tsx` (lines 310–343, 640–698) implements the exact pattern required:
1. **Hidden File Input**:
   ```tsx
   <input
     ref={videoInputRef}
     type="file"
     accept="video/mp4,video/webm"
     className="hidden"
     onChange={e => {
       const file = e.target.files?.[0]
       if (file) handleVideoUpload(file)
     }}
   />
   ```
2. **Side-by-side or Stacked Controls**:
   - URL text input with film icon: user can paste any external Cloudinary, CDN, or direct video URL.
   - "Upload Video" button: triggers `videoInputRef.current?.click()`.
   - While uploading: button displays `<Loader2 className="animate-spin" /> Uploading…` and is disabled.
   - When a video URL is set: a "Clear Video" button allows resetting `videoUrl` to `''`.

### 3.4 URL Resolution (`resolveImageUrl`)
In `services/api.ts` lines 42–56:
```typescript
export function resolveImageUrl(value: unknown) {
  if (!value) return ''
  const url = String(value).trim()
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    return `${originFromUrl(apiBaseUrl)}${url}`
  }
  if (url.startsWith('/')) {
    return `${storefrontBaseUrl.replace(/\/$/, '')}${url}`
  }
  return url
}
```
This safely resolves:
- Full Cloudinary URLs (`https://res.cloudinary.com/...`)
- External URLs (`https://...`)
- Relative paths (`/introvideo/introvideo.mp4` or `/uploads/...`)
- Blob URLs (`blob:...`) for instant client-side preview

---

## 4. Live Video Player Preview Analysis

### 4.1 Existing Implementations
1. **`EventFormPage.tsx` (lines 700–752)**:
   - Evaluates video URL.
   - If present: renders `<video key={directUrl} controls playsInline preload="metadata" src={resolveImageUrl(videoUrl)} className="h-full w-full max-h-80 object-contain" />`.
   - If missing: renders dashed placeholder box with `Film` icon and descriptive text.
2. **`IntroVideo.tsx` (storefront)**:
   - Fullscreen video overlay (`fixed inset-0 z-[1200]`).
   - Autoplays muted, `object-cover`.
   - Includes skip button and loading spinner.

### 4.2 Recommended Embedded Live Preview Component
To give the admin accurate visual confirmation before saving:
- **Container**: Aspect-video (`aspect-video`), rounded-xl, overflow-hidden, background `bg-black/90`, subtle gold/ivory border.
- **Video Element**:
  ```tsx
  <video
    key={resolvedVideoUrl}
    src={resolvedVideoUrl}
    poster={resolvedPosterUrl}
    controls
    playsInline
    preload="metadata"
    className="h-full w-full max-h-72 object-contain"
  >
    Your browser does not support HTML5 video.
  </video>
  ```
- **Metadata Footer Bar**:
  - Displays source type badge ("Cloudinary Video", "Direct MP4/WebM Stream", "Local Asset").
  - Truncated URL display.
- **Empty State**:
  - When `!videoUrl`: Renders a friendly preview placeholder:
    ```tsx
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#EFE8DA] bg-white p-8 text-center">
      <Film className="h-10 w-10 text-[#7A6065]/40 mb-2" />
      <p className="text-sm font-bold text-[#1F080D]">No Video Selected</p>
      <p className="text-xs text-[#7A6065] max-w-sm mt-1">
        Upload an MP4/WebM video or paste a video URL above to preview the storefront intro video here.
      </p>
    </div>
    ```
- **Playback Error Handling**:
  - Attach `onError={() => setPlaybackError('Unable to load video stream from this URL.')}`.
  - If error occurs, render inline warning banner prompting the admin to verify the URL or format.

---

## 5. Controls, Form Validation & State Specifications

### 5.1 Setting Configuration Schema
The backend `intro_video_config` JSON structure:
| Field | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `false` | Master toggle: enable/disable intro video on storefront |
| `videoUrl` | `string` | `""` | Cloudinary URL, external MP4/WebM URL, or uploaded path |
| `posterUrl` | `string` (optional) | `""` | Optional fallback poster image URL |
| `skipEnabled` | `boolean` | `true` | When true, visitors can skip the video |
| `skipAfterSeconds` | `number` | `0` | Seconds before skip button activates (0 = immediate, max = 30) |
| `showOncePerSession` | `boolean` | `true` | When true, uses `sessionStorage.getItem('sas_intro_seen')` |

### 5.2 Required Form Controls
1. **Master Toggle: "Enable Storefront Intro Video"**:
   - Status banner: Emerald banner when active ("Intro Video is Active on Storefront"); Slate banner when disabled ("Intro Video is Inactive — Storefront loads instantly").
2. **Video Uploader & URL Input**:
   - Input for `videoUrl` (with URL validation and paste support).
   - "Upload Video" button triggering file browser for `.mp4` / `.webm` files up to 50MB.
   - Upload progress indicator.
3. **Poster Image (Optional Fallback)**:
   - Input for `posterUrl` with optional "Upload Poster" button (JPEG, PNG, WebP up to 5MB).
4. **Allow Skip Toggle (`skipEnabled`)**:
   - Controls whether the storefront displays a Skip button.
5. **Skip Delay Input (`skipAfterSeconds`)**:
   - Number input (0 to 30 seconds).
   - Explanatory note: "Set to 0 for instant skip access. Set > 0 to require visitors to watch for a brief moment before skipping."
6. **Show Once Per Session Toggle (`showOncePerSession`)**:
   - Controls whether the video only shows on initial visit per session.
   - Explanatory note: "Recommended: On. Prevents repeating the intro every time a visitor navigates back to the homepage."

### 5.3 Validation Rules & Error Handling
1. **URL Validation when Enabled**:
   - If `enabled === true`:
     - `videoUrl.trim()` must NOT be empty.
     - Must start with `http://`, `https://`, or `/`.
     - Error message: `"Video URL is required when intro video is enabled."`
2. **Skip Delay Validation**:
   - `skipAfterSeconds` must be an integer between 0 and 30.
   - Error message: `"Skip delay must be a number between 0 and 30 seconds."`
3. **Save Button State**:
   - The Save button MUST be disabled if:
     - `saveMutation.isPending === true`
     - `uploadingVideo === true`
     - `enabled === true && (!videoUrl.trim() || !isValidUrl(videoUrl))`
     - `skipAfterSeconds < 0 || skipAfterSeconds > 30 || isNaN(skipAfterSeconds)`
4. **Persistence & Refresh**:
   - On save: executes `POST /admin/settings` (or `PUT /admin/settings/:id`).
   - Query client invalidates `['resource', 'settings']`.
   - On full browser refresh (`F5`), React Query reloads `listResource('settings')`, reads `intro_video_config`, and restores exact toggles and input values.

---

## 6. Compilation & Build Requirements

- **Script**: `npm run build` executes `tsc --noEmit && vite build`.
- **TypeScript Strictness**:
  - `tsconfig.json` has `strict: true`, `noEmit: true`.
  - No untyped parameters, no missing React hooks dependencies in `useEffect`.
  - All Lucide icons used (`Video`, `Film`, `Upload`, `X`, `Check`, `Loader2`, `Info`, `Clock`, `Sparkles`, `Play`, `ArrowLeft`, `Trash2`, `Image`) must be imported from `lucide-react`.
  - All API calls must use typed helpers from `../services/api`.

---

## 7. Recommended Implementation Architecture for `SettingsPage.tsx`

To maintain clean separation of concerns and avoid regression:
1. **Page Title & Layout**:
   - Update header to **Store Settings** (`Settings` icon in burgundy/10 badge).
   - Subtitle: "Configure store features, intro video experience, and shipping parameters."
2. **Section Cards**:
   - **Card 1: Intro Video Configuration** (New, matching Requirement R2).
   - **Card 2: Free Shipping Configuration** (Preserving existing working shipping rules).
   - **Card 3: Home New Arrivals Configuration** (Connecting the previously unrendered new arrivals controls).
3. **Component Structure**:
   - Either place the Intro Video card directly within `SettingsPage.tsx` or encapsulate it into `backend/panel/src/components/IntroVideoSettings.tsx` and import it into `SettingsPage.tsx` (mirroring how `GuestDiscountPopupSettings.tsx` is structured).
   - Placing it directly or as a dedicated sub-component cleanly isolates state (`introEnabled`, `videoUrl`, `posterUrl`, `skipEnabled`, `skipAfterSeconds`, `showOncePerSession`, `uploadingVideo`, `uploadError`, `videoInputRef`) and prevents re-rendering unrelated sections.

---

## 8. Summary of Actionable Implementation Specifications

| Requirement | Implementation Detail | Location |
|---|---|---|
| Setting Key | `intro_video_config` | Database `Setting` table, `resource.controller.ts`, `SettingsPage.tsx` |
| Video Upload Endpoint | `POST /admin/uploads/video` (up to 50MB, MP4/WebM to Cloudinary) | `services/api.ts` -> `uploadVideo()` |
| URL Input | Dual-input with upload button + text input | `SettingsPage.tsx` |
| Live Preview | Responsive `<video controls>` with `resolveImageUrl()` | `SettingsPage.tsx` |
| Toggles | Enable Video, Allow Skip, Show Once Per Session | `SettingsPage.tsx` |
| Validation | Disables save if enabled without valid URL; inline errors | `SettingsPage.tsx` |
| Design Tokens | Soil Goddess Burgundy (`#6B1A2A`), Gold (`#D9B86E`), Ivory (`#FAF6EE`) | `tailwind.config.js`, `globals.css` |
| Build Check | `tsc --noEmit && vite build` | `backend/panel` |
