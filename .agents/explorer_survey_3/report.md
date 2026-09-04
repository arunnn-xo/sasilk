# Explorer Survey 3: Storefront Event Details Showcase (R4)
**Target**: `frontend/components/events/EventDetail.tsx`, `frontend/app/events/[slug]/page.tsx`, `frontend/lib/services/storefront.service.ts`
**Date**: 2026-09-03
**Status**: Investigation & Architecture Complete

---

## Executive Summary

This survey analyzes the storefront event showcase in the `frontend` Next.js application, focusing on Requirement R4:
1. **Interactive Multi-Image Gallery**: Elegant thumbnail-switched gallery and touch-friendly mobile carousel matching the Soil Goddess luxury aesthetic, with graceful fallbacks for single-image and no-image states.
2. **Event Highlights & Video Glimpse Player**: Responsive video player embedded below "About this event" supporting direct video file uploads (MP4/WebM) and external streaming providers (YouTube/Vimeo), with zero voids when absent.

All baseline frontend code and Next.js production builds have been verified (`npm run build` exits with code 0). This report establishes the exact technical specifications, component architecture, data contracts, and UI design needed for implementation.

---

## 1. Current State Analysis

### 1.1 Routes & Pages
- **File**: `frontend/app/events/[slug]/page.tsx`
  - Server Component fetching event via `fetchEventBySlug(params.slug)`.
  - Generates dynamic Next.js `Metadata` (title, description).
  - Renders `<Header />`, `<EventDetail event={event} />`, `<Footer />`, and `<FloatingActions />`.
- **File**: `frontend/app/events/page.tsx`
  - Public events listing page displaying upcoming and past events in responsive grid cards.
  - Displays mode pill (`In-person`, `Online`, `In-person + Online`), date/time, address, and entry price.

### 1.2 Event Details Component (`EventDetail.tsx`)
- **File**: `frontend/components/events/EventDetail.tsx` (308 lines)
  - Client component (`'use client'`).
  - Contains two main visual sections:
    1. **Hero Banner** (`lines 143-169`):
       - Gradient background: `linear-gradient(160deg,#5A1827 0%,#8B1A2B 55%,#5A1827 100%)`.
       - Fixed single-image box: `h-48 w-full shrink-0 overflow-hidden rounded-2xl md:w-72`.
       - If `event.imageUrl` is present: renders single `<img src={resolveImageUrl(event.imageUrl)} />`.
       - If absent: renders `<CalendarDays className="h-14 w-14 text-[#E8C87A]" />` placeholder.
       - Text block: "Soil Goddess Event", title, date/time, Zoom link/venue address, seats left.
    2. **Main Grid Section** (`lines 171-305`):
       - Responsive 2-column layout: `grid gap-8 lg:grid-cols-[1fr_420px]`.
       - **Left Column** (`lines 173-176`): Currently *only* contains:
         ```tsx
         <div>
           <h2 className="font-serif text-2xl font-bold text-[#300D14]">About this event</h2>
           <p className="font-sans mt-4 whitespace-pre-line text-sm leading-7 text-[#5A4A3F]">{event.description || 'No description provided yet.'}</p>
         </div>
         ```
       - **Right Column (Sticky Aside)** (`lines 178-303`):
         - "Book your spot" booking card with mode switcher (In-person/Online), ticket quantity stepper, name/email/mobile fields, non-refundable policy checkbox, Razorpay payment handler.

### 1.3 Data Contract Gap (`frontend/lib/services/storefront.service.ts`)
Currently, `EventItem` in `storefront.service.ts` (`lines 121-140`) only defines:
```typescript
export type EventItem = {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  eventDate: string
  startTime: string
  endTime: string
  price: number
  mode: 'offline' | 'online' | 'both'
  venueAddress: string | null
  zoomLink: string | null
  capacity: number | null
  seatsLeft?: number
  isUpcoming: boolean
  isPast: boolean
  bookingClosed: boolean
  closesAt: string
}
```
**Required Update**: Must be extended with:
```typescript
  images?: string[] | null
  videoUrl?: string | null
```

### 1.4 Media URL Resolution & Next.js Image Config
- In `frontend/lib/api/client.ts`, `resolveImageUrl(url)` automatically handles:
  - Absolute URLs (`http://`, `https://`, `data:`).
  - Backend uploaded files (`/uploads/...`): Proxied via Next.js rewrites in `next.config.js` (`/uploads/:path*` -> `http://localhost:5005/uploads/:path*`).
  - Next.js public assets (e.g. `/borderdesign/...`).
- Using standard HTML `<img>` elements with `resolveImageUrl` (as in `SingleProductPage.tsx` and `EventDetail.tsx`) avoids Next.js `<Image>` unconfigured hostname runtime errors when external image URLs (Unsplash, CDNs, cloud storage) are provided.

---

## 2. Soil Goddess Theme & Luxury Styling Tokens

