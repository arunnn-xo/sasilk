# Plan — Guest Discount Popup Alignment

## Objective
Align frontend guest discount popup strictly with existing backend (`GET /api/storefront/guest-discount-popup`) and admin configuration flow.
Remove redundant hardcoded `CouponPopup.tsx` (`SAS15OFF`) and its reference in `app/page.tsx`.
Ensure responsive luxury Soil Goddess styling and session persistence via `sessionStorage`.

## Workflow
1. [x] Round 0: Dispatch `teamwork_preview_implementer`
2. [x] Independent orchestrator verification (npm run build in frontend passed with exit code 0)
3. [x] Round 1: Reviewer 1 (`teamwork_preview_reviewer`) — Adversarial review and edge case checks
4. [x] Independent orchestrator verification (npm run build in frontend passed with exit code 0)
5. [x] Round 2: Reviewer 2 (`teamwork_preview_reviewer`) — Refinement & stress testing
6. [x] Independent orchestrator inspection
7. [x] Round 3: Reviewer 3 (`teamwork_preview_reviewer`) — Final verification against all acceptance criteria
8. [/] Victory Audit (`teamwork_preview_victory_auditor`) — Independent post-victory audit
9. [ ] Final Completion Handoff

## Open Issues Ledger
- [CLOSED] Timer reset on route transitions: Resolved in Reviewer 3 via decoupled route evaluation, arrival timestamp diffing, and module-level config caching.
- [CLOSED] Asymmetric eyebrow heading: Resolved in Reviewer 3 by removing pr-6 sm:pr-0.
- [CLOSED] Focus trap leakage outside modal card: Resolved in Reviewer 3 with !modalCardRef.current.contains(document.activeElement) containment.
- [CLOSED] Accidental dismissal on text selection: Resolved in Reviewer 3 with e.target === e.currentTarget guard.
- [CLOSED] Webkit backdrop filter: Resolved in Reviewer 3 with WebkitBackdropFilter: 'blur(6px)'.
- [OPEN] (reviewer_r3) Minor Robustness Risk: In strict privacy environments where sessionStorage access throws security exceptions, the try/catch fallback protects against crashes, but session dismissal persistence will degrade to in-memory state for that tab.
