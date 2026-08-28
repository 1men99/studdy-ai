# Study AI — Project Implementation Task List

This document contains the granular, trackable task breakdown for the **Study — AI-Powered Study Material Assistant** project, derived directly from the Technical Requirements Document (TRD) and Software Requirements Specification (SRS) (`study_trd_srs.md`).

---

## Progress Overview

- [x] **Phase 0: Workspace & Scaffolding** `(4/4 completed)`
- [x] **Phase 1: Database Schema & Authentication (Convex + Clerk)** `(4/4 completed)`
- [x] **Phase 2: Backend Core & Gemini AI Integration Layer** `(6/6 completed)`
- [x] **Phase 3: Practice Question Generator (End-to-End)** `(6/6 completed)`
- [x] **Phase 4: Plain-Language & "Watch Out For" Translator (End-to-End)** `(6/6 completed)`
- [x] **Phase 5: Study History, Persistence & Dashboard** `(4/4 completed)`
- [x] **Phase 7: UI/UX Polish, Responsive Design & Accessibility** `(4/4 completed)`
- [x] **Phase 8: Testing & Evaluation Suite** `(4/4 completed)`
- [ ] **Phase 9: Containerization, CI/CD & Deployment** `(0/4 completed)`

**Total Progress:** 42 / 46 tasks completed (91%)

---

## Task Legend
- `[FE]` = Frontend (`frontend/`)
- `[BE]` = Backend (`backend/`)
- `[DB]` = Database (`frontend/convex/` or `convex/`)
- `[AI]` = Gemini AI Integration
- `[SEC]` = Security & Auth (Clerk / JWT)
- `[DEVOPS]` = Docker, CI/CD, Deployment

---

## Phase 0: Workspace & Scaffolding

- [x] **TASK-001** `[DEVOPS]` **Initialize Repository Structure & Two-Parent Directory Layout**
  - **TRD Reference:** Section 29 (Project Structure)
  - **Description:** Create root folder hierarchy with two standalone repositories (`frontend/` and `backend/`) ready for independent deployment and separate version control. Set up root `.gitignore` and `README.md`.
  - **Acceptance Criteria:** Clean two-parent directory layout, root `.gitignore` excludes `node_modules`, `__pycache__`, `.env`, `.venv`, and build artifacts.

- [x] **TASK-002** `[FE]` **Initialize React + Vite + TypeScript Frontend with pnpm & shadcn/ui (tweakcn theme)**
  - **TRD Reference:** Section 5, Section 6.1
  - **Description:** Scaffold React app using Vite with TypeScript in `frontend/` using `pnpm`. Configure Tailwind CSS, shadcn UI components, and the requested tweakcn custom theme (`ZFlow` with OKLCH tokens). Installed `@clerk/clerk-react`, `convex`, `@tanstack/react-query`, `react-router-dom`, `lucide-react`, `tailwindcss`, `clsx`, `tailwind-merge`.
  - **Acceptance Criteria:** `pnpm run build` succeeds cleanly with zero TypeScript errors; shadcn UI components configured.

- [x] **TASK-003** `[BE]` **Initialize FastAPI Backend Application with uv & Python 3.12**
  - **TRD Reference:** Section 5, Section 7.1
  - **Description:** Set up Python 3.12 project with `pyproject.toml` in `backend/` using `uv`. Installed `fastapi`, `uvicorn[standard]`, `pydantic>=2.0`, `pydantic-settings`, `google-genai`, `httpx`, `slowapi`, `pyjwt[crypto]`, `pytest`, `pytest-asyncio`. Created modular app structure (`app/api/v1`, `app/core`, `app/services`, `app/schemas`) and health check route.
  - **Acceptance Criteria:** `uv run pytest` executes cleanly (100% pass rate); Pydantic v2 and FastAPI app load without errors.

- [x] **TASK-004** `[DEVOPS]` **Configure Environment Variables Templates & Dockerfile**
  - **TRD Reference:** Section 22 (Environment Variables), Section 25 (Docker)
  - **Description:** Create `.env.example` in `frontend/` and `backend/` with all required keys (`VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CONVEX_URL`, `VITE_API_BASE_URL`, `CLERK_SECRET_KEY`, `CLERK_ISSUER`, `GEMINI_API_KEY`, `CONVEX_URL`, `ALLOWED_ORIGINS`, `RATE_LIMIT`). Create production `Dockerfile` in `backend/` using uv.
  - **Acceptance Criteria:** All env variables documented with placeholders; Dockerfile builds optimized image.

