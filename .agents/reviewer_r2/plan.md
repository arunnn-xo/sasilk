# Reviewer Round 2 Plan: Guest Discount Popup Adversarial Audit

## Objective
Thoroughly audit the guest discount popup implementation, evaluate SSR hydration safety, verify timer cleanup and prevent memory leaks, eliminate unnecessary route-change network re-fetching, enhance accessibility/focus management, and ensure full alignment with backend/admin contracts.

## Review Items & Hypotheses to Test
1. **SSR Hydration Safety:**
   - Verify `document.querySelector('[aria-label="Intro video"]')` does not run during SSR or cause React hydration mismatches.
   - Initial state is `visible: false` on both server and client.
2. **Timer Cleanup & Memory Leaks:**
   - Assess `setTimeout(checkAndShow, 1500)`.
   - Prevent infinite retry loop if intro video persists or selector matches unexpectedly (bound max retries to 10).
   - Use portable timer typing `ReturnType<typeof setTimeout>`.
   - Ensure clean unmount and cancellation.
3. **Route Navigation Performance & Re-fetching:**
   - Prior attempt re-fetched `fetchGuestDiscountPopupConfig()` on every single route change (`pathname` dependency).
   - If user navigates every 2s, popup never shows and API is spammed.
   - Decouple config fetch from route changes so config is fetched once, while path suppression immediately hides/shows popup appropriately.
4. **Focus Management & Navigation Collision:**
   - When user clicks "Register Now" or "Log In", cleanup forcibly called `previousActiveElementRef.current.focus()` on the departing page, stealing focus during router navigation.
   - Fix: Only restore focus on in-place dismissals where the element remains connected in `document.body`.
5. **Path Suppression Completeness:**
   - Add `/account` to `isSuppressedPath` to prevent popup before auth redirect.
6. **Mobile Layout & Contrast:**
   - Ensure title and close button don't collide on compact screens.
   - Ensure luxury Soil Goddess branding and WCAG 2.2 contrast standards.

## Execution Steps
1. Refactor `frontend/components/layout/GuestDiscountPopup.tsx` with complete updated code.
2. Verify contracts and logic.
3. Update progress.md and generate handoff.md.
