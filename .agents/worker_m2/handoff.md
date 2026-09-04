# Handoff Report: Worker M2 — Event Booking Transactional Emails

## 1. Observation
- **Target File**: `backend/node/src/services/email.service.ts`
- **Initial State**:
  - Missing dedicated transactional email functions for Event Bookings.
  - Event confirmations previously invoked `sendGeneralEmail()`, which used a marketing campaign template with unsubscribe footers and embedded base64 data URLs for QR codes (blocked by email clients like Gmail and Apple Mail).
  - No admin alert notification function existed for event bookings.
- **Implemented Functions**:
  1. `sendEventBookingConfirmationEmail(to, booking, event, company)` (Lines 1918–2168)
  2. `sendAdminEventBookingAlert(to, booking, event, company)` (Lines 2172–2334)
  3. `sendAdminEventBookingAlertEmail` alias export (Line 2336)
  4. Helper functions: `escapeEmailHtml`, `formatEventDate`, `formatEventTime`, `formatTimeSlot` (Lines 1871–1914)
  5. Top-level import: `import QRCode from 'qrcode'` (Line 2)

---

## 2. Logic Chain
1. **Branded Customer Confirmation (`sendEventBookingConfirmationEmail`)**:
   - Uses `wrapInEmailTemplate` with brand palette: `#6B1A2A` maroon header and buttons, `#FBF9F6` luxury cream background, `#e8dcc4` sand borders, and `#C29B57` gold accents.
   - Displays event name, formatted date (e.g., `Saturday, 15 Sep 2026`), time slot (e.g., `10:00 AM – 1:00 PM IST`), booking reference number, seat count, and total amount paid (`₹...` or `FREE`).
   - For **In-Person / Offline events (`mode === 'offline'`)**:
     - Generates high-resolution PNG buffer via `QRCode.toBuffer(qrToken, { type: 'png', width: 300, margin: 2, color: { dark: '#300D14', light: '#FFFFFF' } })`.
     - Embeds as inline CID attachment (`cid:entry_qr`) in the HTML card (`<img src="cid:entry_qr" />`) for cross-client rendering.
     - Adds downloadable file attachment `entry-pass-${bookingNumber}.png`.
     - Renders Venue Location card with address and entry instructions.
   - For **Online / Live Webinar events (`mode === 'online'`)**:
     - Renders a prominent "Join Live Session →" CTA button linked to `booking.zoomLink || event.zoomLink`.
     - Displays direct URL fallback and recommended preparation tip.
   - Embeds Customer Care support section with phone, email, and operating hours (`Mon – Sat, 9:30 AM – 6:30 PM IST`).
   - Includes full plain-text fallback for non-HTML email clients.
   - Safely guards unconfigured SMTP (`!env.EMAIL_USER || !env.EMAIL_PASS`) and wraps execution in try/catch to prevent unhandled exceptions.

2. **Admin Booking Alert (`sendAdminEventBookingAlert`)**:
   - Dispatches to `to` parameter (defaulting to `env.ADMIN_EMAIL`).
   - Presents a clean two-card table layout:
     - **Customer Information**: Full Name, Email, and 10-digit Mobile Number.
     - **Booking & Event Details**: Booking Number, Event Name, Date & Time, Mode, Quantity (Seats Reserved), Amount Paid, Payment ID (`razorpayPaymentId` or "Free Registration"), Payment Status, and Booking Timestamp.
   - Includes full plain-text fallback and graceful unconfigured SMTP handling.

---

## 3. Caveats
- If `EMAIL_USER` or `EMAIL_PASS` is empty in `.env`, emails are cleanly skipped with `console.warn` logging as per existing project conventions.
- For offline events where `qrToken` is not preset, the function automatically derives a fallback token `SOILGODDESS-EV-${bookingNumber}`.

---

## 4. Conclusion
The transactional email infrastructure for Soil Goddess event bookings is fully implemented, strictly typed, compliant with brand design requirements, and ready for integration by upstream controllers.

---

## 5. Verification Method
1. **Code Review**:
   - Inspect `backend/node/src/services/email.service.ts`:
     - Line 2: `import QRCode from 'qrcode'`
     - Lines 1918–2168: `sendEventBookingConfirmationEmail`
     - Lines 2172–2334: `sendAdminEventBookingAlert`
     - Line 2336: `export const sendAdminEventBookingAlertEmail = sendAdminEventBookingAlert`
2. **Build Verification**:
   - Run `npm run build` in `backend/node` to confirm zero TypeScript compile errors.
