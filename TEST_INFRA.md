# SASilk Soil Goddess Event Booking Transactional Notifications — Test Infrastructure & Architecture

## 1. Executive Summary & Overview
This document specifies the 4-Tier End-to-End (E2E) automated testing framework for the **Soil Goddess Event Booking and Masterclass Registration Transactional Notifications** system.

The notification infrastructure delivers dual-channel asynchronous transactional messages (Branded HTML Email + WhatsApp) across both customer confirmation and administrator alert streams. The testing architecture guarantees correctness, resilience, idempotency, and non-blocking background dispatch under diverse operational and adverse failure scenarios.

---

## 2. 4-Tier Testing Architecture

```
+-----------------------------------------------------------------------------------------+
|                                 4-TIER TESTING PYRAMID                                 |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   | TIER 4: Real-World Scenarios & User Journeys (E2E Masterclass Lifecycle)        |   |
|   |  - Scenario A: Complete Free Online Masterclass Registration Flow               |   |
|   |  - Scenario B: Complete Paid In-Person Workshop Flow (Razorpay + QR Pass)       |   |
|   +---------------------------------------------------------------------------------+   |
|                                          ^                                              |
|   +---------------------------------------------------------------------------------+   |
|   | TIER 3: Cross-Feature Interactions & System Contracts                            |   |
|   |  - Dual Confirmation Triggers (Free Bookings vs Payment Verification vs Webhook)|   |
|   |  - Offline QR Token + Inline CID Buffer Generation Integration                  |   |
|   |  - Multi-Channel Parity & Non-Blocking Async Dispatch Isolation                 |   |
|   +---------------------------------------------------------------------------------+   |
|                                          ^                                              |
|   +---------------------------------------------------------------------------------+   |
|   | TIER 2: Boundary Conditions, Extremes & Fault Resilience (>= 5 per category)    |   |
|   |  - Empty / Null / Non-Standard Mobile Numbers                                   |   |
|   |  - Pricing Boundaries (Free 0, Fractional 49.50, Standard 999, High 99999)      |   |
|   |  - Single vs Multi-Seat Capacity Boundaries (1, 2, 10, Over-Capacity Rejections)|   |
|   |  - Missing Optional Data (Null Venue, Null Zoom Link, Missing Contact Info)     |   |
|   |  - Provider Error Resilience (Unconfigured SMTP, Network Outage, Mock Fallbacks)|   |
|   +---------------------------------------------------------------------------------+   |
|                                          ^                                              |
|   +---------------------------------------------------------------------------------+   |
|   | TIER 1: Core Feature Verification & Unit Contracts (>= 5 per feature)           |   |
|   |  - Feature 1: Mobile Number Normalization & E.164 Cleansing                     |   |
|   |  - Feature 2: WhatsApp Mock Provider Payload Generation & Dispatch              |   |
|   |  - Feature 3: WhatsApp Message Formatting (Online Zoom vs Offline Venue)        |   |
|   |  - Feature 4: Customer Confirmation Email HTML Rendering & QR/Zoom Logic        |   |
|   |  - Feature 5: Admin Alert Email Rendering & Customer Information Verification   |   |
|   +---------------------------------------------------------------------------------+   |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Test Runners & Execution Commands

### Prerequisites
- Node.js v20.x or higher
- TypeScript 5.5+ and `tsx` execution engine

### Primary Execution Commands
All commands are run from the backend directory (`c:\sts-projects\sasilk\backend\node`):

```powershell
# Run the complete 4-tier automated test suite via tsx
npx tsx scripts/test-notifications.ts

