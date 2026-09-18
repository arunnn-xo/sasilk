# Test Infrastructure & Methodology: Dynamic Storefront Intro Video

## 1. Test Philosophy

The Dynamic Storefront Intro Video test suite is architected around three non-negotiable principles:

1. **Opaque-Box Verification (Black-Box)**:
   - Tests interact exclusively with the system's observable boundaries: HTTP endpoints, request payloads, response status codes, JSON bodies, HTTP headers, database persistent records, and in-memory cache states.
   - Tests have zero coupling with internal implementation details (e.g., variable names, unexported functions, or private class members).
   - If internal implementation details are refactored while preserving interface contracts, tests continue to pass without modification.

2. **Requirement-Driven & Authoritative Derivation**:
   - Every single test case is directly traceable to the authoritative specification documents:
     - `ORIGINAL_REQUEST.md` (§ R1 Backend API & Database Schema, § R2 Admin Panel, § R3 Storefront Dynamic Playback)
     - `PROJECT.md` (§ Architecture, § Interface Contracts, § Code Layout)
   - Expected outputs are derived mathematically and contractually from documented schemas, Zod validation rules, HTTP status standards (RFC 9110), and Multer/Cloudinary media handling constraints.
   - No facade tests: Every test executes real validation logic, checks exact field types, and asserts strict equality.

3. **Progressive Testability & Isolation**:
   - Each test is self-contained and isolated, generating its own unique test fixture or stateless assertion.
   - Tests do not rely on execution order or side-effects from previous tests.
   - The test harness supports dual execution:
     - **In-Process Engine**: Direct in-memory contract, schema, and cache verification capable of running instantly with zero external network dependencies.
     - **Live HTTP Execution**: End-to-end network execution against running backend instances (`GET /api/storefront/intro-video`, `POST /api/admin/settings`, `POST /api/admin/uploads/video`).

---

## 2. 4-Tier Testing Methodology

The test suite is structured into four concentric tiers, guaranteeing comprehensive coverage from basic field assertions to multi-step real-world customer lifecycles.

```
+-------------------------------------------------------------+
|        Tier 4: Real-World Scenarios & E2E Lifecycles        |
|      (Admin Publish -> Public Read -> Session Seen -> Off)  |
+-------------------------------------------------------------+
|        Tier 3: Cross-Feature Combinations & Cache States    |
|       (Pairwise Matrix, Cache Invalidation, Rapid Updates)  |
+-------------------------------------------------------------+
|        Tier 2: Boundary, Corner Cases & Schema Defense      |
|    (Empty URL, Negative Sec, >30 Sec, Non-Video Mime, Sizes) |
+-------------------------------------------------------------+
|        Tier 1: Feature Coverage (Primary Capabilities)      |
|     (Default Read, Valid Update, Public Storefront, Upload)  |
+-------------------------------------------------------------+
```

### Tier 1: Feature Coverage (Primary Capabilities)
Verifies the nominal happy paths and baseline contracts for every distinct feature identified in `PROJECT.md`.
- **Threshold**: At least 5 tests per feature.
- **Features Covered**:
  1. **Default Configuration Retrieval**: Ensures a fresh, unconfigured system returns the authoritative default payload (`enabled: false`, `videoUrl: ""`, `posterUrl: ""`, `skipEnabled: true`, `skipAfterSeconds: 0`, `showOncePerSession: true`).
  2. **Valid Configuration Update**: Tests updating `intro_video_config` with complete valid payloads through the admin settings management layer.
  3. **Retrieval of Updated Configuration**: Verifies that public storefront reads reflect newly committed admin settings.
  4. **Video Upload Endpoint Specifications**: Validates that `/api/admin/uploads/video` is properly registered, handles MP4/WebM/MOV streams, and enforces the 50MB ceiling.
  5. **Storefront Route & Contract Alignment**: Ensures public accessibility (no auth required), application/json content type, exact schema property structure matching frontend `IntroVideoConfig`, and zero administrative leak.

### Tier 2: Boundary & Corner Cases (Adversarial Defense)
Probes limits, illegal types, missing fields, and boundary constraints to verify defensive robustness.
- **Threshold**: At least 5 tests per category.
- **Categories Covered**:
  1. **Empty / Whitespace / Null videoUrl Rejection when Enabled**: Asserts that `enabled: true` strictly demands a non-empty, non-whitespace string URL and raises a 422 Zod issue.
  2. **Invalid Data Types**: Tests rejection of non-boolean toggles (strings, numbers), non-string URLs, non-numeric skip times, and non-object root values.
  3. **skipAfterSeconds Boundary Analysis**: Tests the closed interval `[0, 30]`. Explicitly asserts acceptance of `0` and `30`, and rejection of `-1`, `31`, `100`, and `NaN`.
  4. **Optional Fields & Nullable Permissiveness**: Confirms that `posterUrl` is truly optional (accepts empty string, null, or undefined), and `enabled: false` allows empty `videoUrl`.
  5. **Video Upload Boundaries & Mimetype Enforcement**: Tests rejection of non-video formats (JPEG, PNG, PDF, text) and enforcement of the 50MB file size boundary.

