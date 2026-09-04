# Codebase Investigation Report — Event Booking & Notification Architecture

**Author**: Explorer 1  
**Date**: 2026-09-02  
**Target Project**: Soil Goddess / Threads of TN (`c:\sts-projects\sasilk`)  
**Scope**: Event Booking & Masterclass Registration Endpoints, Schemas, Confirmation Flow, and Async/Error Infrastructure.

---

## 1. Observation

### 1.1 Routes & Controller Architecture
- **Route registration**: In `backend/node/src/routes/index.ts` (lines 13, 26):
  ```typescript
  import eventsRoutes from '../modules/events/events.routes.js'
  ...
  router.use('/storefront/events', eventsRoutes)
  ```
- **Storefront Event Routes**: In `backend/node/src/modules/events/events.routes.ts` (lines 8–18):
  - `GET /storefront/events` → `eventsController.listEvents`
  - `GET /storefront/events/my-bookings` → `requireCustomerAuth, eventsController.getMyBookings`
  - `POST /storefront/events/bookings/:bookingId/verify` → `eventsController.verifyBookingPayment`
  - `GET /storefront/events/bookings/:bookingId` → `eventsController.getBooking`
  - `GET /storefront/events/:slug` → `eventsController.getEventBySlug`
  - `POST /storefront/events/:slug/book` → `optionalCustomerAuth, eventsController.createBooking`
- **Admin Event Routes**: In `backend/node/src/modules/admin/admin.routes.ts` (controller: `backend/node/src/modules/admin/controllers/event.controller.ts`):
  - `GET /admin/events` → `listEvents`
  - `POST /admin/events` → `createEvent`
  - `GET /admin/events/:id` → `getEvent`
  - `PUT /admin/events/:id` → `updateEvent`
  - `DELETE /admin/events/:id` → `deleteEvent`
  - `GET /admin/events/:id/bookings` → `listBookings`
  - `POST /admin/events/check-in` → `checkIn` (verifies entry QR token)
  - `PATCH /admin/events/bookings/:bookingId/toggle-check-in` → `toggleCheckIn`
- **Razorpay Webhook Route**: In `backend/node/src/modules/webhook/webhook.routes.ts` (lines 191–201):
  - On `payment.captured`, queries `EventBooking.findOne({ where: { razorpayOrderId, paymentStatus: 'pending' } })` and calls `confirmPaidBooking(bookingId, payment.id)`.

### 1.2 Event & EventBooking Models & Schema
Defined in `backend/node/src/models/index.ts` (lines 502–541) and migrated in `backend/node/src/database/migrate.ts` (lines 789–837):
- **`Event` (`tableName: 'events'`)**:
  - `id`: `INTEGER.UNSIGNED` (PK, autoIncrement)
  - `name`: `STRING(180)`, `allowNull: false`
  - `slug`: `STRING(200)`, `allowNull: false`, `unique: true`
  - `description`: `TEXT`, `allowNull: true`
  - `imageUrl` (`image_url`): `STRING(255)`, `allowNull: true`
  - `eventDate` (`event_date`): `DATEONLY`, `allowNull: false` (Format: `YYYY-MM-DD`)
  - `startTime` (`start_time`): `STRING(10)`, `allowNull: false` (Format: `HH:MM`, 24h)
  - `endTime` (`end_time`): `STRING(10)`, `allowNull: false` (Format: `HH:MM`, 24h)
  - `price`: `DECIMAL(12, 2)`, `defaultValue: 0`
  - `mode`: `ENUM('offline', 'online', 'both')`, `defaultValue: 'both'`
  - `venueAddress` (`venue_address`): `TEXT`, `allowNull: true`
  - `zoomLink` (`zoom_link`): `STRING(512)`, `allowNull: true`
  - `capacity`: `INTEGER.UNSIGNED`, `allowNull: true`
  - `isActive` (`is_active`): `BOOLEAN`, `defaultValue: true`
  - `deletedAt` (`deleted_at`): `DATE`, paranoid soft-delete