To maintain perfect brand consistency with Soil Goddess e-commerce guidelines:

| Element | Theme Value / Class | Description |
|---|---|---|
| **Primary Burgundy** | `#6B1A2A` / `var(--burgundy)` / `#8B1A2B` / `#5A1827` | Brand luxury core; primary buttons, active borders, accents |
| **Gold & Brass** | `#C29B57` / `#D9B86E` / `#E8C87A` / `#BF9A4B` | Borders, subtle highlights, active badges, icons, section accents |
| **Ivory & Creams** | `#FAF6EE` / `#FDFBF7` / `#F6EED8` / `#E8DCC4` | Background surfaces, card panels, borders, thumbnail containers |
| **Charcoal & Earth** | `#300D14` / `#5A4A3F` / `#2A1A1E` / `#7A6065` | Typography, readable descriptions, subtle captions |
| **Typography** | `font-serif` (headings), `font-sans` (body), `font-montserrat` (badges) | Luxury editorial typography hierarchy |
| **Shadows & Borders** | `border-[#D9B86E]/50`, `shadow-[0_8px_30px_rgba(107,26,42,0.06)]` | Soft, warm luxury elevations |

---

## 3. Detailed Architecture for R4

### 3.1 Feature 1: Interactive Multi-Image Gallery

#### A. Data Pipeline & Normalization
An event can have:
- `event.imageUrl` (string | null): The primary cover image.
- `event.images` (string[] | string | null): Gallery images array (or serialized JSON string from SQLite/MySQL).

The component normalizes this into a clean deduplicated array:
```typescript
function getNormalizedGalleryImages(event: EventItem): string[] {
  let galleryList: string[] = []
  if (Array.isArray(event.images)) {
    galleryList = event.images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
  } else if (typeof event.images === 'string') {
    try {
      const parsed = JSON.parse(event.images)
      if (Array.isArray(parsed)) {
        galleryList = parsed.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
      }
    } catch {
      if (event.images.trim()) galleryList = [event.images.trim()]
    }
  }

  const result: string[] = []
  if (event.imageUrl && typeof event.imageUrl === 'string' && event.imageUrl.trim()) {
    result.push(event.imageUrl.trim())
  }
  for (const img of galleryList) {
    if (!result.includes(img.trim())) {
      result.push(img.trim())
    }
  }
  return result
}
```

#### B. UI Presentation & Layout
The Multi-Image Gallery is placed prominently in the left column above "About this event" (or replacing the hero single-image card and anchoring the main story):
1. **Main High-Res Viewport**:
   - Aspect ratio: `aspect-[16/10]` on mobile, `aspect-[16/9]` on desktop.
   - Border: `rounded-2xl border border-[#D9B86E]/50 overflow-hidden bg-[#FAF6EE] shadow-[0_8px_30px_rgba(107,26,42,0.06)]`.
   - Hover zoom effect: `group-hover:scale-105 transition-transform duration-500`.
   - Floating controls:
     - **Previous / Next buttons**: Rounded pills `bg-white/85 hover:bg-white text-[#5A1827] border border-[#D9B86E]/60 shadow-md backdrop-blur-sm`, visible on hover or always on touch devices.
     - **Image Counter Badge**: Bottom-right translucent pill (`1 / 5`) in `bg-black/60 backdrop-blur-md text-[#FAF6EE] text-xs font-montserrat tracking-widest px-3 py-1 rounded-full`.
     - **Lightbox Enlarge Button**: Top-right button with `Maximize2` icon triggering a luxury full-screen lightbox modal.
2. **Thumbnail Switcher Strip**:
   - Positioned directly below main viewport.
   - Horizontal rail: `flex items-center gap-2.5 overflow-x-auto py-2.5 scrollbar-hide`.
   - Thumbnail buttons:
     - Inactive: `w-20 h-14 rounded-xl border border-[#E8DCC4] opacity-70 hover:opacity-100 hover:border-[#D9B86E] transition-all`.
     - Active: `border-2 border-[#8B1A2B] ring-2 ring-[#8B1A2B]/25 opacity-100 scale-105 shadow-md`.
     - Click or hover instantly sets the active index.
3. **Mobile Touch Carousel**:
   - Touch swipeable with CSS scroll snap (`snap-x snap-mandatory overflow-x-auto scrollbar-hide`).
   - Active index tracking with `onScroll` handler.
   - Bottom slide indicator dots showing active slide position.
4. **Graceful Fallbacks**:
   - **Single Image (`images.length === 1`)**: Displays the single photo cleanly without navigation buttons, thumbnail strip, or indicator dots.
   - **Zero Images (`images.length === 0`)**: Gallery component returns `null` (zero empty boxes). The hero section continues displaying its burgundy gradient placeholder with the `CalendarDays` icon.

---

### 3.2 Feature 2: Event Highlights & Video Glimpse Player

