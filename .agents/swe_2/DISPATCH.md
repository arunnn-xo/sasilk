## 2026-09-07T15:29:49+05:30
You are the SWE Light Orchestrator (swe_2).

## Your Working Directory
`c:\sts-projects\sasilk\.agents\swe_2`
Write all your coordination files (plan.md, progress.md, context.md, handoff.md) in this directory.

## Project Root
`c:\sts-projects\sasilk`
Frontend directory: `c:\sts-projects\sasilk\frontend`

## Authority Document
Read the original user request from:
`c:\sts-projects\sasilk\.agents\ORIGINAL_REQUEST.md` (and `c:\sts-projects\sasilk\ORIGINAL_REQUEST.md`).

## Task Overview
This is a single self-contained fix; keep it small and focused. Align the frontend guest discount popup strictly with the existing backend and admin panel configuration flow, removing outdated hardcoded coupon popups and ensuring consistent welcome offers across the storefront.

Integrity mode: development

## Requirements

### R1. Align Storefront Popup with Existing Backend & Admin Flow
Use the existing backend guest discount configuration endpoint (`GET /api/storefront/guest-discount-popup`) as the single source of truth for the popup:
- Respect the `enabled` flag (only display when enabled by admin).
- Display the configured `discountPercentage` and replace `{percentage}` placeholder in the custom `message`.
- Maintain the intended flow where first-time visitors are encouraged to register/login to automatically receive their welcome discount on their first order without entering manual coupon codes.
- If user is already logged in, the guest popup is not shown.

### R2. Remove Redundant Hardcoded Coupon Popup
Eliminate the obsolete static `CouponPopup.tsx` component (which hardcodes `SAS15OFF` and 15%) and remove its reference from `app/page.tsx`, ensuring visitors are never presented with conflicting or non-functional coupon codes.

### R3. Responsive Luxury Presentation & Dismissal Handling
Ensure the dynamic popup:
- Retains Soil Goddess luxury styling (rich burgundy, gold accents, elegant typography).
- Has smooth dismiss behavior (close button and backdrop tap) with session persistence (`sessionStorage`) so visitors are not repeatedly prompted during the same session.
- Is fully responsive across mobile, tablet, and desktop viewports without overlapping navigation elements or z-index collisions with `MobileBottomNav`.

## Acceptance Criteria

### Offer & Flow Consistency
- [ ] Obsolete static popup (`CouponPopup.tsx` / `SAS15OFF`) is completely removed from `app/page.tsx`.
- [ ] Only the dynamic guest discount popup appears, strictly reflecting backend `guest_discount_popup` settings (`enabled`, `discountPercentage`, `message`).
- [ ] If `enabled` is false or `discountPercentage <= 0`, no popup is displayed.
- [ ] If user is already logged in, the guest popup is not shown.

### User Experience
- [ ] Clicking "Register Now" navigates to `/register` and dismisses popup.
- [ ] Dismissing the popup persists across the user's browsing session.
- [ ] Popup renders responsively across all viewport sizes without UI glitches or z-index collisions with `MobileBottomNav`.

### Build & Integrity
- [ ] Frontend Next.js build (`npm run build` in `frontend`) passes with 0 TypeScript or lint errors.

## Execution Rules
- Always provide FULL updated code, never partial snippets or placeholders.
- Follow the SWE Light loop: dispatch one implementer on the whole task, then repeated reviewer rounds carrying a cumulative open-issues ledger, with correctness established by running tests/builds.
- When all criteria are met and build passes with 0 errors, deliver your completion handoff.md and report completion back to the Sentinel.
