import hashlib
import time
import uuid
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.limiter import limiter
from app.core.errors import register_exception_handlers
from app.api.v1.router import api_router

# Setup structured logger
logger = setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# Register rate limiter
app.state.limiter = limiter

# Register global standardized exception handlers (TRD Section 14)
register_exception_handlers(app)

# CORS configuration (TRD Section 16.3)
if settings.ALLOWED_ORIGINS:
    origins = settings.allowed_origins
    has_wildcard = "*" in origins or "http://*" in origins or "https://*" in origins
    regex_patterns = [
        origin.replace(".", r"\.").replace("*", r".*")
        for origin in origins
        if "*" in origin and origin != "*"
    ]
    origin_regex = f"^({'|'.join(regex_patterns)})$" if regex_patterns else None
    exact_origins = [o for o in origins if "*" not in o]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if has_wildcard else exact_origins,
        allow_origin_regex=origin_regex,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
    )

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    started = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - started) * 1000, 2)
    token = request.headers.get("authorization", "")
    user_id_hash = hashlib.sha256(token.encode()).hexdigest()[:12] if token else None
    extra = {
        "request_id": request_id,
        "duration_ms": duration_ms,
        "status_code": response.status_code,
        "endpoint": request.url.path,
    }
    if user_id_hash:
        extra["user_id_hash"] = user_id_hash
    logger.info("request.completed", extra=extra)
    response.headers["X-Request-ID"] = request_id
    return response


@app.get("/")
async def root():
    return {
        "message": "Welcome to Study AI Backend API",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health",
    }
