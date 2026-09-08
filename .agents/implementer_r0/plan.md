# Implementation Plan - Storefront Guest Discount Alignment

## Context & Objectives
1. Single source of truth: `GET /api/storefront/guest-discount-popup`.
   - Displays configured `discountPercentage` and custom `message` (with `{percentage}` replaced).
   - Only displays if `enabled === true` and `discountPercentage > 0`.
   - Never shown to logged-in users.
   - Clarifies the automatic discount flow (register/login -> automatic discount on first order, no coupon code needed).
2. Remove obsolete static `CouponPopup.tsx` (`SAS15OFF` / 15%) from `app/page.tsx` and eliminate the component file.
3. Responsive luxury presentation & dismissal handling:
   - Rich burgundy and gold luxury styling matching Soil Goddess aesthetic.
   - Smooth dismiss behavior (X button, backdrop click, Escape key, CTA click).
   - Session persistence via `sessionStorage` (`sas_guest_popup_dismissed`) so users aren't re-prompted in the same session.
   - High z-index (`z-[10000]`) above `MobileBottomNav` (`z: 9999`) to prevent any UI overlaps or collision issues.
   - Body scroll locking while modal is open.
   - Fully responsive for mobile, tablet, desktop.

## Action Items
1. Update `frontend/components/layout/GuestDiscountPopup.tsx`:
   - Add session persistence (`sessionStorage.getItem('sas_guest_popup_dismissed')`).
   - Clean up timeouts and handle promise unmounting properly.
   - Improve responsive styling, typography, luxury aesthetic, and accessibility.
   - Set z-index to `z-[10000]` to avoid collision with `MobileBottomNav`.
   - Add body scroll lock while open and Escape key listener.
   - Keep "Register Now" leading to `/register` with auto-dismiss.
   - Add "Log In" link for existing users and "Continue as Guest" dismiss button.
2. Remove `CouponPopup` from `frontend/app/page.tsx`:
   - Remove `import CouponPopup from '@/components/ui/CouponPopup'`.
   - Remove `<CouponPopup />` from the JSX tree.
3. Eliminate `frontend/components/ui/CouponPopup.tsx`:
   - Check if any other files import it; remove the file.
   - If `frontend/homepage-bundle` imports it, clean up `homepage-bundle` references as well so no obsolete code or broken imports remain.
4. Verification:
   - Run `npm run build` in `frontend/` to ensure 0 TypeScript and lint errors.
   - Verify all edge cases:
     - Logged-in user -> popup not shown.
     - `enabled === false` -> popup not shown.
     - `discountPercentage <= 0` -> popup not shown.
     - Dismissed in session -> popup not shown on page refresh or navigation.
     - "Register Now" navigation and auto-dismiss.
     - Z-index collision test against `MobileBottomNav`.
5. Progress & Handoff documentation:
   - Update `progress.md` and write `handoff.md`.
   - Send final notification to orchestrator via `send_message`.
