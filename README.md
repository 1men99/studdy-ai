# Study AI — AI-Powered Study Material Assistant

Study is an AI-powered student productivity web application designed to help students transform difficult academic material into useful study resources.

## Key Capabilities
1. **Practice Question Generator**: Generates exactly 10 balanced, mixed-format practice questions (MCQ, True/False, Fill-in-the-blank, Short Answer) from raw notes with instant grading and explanations.
2. **Plain-Language Translator**: Converts complex textbook excerpts, bills, or contracts into simple language with side-by-side comparison and detects important deadlines, fees, penalties, and obligations under "Watch Out For".

---

## Two-Repository Architecture

The project is architected into two standalone repositories ready for independent deployment:

```
studdy-ai/
├── frontend/             # React + Vite + TypeScript + Tailwind + shadcn UI (ZFlow theme) + Convex + Clerk
└── backend/              # FastAPI + Python 3.12 + Google Gemini API (managed with uv)
```

---

## Quick Start

### 1. Frontend Setup
```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```
Runs at `http://localhost:5173`.

### 2. Backend Setup
```bash
cd backend
uv sync
cp .env.example .env
uv run uvicorn app.main:app --reload --port 8000
```
Runs at `http://localhost:8000` (API Docs at `http://localhost:8000/api/v1/docs`).

### 3. Run Backend Tests
```bash
cd backend
uv run pytest
```

### Production Configuration

Set these variables in the hosting provider dashboards rather than committing `.env` files.

Frontend (Vercel):

```text
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_API_BASE_URL=https://your-backend.example.com
```

Backend (Cloud Run or another container host):

```text
ENVIRONMENT=production
CLERK_SECRET_KEY=sk_live_...
CLERK_ISSUER=https://your-clerk-domain.clerk.accounts.dev
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
CONVEX_URL=https://your-deployment.convex.cloud
ALLOWED_ORIGINS=["https://your-frontend.example.com"]
RATE_LIMIT=30/minute
```

Deploy Convex from `frontend/` with `npx convex deploy`, deploy the backend from `backend/`, and set the resulting backend URL as `VITE_API_BASE_URL`. The backend refuses to start in production when required secrets are missing.