---

## Phase 1: Database Schema & Authentication (Convex + Clerk)

- [x] **TASK-005** `[DB]` **Define Convex Database Schema**
  - **TRD Reference:** Section 11 (Database Design — Convex)
  - **Description:** Create `convex/schema.ts` defining all 6 core tables:
    1. `users` (`clerkId`, `email`, `fullName`, `imageUrl`, `createdAt`, `updatedAt`)
    2. `study_sessions` (`userId`, `type`, `title`, `sourceText`, `status`, `createdAt`, `updatedAt`)
    3. `practice_questions` (`sessionId`, `questionNumber`, `type`, `question`, `options`, `correctAnswer`, `explanation`, `createdAt`)
    4. `question_answers` (`sessionId`, `questionId`, `userAnswer`, `isCorrect`, `answeredAt`)
    5. `simplifications` (`sessionId`, `originalText`, `plainLanguage`, `createdAt`)
    6. `watch_out_items` (`simplificationId`, `category`, `title`, `description`, `severity`, `createdAt`)
  - **Acceptance Criteria:** `npx convex dev` validates schema without schema errors; indexes configured for `by_userId`, `by_sessionId`, and `by_clerkId`.

- [x] **TASK-006** `[DB]` **Implement Convex Queries & Mutations with Ownership Validation**
  - **TRD Reference:** Section 4.2, Section 11, Section 16.2
  - **Description:** Implement `convex/users.ts`, `convex/sessions.ts`, `convex/questions.ts`, `convex/simplifications.ts`. Include helper checks ensuring queries and mutations verify user ownership.
  - **Acceptance Criteria:** User cannot read/mutate sessions belonging to other user IDs. CRUD mutations for sessions and answers function correctly.

- [x] **TASK-007** `[FE]` `[SEC]` **Set up Clerk Authentication in Frontend**
  - **TRD Reference:** FR-001, Section 6.2
  - **Description:** Wrap `App.tsx` with `<ClerkProvider>` and `<ConvexProviderWithClerk>`. Create Auth routes/pages: Sign In (`/sign-in`), Sign Up (`/sign-up`), Forgot Password, and Protected Route wrapper (`<ProtectedRoute>`).
  - **Acceptance Criteria:** Unauthenticated users are redirected to `/sign-in` when visiting protected routes (`/dashboard`, `/practice`, `/simplify`, `/history`, `/profile`).

- [x] **TASK-008** `[BE]` `[SEC]` **Implement Clerk JWT Verification Middleware in FastAPI**
  - **TRD Reference:** Section 4.2, Section 16.1
  - **Description:** Implement `apps/backend/app/core/security.py` to extract Bearer token from `Authorization` header, verify Clerk JWT signature against JWKS/Clerk Issuer, check token expiration, and inject the authenticated `user_id` into FastAPI request dependency `get_current_user`.
  - **Acceptance Criteria:** Valid token allows endpoint access; missing, invalid, or expired tokens return HTTP `401 Unauthorized`.

---

## Phase 2: Backend Core & Gemini AI Integration Layer

- [x] **TASK-009** `[BE]` **Implement Core Configuration & Structured Logging**
  - **TRD Reference:** Section 7.1, Section 26 (Logging & Monitoring)
  - **Description:** Create `app/core/config.py` using `pydantic-settings` to load and validate backend environment variables. Create `app/core/logging.py` for structured JSON logging (logging request ID, user ID hash, endpoint, duration, Gemini status, omitting raw notes and sensitive keys).
  - **Acceptance Criteria:** Missing env variables fail at startup with clear errors; structured logs emit valid JSON without leaking secrets or full text notes.

- [x] **TASK-010** `[BE]` **Implement Health Check Endpoint**
  - **TRD Reference:** Section 8.5
  - **Description:** Create `GET /api/v1/health` returning `{"status": "healthy"}`.
  - **Acceptance Criteria:** Returns HTTP 200 with expected JSON payload.

