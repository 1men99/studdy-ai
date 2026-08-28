# Technical Requirements Document (TRD) & Software Requirements Specification (SRS)

**Project:** Study — AI-Powered Study Material Assistant  
**Document Version:** 1.0.0  
**Status:** Technical Implementation Specification  
**Target Users:** Students  
**Target Platform:** Responsive Web Application  
**Frontend:** React.js + Vite + TypeScript  
**Backend:** Python 3.12 + FastAPI  
**Database:** Convex  
**Authentication:** Clerk  
**AI Platform:** Google Gemini API  

---

## 1. Overview

### 1.1 Executive Summary
Study is an AI-powered student productivity web application designed to help students transform difficult academic material into useful study resources.

The platform provides two primary AI-powered capabilities:
1. **Practice Question Generator** — Students paste class notes and Study generates 10 mixed-format practice questions.
2. **Plain-Language Translator** — Students paste difficult paragraphs from textbooks, bills, contracts, or other documents and Study converts them into simple language while displaying the original text alongside the explanation.

For contracts and bills, Study additionally identifies important details under a **"Watch Out For"** section, including deadlines, fees, penalties, cancellation terms, obligations, and other potentially important conditions.

The system uses Clerk for authentication, Convex for real-time application data, FastAPI for backend/API orchestration, and Gemini for AI processing.

### 1.2 System Architecture Philosophy
Study follows a lightweight decoupled architecture:

1. **Frontend — React + Vite + TypeScript**
   - Provides the student interface.
   - Handles navigation, authentication UI, text input, results display, loading states, and responsive mobile layouts.

2. **Authentication — Clerk**
   - Handles sign-up, sign-in, sign-out, password recovery, and session management.
   - Provides authenticated user identity to the frontend and backend.

3. **Database — Convex**
   - Stores user profiles, pasted study sessions, generated questions, simplified explanations, watch-out items, and usage history.
   - Provides reactive data synchronization.

4. **Backend — FastAPI + Python**
   - Provides secured REST API endpoints.
   - Validates incoming requests using Pydantic.
   - Verifies Clerk authentication tokens.
   - Orchestrates Gemini API requests.
   - Validates AI responses.
   - Applies rate limiting and error handling.

5. **AI Engine — Gemini API**
   - Reads class notes and generates practice questions.
   - Converts difficult text into plain language.
   - Identifies important contract/bill details.
   - Returns structured JSON responses.

The architecture follows the sample document's separation of frontend, database, backend orchestration, and Gemini intelligence layers.

---

## 2. Goals & Non-Goals

### 2.1 Primary Goals

- **G-001 — Student Authentication**: Students must be able to create accounts, sign in, sign out, and securely access their own study history.
- **G-002 — Practice Question Generation**: Students must be able to paste class notes and generate exactly 10 mixed-format practice questions.
- **G-003 — Plain-Language Conversion**: Students must be able to paste difficult paragraphs and receive a simplified explanation.
- **G-004 — Contract/Bill Awareness**: The system must identify important details in bills and contracts and display them under a "Watch Out For" section.
- **G-005 — Input Validation**: The system must prevent empty or extremely short input from being submitted to the AI.
- **G-006 — Mobile Usability**: The application must be fully responsive and usable on smartphones, tablets, and desktop computers.
- **G-007 — Error Visibility**: The application must never fail silently. Users must receive clear feedback when something goes wrong.
- **G-008 — Secure User Data**: Users must only be able to access their own study materials and generated results.

### 2.2 Non-Goals — Version 1
The following features are outside the initial version:
- AI tutoring through unrestricted conversations.
- Automatic completion of student assignments.
- Automatic submission of assignments.
- Full document upload and OCR processing.
- Legal advice or legal interpretation.
- Medical or financial professional advice.
- Plagiarism detection.
- Learning management system integration.
- Teacher/admin dashboards.
- Social features between students.
- Native Android/iOS applications.
- Automatic textbook importing.

> The application may explain contract or bill language, but it must clearly communicate that the feature is an explanation tool rather than professional legal or financial advice.

---

## 3. Functional Requirements