### Tier 3: Cross-Feature Combinations & State Transitions
Explores pairwise combinations, state transition matrices, and synchronization between admin writes and storefront reads.
- **Categories Covered**:
  1. **Pairwise Field Combinations**:
     - `enabled: false` with populated `videoUrl` (inactive campaign retention).
     - `skipEnabled: false` with `skipAfterSeconds: 15` (skip button disabled regardless of countdown).
     - `skipEnabled: true` with `skipAfterSeconds: 0` (immediate skip allowed on frame 0).
     - `skipEnabled: true` with `skipAfterSeconds: 5` (countdown enforcement).
  2. **Cache Invalidation & Synchronous Invalidation Hooks**:
     - Tests that calling `invalidateIntroVideoCache()` or mutating settings triggers cache eviction.
     - Tests that subsequent reads reload from persistent store without stale cache hits.
  3. **Rapid Successive Updates**: Ensures back-to-back updates cleanly converge on the final state without race conditions.
  4. **Database Malformed JSON Fallback**: Confirms that if the database holds invalid data or null, the system gracefully falls back to the default config rather than crashing.

### Tier 4: Real-World Scenarios & End-to-End Lifecycles
Simulates end-to-end user journeys spanning admin actions and public visitor interactions.
- **Scenarios Covered**:
  1. **Scenario 1: Fresh Storefront Launch**: Unconfigured store -> public visitor loads site -> receives disabled config -> homepage mounts with zero intro interruption and zero layout shift.
  2. **Scenario 2: Admin Campaign Deployment**: Admin enters video URL, configures 5s skip, enables video -> saves -> visitor immediately receives active campaign on next request.
  3. **Scenario 3: Session Persistence Enforcement (`showOncePerSession: true`)**:
     - First visit in browser session: `sessionStorage.getItem('sas_intro_seen')` is null -> video plays.
     - User watches or clicks skip -> `sessionStorage.setItem('sas_intro_seen', '1')`.
     - Second visit / reload in same session: component detects flag -> immediately returns `null`.
  4. **Scenario 4: Session Persistence Disabled (`showOncePerSession: false`)**:
     - Every page visit plays intro video regardless of session state.
  5. **Scenario 5: Emergency Killswitch**: Admin disables intro video immediately -> active storefront suppresses video on next page reload.

---

## 3. Minimum Threshold Calculation

To guarantee comprehensive coverage without coverage gaps, the minimum test count is computed as follows:

$$\text{Total Minimum Tests} = \sum_{t=1}^{4} \text{Tier}_t$$

1. **Tier 1 (Feature Coverage)**:
   - 5 features $\times$ 5 tests/feature = **25 tests**
2. **Tier 2 (Boundary & Corner Cases)**:
   - 5 categories $\times$ 5 tests/category = **25 tests**
3. **Tier 3 (Cross-Feature Combinations & Cache)**:
   - 10 matrix & transition cases = **10 tests**
4. **Tier 4 (Real-World Scenarios)**:
   - 5 end-to-end lifecycle simulations = **5 tests**

$$\text{Minimum Threshold} = 25 + 25 + 10 + 5 = 65\text{ Tests}$$

The test harness implements **65 distinct automated tests**, exceeding all coverage thresholds.

---

## 4. Test Architecture & Runner Design

### File Locations
- **Test Infrastructure Specification**: `c:\sts-projects\sasilk\TEST_INFRA.md`
- **Executable Test Runner Script**: `c:\sts-projects\sasilk\backend\node\scripts/test-intro-video.ts`
- **Execution Summary & Readiness**: `c:\sts-projects\sasilk\TEST_READY.md`

### Test Runner Execution Engine
The test runner is written in modern TypeScript (ESM) and executed via `npx tsx` within `backend/node`.
It features:
- **Zero External Test Framework Overhead**: Implements high-precision performance timers (`performance.now()`), deep object comparison, assertion helpers, and ANSI color reporting.
- **Self-Contained Mock & Contract Validator**: Houses reference models and contracts matching `PROJECT.md` to validate logic in isolated environments.
- **Live Integration Adapter**: Auto-detects live Express server instances or mounts the application routers in-process when available.
- **Structured JSON & Markdown Output**: Automatically tallies passes, failures, and execution times by tier.

### Command Line Execution
```powershell
# From backend/node directory:
npx tsx scripts/test-intro-video.ts

# Or from workspace root:
npx tsx --tsconfig backend/node/tsconfig.json backend/node/scripts/test-intro-video.ts
```