#### A. Universal Video URL Parser
Administrators can configure:
1. Direct video uploads (e.g. `/uploads/events/highlight.mp4`, `.webm`, `.mov`).
2. YouTube links: standard watch URLs (`youtube.com/watch?v=...`), short URLs (`youtu.be/...`), embed URLs (`youtube.com/embed/...`), and YouTube Shorts (`youtube.com/shorts/...`).
3. Vimeo links: standard (`vimeo.com/...`) and player embeds (`player.vimeo.com/video/...`).

The parser decomposes any URL:
```typescript
export type ParsedVideo = 
  | { type: 'youtube'; embedUrl: string }
  | { type: 'vimeo'; embedUrl: string }
  | { type: 'direct'; src: string }

export function parseEventVideo(url: string | null | undefined): ParsedVideo | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // YouTube match
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  )
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
    }
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(
    /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/
  )
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`
    }
  }

  // Direct video file or uploaded asset
  return {
    type: 'direct',
    src: resolveImageUrl(trimmed) || trimmed
  }
}
```

#### B. UI Presentation & Layout
- **Placement**: Directly below the "About this event" description in the left column.
- **Section Heading**:
  - Title: "Event Highlights & Glimpses" (`font-serif text-2xl font-bold text-[#300D14]`).
  - Subtitle: "A glimpse into our masterclasses, artistry, and live sessions" (`font-sans text-xs text-[#8A6D4B] mt-1`).
  - Visual accent: Gold divider line `border-t border-[#D9B86E]/40 my-8`.
- **Responsive Player Frame**:
  - Container: `relative w-full aspect-video rounded-2xl overflow-hidden border border-[#D9B86E]/50 bg-black shadow-[0_12px_36px_rgba(42,26,30,0.12)]`.
  - **If YouTube or Vimeo**: Responsive accessible `<iframe>` with `allowFullScreen`, `title`, and sandbox permissions.
  - **If Direct Video**: HTML5 `<video controls playsInline preload="metadata" poster={posterImage} className="w-full h-full object-contain">`.
- **Zero Voids Guarantee**:
  - If `!event.videoUrl || !parseEventVideo(event.videoUrl)`, the component returns `null`.
  - Zero margin, zero padding, zero divider line, zero DOM footprint when video is not present.

---

## 4. Component Structure & Modular Breakdown

To comply with the single-responsibility rule and maintain clean code:

```
frontend/
├── lib/
│   └── services/
│       └── storefront.service.ts      # Add `images?: string[] | null` & `videoUrl?: string | null` to EventItem
└── components/
    └── events/
        ├── EventGallery.tsx           # NEW: Dedicated interactive multi-image gallery & touch carousel
        ├── EventVideoPlayer.tsx       # NEW: Dedicated responsive video player for highlights & glimpses
        ├── EventDetail.tsx            # UPDATED: Incorporate EventGallery & EventVideoPlayer cleanly
        └── BookingConfirmation.tsx    # Existing booking confirmation screen
```

---

## 5. Responsive Design Matrix

| Breakpoint | Screen Size | Gallery Layout | Video Layout | Booking Aside |
|---|---|---|---|---|
| **Mobile** | `< 640px` | `aspect-[16/10]`, touch swipe snap, dot indicators, compact thumbnail row | Full width `aspect-video`, native controls | Follows below main content, full width |
| **Tablet** | `640px – 1023px` | `aspect-[16/9]`, left/right buttons, thumbnail rail with hover states | `aspect-video`, luxury gold border frame | Below main content or stacked |
| **Laptop** | `1024px – 1279px` | Left column (~600px), high-res viewport, thumbnails, lightbox trigger | In left column below "About this event", `aspect-video` | Sticky sidebar (`420px`), `top-6` |
| **Desktop** | `>= 1280px` | Left column (~700px), max clarity, smooth image transitions | In left column below "About this event", `aspect-video` | Sticky sidebar (`420px`), `top-6` |

---

## 6. Verification and Build Strategy

1. **Type Safety**:
   - `frontend/lib/services/storefront.service.ts` updated with optional `images` and `videoUrl`.
   - TypeScript compilation verified via `npm run build` in `frontend`.
2. **Defensive Edge Cases**:
   - `event.images` is `undefined` or `null` -> Handled without error.
   - `event.images` is JSON stringified array -> Safely parsed via try/catch.
   - `event.images` is empty array `[]` -> Handled gracefully.
   - `event.imageUrl` alone -> Renders clean single image fallback.
   - No images at all -> Renders hero placeholder, gallery returns `null`.
   - `event.videoUrl` is YouTube Shorts, standard, youtu.be, or Vimeo -> Parsed to correct embed player.
   - `event.videoUrl` is empty string or whitespace -> Gracefully returns `null` (zero voids).
3. **Build Command**:
   - `cd frontend && npm run build` (Must complete with 0 errors).