| ID | Module | Feature | Description | Priority |
|---|---|---|---|---|
| FR-001 | Authentication | Clerk Authentication | Support student sign-up, sign-in, sign-out and password recovery using Clerk. | P0 |
| FR-002 | Dashboard | Student Dashboard | Display the two main Study tools and recent activity. | P0 |
| FR-003 | Notes | Notes Input | Allow students to paste class notes into a large text area. | P0 |
| FR-004 | Questions | Generate Questions | Generate exactly 10 mixed-format practice questions from class notes. | P0 |
| FR-005 | Questions | Mixed Formats | Support multiple choice, true/false, fill-in-the-blank and short-answer questions. | P0 |
| FR-006 | Questions | Answer Questions | Allow students to answer generated questions. | P0 |
| FR-007 | Questions | Answer Feedback | Display correct/incorrect feedback and explanations where appropriate. | P0 |
| FR-008 | Plain Language | Text Input | Allow students to paste difficult paragraphs, bills or contracts. | P0 |
| FR-009 | Plain Language | Simplification | Convert difficult text into clear plain language. | P0 |
| FR-010 | Plain Language | Side-by-Side View | Display original text alongside the plain-language explanation on desktop. | P0 |
| FR-011 | Watch Out | Important Details | Identify important fees, deadlines, penalties, obligations and cancellation terms. | P0 |
| FR-012 | Validation | Empty Input | Reject empty submissions with a clear error message. | P0 |
| FR-013 | Validation | Short Input | Reject input below the minimum useful length. | P0 |
| FR-014 | Error Handling | AI Failure | Display a user-friendly error when Gemini cannot process a request. | P0 |
| FR-015 | History | Study History | Store previous generated study sessions for authenticated users. | P1 |
| FR-016 | Profile | Account Management | Allow students to view basic account information and sign out. | P1 |
| FR-017 | Responsive UI | Mobile Interface | Provide a responsive interface optimized for mobile devices. | P0 |
| FR-018 | Security | Data Isolation | Prevent one student from accessing another student's data. | P0 |

---

## 4. User Roles & Access Model

### 4.1 Student
Study uses a single primary role: **Student**.

A student can:
- Create an account.
- Sign in and sign out.
- Paste class notes.
- Generate practice questions.
- Answer practice questions.
- Paste difficult text.
- Generate plain-language explanations.
- Review "Watch Out For" details.
- View their previous study sessions.
- Delete their own study history.

### 4.2 Security Boundaries
- Every protected request must be associated with the authenticated Clerk user.
- The backend must verify the Clerk JWT before processing protected requests.
- Every Convex query and mutation must ensure that the requested record belongs to the authenticated user.
- This follows the sample's strict data-isolation model where users can only access their own documents and the backend validates the authenticated identity against stored ownership.

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | UI framework |
| Build Tool | Vite | Development server and production bundling |
| Language | TypeScript | Frontend type safety |
| Styling | Tailwind CSS | Responsive UI and design system |
| Routing | React Router | Application navigation |
| Server State | TanStack Query | API request and caching management |
| Authentication | Clerk | Authentication and session management |
| Database | Convex | Reactive application database |
| Backend | FastAPI | REST API and AI orchestration |
| Backend Language | Python 3.12+ | Backend implementation |
| Validation | Pydantic v2 | Request/response validation |
| AI | Gemini API | Question generation and text simplification |
| AI SDK | Google GenAI SDK | Gemini API integration |
| Rate Limiting | SlowAPI | API abuse protection |
| Backend Server | Uvicorn | ASGI server |
| Testing | Pytest | Backend tests |
| Frontend Testing | Vitest + React Testing Library | Component/unit testing |
| E2E Testing | Playwright | Full application testing |
| Containerization | Docker | Backend deployment |
| CI/CD | GitHub Actions | Automated testing/deployment |
| Frontend Hosting | Vercel | React production hosting |
| Backend Hosting | Google Cloud Run | FastAPI production hosting |
| Database Hosting | Convex Cloud | Production database |

The technology choices intentionally follow the architecture of the uploaded sample where React/Vite is paired with Tailwind, TanStack Query, FastAPI, Pydantic, Convex, Clerk, Gemini, testing tools, Docker, and cloud deployment.