- [x] **TASK-011** `[BE]` `[AI]` **Implement Gemini Client with Retry & Exponential Backoff**
  - **TRD Reference:** Section 5, Section 9, Section 15 (AI Failure Recovery)
  - **Description:** Create `app/services/ai/gemini_client.py` using Google GenAI SDK. Implement retry logic with exponential backoff (1s, 2s, 4s) for rate limit handling (HTTP 429) and max 2 retries for malformed JSON responses.
  - **Acceptance Criteria:** Successfully connects to Gemini API; handles transient rate limits gracefully with backoff.

- [x] **TASK-012** `[BE]` `[AI]` **Define Pydantic Models for AI Input & Structured Output**
  - **TRD Reference:** Section 10 (Structured AI Output), Section 13 (Input Validation)
  - **Description:** Create `app/schemas/questions.py` and `app/schemas/simplify.py` defining:
    - `GenerateQuestionsRequest` (min length 50 chars, max length limit, question count = 10, difficulty)
    - `PracticeQuestion` (`id`, `type`: `multiple_choice | true_false | fill_blank | short_answer`, `question`, `options`, `answer`, `explanation`)
    - `QuestionGenerationResult` (with validator asserting `len(questions) == 10`)
    - `SimplifyTextRequest` (`text`, `text_type`: `general | textbook | bill | contract`)
    - `WatchOutItem` (`category`, `title`, `description`, `severity`)
    - `SimplificationResult` (`plain_language`, `watch_out_for`)
  - **Acceptance Criteria:** Pydantic models reject payloads under 50 characters, payloads over max size, and enforce exactly 10 questions in generation responses.

- [x] **TASK-013** `[BE]` `[AI]` **Build AI Question Generator Service**
  - **TRD Reference:** Section 9.1, Section 9.2, Section 10
  - **Description:** Implement `app/services/ai/question_generator.py`. Construct prompt enforcing structured JSON output conforming to `QuestionGenerationResult` schema, targeting balanced format distribution (3 MCQ, 2 T/F, 2 Fill-in-the-blank, 3 Short Answer) strictly grounded in provided notes.
  - **Acceptance Criteria:** Prompt produces 10 questions of mixed format based exclusively on input notes, parsed and validated through Pydantic.

- [x] **TASK-014** `[BE]` `[AI]` **Build AI Plain-Language & Watch-Out Analyzer Service**
  - **TRD Reference:** Section 9.3, Section 9.4, Section 10
  - **Description:** Implement `app/services/ai/plain_language.py`. Construct prompt converting complex text into simple language while identifying deadlines, fees, penalties, cancellation terms, obligations under "Watch Out For", adapted to the selected `text_type`.
  - **Acceptance Criteria:** Simplifies complex text without hallucinating unsupported legal/financial claims, extracts structured watch-out items, passes Pydantic validation.

---

## Phase 3: Practice Question Generator (End-to-End)

- [x] **TASK-015** `[BE]` **Implement Generate Questions API Endpoint**
  - **TRD Reference:** FR-004, FR-005, Section 8.1, Section 12.1
  - **Description:** Implement `POST /api/v1/questions/generate` in `app/api/v1/endpoints/questions.py`. Validates Clerk auth token, validates input notes, calls `question_generator`, persists session & questions to Convex, returns session ID and 10 questions.
  - **Acceptance Criteria:** Endpoint returns HTTP 200 with 10 questions and session ID for valid input; returns 400 for input < 50 chars; returns 401 if unauthenticated.

- [x] **TASK-016** `[FE]` **Create TanStack Query Mutation & State for Question Generation**
  - **TRD Reference:** Section 19 (State Management)
  - **Description:** Implement `useGenerateQuestions` custom hook in `apps/frontend/src/hooks/useGenerateQuestions.ts` using `@tanstack/react-query` to call `/api/v1/questions/generate` with Clerk auth headers.
  - **Acceptance Criteria:** Handles loading, success, and error states; caches generated session in query cache.