# Run the TypeScript build typecheck
npm run build
```

---

## 4. Test Matrix & Coverage Catalog

### Tier 1: Core Feature Coverage (>=5 tests per feature)

#### Feature 1: Mobile Number Normalization (`normalizeMobileNumber`)
| Test ID | Input | Expected Output | Assertion Rationale |
|---|---|---|---|
| `T1-MOB-01` | `"9876543210"` | `"919876543210"` | Standard 10-digit Indian mobile prepended with country code 91 |
| `T1-MOB-02` | `"+91 98765 43210"` | `"919876543210"` | Handles +91 country prefix and internal whitespace |
| `T1-MOB-03` | `"09876543210"` | `"919876543210"` | Handles domestic leading 0 prefix correctly |
| `T1-MOB-04` | `"+91-98765-43210"` | `"919876543210"` | Strips hyphens, punctuation, and non-numeric characters |
| `T1-MOB-05` | `"919876543210"` | `"919876543210"` | Preserves already normalized 12-digit Indian number |
| `T1-MOB-06` | `"12345"` (invalid) | `null` | Returns `null` on invalid length without throwing |

#### Feature 2: WhatsApp Mock Provider Payload Generation & Dispatch
| Test ID | Input / Scenario | Expected Output | Assertion Rationale |
|---|---|---|---|
| `T1-WA-01` | Valid booking in mock mode | `{ success: true, provider: 'mock' }` | Successfully produces mock dispatch result |
| `T1-WA-02` | Mock message ID format | `messageId` starts with `mock-` | Validates predictable mock message ID generation |
| `T1-WA-03` | Recipient alignment | `recipient === "919876543210"` | Normalized mobile number propagated to provider payload |
| `T1-WA-04` | Disabled WhatsApp setting | Returns non-error bypass | Returns graceful skipped response when WhatsApp disabled |
| `T1-WA-05` | Unsupported / missing config | Fallback to mock provider | Graceful fallback to mock mode with zero exceptions |

#### Feature 3: WhatsApp Message Formatting (`formatBookingWhatsAppMessage`)
| Test ID | Input / Scenario | Expected Output | Assertion Rationale |
|---|---|---|---|
| `T1-WAFMT-01` | Online event (Zoom) | Contains Zoom join URL & webinar notes | Formats personalized Zoom joining link |
| `T1-WAFMT-02` | Offline event (Venue) | Contains Venue address & entry pass note | Formats physical venue and entry check-in reminder |
| `T1-WAFMT-03` | Free event pricing | Contains `"FREE"` or `"₹0"` badge | Clearly indicates zero payment for free registrations |
| `T1-WAFMT-04` | Paid event pricing | Contains formatted `"₹999"` / `"₹9,999"` | Formats currency with INR symbol and separators |
| `T1-WAFMT-05` | Company branding & support | Contains `"Soil Goddess"` / `"Threads of TN"` | Emits brand name and customer care contact |

#### Feature 4: Customer Confirmation Email HTML Rendering
| Test ID | Input / Scenario | Expected Output | Assertion Rationale |
|---|---|---|---|
| `T1-EMLCUST-01` | Online event confirmation | HTML contains Zoom link & button | Renders interactive button and clickable link |
| `T1-EMLCUST-02` | Offline event confirmation | HTML references `cid:entry_qr` & venue | Embeds inline CID QR pass and venue address |
| `T1-EMLCUST-03` | Offline QR Buffer generation | Generates non-empty PNG buffer | Verifies `qrcode.toBuffer()` generates valid PNG header |
| `T1-EMLCUST-04` | Brand palette & styling | HTML contains `#6B1A2A` and `#FBF9F6` | Complies with brand color design system |
| `T1-EMLCUST-05` | Plaintext fallback | Non-empty text version returned | Generates structured readable plain text body |

#### Feature 5: Admin Alert Email Rendering
| Test ID | Input / Scenario | Expected Output | Assertion Rationale |
|---|---|---|---|
| `T1-EMLADM-01` | Full customer details | Contains Name, Email, and Phone | Verifies all customer contact details exposed to admin |
| `T1-EMLADM-02` | Booking reference & Event | Contains Booking Number & Event Title | Explicit identification for booking operations |
| `T1-EMLADM-03` | Seat count & Financials | Contains Seats count and Amount Paid | Accurately communicates revenue and capacity usage |
| `T1-EMLADM-04` | Payment status & ID | Contains Payment Status and Gateway ID | Displays `"paid"` / `"free"` and Razorpay payment ID |
| `T1-EMLADM-05` | Unconfigured SMTP safety | Executes safely without throw | Resilient against missing SMTP credentials |

---

### Tier 2: Boundary & Corner Cases (>=5 tests per category)

#### Category 1: Extreme & Invalid Mobile Inputs
| Test ID | Scenario | Expected Output |
|---|---|---|
| `T2-BND-MOB-01` | `""` (Empty string) | `normalizeMobileNumber("") === null` |
| `T2-BND-MOB-02` | `null` / `undefined` | `normalizeMobileNumber(null) === null` |
| `T2-BND-MOB-03` | `"abcdefghij"` (Alpha string) | `normalizeMobileNumber("abcdefghij") === null` |
| `T2-BND-MOB-04` | `"+1 555 123 4567"` (Non-Indian) | Sanitized or flagged appropriately |
| `T2-BND-MOB-05` | `"   9876543210   "` (Leading/trailing whitespace) | Returns `"919876543210"` |

#### Category 2: Financial & Pricing Boundaries
| Test ID | Scenario | Expected Output |
|---|---|---|
| `T2-BND-PRC-01` | Free event (`price: 0`, `total: 0`) | Handled as confirmed free booking without payment gateway call |
| `T2-BND-PRC-02` | Fractional price (`price: 49.50`, `quantity: 1`) | Formatted correctly as ₹49.50 |
| `T2-BND-PRC-03` | Standard price (`price: 999.00`) | Formatted with Indian thousands separator |
| `T2-BND-PRC-04` | High-value workshop (`price: 99999.00`) | Formatted as ₹99,999.00 without truncation |
| `T2-BND-PRC-05` | Zero quantity edge guard | Rejects or handles gracefully with validation error |