---

## 6. Frontend Requirements

### 6.1 Frontend Architecture
Recommended structure:

```
apps/
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── common/
    │   │   ├── dashboard/
    │   │   ├── questions/
    │   │   ├── plain-language/
    │   │   └── history/
    │   ├── pages/
    │   │   ├── Landing/
    │   │   ├── Dashboard/
    │   │   ├── Practice/
    │   │   ├── PlainLanguage/
    │   │   ├── History/
    │   │   └── Profile/
    │   ├── hooks/
    │   ├── services/
    │   ├── types/
    │   ├── utils/
    │   ├── layouts/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

### 6.2 Main Pages

#### Landing Page
- **Purpose:** Introduce Study and explain its two main capabilities.
- **Primary actions:** Sign In, Get Started

#### Authentication Pages
Clerk should provide: Sign In, Sign Up, Forgot Password, Sign Out

#### Dashboard
The dashboard should contain two primary cards:
- **Practice Questions:** Turn your class notes into 10 practice questions. (Button: *Create Questions*)
- **Plain Language:** Make difficult text easier to understand. (Button: *Simplify Text*)
- A recent activity section should appear underneath.

### 6.3 Practice Question Interface
**Components:**
- `NotesInput`
- `CharacterCounter`
- `GenerateQuestionsButton`
- `GenerationLoader`
- `QuestionCard`
- `AnswerInput`
- `AnswerFeedback`
- `QuestionProgress`

The text area should display placeholder: `"Paste your class notes here..."`  
The minimum input requirement should be configurable from the backend.

### 6.4 Plain Language Interface
**Components:**
- `TextInput`
- `TextTypeSelector`
- `CharacterCounter`
- `SimplifyButton`
- `OriginalTextPanel`
- `PlainLanguagePanel`
- `WatchOutPanel`
- `WarningCard`
- `GenerationLoader`

The student may optionally select text type classification: General Text, Textbook, Bill, Contract. This classification helps Gemini produce more appropriate output.

### 6.5 Responsive Design
- **Desktop:** Side-by-side view (Original Text | Plain Language)
- **Mobile:** Stacked view (Original Text -> Plain Language -> Watch Out For)
- The application must not require horizontal scrolling.

---

## 7. Backend Requirements

### 7.1 FastAPI Architecture
Recommended structure:

```
apps/
└── backend/
    ├── app/
    │   ├── api/
    │   │   └── v1/
    │   │   ├── endpoints/
    │   │   │   ├── questions.py
    │   │   │   ├── simplify.py
    │   │   │   ├── history.py
    │   │   │   └── health.py
    │   │   └── router.py
    │   ├── core/
    │   │   ├── config.py
    │   │   ├── security.py
    │   │   └── logging.py
    │   ├── models/
    │   ├── services/
    │   │   ├── ai/
    │   │   │   ├── gemini_client.py
    │   │   │   ├── question_generator.py
    │   │   │   └── plain_language.py
    │   │   └── convex/
    │   ├── schemas/
    │   └── main.py
    ├── tests/
    ├── Dockerfile
    ├── pyproject.toml
    └── requirements.txt
