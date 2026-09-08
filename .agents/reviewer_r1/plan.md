# Reviewer Round 1 Plan: Guest Discount Popup

## Step 1: Independent Requirements Understanding
- Verify backend endpoint `GET /api/storefront/guest-discount-popup` contract and data structure.
- Verify `CouponPopup.tsx` removal and ensure no lingering references exist.
- Verify dynamic `GuestDiscountPopup.tsx` behavior:
  - Enabled flag respected (suppressed when false/missing).
  - discountPercentage > 0 requirement.
  - Message token replacement ({percentage}).
  - Authentication check: guest vs logged in user.
  - Session persistence with `sessionStorage` (suppress on subsequent navigations/reloads).
  - Responsive design, backdrop click, close button, escape key.
  - Body scroll lock.
  - Z-index coordination with MobileBottomNav (9999) and CartDrawer.
  - Accessibility: aria-modal, role="dialog", aria-label/labelledby/describedby, focus management.

## Step 2: Adversarial Audit & Edge Case Breakdown
- Inspect `GuestDiscountPopup.tsx` line by line.
- Edge cases to check:
  - Token replacement regex (e.g. `replaceAll` vs `replace` if multiple `{percentage}`).
  - Parsing of discountPercentage (NaN, string vs number, zero, negative).
  - Unmounting / cleanup of setTimeout (`SHOW_DELAY_MS`) if user navigates away or unmounts quickly.
  - Race condition with `useAuth()` loading state: does it show popup for a logged in user while auth is still loading?
  - Escape key listener cleanup on unmount.
  - Scroll lock cleanup on unmount: if component unmounts while modal is open, does `document.body.style.overflow = ''` clean up?
  - Accessibility: role="dialog", aria-modal="true", aria-labelledby, focus trap or autofocus on close or primary CTA.
  - Remnants of CouponPopup across the repo.

## Step 3: Fix Defects Found
- Apply fixes adhering to user global rules (full updated code).

## Step 4: Verification
- Inspect files and verify build.