- **`EventBooking` (`tableName: 'event_bookings'`)**:
  - `id`: `INTEGER.UNSIGNED` (PK, autoIncrement)
  - `bookingNumber` (`booking_number`): `STRING(80)`, `unique: true`, generated as `EV-<timestamp36>-<hex3>`
  - `eventId` (`event_id`): `INTEGER.UNSIGNED` (FK -> `events.id`)
  - `customerId` (`customer_id`): `INTEGER.UNSIGNED`, `allowNull: true` (FK -> `customers.id`)
  - `customerName` (`customer_name`): `STRING(140)`, `allowNull: false`
  - `customerEmail` (`customer_email`): `STRING(190)`, `allowNull: false`
  - `customerMobile` (`customer_mobile`): `STRING(32)`, `allowNull: false` (validated via `/^[6-9]\d{9}$/`)
  - `mode`: `ENUM('offline', 'online')`, `allowNull: false`
  - `quantity`: `INTEGER.UNSIGNED`, `defaultValue: 1`
  - `unitPrice` (`unit_price`): `DECIMAL(12, 2)`, `allowNull: false`
  - `total`: `DECIMAL(12, 2)`, `allowNull: false`
  - `paymentStatus` (`payment_status`): `ENUM('pending', 'paid', 'failed', 'refunded')`, `defaultValue: 'pending'`
  - `razorpayOrderId` (`razorpay_order_id`): `STRING(120)`, `allowNull: true`
  - `razorpayPaymentId` (`razorpay_payment_id`): `STRING(120)`, `allowNull: true`
  - `qrToken` (`qr_token`): `STRING(255)`, `unique: true`, generated as `SOILGODDESS-EV-<hex12>`
  - `qrImage` (`qr_image`): `TEXT`, Base64 PNG data URL generated via `QRCode.toDataURL(qrToken, { margin: 1 })`
  - `zoomLink` (`zoom_link`): `STRING(512)`, `allowNull: true`
  - `checkedIn` (`checked_in`): `BOOLEAN`, `defaultValue: false`
  - `checkInAt` (`check_in_at`): `DATE`, `allowNull: true`
  - `refundedAt` (`refunded_at`): `DATE`, `allowNull: true`

### 1.3 Booking Confirmation Execution Paths
Central function: `confirmPaidBooking(bookingId: number, razorpayPaymentId: string)` in `backend/node/src/modules/events/events.controller.ts` (lines 268–307).

Three distinct triggers execute `confirmPaidBooking`:
1. **Free Event Booking (`total <= 0`)**:
   - In `createBooking` (`events.controller.ts:184-201`):
     ```typescript
     if (total <= 0) {
       let booking: any
       try {
         booking = await sequelize.transaction(async (t) => reserveSeat(t))
       } catch (err) { ... }
       await confirmPaidBooking(booking.get('id') as number, null as any)
       res.status(201).json({ bookingId: booking.get('id'), bookingNumber, razorpayOrderId: null, amount: 0, currency: 'INR', status: 'confirmed' })
       return
     }
     ```
2. **Paid Event Storefront Client Verification (`POST /storefront/events/bookings/:bookingId/verify`)**:
   - In `verifyBookingPayment` (`events.controller.ts:340-379`):
     - Validates Razorpay HMAC signature (`verifyRazorpayPayment`).
     - Matches `razorpayOrderId`.
     - Calls `await confirmPaidBooking(bookingId, razorpayPaymentId)`.
     - Returns fresh booking status with `qrImage`/`qrToken` or `zoomLink`.
3. **Razorpay Webhook Verification (`POST /webhook`)**:
   - In `webhook.routes.ts` (lines 191–201):
     - Catches `payment.captured` event.
     - Finds pending `EventBooking` by `razorpayOrderId`.
     - Calls `await confirmPaidBooking(bookingId, payment.id)`.

### 1.4 Existing Notifications & Shortcomings
Inside `confirmPaidBooking` (`events.controller.ts:289-306`):
```typescript
sendGeneralEmail(
  bookingPlain.customerEmail,
  bookingPlain.customerName,
  {
    subject: `Booking Confirmed – ${event?.name ?? 'Event'} (${bookingPlain.bookingNumber})`,
    content: buildBookingConfirmationHtml({
      ...bookingPlain,
      zoomLink: event?.zoomLink ?? null,
      eventName: event?.name ?? 'Event',
      eventDate: event?.eventDate ?? '',
      startTime: event?.startTime ?? '',
      endTime: event?.endTime ?? '',
      venueAddress: event?.venueAddress ?? null,
    }),
  },
).catch((err: any) => {
  console.error('[Events] Confirmation email failed:', err?.message)
})
```
**Deficiencies Identified**:
- **Bug in QR Code Rendering**: `bookingPlain` was captured *before* `booking.update(updates)`. Therefore, `bookingPlain.qrImage` was undefined when passing to `buildBookingConfirmationHtml`, causing QR images to be omitted in the email.
- **No Dedicated Branded Customer Email**: Currently relies on basic `sendGeneralEmail` instead of a dedicated, high-converting HTML template (`sendEventBookingConfirmationEmail`) matching the brand design system.
- **No Admin Alert Email**: Admin is never notified when an event or masterclass is booked.
- **No WhatsApp Notification**: No integration with WhatsApp service; customer mobile number is collected but no message is sent.

### 1.5 Async & Error Handling Architecture
- **Async route wrapper**: `asyncHandler` (`backend/node/src/utils/http.ts:12-18`) wraps all Express async handlers and forwards rejections to `next(err)`.
- **Global Error Handler**: `errorHandler` (`backend/node/src/middleware/error-handler.ts`) cleanly handles `ZodError` (422), `AppError` (custom HTTP codes), Sequelize constraints (409), and 500s.
- **Fire-and-forget notification pattern**: Followed across the backend (e.g. `order.controller.ts:275-292`), where notification promises (`sendOrderConfirmationEmail`, `sendAdminOrderNotification`) are triggered asynchronously without `await` in the HTTP response path, preventing third-party latency from blocking API responses.
- **Build Verification**: `npm run build` (`tsc -p tsconfig.json`) runs cleanly with exit code 0.

