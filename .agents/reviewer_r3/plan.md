# Reviewer Round 3 Execution Plan

## 1. Audit Scope & Objectives
- Final adversarial review pass (Round 3) for the storefront guest discount popup alignment.
- Rigorous check against all requirements:
  - R1: Backend & admin flow alignment (`GET /api/storefront/guest-discount-popup`, `enabled`, `discountPercentage`, `{percentage}` message token, guest vs logged-in state).
  - R2: Elimination of obsolete `CouponPopup.tsx` and hardcoded `SAS15OFF` references.
  - R3: Responsive luxury presentation, z-index hierarchy above `MobileBottomNav` (`z-[10000]` vs `z-[9999]`), focus trapping, scroll locking, and dismissal persistence across session.
- Identify and rectify any defects left behind or unaddressed by prior passes (e.g. route transition delay resets, module config caching, focus trapping edge cases, mobile visual centering, backdrop click-and-drag handling).

## 2. Execution Steps
1. [x] Step 1: Independent requirement analysis and understanding.
2. [x] Step 2: Adversarial code review of prior attempts. Uncover remaining defects:
   - Defect 1: Coupling of timer delay and config fetching to route changes in `GuestDiscountPopup.tsx`.
   - Defect 2: Missing module-level config cache / in-flight request deduplication.
   - Defect 3: Asymmetric `pr-6` on mobile eyebrow causing off-center alignment.
   - Defect 4: Focus trap flaw when focus starts outside or escapes dialog.
   - Defect 5: Backdrop click dismissal triggering on drag-selection.
   - Defect 6: Potential `document.body` focus call on in-place dismissal.
   - Defect 7: Missing WebKit backdrop-filter support on iOS/Safari.
3. [x] Step 3: Implement fixes with full updated code.
4. [x] Step 4: Verify against all acceptance criteria and edge cases.
5. [x] Step 5: Document verification and handoff report.
