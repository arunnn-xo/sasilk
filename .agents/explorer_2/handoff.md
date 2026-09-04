# Investigation Report: Backend Email Infrastructure, Transactional Notifications, and Event Booking Flow

## 1. Observation

### 1.1 Environment Configuration & Admin Settings
- **File**: `backend/node/src/config/env.ts`
  - Lines 24–29:
    ```typescript
    ADMIN_EMAIL: z.string().email().default('admin@threadsoftn.com'),
    ADMIN_PASSWORD: z.string().min(8),
    EMAIL_HOST: z.string().optional().default(''),
    EMAIL_PORT: z.coerce.number().default(587),
    EMAIL_USER: z.string().optional().default(''),
    EMAIL_PASS: z.string().optional().default(''),
    ```
  - `ADMIN_EMAIL` is typed with Zod, defaults to `'admin@threadsoftn.com'`, and is accessible via `env.ADMIN_EMAIL`.
  - SMTP credentials are in `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`.

### 1.2 Nodemailer Transporter & Base Email Layout
- **File**: `backend/node/src/services/email.service.ts`
  - Lines 12–20: Transporter initialization:
    ```typescript
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST || 'smtp.gmail.com',
      port: env.EMAIL_PORT || 587,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_USER || '',
        pass: env.EMAIL_PASS || '',
      },
    })
    ```
  - Lines 31–34: Sender formatting:
    ```typescript
    function emailFrom(companyName: string) {
      const fromEmail = env.EMAIL_USER || 'hello@threadsoftn.com'
      return `"${companyName}" <${fromEmail}>`
    }
    ```
  - Lines 52–72: Logo resolution using `cid:logo` inline attachment from local filesystem (`uploads/threads-of-tn-logo.png` or `public/logo.png`) or `company.logoUrl`.
  - Lines 74–108: `wrapInEmailTemplate(contentHtml, previewText, logoExists, companyName)` provides the primary responsive email layout:
    - Max-width 600px container (`.email-container`).
    - Background `#f8f5f0`, card `#ffffff` with border `#e8dcc4` and radius 12px.
    - Header background `#FBF9F6`, border-bottom 3px solid `#6B1A2A` (brand maroon).
    - Inline logo image `<img src="cid:logo" ... />` or serif text `<h1 class="logo-text">`.
    - Footer with automated notification notice and dynamic year copyright.

### 1.3 Existing Transactional Emails
- **File**: `backend/node/src/services/email.service.ts`
  - `sendOtpEmail(to, otp)` (lines 110–154): Sends 6-digit OTP inside a styled monospace box.
  - `sendOrderConfirmationEmail(to, order, company)` (lines 486–672): Sends customer confirmation with item table, attribute chips (color, size), GST breakdown, shipping address card, CTA button, plain-text fallback, and logo attachment.
  - `sendAdminOrderNotification(to, order, company)` (lines 676–709): Sends new order summary to `ADMIN_EMAIL`.
  - Order lifecycle emails (`sendPackingEmail`, `sendShippingEmail`, `sendOutForDeliveryEmail`, `sendDeliveryEmail`, `sendCancellationEmail`, `sendRtoEmail`, `sendReturnedEmail`) all follow the `wrapInEmailTemplate` pattern.
  - All transactional email functions guard with `if (!env.EMAIL_USER || !env.EMAIL_PASS) return` (or log a warning) to avoid crashing when credentials are not configured.

### 1.4 Current Event Booking Confirmation Implementation
- **File**: `backend/node/src/modules/events/events.controller.ts`
  - Lines 268–307:
    ```typescript
    export async function confirmPaidBooking(bookingId: number, razorpayPaymentId: string): Promise<void> {
      const booking = await EventBooking.findByPk(bookingId, { include: [{ model: Event, as: 'event' }] })
      if (!booking) throw new AppError(404, 'Booking not found.')
      if (booking.get('paymentStatus') === 'paid') return

      const event: any = booking.get('event')
      const bookingPlain = booking.get({ plain: true }) as any
      const updates: Record<string, unknown> = {
        paymentStatus: 'paid',
        razorpayPaymentId,
      }

      if (bookingPlain.mode === 'offline') {
        const qrToken = `SOILGODDESS-EV-${randomBytes(12).toString('hex').toUpperCase()}`
        const qrImage = await QRCode.toDataURL(qrToken, { margin: 1 })
        updates.qrToken = qrToken
        updates.qrImage = qrImage
      }

      await booking.update(updates)

      sendGeneralEmail(
        bookingPlain.customerEmail,
        bookingPlain.customerName,
        {
          subject: `Booking Confirmed – ${event?.name ?? 'Event'} (${bookingPlain.bookingNumber})`,
          content: buildBookingConfirmationHtml({ ... }),
        },
      ).catch((err: any) => {
        console.error('[Events] Confirmation email failed:', err?.message)
      })
    }
    ```
  - **Deficiencies Identified**:
    1. It currently invokes `sendGeneralEmail()`, which is a marketing campaign template containing an "Unsubscribe from marketing emails" footer and marketing styling.
    2. QR code is currently rendered via inline base64 data URL (`<img src="${data.qrImage}" />`). Most major email clients (Gmail, Outlook, Apple Mail) suppress or block embedded base64 data URLs.
    3. No Admin notification email is dispatched when an event booking is confirmed.
    4. Missing customer care contact details, venue cards, and branded luxury styling.

