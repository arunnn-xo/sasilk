## 2026-09-18T05:19:20Z

You are Admin Panel Worker M2 for Milestone 2: Admin Panel Management & Live Video Preview.
Your working directory is: c:\sts-projects\sasilk\.agents\worker_m2
Workspace root: c:\sts-projects\sasilk
Authoritative request: c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md
Project Blueprint: c:\sts-projects\sasilk\PROJECT.md
Survey report: c:\sts-projects\sasilk\.agents\survey_explorer_2\survey_report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership (files you own exclusively):
- `backend/panel/src/pages/SettingsPage.tsx`

Your mission:
Implement Milestone 2 in `backend/panel/src/pages/SettingsPage.tsx` per `PROJECT.md § Interface Contracts` and `ORIGINAL_REQUEST.md R2`:
1. Inspect `SettingsPage.tsx`:
   - Keep existing Shipping Status card and logic completely intact.
   - Retrieve settings list using existing `const { data: listData, isLoading: isFetching } = useQuery(...)`.
   - Find existing intro video config: `const existingIntroVideo = listData?.items?.find((i: any) => i.key === 'intro_video_config')`.
2. Form State:
   - `enabled`: boolean (default false)
   - `videoUrl`: string (default '')
   - `posterUrl`: string (default '')
   - `skipEnabled`: boolean (default true)
   - `skipAfterSeconds`: number (default 0)
   - `showOncePerSession`: boolean (default true)
   - `isUploadingVideo`: boolean
   - `isUploadingPoster`: boolean
   - Populate from `existingIntroVideo?.value` on load.
3. UI Card (Soil Goddess Aesthetic):
   - Container: `bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EFE8DA] space-y-6`
   - Header with Video/Film icon (`flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBF7F8] text-[#6B1A2A] border border-[#D9B86E]/40`), title "Storefront Intro Video", description "Configure dynamic full-screen intro video with live preview and skip controls."
   - Master toggle: Enable / Disable Intro Video.
   - Dual-mode video upload:
     - Direct upload button using `uploadVideo` from `../services/api` with hidden file input (`accept="video/mp4,video/webm,video/quicktime"`, 50MB check).
     - Text input for direct/external video URL.
   - Poster image input with upload (via `uploadImage`) or image URL text input.
   - Embedded live video player preview:
     - When `videoUrl` is present: render `<video key={resolveImageUrl(videoUrl)} controls playsInline preload="metadata" src={resolveImageUrl(videoUrl)} poster={posterUrl ? resolveImageUrl(posterUrl) : undefined} className="w-full max-h-80 object-contain rounded-xl border border-[#EFE8DA] bg-black/5" />`.
     - When empty: clean empty state with video icon and instruction text.
   - Controls:
     - Toggle: "Allow Skip" (`skipEnabled`).
     - Number input: "Skip After (seconds)" (`skipAfterSeconds`, min 0, max 30).
     - Toggle: "Show Once Per Session" (`showOncePerSession`).
   - Validation & Feedback:
     - When `enabled` is true and `videoUrl` is empty/invalid, display clear inline error message.
     - Save button must use `.admin-btn-primary` styling, with disabled state while uploading, when enabled without a video URL, when skip seconds is out of [0, 30], or when mutation is pending.
4. Mutation:
   - On save: mutate via `createResource('settings', payload)` if `!existingIntroVideo`, or `updateResource('settings', existingIntroVideo.id, payload)`.
   - Invalidate query `['resource', 'settings']` on success, and show success toast/message.
5. Verification:
   - Run `npm run build` in `backend/panel` (`tsc --noEmit && vite build`). Must pass with 0 errors.

Write handoff report to `c:\sts-projects\sasilk\.agents\worker_m2\handoff.md` and send message to orchestrator upon completion.