- [x] **TASK-017** `[FE]` **Build Notes Input Component & Validation**
  - **TRD Reference:** FR-003, FR-012, FR-013, Section 6.3, Section 13
  - **Description:** Build `NotesInput.tsx`, `CharacterCounter.tsx`, and `GenerateQuestionsButton.tsx`. Display character counter, warn when input is < 50 characters or exceeds max limit, disable button when invalid, show error message when empty/short.
  - **Acceptance Criteria:** Input field displays placeholder `"Paste your class notes here..."`, shows live character count, prevents submission under 50 characters with accessible error message.

- [x] **TASK-018** `[FE]` **Build Question Generation Loading State**
  - **TRD Reference:** Section 6.3, Section 27 (Feedback)
  - **Description:** Build `GenerationLoader.tsx` with animated pulse, step indicators ("Analyzing notes...", "Crafting 10 questions...", "Finalizing answers..."), ensuring student is never left on an unresponsive screen.
  - **Acceptance Criteria:** Loading indicator renders smoothly while request is pending and unmounts upon completion or error.

- [x] **TASK-019** `[FE]` **Build Question Cards & Interactive Quiz UI**
  - **TRD Reference:** FR-005, FR-006, Section 6.3
  - **Description:** Build `QuestionCard.tsx`, `AnswerInput.tsx` (radio buttons for MCQ, True/False buttons, text inputs for Fill-in-the-blank & Short Answer), and `QuestionProgress.tsx` (e.g. "Question 3 of 10", progress bar).
  - **Acceptance Criteria:** Renders all 10 questions clearly with appropriate input controls for each question type; allows navigating through or viewing all questions.

- [x] **TASK-020** `[FE]` **Build Instant Answer Evaluation & Feedback Display**
  - **TRD Reference:** FR-006, FR-007, Section 6.3
  - **Description:** Build `AnswerFeedback.tsx`. Evaluate student answer against correct answer, display green/red status badge, reveal model answer and explanation, track overall score (e.g. 8/10 correct), and record answers in Convex via `question_answers` mutation.
  - **Acceptance Criteria:** Shows instant feedback on submit, displays explanation, updates quiz score summary, saves student answer to database.

---

## Phase 4: Plain-Language & "Watch Out For" Translator (End-to-End)

- [x] **TASK-021** `[BE]` **Implement Simplify Text API Endpoint**
  - **TRD Reference:** FR-008, FR-009, FR-011, Section 8.2, Section 12.2
  - **Description:** Implement `POST /api/v1/simplify` in `app/api/v1/endpoints/simplify.py`. Validates Clerk auth token, validates text, calls `plain_language` AI service, persists simplification and watch-out items to Convex, returns structured response.
  - **Acceptance Criteria:** Returns HTTP 200 with original text, plain language text, and watch-out array; returns 400 for empty or short text; returns 401 if unauthenticated.

- [x] **TASK-022** `[FE]` **Create TanStack Query Mutation for Text Simplification**
  - **TRD Reference:** Section 19 (State Management)
  - **Description:** Implement `useSimplifyText` custom hook in `apps/frontend/src/hooks/useSimplifyText.ts` with Clerk authorization header, loading/error states, and error handling.
  - **Acceptance Criteria:** Successfully sends text and `text_type` to backend; manages reactive loading and error states.

- [x] **TASK-023** `[FE]` **Build Text Input & Text-Type Selector Component**
  - **TRD Reference:** FR-008, Section 6.4
  - **Description:** Build `TextInput.tsx` and `TextTypeSelector.tsx` offering selection pills: General Text, Textbook, Bill, Contract. Include `CharacterCounter.tsx` and `SimplifyButton.tsx`.
  - **Acceptance Criteria:** User can paste text, select text type, see character count, and trigger simplification; rejects input < 50 characters with inline message.

- [x] **TASK-024** `[FE]` **Build Side-by-Side & Responsive Stacked Comparison View**
  - **TRD Reference:** FR-010, Section 6.5
  - **Description:** Build `OriginalTextPanel.tsx` and `PlainLanguagePanel.tsx`. On desktop (`md:` breakpoint and above), display side-by-side grid (`grid-cols-2`); on mobile, stack original above simplified text with clear panel headers and copy-to-clipboard action.
  - **Acceptance Criteria:** Side-by-side on desktop, cleanly stacked on mobile without horizontal scroll.

