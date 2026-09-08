# Audit Plan: Storefront Guest Discount Alignment & Popup Cleanup

## Objective
Independently audit and verify the implementation of the Storefront Guest Discount Popup alignment and obsolete CouponPopup cleanup against all requirements and acceptance criteria in ORIGINAL_REQUEST.md.

## Phase 1: Timeline & Changes Audit
1. Inspect modified and deleted files:
   - Verify `CouponPopup.tsx` is completely deleted from `frontend/components/ui/` and any backup/bundle folders.
   - Verify references to `CouponPopup` and `SAS15OFF` are removed from `frontend/app/page.tsx`, `layout.tsx`, and all other storefront files.
   - Check `frontend/components/layout/GuestDiscountPopup.tsx` changes and history.
   - Inspect backend contract in `backend/node/src/modules/storefront/controllers/catalog.controller.ts` or routes.
2. Check agent workspace artifacts, progress logs, and reviewer cycles.

## Phase 2: Cheating & Regression Detection
1. Check for hardcoded responses, stubs, or bypasses in `GuestDiscountPopup.tsx`.
2. Check for mocked tests or weakened assertions.
3. Check for any side effects or regressions in `app/page.tsx`, `app/layout.tsx`, `AuthContext`, or routing.
4. Verify no coupon code `SAS15OFF` or static discounts are hardcoded.

## Phase 3: Acceptance Criteria & Contract Verification
Audit each acceptance criterion with concrete proof:
1. **Offer & Flow Consistency**:
   - [ ] Obsolete static popup (`CouponPopup.tsx` / `SAS15OFF`) is completely removed from `app/page.tsx`.
   - [ ] Only the dynamic guest discount popup appears, strictly reflecting backend `guest_discount_popup` settings (`enabled`, `discountPercentage`, `message`).
   - [ ] If `enabled` is false or `discountPercentage <= 0`, no popup is displayed.
   - [ ] If user is already logged in, the guest popup is not shown.
2. **User Experience**:
   - [ ] Clicking "Register Now" navigates to `/register` and dismisses popup.
   - [ ] Dismissing the popup persists across the user's browsing session.
   - [ ] Popup renders responsively across all viewport sizes without UI glitches or z-index collisions with `MobileBottomNav`.
3. **Build & Integrity**:
   - [ ] Frontend Next.js build (`npm run build` in `frontend`) passes with 0 TypeScript or lint errors.

## Phase 4: Reporting & Notification
1. Write VICTORY AUDIT REPORT to `handoff.md`.
2. Update `progress.md` and `BRIEFING.md`.
3. Send message to caller with final verdict.