### 1.5 QR Code Capabilities & Dependencies
- **File**: `backend/node/package.json`
  - Line 31: `"qrcode": "^1.5.4"`
  - Line 50: `"@types/qrcode": "^1.5.6"`
  - `qrcode` is already installed and typed.
  - `QRCode.toBuffer(text, { type: 'png', width: 300, margin: 2 })` creates a binary PNG Buffer, suitable for nodemailer CID attachments.

---

## 2. Logic Chain

1. **Email Architecture & Consistency**:
   - The backend uses `nodemailer` configured in `src/services/email.service.ts` with a standardized header/footer template (`wrapInEmailTemplate`).
   - The existing order emails use brand colors (`#6B1A2A` maroon, `#FBF9F6` cream, `#e8dcc4` sand border, `#C29B57` gold) and embed `cid:logo`.
   - Creating dedicated functions `sendEventBookingConfirmationEmail` and `sendAdminEventBookingAlertEmail` directly inside `email.service.ts` maintains single-responsibility, shares the logo attachment resolver, and respects existing SMTP configuration patterns.

2. **Customer Booking Confirmation Email Requirements**:
   - When a booking is confirmed (free direct booking via `createBooking` where `total <= 0`, or paid booking via `verifyBookingPayment`), `confirmPaidBooking` executes.
   - For in-person (`offline`) events:
     - `qrToken` (e.g., `SOILGODDESS-EV-...`) is stored on the `EventBooking` record.
     - To ensure delivery across all email clients, `QRCode.toBuffer(qrToken)` must be generated and attached as an inline CID attachment (`cid:entry_qr` or `cid:entry_pass`) and as a file attachment `entry-pass-${bookingNumber}.png`.
     - Email HTML references `<img src="cid:entry_qr" ... />`, displays the venue address card, and provides entry instructions.
   - For online (`online`) events:
     - Prominent Zoom / Webinar joining link button and info box (`event.zoomLink`), with access instructions.
   - For both modes:
     - Event Title, Event Date (formatted), Time Slot (`startTime` – `endTime`), Mode Badge, Booking Number, Seats (`quantity`), Total Price Paid (`₹${total}` or `FREE`), Customer Mobile, and Customer Care info from `getCompanyInfo()`.
     - Plain-text fallback for non-HTML mail readers.

3. **Admin Booking Alert Email Requirements**:
   - Sent to `env.ADMIN_EMAIL`.
   - Contains all customer details: Name, Email, 10-digit Mobile Number.
   - Contains all booking metrics: Booking Reference, Event Name, Event Date/Time, Mode, Quantity, Total Amount Paid, Payment ID (`razorpayPaymentId` or `'Free Registration'`), and Timestamp.

4. **Asynchronous & Resilient Execution**:
   - `confirmPaidBooking` in `events.controller.ts` should fire both email and WhatsApp dispatches asynchronously via `Promise.all` with top-level `.catch()` logging.
   - If SMTP fails or is unconfigured, the HTTP response of `createBooking` or `verifyBookingPayment` is never delayed or aborted.

---

## 3. Caveats

1. **Local SMTP Configuration**: If `EMAIL_USER` and `EMAIL_PASS` are empty in `.env` during local testing, emails are skipped and logged (`console.warn`). This is standard across the codebase.
2. **Event Mode Enum**: The `Event` model allows `mode: 'offline' | 'online' | 'both'`, whereas `EventBooking` has `mode: 'offline' | 'online'`. The email template must inspect the booking's specific mode (`booking.mode`).
3. **Logo Resolution**: `resolveLogoAttachment()` looks for `uploads/threads-of-tn-logo.png` or `public/logo.png`. If not found, it gracefully falls back to serif text header.

---

## 4. Conclusion

The existing backend is well-architected for transactional notifications. To fulfill the user's requirements:
1. **Add Two Functions in `backend/node/src/services/email.service.ts`**:
   - `sendEventBookingConfirmationEmail(to, booking, event, company)`
   - `sendAdminEventBookingAlertEmail(to, booking, event, company)`
2. **Leverage `qrcode.toBuffer()`** in `sendEventBookingConfirmationEmail` to attach the entry QR code as `cid:entry_qr` inline attachment and download attachment.
3. **Refactor `confirmPaidBooking` in `backend/node/src/modules/events/events.controller.ts`**:
   - Replace the legacy `sendGeneralEmail` invocation with non-blocking asynchronous calls to `sendEventBookingConfirmationEmail` (to customer) and `sendAdminEventBookingAlertEmail` (to `env.ADMIN_EMAIL`).
   - Integrate with the WhatsApp notification service in the same non-blocking async block.
4. **Pass all TypeScript compile checks** (`npm run build` passes with zero errors).

---

## 5. Verification Method

### 5.1 Build Verification
Run TypeScript compiler in backend:
```powershell
cd c:\sts-projects\sasilk\backend\node
npm run build
```
Expected: Exits with code 0 and zero compilation errors.

### 5.2 Code Inspection
1. Verify `sendEventBookingConfirmationEmail` and `sendAdminEventBookingAlertEmail` exist in `backend/node/src/services/email.service.ts`.
2. Verify `confirmPaidBooking` in `backend/node/src/modules/events/events.controller.ts` calls both customer and admin notification functions with `booking` and `event` metadata.
3. Verify QR code is generated using `QRCode.toBuffer` with `cid:entry_qr` attachment.
4. Verify Zoom link is rendered for online bookings.