- [x] **TASK-025** `[FE]` **Build "Watch Out For" Panel & Warning Cards**
  - **TRD Reference:** FR-011, Section 6.4
  - **Description:** Build `WatchOutPanel.tsx` and `WarningCard.tsx`. Displays detected items with category icons (fee, deadline, penalty, obligation, cancellation) and severity badges (warning, alert, info).
  - **Acceptance Criteria:** Renders structured list of watch-out items when present; displays "No critical watch-out items detected" when none are returned.

- [x] **TASK-026** `[FE]` **Implement Legal & Financial Safety Disclaimer Banner**
  - **TRD Reference:** Section 2.2, Section 9.4
  - **Description:** Add persistent disclaimer banner/notice in `PlainLanguage` interface: *"Important: Study explains difficult text in simpler language. It does not replace professional legal or financial advice."*
  - **Acceptance Criteria:** Notice is clearly visible whenever plain-language explanations or watch-out items are displayed.

---

## Phase 5: Study History, Persistence & Dashboard

- [x] **TASK-027** `[DB]` **Implement History Queries in Convex**
  - **TRD Reference:** FR-015, Section 11.2, Section 16.2
  - **Description:** Create Convex queries in `convex/sessions.ts` to fetch user sessions sorted by `createdAt desc`, fetch session details with questions/simplifications, and delete session by `sessionId` with strict user ID ownership verification.
  - **Acceptance Criteria:** Returns only records belonging to the authenticated user; unauthorized deletion attempt fails with error.

- [x] **TASK-028** `[BE]` **Implement History API Endpoints in FastAPI**
  - **TRD Reference:** Section 8.3, Section 8.4
  - **Description:** Implement `GET /api/v1/history` (list user sessions) and `DELETE /api/v1/history/{session_id}` (delete session) in `app/api/v1/endpoints/history.py`.
  - **Acceptance Criteria:** `GET` returns list of user's past sessions; `DELETE` removes session and returns 200/204; returns 403/404 if session belongs to another user.

- [x] **TASK-029** `[FE]` **Build Student Dashboard Page**
  - **TRD Reference:** FR-002, Section 6.2
  - **Description:** Implement `Dashboard.tsx` with two prominent hero action cards:
    1. "Practice Questions" -> *"Turn your class notes into 10 practice questions"* -> Button: `Create Questions` (`/practice`)
    2. "Plain Language" -> *"Make difficult text easier to understand"* -> Button: `Simplify Text` (`/simplify`)
    Underneath, display a "Recent Activity" section showing the last 3-5 sessions with quick links.
  - **Acceptance Criteria:** Dashboard displays both main feature cards and dynamically renders recent sessions from Convex.

- [x] **TASK-030** `[FE]` **Build Study History Page & Session Details Modal/View**
  - **TRD Reference:** FR-015, Section 6.2
  - **Description:** Implement `History.tsx`. Display filterable list of previous sessions (All, Practice Questions, Simplifications), search by title/snippet, view full generated questions/simplifications, and delete session with confirmation modal.
  - **Acceptance Criteria:** Real-time updates via Convex reactive hooks; deleting a session immediately updates list; clicking a session opens full detail view.

---

## Phase 6: Error Handling, Rate Limiting & Security Hardening

- [x] **TASK-031** `[BE]` `[SEC]` **Implement Rate Limiting with SlowAPI**
  - **TRD Reference:** Section 14, Section 17 (Rate Limiting)
  - **Description:** Configure SlowAPI middleware in `apps/backend/app/main.py`. Set limit to 30 requests/minute per authenticated user key (`user_id`); block unauthenticated access.
  - **Acceptance Criteria:** Exceeding 30 req/min returns HTTP 429 `{"detail": "Too many requests. Please try again shortly."}`.

- [x] **TASK-032** `[BE]` **Implement Standardized HTTP Exception Handlers**
  - **TRD Reference:** Section 14 (Error Handling table)
  - **Description:** Add global exception handlers in FastAPI for:
    - 400: Empty / short input (`Please provide more text...`)
    - 401: Unauthenticated (`Please sign in again.`)
    - 403: Unauthorized resource access
    - 413: Input too long (`Your text is too long. Please shorten it...`)
    - 422: Pydantic validation error (`Please check your input.`)
    - 429: SlowAPI rate limit
    - 502: Gemini API failure (`Study could not process your request.`)
    - 500: Internal server error (`Something went wrong. Please try again.`)
  - **Acceptance Criteria:** All API errors return standardized JSON format `{"status": "error", "message": "..."}` matching Section 14.

