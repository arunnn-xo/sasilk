# Original User Request

## 2026-09-02T10:12:30Z

Implement end-to-end transactional notifications for the Soil Goddess Event Booking and Masterclass registration flow, sending automated branded confirmation emails to both the Customer and Admin, as well as an automated WhatsApp confirmation message to the Customer upon successful booking creation.

Working directory: c:\sts-projects\sasilk
Integrity mode: development

## Requirements

### R1. Customer Booking Confirmation Email
When an event booking is confirmed (both for free events and paid Razorpay verified events), immediately dispatch a branded HTML confirmation email to the customer's email address (customerEmail).
- Include: Event Title, Event Date, Start & End Time, Mode (In-Person / Online).
- For in-person events: Venue Address and entry QR code image attachment.
- For online events: Zoom / Webinar joining link.
- Booking reference number (bookingNumber), quantity, total amount, and customer care contact.

### R2. Admin Booking Alert Email
Simultaneously send an alert email to the configured administrator (ADMIN_EMAIL / env.ADMIN_EMAIL).
- Include: Complete customer details (Name, Email, 10-digit Mobile Number), Booking Number, Event Name, Date/Time, Mode, Number of Seats, Amount Paid, and Payment ID / Status.

### R3. Customer WhatsApp Notification Service
Create a modular WhatsApp notification service (backend/node/src/services/whatsapp.service.ts) configurable via .env (supporting WhatsApp Cloud API / Webhook providers like Interakt, Aisensy, Wati, or Twilio).
- Automatically trigger an instant WhatsApp message to the customer's mobile number (customerMobile) with a personalized confirmation greeting, event details, booking number, and venue/zoom instructions.
- Provide a clean fallback / mock mode for local testing when credentials are not yet configured in .env.

### R4. Asynchronous & Resilient Dispatch
Notification delivery (Email and WhatsApp) must execute asynchronously in the background so third-party network latency or transient provider failures never delay or fail the core booking creation/payment verification API response. Include comprehensive error logging for debugging.

## Acceptance Criteria

### Customer Email Notification
- [ ] Branded HTML confirmation email sent to customer with all event details, QR code (for offline), or Zoom link (for online).

### Admin Email Notification
- [ ] Admin alert email dispatched to ADMIN_EMAIL with full customer contact info and booking details.

### WhatsApp Notification
- [ ] Automated WhatsApp message payload generated and sent to customer's mobile number upon booking confirmation.
- [ ] Service handles missing/invalid mobile numbers gracefully without throwing unhandled exceptions.

### System Integrity & Reliability
- [ ] Booking creation and payment verification endpoints return HTTP 200/201 without blocking or timing out.
- [ ] Both free events (total = 0) and paid events (verifyBookingPayment) trigger the full notification flow.
- [ ] Backend TypeScript build and test suite pass with zero errors.

## 2026-09-03T12:32:11Z

Enhance the Soil Goddess Event Management system to allow administrators to add multiple gallery images and an optional video glimpse for events, and display them seamlessly with an interactive gallery and video player on the storefront event details page.

Working directory: c:\sts-projects\sasilk
Integrity mode: development

## Requirements

### R1. Database Schema & Event Model
Extend the `events` table and Sequelize `Event` model to support:
- `images` (JSON array of image URL strings) preserving order for multiple gallery images alongside the primary `imageUrl`.
- `videoUrl` (`VARCHAR(512)`, nullable) for the optional video glimpse URL (supports uploaded video files or external streaming links such as YouTube/Vimeo).
Ensure migrations safely add these columns if missing without breaking existing event records.

### R2. Backend Admin & Storefront API
Update event controllers and validation schemas:
- Update `eventSchema` in `backend/node/src/modules/admin/controllers/event.controller.ts` to accept optional `images` (array of strings) and optional `videoUrl` (nullable string).
- Ensure `createEvent` and `updateEvent` persist `images` and `videoUrl`.
- Ensure public storefront event endpoints (`getEventBySlug`, `listEvents` in `backend/node/src/modules/events/events.controller.ts`) return `images` and `videoUrl`.

### R3. Admin Panel Event Form (`EventFormPage.tsx`)
Upgrade the Event Form in `backend/panel/src/pages/EventFormPage.tsx`:
- **Multiple Image Gallery Uploader**: Allow uploading and managing multiple gallery images (with thumbnail grid preview, "+ Add Image" button, individual remove button, and primary cover selection).
- **Optional Video Glimpse Section**: Provide a dedicated field for video glimpse (upload video file or paste video URL) with live embedded player preview so administrators can preview before publishing.

### R4. Storefront Event Detail Showcase (`EventDetail.tsx`)
Upgrade the event page in `frontend/components/events/EventDetail.tsx` and related components:
- **Interactive Multi-Image Gallery**: If multiple images exist, render an elegant thumbnail-switched gallery or touch-friendly carousel matching the Soil Goddess luxury aesthetic.
- **Event Highlights & Video Glimpse Player**: If `videoUrl` is present, display a dedicated "Event Highlights & Glimpses" section below "About this event" with a responsive video player.

## Acceptance Criteria

### Admin Panel Management
- [ ] Admin can upload and save multiple images for an event; thumbnails display with delete actions.
- [ ] Admin can optionally add a video glimpse (URL or upload) with preview in the form.
- [ ] Existing events without gallery images or videos load and save without regression.

### Storefront Experience
- [ ] Event details page (`/events/[slug]`) displays multiple gallery images with interactive switcher or carousel.
- [ ] When an event has a video glimpse, the video player renders responsively and plays smoothly.
- [ ] If an event has no video glimpse, the video section is gracefully hidden without empty voids.

### Build & Code Integrity
- [ ] Backend TypeScript build (`npm run build` in `backend/node`), Admin Panel build (`npm run build` in `backend/panel`), and Frontend Next.js build (`npm run build` in `frontend`) all pass with 0 errors.