```

---

## 8. API Specification

### 8.1 Generate Practice Questions
- **Endpoint:** `POST /api/v1/questions/generate`
- **Authentication:** `Authorization: Bearer <clerk_jwt>`

**Request:**
```json
{
  "notes": "Photosynthesis is the process...",
  "question_count": 10,
  "difficulty": "mixed"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "session_id": "session_123",
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "What is the main purpose of photosynthesis?",
        "options": [
          "Produce glucose",
          "Break down proteins",
          "Produce nitrogen",
          "Store water"
        ],
        "answer": "Produce glucose",
        "explanation": "Photosynthesis converts light energy into chemical energy stored in glucose."
      }
    ]
  }
}
```
*The response must contain exactly 10 questions.*

### 8.2 Simplify Text
- **Endpoint:** `POST /api/v1/simplify`

**Request:**
```json
{
  "text": "The lessee shall be liable...",
  "text_type": "contract"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "session_id": "session_456",
    "original_text": "The lessee shall be liable...",
    "plain_language": "This means the person renting the property...",
    "watch_out_for": [
      {
        "category": "penalty",
        "title": "Late Payment",
        "description": "You may be charged an additional fee if payment is late."
      },
      {
        "category": "deadline",
        "title": "Payment Deadline",
        "description": "Payment must be made by the stated due date."
      }
    ]
  }
}
```

### 8.3 Get Study History
- **Endpoint:** `GET /api/v1/history`
- Returns the authenticated student's previous sessions.

### 8.4 Delete Study Session
- **Endpoint:** `DELETE /api/v1/history/{session_id}`
- The backend must verify that the session belongs to the authenticated user before deletion.

### 8.5 Health Check
- **Endpoint:** `GET /api/v1/health`
- **Response:** `{"status": "healthy"}`

---

## 9. AI Service Requirements

### 9.1 Gemini Question Generator
The Question Generator must:
1. Receive student notes.
2. Understand the major concepts.
3. Generate exactly 10 questions.
4. Mix question formats.
5. Avoid questions unrelated to the supplied notes.
6. Avoid inventing information not present in the notes.
7. Provide answers.
8. Provide short explanations where useful.
9. Return strict structured JSON.

**Recommended formats:**
- Multiple choice
- True/False
- Fill in the blank
- Short answer

### 9.2 Question Distribution
The system should aim for a balanced distribution:
- 3 × Multiple Choice
- 2 × True/False
- 2 × Fill in the Blank
- 3 × Short Answer

*The exact distribution may vary slightly when necessary to produce better questions, but the total must always equal 10.*

### 9.3 Gemini Plain-Language Service
The service must:
1. Read the supplied text.
2. Preserve the original meaning.
3. Rewrite complex language in simpler language.
4. Avoid adding unsupported facts.
5. Identify important conditions.
6. Identify deadlines.
7. Identify fees.
8. Identify penalties.
9. Identify obligations.
10. Identify cancellation/termination conditions where applicable.

### 9.4 Contract and Bill Safety
Study must not claim to provide professional legal or financial advice.

For contract/bill content, the UI should display a small notice such as:
> **Important:** Study explains difficult text in simpler language. It does not replace professional legal or financial advice.

The AI should distinguish between:
- What the text says
- Why it may matter
- Potential item to review

It should not make unsupported claims that a clause is illegal, fraudulent, or legally enforceable.

---

## 10. Structured AI Output

Gemini responses must be validated using Pydantic.

```python
from typing import Literal
from pydantic import BaseModel, field_validator

class PracticeQuestion(BaseModel):
    id: str
    type: Literal[
        "multiple_choice",
        "true_false",
        "fill_blank",
        "short_answer"
    ]
    question: str
    options: list[str] | None = None
    answer: str
    explanation: str | None = None

class QuestionGenerationResult(BaseModel):
    questions: list[PracticeQuestion]

    @field_validator("questions")
    @classmethod
    def validate_question_count(cls, value):
        if len(value) != 10:
            raise ValueError("Exactly 10 questions are required")
        return value

class WatchOutItem(BaseModel):
    category: str
    title: str
    description: str

class SimplificationResult(BaseModel):
    plain_language: str
    watch_out_for: list[WatchOutItem]
