# Stage 1: Build stage
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt-get/lists/*

# Install uv for fast dependency syncing
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Stage 2: Production runtime stage
FROM python:3.12-slim AS runner

WORKDIR /app

# Install system dependencies (curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt-get/lists/*

# Create a non-root system user for security
RUN groupadd -g 999 appgroup && \
    useradd -r -u 999 -g appgroup appuser

# Copy virtual environment and app code
COPY --from=builder /app/.venv /app/.venv
COPY app /app/app

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PORT=8000

USER appuser

EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