---

## 2. Logic Chain

1. **Endpoint & Flow Completeness**:
   - The codebase has a fully functioning event booking API structure for both free (`total = 0`) and paid bookings (`Razorpay` order + verification + webhook).
   - Because all three confirmation paths converge in `confirmPaidBooking(bookingId, razorpayPaymentId)`, hooking notifications inside or immediately after `confirmPaidBooking` guarantees 100% notification coverage across free registrations, client-side Razorpay verifications, and background webhook captures.

2. **Idempotency & Double Dispatch Protection**:
   - `confirmPaidBooking` checks `if (booking.get('paymentStatus') === 'paid') return`.
   - Any notification dispatch triggered inside `confirmPaidBooking` will execute exactly once per confirmed booking, even if both the storefront client and the Razorpay webhook attempt verification concurrently.

3. **Email Notification Synthesis**:
   - `email.service.ts` provides `transporter` and `wrapInEmailTemplate` with CID logo support and company branding (using `getCompanyInfo()` from `settings.service.ts`).
   - We need to add two new dedicated functions in `email.service.ts`:
     1. `sendEventBookingConfirmationEmail(to, booking, event, company)` — rich branded HTML containing QR code (inline image or CID attachment for offline events), Zoom join link (for online events), date/time, ticket quantity, booking number, total amount, and customer care details.
     2. `sendAdminEventBookingAlert(to, booking, event, company)` — alert to `env.ADMIN_EMAIL` with full customer details (`customerName`, `customerEmail`, `customerMobile`), booking number, seat count, payment status, and amount.

4. **WhatsApp Service Architecture (`services/whatsapp.service.ts`)**:
   - We need a modular WhatsApp service that:
     - Formats / sanitizes mobile numbers to E.164 (`+91...` for 10-digit Indian numbers).
     - Provides a clean fallback / mock mode when API keys are not provided in `.env`, logging structured payloads with zero runtime errors.
     - Can be configured via `.env` for WhatsApp Cloud API or webhook providers.
     - Produces personalized message strings containing Customer Name, Event Title, Booking Number, Date/Time, Venue / Zoom link, and Support info.

5. **Asynchronous Dispatch & Error Resilience**:
   - In `confirmPaidBooking`, notifications should be wrapped in an asynchronous non-blocking dispatcher `dispatchBookingNotifications(bookingPlain, eventPlain)`.
   - Any individual provider error (SMTP failure, WhatsApp network timeout) must be caught and logged via `console.error` without throwing unhandled rejections or delaying the API response.

---

## 3. Caveats

- **Network Mode**: In local development / offline environments, SMTP credentials and WhatsApp API credentials in `.env` may be blank or placeholders. Both email and WhatsApp services must gracefully detect unconfigured credentials, log informative mock/debug messages, and return cleanly without throwing errors.
- **QR Code Storage**: `qrImage` is stored in the database as a Base64 data URL. In email clients, some providers block data URLs; attaching the QR code buffer as a CID attachment or rendering inline ensures maximum email client compatibility.

---

## 4. Conclusion

The existing backend architecture is well-structured and ready for notification implementation:
1. All event routes (`/api/storefront/events/:slug/book`, `/api/storefront/events/bookings/:bookingId/verify`, and `/api/webhook`) converge on a single idempotent function: `confirmPaidBooking` in `backend/node/src/modules/events/events.controller.ts`.
2. All required data fields (`customerName`, `customerEmail`, `customerMobile`, `bookingNumber`, `mode`, `quantity`, `total`, `venueAddress`, `zoomLink`, `qrImage`, `qrToken`) are present in `Event` and `EventBooking` models.
3. Adding dedicated functions in `email.service.ts`, creating `whatsapp.service.ts`, and wiring asynchronous non-blocking dispatches in `confirmPaidBooking` will completely fulfill requirements R1, R2, R3, and R4.

---

## 5. Verification Method

1. **Type Safety & Build Verification**:
   ```powershell
   cd c:\sts-projects\sasilk\backend\node
   npm run build
   ```
   Must compile with 0 TypeScript errors.

2. **Code Inspection**:
   - Verify `confirmPaidBooking` in `backend/node/src/modules/events/events.controller.ts` calls both email functions and whatsapp service asynchronously.
   - Verify `sendEventBookingConfirmationEmail` and `sendAdminEventBookingAlert` in `backend/node/src/services/email.service.ts`.
   - Verify `sendBookingConfirmationWhatsApp` in `backend/node/src/services/whatsapp.service.ts`.

3. **Invalidation Conditions**:
   - Any change that alters the signature of `createBooking` or `verifyBookingPayment` without maintaining backward compatibility.
   - Any synchronous `await` on email/WhatsApp dispatch that delays HTTP responses.