- [x] **TASK-033** `[FE]` **Implement Global Error Boundary & Toast Notification System**
  - **TRD Reference:** G-007, Section 14, Section 27
  - **Description:** Implement React Error Boundary (`ErrorBoundary.tsx`) and notification system (toast / alert banners). Ensure API errors (400, 429, 502) show clear, friendly error messages to the student.
  - **Acceptance Criteria:** App never fails silently; user is shown actionable error messages with a "Try Again" button.

- [x] **TASK-034** `[SEC]` **CORS Whitelist & Client Secret Audit**
  - **TRD Reference:** Section 16.3, Section 16.4
  - **Description:** Configure `CORSMiddleware` in FastAPI to allow only frontend origin (`http://localhost:5173`, Vercel production domains). Audit frontend codebase to guarantee `GEMINI_API_KEY` and `CLERK_SECRET_KEY` are never bundled in client code.
  - **Acceptance Criteria:** Unauthorized CORS origins rejected; client bundle contains zero backend secrets.

---

## Phase 7: UI/UX Polish, Responsive Design & Accessibility

- [x] **TASK-035** `[FE]` **Implement Design System Tokens & Global Styling**
  - **TRD Reference:** Section 6, Section 27, Web App Aesthetics Rules
  - **Description:** Set up Tailwind config with curated color palette (modern indigo/violet accents, clean slate neutrals, emerald for correct, rose for errors, amber for watch-outs), Google Fonts (Inter / Outfit), card glassmorphism, subtle micro-animations.
  - **Acceptance Criteria:** Modern, cohesive visual hierarchy with smooth transitions on button hovers and card interactions.

- [x] **TASK-036** `[FE]` **Build Navigation Header, Mobile Drawer & User Profile**
  - **TRD Reference:** FR-016, FR-017, Section 6.2
  - **Description:** Build `Navbar.tsx` with logo, desktop links (Dashboard, Practice, Plain Language, History), Clerk `<UserButton />`, and responsive mobile hamburger menu (`MobileNav.tsx`). Build basic `Profile.tsx` page.
  - **Acceptance Criteria:** Fully responsive navigation across desktop, tablet, and mobile; active route indicator; user profile management via Clerk widget.

- [x] **TASK-037** `[FE]` **Build Landing Page**
  - **TRD Reference:** Section 6.2 (Landing Page)
  - **Description:** Build `Landing.tsx` introducing Study with hero headline, preview cards for Practice Questions & Plain-Language Translator, key benefits, and prominent "Get Started" / "Sign In" call-to-actions.
  - **Acceptance Criteria:** Responsive, engaging hero page directing new users to Sign Up and existing users to Dashboard.

- [x] **TASK-038** `[FE]` **Implement WCAG 2.1 AA Accessibility Standards**
  - **TRD Reference:** Section 28 (Accessibility)
  - **Description:** Verify semantic HTML (`<main>`, `<nav>`, `<section>`, `<h1>`-`<h3>`), proper `aria-label` attributes on icon-only buttons, visible `:focus-visible` rings, high contrast ratios (>= 4.5:1), and keyboard tab order through quiz forms.
  - **Acceptance Criteria:** All interactive elements operable via keyboard; screen reader labels present; passes basic Lighthouse / axe a11y audit.

---

## Phase 8: Testing & Evaluation Suite

- [x] **TASK-039** `[BE]` **Implement Pytest Suite for Backend Endpoints & Services**
  - **TRD Reference:** Section 20.1
  - **Description:** Write Pytest unit & integration tests:
    - Auth middleware (valid, missing, expired tokens)
    - Input validation (empty, <50 chars, max length)
    - Pydantic schema validation (10 questions rule, watch-out schema)
    - Gemini service mocks & retry logic
    - Endpoints (`/health`, `/questions/generate`, `/simplify`, `/history`)
  - **Acceptance Criteria:** `pytest` passes with >85% backend test coverage. *(Achieved: 95% coverage, 38/38 passing tests)*

