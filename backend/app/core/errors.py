import logging
from typing import Any, Mapping, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger(__name__)

STATUS_CODE_MESSAGES: dict[int, str] = {
    400: "Please check your request and provide valid input.",
    401: "Please sign in again.",
    403: "You do not have access to this content.",
    404: "The requested resource was not found.",
    413: "Your text is too long. Please shorten it and try again.",
    422: "Please check your input.",
    429: "Too many requests. Please try again shortly.",
    500: "Something went wrong. Please try again.",
    502: "Study could not process your request.",
}


def build_error_response(
    status_code: int,
    message: Optional[str] = None,
    detail: Any = None,
    headers: Optional[dict[str, str] | Mapping[str, str]] = None,
) -> JSONResponse:
    default_msg = STATUS_CODE_MESSAGES.get(status_code, "An unexpected error occurred.")
    final_message = message or (detail if isinstance(detail, str) and detail else default_msg)

    payload = {
        "status": "error",
        "message": final_message,
    }
    if detail is not None and detail != final_message:
        payload["detail"] = detail

    return JSONResponse(
        status_code=status_code,
        content=payload,
        headers=headers,
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    logger.warning(
        "http_exception",
        extra={
            "status_code": exc.status_code,
            # pyrefly: ignore [unnecessary-type-conversion]
            "detail": str(exc.detail),
            "path": request.url.path,
        },
    )
    message = exc.detail if isinstance(exc.detail, str) else None
    return build_error_response(
        status_code=exc.status_code,
        message=message,
        detail=exc.detail if not isinstance(exc.detail, str) else None,
        headers=exc.headers,
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.warning(
        "validation_error",
        extra={
            "path": request.url.path,
            "errors": exc.errors(),
        },
    )
    for err in exc.errors():
        err_type = str(err.get("type", "")).lower()
        err_msg = str(err.get("msg", "")).lower()
        if "too_long" in err_type or "too long" in err_msg or "max_length" in err_type or "less_than" in err_type:
            return build_error_response(
                status_code=413,
                message="Your text is too long. Please shorten it and try again.",
                detail=exc.errors(),
            )
        if "too_short" in err_type or "min_length" in err_type or "at least" in err_msg or "greater_than" in err_type:
            return build_error_response(
                status_code=400,
                message="Please provide more text so Study can give you a useful result.",
                detail=exc.errors(),
            )

    return build_error_response(
        status_code=422,
        message="Please check your input.",
        detail=exc.errors(),
    )


async def rate_limit_exceeded_handler(
    request: Request, exc: RateLimitExceeded
) -> JSONResponse:
    logger.warning(
        "rate_limit_exceeded",
        extra={
            "path": request.url.path,
            # pyrefly: ignore [unnecessary-type-conversion]
            "detail": str(exc.detail),
        },
    )
    headers = {}
    retry_after = getattr(exc, "retry_after", None)
    if retry_after is not None:
        headers["Retry-After"] = str(retry_after)

    return build_error_response(
        status_code=429,
        message="Too many requests. Please try again shortly.",
        # pyrefly: ignore [unnecessary-type-conversion]
        detail=str(exc.detail) if exc.detail else "Rate limit exceeded: 30 requests per minute.",
        headers=headers,
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        "unhandled_server_error",
        extra={
            "path": request.url.path,
            "error_type": type(exc).__name__,
        },
    )
    return build_error_response(
        status_code=500,
        message="Something went wrong. Please try again.",
    )


def register_exception_handlers(app: FastAPI) -> None:
    # pyrefly: ignore [bad-argument-type]
    app.add_exception_handler(HTTPException, http_exception_handler)  # pyright: ignore[reportArgumentType]
    # pyrefly: ignore [bad-argument-type]
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # pyright: ignore[reportArgumentType]
    # pyrefly: ignore [bad-argument-type]
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)  # pyright: ignore[reportArgumentType]
    app.add_exception_handler(Exception, unhandled_exception_handler)
