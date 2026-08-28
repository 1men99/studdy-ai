# Study AI Production Deployment & Operations Guide

This guide covers deploying the **Study AI** platform to production across **Vercel** (Frontend), **Google Cloud Run / Container Host** (FastAPI Backend), and **Convex Cloud** (Relational Database).

---

## Architecture Overview

```
                        +---------------------------+
                        |   Vercel (React Frontend) |
                        |   https://studdy.ai       |
                        +-------------+-------------+
                                      |
                      +---------------+---------------+
                      |                               |
                      v                               v
        +---------------------------+   +---------------------------+
        | Cloud Run (FastAPI API)   |   | Convex Cloud (Database)   |
        | https://api.studdy.ai     |   | https://studdy.convex.cloud|
        +---------------------------+   +---------------------------+
```

---

## 1. Frontend Deployment (Vercel)

The React SPA is hosted on **Vercel**:

### Configuration (`frontend/vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Environment Variables
Configure the following production variables in the Vercel Dashboard under **Settings > Environment Variables**:

| Variable Name | Production Value Example | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://api.studdy.ai` | FastAPI production backend URL |
| `VITE_CONVEX_URL` | `https://scrupulous-blackbird-512.convex.cloud` | Convex production deployment URL |
| `VITE_CONVEX_SITE_URL` | `https://scrupulous-blackbird-512.convex.site` | Convex HTTP endpoint URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Clerk live publishable authentication key |

### Deployment Command
```bash
cd frontend
npx vercel --prod
```

---

## 2. Backend Container Deployment (Google Cloud Run)

The FastAPI service runs as a stateless Docker container.

### A. Environment Variables & Secret Management
Set the following secrets in Google Secret Manager / Cloud Run environment:

| Variable Name | Description |
| :--- | :--- |
| `ENVIRONMENT` | Must be set to `production` |
| `ALLOWED_ORIGINS` | `https://studdy.ai,https://www.studdy.ai` |
| `GROQ_API_KEY` | Production Groq API key |
| `CLERK_SECRET_KEY` | Production Clerk backend secret key |
| `CLERK_ISSUER` | Clerk JWT Issuer URL (e.g. `https://clerk.studdy.ai`) |
| `CONVEX_URL` | Production Convex deployment URL |
| `RATE_LIMIT` | `30/minute` |

### B. Container Build & Deploy Script
```bash
# 1. Build and push container to Google Artifact Registry
gcloud builds submit --tag gcr.io/studdy-ai-prod/backend:latest ./backend

# 2. Deploy to Cloud Run
gcloud run deploy study-ai-backend \
  --image gcr.io/studdy-ai-prod/backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars ENVIRONMENT=production,ALLOWED_ORIGINS="https://studdy.ai" \
  --set-secrets GROQ_API_KEY=GROQ_API_KEY:latest,CLERK_SECRET_KEY=CLERK_SECRET_KEY:latest
```

---

## 3. Database Deployment (Convex Cloud)

Deploy Convex database schema and serverless backend logic:

```bash
cd frontend
npx convex deploy --prod
```

---

## 4. Production Readiness Checklist

Before launching to live users, verify all security and infrastructure criteria:

- [x] **HTTPS Enforcement**: SSL/TLS active across Vercel, Cloud Run, and Convex.
- [x] **Secret Audit**: Confirm no secret API keys exist in client-side bundles (`VITE_*`).
- [x] **Rate Limiting**: `slowapi` active on FastAPI endpoints (`30/minute`).
- [x] **CORS Isolation**: `ALLOWED_ORIGINS` strictly restricted to production domain.
- [x] **Responsive UI**: Verified layout on iOS Safari, Android Chrome, and Desktop screens.
- [x] **Error Fallbacks**: React `<ErrorBoundary>` configured to handle runtime UI failures gracefully.