- [x] **TASK-040** `[FE]` **Implement Vitest & React Testing Library Frontend Suite**
  - **TRD Reference:** Section 20.2
  - **Description:** Write unit tests for:
    - `NotesInput` validation and character count
    - `QuestionCard` rendering and answer selection
    - `AnswerFeedback` correct/incorrect state
    - `OriginalTextPanel` vs `PlainLanguagePanel` display
    - `WatchOutPanel` warnings rendering
  - **Acceptance Criteria:** `npm run test` executes and passes all test suites cleanly. *(Achieved: 5/5 suites, 19/19 passing tests)*

- [x] **TASK-041** `[AI]` **Create AI Prompt Evaluation Suite & Test Cases**
  - **TRD Reference:** Section 21 (AI Evaluation)
  - **Description:** Create automated test runner in `apps/backend/tests/test_ai_evaluation.py` running against sample dataset (Biology notes, Math notes, History lecture, Lease contract, Utility bill) asserting:
    1. Exactly 10 questions generated with answers and explanations.
    2. Format distribution includes multiple choice, true/false, fill-in-the-blank, short answer.
    3. Plain language retains core meaning and extracts deadlines/fees.
    4. No unsupported legal/financial statements.
  - **Acceptance Criteria:** Evaluation test script passes all sample benchmarks. *(Achieved: 5/5 benchmark test suites passing)*

- [x] **TASK-042** `[DEVOPS]` **Implement Playwright End-to-End (E2E) Test Suite**
  - **TRD Reference:** Section 20.3
  - **Description:** Write Playwright E2E tests in `tests/e2e/`:
    1. Flow 1: Sign In -> Dashboard -> Practice Questions -> Generate 10 Questions -> Answer Questions -> Verify feedback.
    2. Flow 2: Sign In -> Plain Language -> Paste Lease -> Simplify -> Verify Side-by-Side & Watch-Out items.
  - **Acceptance Criteria:** `npx playwright test` completes successfully in headless browser. *(Achieved: 3/3 E2E test suites passing)*

---

## Phase 9: Containerization, CI/CD & Deployment

- [x] **TASK-043** `[BE]` `[DEVOPS]` **Create Backend Dockerfile & Container Optimization**
  - **TRD Reference:** Section 25 (Docker), Section 23
  - **Description:** Write multi-stage `Dockerfile` in `apps/backend/` using `python:3.12-slim`, non-root user, pinned dependencies, running `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
  - **Acceptance Criteria:** Docker container builds locally, starts up cleanly, and passes health check.

- [x] **TASK-044** `[DEVOPS]` **Set Up GitHub Actions CI/CD Workflow**
  - **TRD Reference:** Section 24 (CI/CD)
  - **Description:** Create `.github/workflows/ci.yml` running on pull requests and pushes to `main`/`develop`:
    - Linting (ESLint, Ruff/Flake8)
    - Type checking (TypeScript `tsc`, Pyright/MyPy)
    - Backend Pytest suite
    - Frontend Vitest suite
    - Frontend build (`npm run build`)
    - Docker build validation
  - **Acceptance Criteria:** CI workflow triggers on commit and passes all jobs.

- [x] **TASK-045** `[DEVOPS]` **Configure Hosting & Deployment Targets**
  - **TRD Reference:** Section 23 (Deployment Architecture)
  - **Description:** Document and configure deployment setups:
    - Frontend: Vercel deployment with environment variables.
    - Backend: Google Cloud Run service with Cloud Run env secrets.
    - Database: Convex Cloud deployment with production schema.
  - **Acceptance Criteria:** Deploy configurations documented with production deployment scripts/guides.

- [x] **TASK-046** `[DEVOPS]` **Production Readiness & Launch Checklist**
  - **TRD Reference:** Section 31 (MVP Acceptance Criteria)
  - **Description:** Perform end-to-end audit verifying:
    - HTTPS enabled everywhere
    - Rate limits active
    - No leaked API keys
    - Responsive on mobile devices (iOS Safari, Android Chrome) and desktop browsers
    - Error handling gracefully displays on UI
  - **Acceptance Criteria:** All MVP acceptance criteria from Section 31 validated and approved.