```

Structured output validation follows the sample architecture's use of Pydantic to enforce Gemini JSON schemas.

---

## 11. Database Design — Convex

Recommended Convex tables:
- `users`
- `study_sessions`
- `practice_questions`
- `question_answers`
- `simplifications`
- `watch_out_items`

### 11.1 Users
```
users
├── clerkId
├── email
├── fullName
├── imageUrl
├── createdAt
└── updatedAt
```

### 11.2 Study Sessions
```
study_sessions
├── userId
├── type (practice_questions | plain_language)
├── title
├── sourceText
├── status (processing | completed | failed)
├── createdAt
└── updatedAt
```

### 11.3 Practice Questions
```
practice_questions
├── sessionId
├── questionNumber
├── type
├── question
├── options
├── correctAnswer
├── explanation
└── createdAt
```

### 11.4 Question Answers
```
question_answers
├── sessionId
├── questionId
├── userAnswer
├── isCorrect
└── answeredAt
```

### 11.5 Simplifications
```
simplifications
├── sessionId
├── originalText
├── plainLanguage
└── createdAt
```

### 11.6 Watch-Out Items
```
watch_out_items
├── simplificationId
├── category
├── title
├── description
├── severity
└── createdAt
```
*All records must have a user ownership path through the corresponding study session.*

---

## 12. Data Flow

### 12.1 Practice Question Flow
Student -> React UI -> Clerk Authentication -> FastAPI -> Validate Request -> Gemini API -> Pydantic Validation -> Convex -> React -> 10 Practice Questions

### 12.2 Plain-Language Flow
Student -> Paste Difficult Text -> React -> Clerk JWT -> FastAPI -> Validate Text -> Gemini API -> Plain-Language Result -> Watch-Out Detection -> Pydantic Validation -> Convex -> React

---

## 13. Input Validation

### 13.1 Empty Input
If the student submits an empty field:
`Please paste some text before continuing.`
*(No Gemini API request should be made.)*

### 13.2 Too-Short Input
The backend should enforce a minimum input length (Recommended initial value: 50 characters). The threshold should be configurable using environment settings.  
Error: `Please provide more text so Study can give you a useful result.`

### 13.3 Maximum Input
The backend must establish a maximum input size to control Gemini token consumption, request latency, API cost, and abuse. The maximum should be configurable.  
If exceeded: `Your text is too long. Please shorten it and try again.`

---

## 14. Error Handling

| Scenario | HTTP Status | User Response |
|---|---|---|
| Empty input | 400 | Please paste some text before continuing. |
| Input too short | 400 | Please provide more text. |
| Input too long | 413 | Your text is too long. |
| Invalid request | 422 | Please check your input. |
| Unauthenticated | 401 | Please sign in again. |
| Unauthorized resource | 403 | You do not have access to this content. |
| Gemini rate limit | 429 | Too many requests. Please try again shortly. |
| Gemini failure | 502 | Study could not process your request. |
| Server failure | 500 | Something went wrong. Please try again. |

The sample TRD similarly specifies explicit handling for invalid inputs, API rate limits, authentication failures, and AI output validation failures.

---

## 15. AI Failure Recovery

If Gemini returns invalid structured output:
1. Validate response with Pydantic.
2. If validation fails, attempt a controlled repair/retry.
3. Limit retries to a maximum of 2.
4. If unsuccessful, return an error to the frontend.
5. Never display malformed AI data.

**For Gemini rate limits (exponential backoff):**
- Retry 1 -> 1 second
- Retry 2 -> 2 seconds
- Retry 3 -> 4 seconds

After the maximum retry count, return an appropriate error.

---

## 16. Security Requirements

### 16.1 Authentication
All protected API endpoints require a valid Clerk JWT. The backend verifies: Signature, Expiration, Issuer, User identity.

### 16.2 Data Isolation
A student must never be able to:
- View another student's notes.
- View another student's questions.
- View another student's simplifications.
- Delete another student's sessions.

### 16.3 API Security
Implement HTTPS/TLS in production, CORS whitelist, request validation, rate limiting, authentication middleware, input sanitization, secure environment variables, and ensure no Gemini API keys exist in frontend code.

### 16.4 API Key Protection
The Gemini API key must exist only on the FastAPI server. Never expose `GEMINI_API_KEY` inside React/Vite client-side code.

---

## 17. Rate Limiting

Recommended initial limits:
- **Authenticated user:** 30 AI requests / minute
- **Unauthenticated:** No AI generation access

Additional daily usage limits may be introduced later depending on Gemini API costs.

---

## 18. Performance Requirements

| Metric | Target |
|---|---|
| Initial page render | < 2 seconds |
| API validation | < 200ms |
| Question generation | < 8 seconds |
| Plain-language generation | < 8 seconds |
| Convex read | < 500ms |
| UI interaction response | < 100ms |
| API availability | 99.9% target |

AI generation times may vary depending on Gemini availability, input size, and model selection.

---

## 19. State Management

- **TanStack Query:** For FastAPI requests, request caching, loading states, error states, refetching.
- **Convex React Hooks:** For real-time study history, persistent user data, reactive session updates.
- **Local React State:** For text input, current question answer, modal state, UI controls.

*Avoid introducing Redux unless application complexity grows significantly.*

---

## 20. Testing Strategy

### 20.1 Backend
- **Tool:** Pytest
- **Tests:** Authentication middleware, input validation, Pydantic schemas, Gemini service, retry handling, Convex integration, API endpoints.
- **Target:** `>85% backend coverage`

### 20.2 Frontend
- **Tool:** Vitest + React Testing Library
- **Tests:** Dashboard, input validation, question cards, answer selection, loading states, error states, plain-language display, mobile navigation.

### 20.3 End-to-End
- **Tool:** Playwright
- **Flows:**
  - Sign Up -> Dashboard -> Paste Notes -> Generate Questions -> Answer Questions
  - Sign In -> Plain Language -> Paste Contract -> Simplify -> Review Watch-Out Items

---

## 21. AI Evaluation

AI output should be tested independently from normal application testing using an evaluation dataset containing: Lecture notes, Science notes, Mathematics notes, Business notes, History notes, Textbook paragraphs, Bills, Contracts.

**Evaluate Question Generation:** Exactly 10 questions, correct answers, relevance to notes, variety of question formats, no unsupported information.  
**Evaluate Plain Language:** Meaning preservation, readability, accuracy, important detail detection, no invented legal/financial claims.

---

## 22. Environment Variables

### Frontend (`.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_CONVEX_URL=
VITE_API_BASE_URL=
```

### Backend (`.env`)
```env
CLERK_SECRET_KEY=
CLERK_ISSUER=
GEMINI_API_KEY=
CONVEX_URL=
ALLOWED_ORIGINS=
RATE_LIMIT=
```
*Secrets must never be committed to Git.*

---

## 23. Deployment Architecture

```
 ┌───────────────────┐
 │      Student      │
 └─────────┬─────────┘
           │
           ▼
 ┌───────────────────┐
 │      Vercel       │
 │   React + Vite    │
 └─────────┬─────────┘
           │ Clerk JWT
           ▼
 ┌───────────────────┐
 │ Google Cloud Run  │
 │ FastAPI + Python  │
 └───────┬─────┬─────┘
         │     │
 ┌───────┘     └────────┐
 ▼                      ▼
 ┌──────────────┐ ┌──────────────┐
 │ Convex Cloud │ │  Gemini API  │
 │   Database   │ │  AI Engine   │
 └──────────────┘ └──────────────┘
