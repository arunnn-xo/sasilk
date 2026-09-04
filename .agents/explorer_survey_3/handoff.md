# Handoff Report: Explorer Survey 3 (Storefront Event Details Showcase)
**Target**: Storefront Event Details Showcase (`frontend/components/events/EventDetail.tsx`, `frontend/lib/services/storefront.service.ts`)
**Author**: Explorer Survey 3
**Date**: 2026-09-03
**Type**: Hard (Task Complete)

---

## 1. Observation

1. **Event Page Routing & Layout**:
   - `frontend/app/events/[slug]/page.tsx`:
     ```tsx
     24: export default async function EventDetailPage({ params }: Props) {
     25:   let event
     26:   try {
     27:     event = await fetchEventBySlug(params.slug)
     28:   } catch {
     29:     notFound()
     30:   }
     31: 
     32:   return (
     33:     <>
     34:       <Header />
     35:       <EventDetail event={event} />
     36:       <Footer />
     37:       <FloatingActions />
     38:     </>
     39:   )
     40: }
     ```
   - Renders `<EventDetail event={event} />` receiving `EventItem` from `fetchEventBySlug`.

2. **Current `EventDetail.tsx` Visual Layout**:
   - `frontend/components/events/EventDetail.tsx` lines 146-154 only renders a single image thumbnail in the hero banner:
     ```tsx
     146: {event.imageUrl ? (
     147:   <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl md:w-72">
     148:     <img src={resolveImageUrl(event.imageUrl)} alt={event.name} className="h-full w-full object-cover" />
     149:   </div>
     150: ) : (
     151:   <div className="flex h-48 w-full shrink-0 items-center justify-center rounded-2xl bg-[#300D14] md:w-72">
     152:     <CalendarDays className="h-14 w-14 text-[#E8C87A]" strokeWidth={1.3} />
     153:   </div>
     154: )}
     ```
   - In lines 171-177, the left column of the main section only renders:
     ```tsx
     171: <section className="mx-auto max-w-6xl px-4 lg:px-6 py-10 lg:py-14">
     172:   <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
     173:     <div>
     174:       <h2 className="font-serif text-2xl font-bold text-[#300D14]">About this event</h2>
     175:       <p className="font-sans mt-4 whitespace-pre-line text-sm leading-7 text-[#5A4A3F]">{event.description || 'No description provided yet.'}</p>
     176:     </div>
     ```
   - There is currently no multi-image gallery and no video player on the event details page.

3. **Data Type Gap**:
   - In `frontend/lib/services/storefront.service.ts` lines 121-140, `EventItem` lacks `images` and `videoUrl`:
     ```typescript
     121: export type EventItem = {
     122:   id: number
     123:   name: string
     124:   slug: string
     125:   description: string | null
     126:   imageUrl: string | null
     127:   eventDate: string
     ...
     140: }
     ```

4. **Image & Video Handling Verification**:
   - `frontend/next.config.js` lines 12-25:
     ```javascript
     12:   async rewrites() {
     ...
     20:       {
     21:         source: '/uploads/:path*',
     22:         destination: `${base}/uploads/:path*`,
     23:       },
     24:     ]
     25:   },
     ```
   - `frontend/lib/api/client.ts` line 50: `resolveImageUrl(url)` automatically handles `/uploads/...`, `http://`, `https://`, and Next public folder paths.
   - `backend/node/src/modules/admin/admin.routes.ts` line 155: `router.post('/uploads/video', uploadVideo.single('file'), asyncHandler(uploadVideoFile))` confirms video file uploads are supported under `/uploads/`.
   - `SingleProductPage.tsx` lines 413-535 demonstrates working touch swipe carousel, thumbnail switcher, and luxury styling patterns in the codebase.

5. **Build Baseline**:
   - Ran `npm run build` in `frontend/`. Exited with code 0. Next.js 14.2.3 production build succeeded with zero errors.

---

## 2. Logic Chain

1. **From Observation 1 & 3**:
   `EventDetailPage` passes `event` directly from `fetchEventBySlug` to `EventDetail`. Since `EventItem` in `storefront.service.ts` currently lacks `images?: string[] | null` and `videoUrl?: string | null`, adding these two optional fields to `EventItem` will provide end-to-end TypeScript safety without altering any existing fields or breaking other consumers (`EventsPage`, `BookingConfirmation`).

