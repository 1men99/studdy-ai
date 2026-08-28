# Implementation Plan - Phase 8: Testing & Evaluation Suite

This plan details the full implementation of **Phase 8** for Study AI, covering comprehensive backend unit/integration tests with high coverage, frontend component testing with Vitest and React Testing Library, AI benchmark evaluation tests, and Playwright End-to-End (E2E) automated browser tests.

## User Review Required

> [!NOTE]
> Phase 8 involves adding test dependencies and test suites for backend, frontend, AI prompt evaluation, and E2E browser flows. No production application logic will be altered destructively.

---

## Proposed Changes

### 1. Backend Testing Suite (`backend/tests/`) - TASK-039
- **Authentication & Security Tests (`test_auth.py`):**
  - Verify missing `Authorization` header returns 401 with standard error JSON.
  - Verify invalid JWT, malformed bearer, expired token, and invalid kid.
  - Verify development mode bypass (`dev_user_*`).
  - Verify JWKS key caching and refresh behavior.
- **Endpoint & Service Tests (`test_questions_endpoint.py`, `test_simplify_endpoint.py`, `test_history_endpoint.py`):**
  - Verify `/api/v1/questions/generate` endpoint with mocked Gemini/Groq services.
  - Verify `/api/v1/simplify` endpoint with mocked AI responses and fallback mechanisms.
  - Verify `/api/v1/history` and `/api/v1/history/{session_id}` with mocked Convex client (success, error, 404, 502).
  - Verify 502 Bad Gateway mapping on external service failures.
- **Coverage Target:**
  - Target >85% backend code coverage across `app/` modules.

---

### 2. Frontend Testing Suite (`frontend/src/**/*.test.tsx`) - TASK-040
- **Dependencies Setup:**
  - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@vitejs/plugin-react`.
  - Configure `vitest.config.ts` or update `vite.config.ts` with test environment (`jsdom`) and path aliases (`@/*`).
  - Create `src/test/setup.ts` with jest-dom matchers and mocks for `window.matchMedia`, `ResizeObserver`, and Clerk hooks.
- **Component Unit Tests:**
  - `NotesInput.test.tsx`: Character counting, <50 char minimum warning, >max length warning, textarea changes.
  - `QuestionCard.test.tsx`: Render multiple-choice, true/false, fill-in-blank, short-answer questions; answer selection and immediate grading; explanation display; callback invocations.
  - `OriginalTextPanel.test.tsx` / `Simplify.test.tsx`: Original text vs plain language side-by-side display, copy to clipboard action.
  - `WatchOutPanel.test.tsx`: Categorized badges (Fees, Deadlines, Clauses, Penalties) and warning cards.
  - `ErrorBoundary.test.tsx`: Graceful recovery and fallback UI on render error.

---

### 3. AI Prompt Evaluation Suite (`backend/tests/test_ai_evaluation.py`) - TASK-041
- **Benchmark Evaluation Dataset:**
  - 5 representative educational & document domain samples:
    1. Biology Notes (Cellular respiration / ATP synthesis)
    2. Mathematics Notes (Calculus derivatives and integrals)
    3. History Lecture Notes (Industrial revolution & labor reform)
    4. Residential Lease Contract (Security deposits, pet fees, 30-day notice clause)
    5. Utility Bill (Usage charges, late payment penalty, due date)
- **Evaluation Runner & Assertions:**
  - Question Generation:
    - Asserts exactly 10 questions returned.
    - Asserts format distribution (3 multiple-choice, 2 true/false, 2 fill-in-the-blank, 3 short-answer).
    - Asserts non-empty question, answer, and explanation fields.
    - Asserts answers strictly ground in provided context without hallucination.
  - Plain Language & Watch-Out Translation:
    - Asserts readability and simplicity without loss of critical meaning.
    - Asserts extraction of fees and deadlines into structured `watch_out_for` items.
    - Asserts no unsupported legal or financial claims.

---

### 4. Playwright End-to-End (E2E) Test Suite (`frontend/e2e/`) - TASK-042
- **Playwright Configuration:**
  - Configure `playwright.config.ts` for running tests in headless Chromium.
- **E2E Test Specifications:**
  - `practice-flow.spec.ts`:
    - Navigates to Practice page.
    - Enters notes (>50 characters).
    - Triggers question generation.
    - Answers 10 questions across types and checks real-time score/feedback and completion summary.
  - `simplify-flow.spec.ts`:
    - Navigates to Plain Language page.
    - Selects document type (e.g., Contract).
    - Enters legal text with hidden fee and deadline.
    - Generates simplification.
    - Asserts side-by-side comparison renders and Watch-Out items (fee & deadline cards) display correctly.

---

## Verification Plan

### Automated Tests
1. **Backend Tests:** Run `uv run pytest --cov=app --cov-report=term-missing` and verify all tests pass with >85% coverage.
2. **Frontend Tests:** Run `pnpm test` (or `npm test`) inside `frontend/` and verify all Vitest test suites pass.
3. **AI Evaluation Tests:** Run `uv run pytest tests/test_ai_evaluation.py` to ensure all benchmark test assertions pass.
4. **Playwright E2E Tests:** Run `npx playwright test` to verify end-to-end flows.

### Manual Verification
- Review test reports, coverage summaries, and update `TASKS.md` checkboxes.