```

Vercel for React application, Convex Cloud for database, and Cloud Run for FastAPI service.

---

## 24. CI/CD

Use **GitHub Actions**.  
**Pipeline:** Git Push -> Install Dependencies -> Lint -> Type Check -> Backend Tests -> Frontend Tests -> Build Frontend -> Build Docker Image -> Deploy  
**Branches:** `main` (production deployment), `develop`, `feature/*`

---

## 25. Docker

FastAPI backend containerized flow:  
`Python 3.12 -> Install requirements -> Copy application -> Run Uvicorn -> Cloud Run`

---

## 26. Logging & Monitoring

**Backend logs capture:** Request ID, User ID hash, Endpoint, Request duration, Gemini status, Validation failures, Error codes.  
**Do NOT log:** Raw student notes unnecessarily, Passwords, Clerk secrets, Gemini API keys, Sensitive contract/bill content.  
**Recommended monitoring:** Sentry (errors), Google Cloud Monitoring (backend), Convex Dashboard (database).

---

## 27. User Experience Requirements

- **Simple:** Understand feature purpose immediately.
- **Minimal Navigation:** Home, Practice, Plain Language, History, Profile.
- **Clear Actions:** Primary buttons like "Generate 10 Questions", "Simplify Text", "Try Again", "View History".
- **Feedback:** Clear states for Loading, Success, Error. Never leave user staring at an unchanged screen while processing.

---

## 28. Accessibility

Target **WCAG 2.1 AA** principles: Keyboard navigation, visible focus states, proper form labels, accessible buttons, sufficient text contrast, screen-reader-friendly error messages, semantic HTML, no information conveyed only through color, responsive text sizing.

---

## 29. Recommended Project Structure

```
study/
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── backend/
│       ├── app/
│       ├── tests/
│       ├── Dockerfile
│       ├── pyproject.toml
│       └── requirements.txt
├── convex/
│   ├── schema.ts
│   ├── users.ts
│   ├── sessions.ts
│   └── questions.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── README.md
└── .gitignore
```

---

## 30. Development Milestones

- **Sprint 1 — Project Setup (Week 1):** React + Vite + TS, Tailwind CSS, Clerk, Convex, FastAPI, GitHub repo, Env config.
- **Sprint 2 — Authentication & Dashboard (Week 2):** Sign up/in/out, Protected routes, Dashboard, Mobile nav, Profile.
- **Sprint 3 — Practice Question Generator (Weeks 3–4):** Notes input, Validation, FastAPI question endpoint, Gemini integration, Pydantic validation, 10-question generation, Question UI, Answers.
- **Sprint 4 — Plain Language (Weeks 5–6):** Text input, Text-type selection, Gemini simplification, Side-by-side layout, Watch-Out system, Safety notice.
- **Sprint 5 — History & Persistence (Week 7):** Convex study sessions, Question/simplification history, Delete session, Recent activity.
- **Sprint 6 — Security & Testing (Week 8):** Clerk JWT verification, Rate limiting, CORS, API security, Pytest, Vitest, RTL, Playwright.
- **Sprint 7 — Deployment (Week 9):** Docker, Cloud Run, Vercel, Convex Prod, Production Env vars, GitHub Actions CI/CD.
- **Sprint 8 — Final QA (Week 10):** Mobile/Desktop testing, AI evaluation, Performance testing, Security review, Error testing, Production launch.

---

## 31. MVP Acceptance Criteria

- **Authentication:** Student can create account, sign in, sign out; protected pages require authentication.
- **Practice Questions:** Paste notes, reject empty/short input, generate 10 mixed questions, answer questions, receive feedback.
- **Plain Language:** Paste text, classify text type, display original & simplified text, display Watch-Out items, display safety disclaimer.
- **Persistence:** Store sessions in Convex, view history, isolate user data.
- **Reliability:** Loading & error states work, handle Gemini failures, reject invalid AI output, rate limiting works.
- **Deployment:** Frontend & backend publicly accessible, HTTPS enabled, env vars configured, works on mobile & desktop.

---

## 32. Future Enhancements — Version 2

1. AI conversational tutor
2. Flashcard generation
3. Study-plan generation
4. Spaced repetition
5. PDF/document uploads
6. Image-based note processing
7. OCR for scanned notes
8. Audio lecture transcription
9. Voice-based studying
10. Progress analytics
11. Course/subject organization
12. Teacher/classroom functionality
13. Collaborative study groups
14. Calendar integration
15. Native mobile applications

---

## 33. Final Architecture Summary

```
           STUDENT
              │
              ▼
    ┌───────────────────┐
    │   React + Vite    │
    │    TypeScript     │
    │   Tailwind CSS    │
    └─────────┬─────────┘
              │ Clerk JWT
              ▼
    ┌───────────────────┐
    │      FastAPI      │
    │    Python 3.12    │
    │                   │
    │    Validation     │
    │     Security      │
    │  AI Orchestration │
    └───────┬─────┬─────┘
            │     │
            ▼     ▼
    ┌──────────┐ ┌──────────────┐
    │  Convex  │ │  Gemini API  │
    │ Database │ │  AI Engine   │
    └──────────┘ └──────────────┘
```

**Core Stack Summary:**
React + Vite + TypeScript + Tailwind CSS + React Router + TanStack Query  
↓  
Clerk  
↓  
FastAPI + Python + Pydantic  
↓  
Convex + Gemini API  
↓  
Vercel + Google Cloud Run + GitHub Actions  

> This stack is intentionally kept relatively small. Since Study's MVP is based on pasted text rather than document uploads, there is no need to introduce unnecessary PDF parsers, rich-text editors, message queues, or microservices at this stage.