#### Category 3: Single vs Multi-Seat Capacity Allocations
| Test ID | Scenario | Expected Output |
|---|---|---|
| `T2-BND-CAP-01` | Single seat booking (`quantity: 1`) | Renders singular `"1 Seat"` / `"1 Ticket"` |
| `T2-BND-CAP-02` | Multi-seat booking (`quantity: 2`) | Renders plural `"2 Seats"` / `"2 Tickets"` |
| `T2-BND-CAP-03` | Maximum allowed batch (`quantity: 10`) | Successfully accommodates batch registration |
| `T2-BND-CAP-04` | Exceeding capacity check | Controller rejects with 400 when seats remaining < quantity |
| `T2-BND-CAP-05` | QR code token for multi-seat | Single authoritative QR master pass generated for booking group |

#### Category 4: Missing & Optional Data Handling
| Test ID | Scenario | Expected Output |
|---|---|---|
| `T2-BND-OPT-01` | Offline event with `null` venue address | Falls back to `"TBA / To be announced"` without crash |
| `T2-BND-OPT-02` | Online event with `null` zoom link | Falls back to placeholder / instructions without crash |
| `T2-BND-OPT-03` | Missing company support contact | Falls back to default company details |
| `T2-BND-OPT-04` | Missing customer name / whitespace | Safely escaped and formatted |
| `T2-BND-OPT-05` | Unconfigured Admin Email | Falls back to default or logs warning safely |

#### Category 5: Provider Error Resilience & Exception Isolation
| Test ID | Scenario | Expected Output |
|---|---|---|
| `T2-BND-RES-01` | SMTP transport failure | Error caught and logged; booking response NOT failed |
| `T2-BND-RES-02` | WhatsApp network timeout | Error caught and logged; booking response NOT failed |
| `T2-BND-RES-03` | Malformed email address | Validated before transport attempt |
| `T2-BND-RES-04` | Provider credentials missing | Automatic fallback to mock provider |
| `T2-BND-RES-05` | Uncaught promise isolation | Background dispatches use `.catch()` handlers |

---

### Tier 3: Cross-Feature Interactions & Idempotency
| Test ID | Scope | Verification Goal |
|---|---|---|
| `T3-INT-01` | Free Event Booking Flow | `createBooking` for free event immediately invokes `confirmPaidBooking`, generates QR/Zoom, and fires notifications |
| `T3-INT-02` | Paid Event Payment Verification | `verifyBookingPayment` validates signature, updates status to `paid`, and triggers notifications |
| `T3-INT-03` | Webhook Idempotency | Consecutive invocations of `confirmPaidBooking` for the same booking ID do not duplicate emails or regenerate QR passes |
| `T3-INT-04` | Offline QR Generation Pipeline | QR Token -> QRCode Buffer -> Nodemailer CID Attachment -> HTML `<img>` tag consistency |
| `T3-INT-05` | Multi-Channel Data Parity | Event title, booking reference, date, and customer name match identically across Email and WhatsApp payloads |

---

### Tier 4: Real-World Scenarios (End-to-End User Journeys)

#### Scenario A: Soil Goddess Free Online Masterclass Registration
1. User books free ticket for "Soil Goddess: Organic Cotton & Natural Dyes Masterclass" (Online / Zoom).
2. Controller detects `total === 0`, marks booking confirmed.
3. WhatsApp service dispatches confirmation with Zoom webinar join link.
4. Email service sends branded confirmation email containing Zoom button.
5. Admin alert email dispatched to operations team.
6. User receives HTTP 201 response with confirmed status and booking reference.

#### Scenario B: Soil Goddess Paid In-Person Kanchipuram Weaving Workshop
1. User books 2 tickets for "Soil Goddess: Heritage Handloom Immersion" (Offline / Kanchipuram Studio).
2. Controller creates pending booking and Razorpay order.
3. Razorpay payment verification succeeds with valid HMAC SHA256 signature.
4. Booking updated to `paid`, QR entry pass token generated.
5. Email service generates inline CID QR image attachment and dispatches to customer.
6. WhatsApp service dispatches personalized message with venue directions and entry instructions.
7. Admin alert email sent with customer contact details, 2 seats, and Razorpay payment ID.
8. User receives HTTP 200 response with booking details and QR code.

---

## 5. Continuous Testing & Quality Gates
- **Zero TypeScript Errors**: Tested with `tsc -p tsconfig.json`.
- **100% Pass Rate**: Verified via `npx tsx scripts/test-notifications.ts`.
- **Zero Data Loss & Non-Blocking Guarantee**: Confirmed via asynchronous failure isolation tests.
