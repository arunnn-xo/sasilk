# Dispatch: Worker M3 (Storefront Event Details Showcase)

## Mission
Implement Requirement R4 for the Soil Goddess Event Management enhancement project in `frontend`.

## Input References
- Original Request: `c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md`
- Project Architecture & Scope: `c:\sts-projects\sasilk\PROJECT.md`
- Explorer Survey 3 Report: `c:\sts-projects\sasilk\.agents\explorer_survey_3\report.md`
- Explorer Survey 3 Handoff: `c:\sts-projects\sasilk\.agents\explorer_survey_3\handoff.md`

## Exclusive File Ownership
You exclusively own and may create/edit ONLY these files:
1. `frontend/lib/services/storefront.service.ts`
2. `frontend/components/events/EventGallery.tsx` (new component)
3. `frontend/components/events/EventVideoPlayer.tsx` (new component)
4. `frontend/components/events/EventDetail.tsx`

## Detailed Implementation Requirements
1. **Extend Type Contract (`frontend/lib/services/storefront.service.ts`)**:
   - In `export type EventItem = { ... }`, add:
     ```typescript
     images?: string[] | null
     videoUrl?: string | null
     ```
2. **Interactive Multi-Image Gallery (`frontend/components/events/EventGallery.tsx`)**:
   - Accepts props: `{ images?: string[] | null; eventName: string; coverImageUrl?: string | null }`.
   - Normalization:
     - Combine `images` and `coverImageUrl` safely:
       ```typescript
       const list = Array.isArray(images) && images.length > 0
         ? images.filter(Boolean)
         : (coverImageUrl ? [coverImageUrl] : [])
       ```
     - If `list.length === 0`, return null (gracefully omit).
   - Single Image Behavior:
     - If `list.length === 1`, render clean elegant image card without arrows, dots, or thumbnails.
   - Multi-Image Behavior (`list.length > 1`):
     - Active high-res viewport (`aspect-[16/9] md:aspect-[21/9] lg:aspect-[16/9]` or similar responsive ratio) displaying current selected image with smooth transition.
     - Next & Previous navigation buttons with subtle hover effect and backdrop blur.
     - Counter pill badge (`1 / N`) in top-right corner.
     - Fullscreen lightbox button / click-to-expand modal allowing full-screen high-res viewing with close (`X`) button and keyboard Escape support.
     - Horizontal thumbnail switcher strip below the main viewport:
       - Thumbnails scroll horizontally if many images exist (`overflow-x-auto no-scrollbar`).
       - Active thumbnail highlighted with gold border (`border-[#D9B86E]`) and subtle ring.
     - Mobile: Touch-friendly swipe gesture / scroll-snap carousel with indicator dots.
   - Luxury Styling:
     - Match Soil Goddess aesthetic: rounded-2xl corners, `#300D14` deep burgundy accents, `#D9B86E` gold highlights, subtle luxury shadow (`shadow-md`), image resolution via `resolveImageUrl(img)`.
3. **Event Highlights & Video Glimpse Player (`frontend/components/events/EventVideoPlayer.tsx`)**:
   - Accepts props: `{ videoUrl?: string | null; eventName: string; posterImageUrl?: string | null }`.
   - If `!videoUrl || !videoUrl.trim()`, return `null` (zero empty voids, nothing rendered).
   - When `videoUrl` is present:
     - Dedicated section container with:
       - Subtle section divider / badge "Event Highlights & Glimpses".
       - Heading "Experience the Ambiance & Glimpses" or "Event Highlights & Glimpse".
       - Subtitle "A preview of what awaits you at this exclusive gathering".
     - Universal responsive 16:9 player container (`aspect-video w-full rounded-2xl overflow-hidden border border-[#D9B86E]/40 shadow-lg bg-black`):
       - YouTube: parses URLs (standard, shorts, embed, youtu.be) and renders accessible `<iframe>` with `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` and `allowFullScreen`.
       - Vimeo: parses URLs (`vimeo.com/ID`) and renders accessible `<iframe>` with `https://player.vimeo.com/video/${id}`.
       - Direct video / upload: renders HTML5 `<video controls playsInline preload="metadata" poster={posterImageUrl ? resolveImageUrl(posterImageUrl) : undefined} className="w-full h-full object-contain"> <source src={resolveImageUrl(videoUrl)} /> </video>`.
4. **Upgrade `frontend/components/events/EventDetail.tsx`**:
   - In the left column (`grid-cols-[1fr_420px]`):
     - Render `<EventGallery images={event.images} eventName={event.name} coverImageUrl={event.imageUrl} />` above "About this event".
     - Render `<EventVideoPlayer videoUrl={event.videoUrl} eventName={event.name} posterImageUrl={event.imageUrl} />` directly below "About this event".
   - Keep hero banner intact (or refine so hero thumbnail does not clash with the gallery).
   - Ensure 100% responsiveness across mobile, tablet, laptop, and desktop.
   - Preserve all existing booking, quantity, Razorpay modal, and mode selection functionality.

## Verification Commands
1. Run `npm run build` in `c:\sts-projects\sasilk\frontend` to verify 0 TypeScript/Next.js compilation errors.
2. Confirm the updated code adheres to all user rules (provide FULL updated code, fully responsive mobile to desktop, no partial snippets).

## Mandatory Rules
- Always provide full updated code (no partial snippets or placeholders).
- DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your handoff report to `c:\sts-projects\sasilk\.agents\worker_m3_2\handoff.md` and send a message back when complete.

## 2026-09-03T12:58:56Z
You are Worker M3 (Storefront Event Details Showcase).
Your working directory: c:\sts-projects\sasilk\.agents\worker_m3_2
Your dispatch instructions: c:\sts-projects\sasilk\.agents\worker_m3_2\DISPATCH.md
Original user request: c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md
Project architecture: c:\sts-projects\sasilk\PROJECT.md

Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement:
1. In `frontend/lib/services/storefront.service.ts`: extend `EventItem` with `images?: string[] | null` and `videoUrl?: string | null`.
2. Create `frontend/components/events/EventGallery.tsx`: interactive multi-image gallery with high-res active viewport, prev/next arrows, counter badge, thumbnail switcher strip, fullscreen lightbox modal, mobile touch carousel with dots, single-image fallback, and zero-image graceful handling.
3. Create `frontend/components/events/EventVideoPlayer.tsx`: dedicated "Event Highlights & Glimpses" section below "About this event" with responsive 16:9 player for YouTube, Vimeo, and direct video uploads. Gracefully hidden (zero voids) if `videoUrl` is absent.
4. Update `frontend/components/events/EventDetail.tsx`: integrate `EventGallery` above "About this event" and `EventVideoPlayer` below "About this event".
5. Run `npm run build` in `frontend` and verify 0 errors.
6. Ensure full updated code is written, adhering to all user rules (responsive on mobile, tablet, laptop, desktop).

Write your report to c:\sts-projects\sasilk\.agents\worker_m3_2\handoff.md and notify me when complete.