2. **From Observation 2 & 4**:
   In `EventDetail.tsx`, the left column (`grid-cols-[1fr_420px]`) has empty vertical real estate above and below "About this event". Placing an **Interactive Multi-Image Gallery** (`EventGallery.tsx`) above "About this event" allows the visual story (workshop setting, saree drape showcase, artisan details) to lead the page, matching luxury e-commerce expectations.
   Placing the **Event Highlights & Video Glimpse Player** (`EventVideoPlayer.tsx`) directly below "About this event" satisfies Requirement R4 with a dedicated section and zero voids when `videoUrl` is absent.

3. **From Observation 4**:
   `resolveImageUrl` correctly routes local `/uploads/` to the backend server while preserving absolute URLs. Using standard HTML `<img>` and `<video>` tags with `resolveImageUrl` guarantees full compatibility with both local uploads and external CDN links, avoiding Next.js image domain whitelist crashes.

4. **From Observation 5**:
   Because baseline compilation is clean (code 0), introducing modular components (`EventGallery.tsx`, `EventVideoPlayer.tsx`) and updating `EventDetail.tsx` + `storefront.service.ts` will preserve total build integrity.

---

## 3. Caveats

1. **Backend Database & API Synchronization**:
   This survey addresses storefront frontend consumption. The actual availability of `event.images` and `event.videoUrl` depends on Explorer Survey 1's migration and controller updates. Defensive programming (safe JSON parsing, null checks, fallback arrays) must be employed so the storefront works seamlessly whether the backend has deployed the new fields or is serving existing records.
2. **Video URL Formats**:
   The video player parser covers direct files (`.mp4`, `.webm`, etc.), YouTube (standard, shorts, embed, youtu.be), and Vimeo (standard and player embed). If a user inputs an unsupported obscure video host, the player will fall back to direct HTML5 or iframe rendering.
3. **No Caveats on Styling/Tokens**:
   Soil Goddess luxury theme tokens (`#6B1A2A`, `#D9B86E`, `#FAF6EE`, `#300D14`) are directly sourced from `tailwind.config.js` and `globals.css`.

---

## 4. Conclusion

The storefront event details showcase can be cleanly upgraded to fulfill Requirement R4 through three focused modifications:
1. **Extend Type Contract**: Add `images?: string[] | null` and `videoUrl?: string | null` to `EventItem` in `frontend/lib/services/storefront.service.ts`.
2. **Create Modular UI Components**:
   - `frontend/components/events/EventGallery.tsx`: Interactive multi-image gallery with high-res active viewport, next/prev controls, thumbnail switcher, full-screen lightbox, touch swipe carousel on mobile, and single-image / no-image fallbacks.
   - `frontend/components/events/EventVideoPlayer.tsx`: Dedicated "Event Highlights & Glimpses" section with responsive 16:9 player for YouTube, Vimeo, and direct video uploads (`<video>` / `<iframe>`), cleanly hidden (zero voids) when absent.
3. **Update `frontend/components/events/EventDetail.tsx`**:
   - Import and render `EventGallery` above "About this event".
   - Import and render `EventVideoPlayer` below "About this event".
   - Maintain 100% responsiveness across mobile, tablet, laptop, and desktop.

Full architectural details are documented in `c:\sts-projects\sasilk\.agents\explorer_survey_3\report.md`.

---

## 5. Verification Method

1. **TypeScript Typecheck & Build**:
   ```powershell
   cd c:\sts-projects\sasilk\frontend
   npm run build
   ```
   *Expected outcome*: Exit code 0, all routes including `/events/[slug]` compile without errors.
2. **Visual & Behavioral Invalidation Checks**:
   - **Multi-Image Event**: When an event contains 3 images, an active viewport renders with previous/next arrows and a thumbnail switcher below. Clicking thumbnail changes the active image.
   - **Single-Image Event**: When an event contains 1 image, it renders cleanly without navigation arrows, thumbnails, or dots.
   - **No-Image Event**: When an event contains no images, hero fallback card displays without broken image frames.
   - **Video Present**: When `videoUrl` is provided (YouTube or MP4), "Event Highlights & Glimpses" renders responsively with a 16:9 video frame.
   - **Video Absent**: When `videoUrl` is null/empty, "Event Highlights & Glimpses" is completely omitted with zero empty voids or spacing artifacts.
