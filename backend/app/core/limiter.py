import hashlib
import jwt
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings


def get_rate_limit_key(request: Request) -> str:
    """
    Extracts the authenticated user ID from Authorization Bearer token or falls back to client IP.
    Ensures rate limits apply per student user ID.
    """
    auth_header = request.headers.get("Authorization", "") or request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        if token:
            # Development mode token
            if token.startswith("dev_user_"):
                return f"user:{token}"
            try:
                # Fast unverified JWT payload decode to retrieve 'sub' (User ID) without network overhead
                unverified = jwt.decode(token, options={"verify_signature": False})
                sub = unverified.get("sub")
                if sub:
                    return f"user:{sub}"
            except Exception:
                pass
            return f"token:{hashlib.sha256(token.encode()).hexdigest()[:16]}"

    # Fallback to client remote IP for unauthenticated routes
    return get_remote_address(request)


limiter = Limiter(
    key_func=get_rate_limit_key,
    default_limits=[settings.RATE_LIMIT],
    headers_enabled=True,
)
