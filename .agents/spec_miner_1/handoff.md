# WhatsApp Notification & Transactional Alert Service Specification Report

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | WhatsApp Service | Modular WhatsApp Notification Engine (`whatsapp.service.ts`) | Core service module providing provider-agnostic WhatsApp notification dispatch for event registrations and bookings. | `EventBookingNotificationData` (customer name, mobile, email, booking number, event title, date, time, mode, quantity, total, venue address, zoom link) | `Promise<WhatsAppSendResult>` with `success`, `messageId`, `provider`, `timestamp` | Returns `{ success: false, error: string }` and logs without throwing unhandled exceptions. | `ORIGINAL_REQUEST.md` (R3, R4), `backend/node/src/services/` |
| 2 | WhatsApp Service | Configurable Multi-Provider Support & Adapter Layer | Adapter supporting Meta WhatsApp Cloud API (Graph API v20+), Third-party Webhook/Gateway providers (Interakt, Aisensy, Wati, Twilio), and Mock mode. | Provider credentials via `.env` (`WHATSAPP_PROVIDER`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_URL`, `WHATSAPP_API_KEY`) | Formatted provider-specific API payloads (`fetch` request to provider endpoint) | If provider credentials missing or endpoint returns HTTP error, gracefully fallback to mock mode or record error in logs. | `ORIGINAL_REQUEST.md` (R3), `backend/node/src/services/shiprocket.service.ts` |
| 3 | WhatsApp Service | Mock / Local Testing Provider | Local development mode that formats and logs the WhatsApp message payload directly to the console without making network calls. | Any valid or test booking payload | Logs payload formatted with header `[WhatsApp Mock]` and returns mock message ID | Always succeeds, zero network dependency. | `ORIGINAL_REQUEST.md` (R3) |
| 4 | WhatsApp Service | Mobile Number Sanitizer & E.164 Normalizer | Normalizes standard Indian 10-digit mobile numbers (`^[6-9]\d{9}$`), stripping formatting, dashes, spaces, leading zeroes, and standardizing to `91XXXXXXXXXX`. | Raw customer mobile string (e.g. `"9876543210"`, `"+91 98765 43210"`, `"09876543210"`) | Normalized E.164 formatted string (`"919876543210"`) or `null` if invalid | If mobile number is invalid or empty, returns `null` and logs warning `[WhatsApp] Invalid mobile number skipped`, avoiding API failure. | `backend/node/src/modules/events/events.controller.ts:99` |
| 5 | Message Templates | Customer WhatsApp Event Confirmation Template | Rich text WhatsApp message with branded header, emojis, booking number, event title, date, time range, ticket quantity, price, location/Zoom details, and customer care contact info. | Booking, Event, and Company Settings metadata | Formatted multiline WhatsApp text string | Handles missing optional fields with sensible fallbacks (e.g. "Venue: TBA", "Free Event"). | `ORIGINAL_REQUEST.md` (R1, R3), `backend/node/src/services/settings.service.ts` |
| 6 | Email Service | Branded Customer Booking Confirmation Email | HTML confirmation email dispatched to `customerEmail` with Soil Goddess branding, event metadata, entry pass QR code image (for offline mode) or Zoom webinar link (for online mode), and support contacts. | Customer email, booking details, event details, company info | NodeMailer SMTP dispatch with inline QR code CID attachment or data URL | Logs `[Email] Failed to send booking confirmation: <err>` without blocking HTTP caller. | `ORIGINAL_REQUEST.md` (R1), `backend/node/src/services/email.service.ts` |
| 7 | Email Service | Admin Booking Alert Email | Instant administrative email alert dispatched to `ADMIN_EMAIL` containing customer contact details (Name, Email, 10-digit Mobile), Booking ID, Event Name, Date/Time, Seats, Amount, and Payment ID. | Booking payload, admin email address (`env.ADMIN_EMAIL`), company info | NodeMailer plain-text / HTML alert email to admin | Logs `[Email] Failed to send admin booking alert: <err>` without blocking HTTP caller. | `ORIGINAL_REQUEST.md` (R2), `backend/node/src/services/email.service.ts:676` |
| 8 | Async Execution | Resilient Background Dispatcher | Non-blocking asynchronous dispatch pipeline using `Promise.allSettled` / `setImmediate` ensuring email and WhatsApp notifications run in the background after booking confirmation. | Booking ID, payment transaction ID | Detached async execution returning immediate HTTP 200/201 to the client | Individual failures are caught, logged, and isolated so one channel failure (e.g. WhatsApp) does not affect others (e.g. Email). | `ORIGINAL_REQUEST.md` (R4), `backend/node/src/services/price-drop.service.ts:60` |
| 9 | Lifecycle & Idempotency | Dual Confirmation Trigger (Free vs Paid Booking) | Handles confirmation triggers from both free event bookings (`POST /api/events/:slug/book` when `total <= 0`) and paid bookings (`POST /api/events/bookings/:id/verify` or Razorpay webhook). | Booking ID, payment ID (`null` or `razorpayPaymentId`) | Database update to `paymentStatus = 'paid'` and one-time notification dispatch | Idempotency guard (`if (booking.paymentStatus === 'paid') return`) prevents duplicate notifications if both verification API and webhook trigger. | `backend/node/src/modules/events/events.controller.ts:271`, `backend/node/src/modules/webhook/webhook.routes.ts:196` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Mobile Normalization | 10-digit Indian number `"9876543210"` | Sanitizer prepends country code `91` -> `"919876543210"`. |
| 2 | Mobile Normalization | Number with +91 prefix `"+91 98765 43210"` | Sanitizer strips `+` and whitespace -> `"919876543210"`. |
| 3 | Mobile Normalization | Number with leading zero `"09876543210"` | Sanitizer strips leading `0` and adds `91` -> `"919876543210"`. |
| 4 | Mobile Normalization | Empty / Malformed mobile `"12345"` or `null` | Sanitizer returns `null`; WhatsApp dispatcher logs warning and skips WhatsApp delivery gracefully without crashing or throwing. |
| 5 | Free Event (Price = 0) | Booking with `total = 0` / free event | Automatically marked `paid` in `createBooking`; email and WhatsApp display "Amount: ₹0 (Free Event)", Admin alert notes payment ID as "N/A (Free Event)". |
| 6 | Paid Event (Unpaid / Abandoned) | Booking created with `paymentStatus = 'pending'` | No notifications are dispatched at creation time; notifications are deferred until payment verification succeeds, preventing spam for abandoned checkouts. |
| 7 | Offline Event Mode | Booking with `mode = 'offline'` | Entry QR pass generated via `QRCode.toDataURL()`, embedded in customer email, venue address included in email and WhatsApp; Zoom link excluded. |
| 8 | Online Event Mode | Booking with `mode = 'online'` | Zoom joining link included in email and WhatsApp; QR code image and venue address excluded. |
| 9 | Missing Zoom Link / TBA Venue | Online event where `zoomLink` is empty or Offline where `venueAddress` is empty | Template uses fallback text: *"Webinar link will be shared prior to the session"* / *"Venue: Details will be announced shortly"*, preventing broken links or `undefined` text. |
| 10 | Third-Party Provider Downtime | Meta Cloud API or Webhook returns HTTP 500 or network timeout | Async worker catches exception, logs `[WhatsApp:Error]` with status code and error body, and does not affect the client API response (HTTP 200/201). |
| 11 | Duplicate Webhook / Verification Call | Both `/bookings/:id/verify` and Razorpay `payment.captured` webhook execute | `confirmPaidBooking` checks `if (booking.get('paymentStatus') === 'paid') return`, ensuring notifications are dispatched exactly once. |

---

# 5-Component Handoff Report

## 1. Observation
- **Codebase & Runtime**: `backend/node` uses Node.js (v20+), TypeScript 5.5.3 (`"target": "ES2022"`, `"module": "NodeNext"`), Express 4.19.2, Sequelize 6.37.3 (MySQL), NodeMailer 8.0.10, and `zod` 3.23.8.
- **Compilation**: Verified TypeScript compilation with `npx tsc --noEmit` which exits cleanly with code 0.
- **Current Event Booking Flow**:
  - `backend/node/src/modules/events/events.controller.ts`:
    - Line 96-102: `bookSchema` validates `customerName`, `customerEmail`, `customerMobile: z.string().regex(/^[6-9]\d{9}$/)`, `mode: z.enum(['offline', 'online'])`, `quantity`.
    - Line 184-201: Free bookings (`total <= 0`) call `await confirmPaidBooking(booking.get('id'), null)`.
    - Line 268-307: `confirmPaidBooking(bookingId, razorpayPaymentId)` generates QR code for offline events, updates status to `'paid'`, and calls `sendGeneralEmail(...)`. Currently, it does not send a dedicated branded booking confirmation email, does not send an admin alert email, and has no WhatsApp notification service integration.
    - Line 340-379: `verifyBookingPayment` verifies Razorpay HMAC signature and calls `confirmPaidBooking(bookingId, razorpayPaymentId)`.
  - `backend/node/src/modules/webhook/webhook.routes.ts`:
    - Line 191-201: Razorpay `payment.captured` webhook calls `confirmPaidBooking(bookingId, payment.id)`.
- **Configuration & Environment**:
  - `backend/node/src/config/env.ts` defines schema with `zod`. Currently contains `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_EMAIL`, `FRONTEND_URL`, `API_URL`, etc., but lacks WhatsApp-specific environment keys.
- **Company Info Service**:
  - `backend/node/src/services/settings.service.ts`: `getCompanyInfo()` provides store name (`"Soil Goddess"` / `"Threads of TN"`), support `phone`, support `email`, `address`, and `logoUrl`.

## 2. Logic Chain
1. **Zero-Latency Requirement**: Per `ORIGINAL_REQUEST.md` (R4), notification delivery must execute in the background so that network latency or failures from SMTP or WhatsApp APIs never delay the HTTP response of `createBooking` or `verifyBookingPayment`.
2. **Provider Agility**: Per R3, WhatsApp delivery must support Meta WhatsApp Cloud API, generic webhooks/aggregators (Aisensy, Interakt, Wati, Twilio), and an automatic fallback/mock mode when `.env` credentials are not yet configured.
3. **Number Normalization**: Customer mobile numbers are captured as 10 digits (`^[6-9]\d{9}$`). WhatsApp providers require international format (e.g. `91XXXXXXXXXX`). A dedicated normalizer is required to sanitize and format numbers, with graceful skip handling for invalid or missing inputs.
4. **Notification Parity**: Both free events (`total <= 0`) and paid events (via `verifyBookingPayment` or webhook) must trigger the full tripartite notification flow: (1) Customer Branded Email with QR/Zoom link, (2) Admin Alert Email, (3) Customer WhatsApp Message.

## 3. Caveats
- Meta WhatsApp Cloud API requires pre-approved message templates if messaging customers outside a 24-hour service window. For transactional confirmation, using standard text or pre-approved template structures ensures compatibility across both development and production.
- Database transactions in Sequelize should commit before triggering detached background notification dispatches to ensure the database record is in its final state when read by the background worker.

## 4. Conclusion
- A new modular service `backend/node/src/services/whatsapp.service.ts` should be introduced with full provider adaptation (Meta Cloud API, Webhook/Aggregator, Mock mode), E.164 normalization, and comprehensive logging.
- `backend/node/src/config/env.ts` should be augmented with WhatsApp environment variables (`WHATSAPP_ENABLED`, `WHATSAPP_PROVIDER`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_API_URL`, `WHATSAPP_API_KEY`, `WHATSAPP_TEMPLATE_NAME`).
- `backend/node/src/services/email.service.ts` should be expanded to include dedicated branded helpers: `sendEventBookingConfirmationEmail` (customer HTML confirmation with QR code / Zoom link) and `sendAdminEventBookingAlert` (admin notification with complete customer contact info and booking details).
- `confirmPaidBooking` in `events.controller.ts` should coordinate asynchronous dispatch of customer email, admin email, and customer WhatsApp message with non-blocking resilience (`Promise.allSettled`).

## 5. Verification Method
1. **TypeScript Build**: Run `npx tsc --noEmit` in `backend/node` to confirm zero type errors.
2. **Unit / Integration Tests**: Execute standalone test scripts using `tsx` (e.g. `npx tsx scripts/test-notifications.ts`) verifying:
   - Phone number normalization (10-digit, +91, invalid strings).
   - WhatsApp template rendering for online and offline modes.
   - WhatsApp mock provider execution and payload logging.
   - Asynchronous error handling when third-party endpoints fail.
