from typing import Any

import httpx
import jwt
from jwt.algorithms import RSAAlgorithm
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security_scheme = HTTPBearer(auto_error=False)
_jwks_cache: dict[str, Any] | None = None


async def _get_signing_key(token: str, *, allow_refresh: bool = True) -> Any:
    global _jwks_cache

    header = jwt.get_unverified_header(token)
    key_id = header.get("kid")
    if not key_id or not settings.CLERK_ISSUER:
        raise jwt.InvalidTokenError("Missing Clerk issuer or key ID")

    if _jwks_cache is None or not isinstance(_jwks_cache, dict):
        jwks_url = f"{settings.CLERK_ISSUER.rstrip('/')}/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url, timeout=5)
        response.raise_for_status()
        _jwks_cache = response.json()

    if isinstance(_jwks_cache, dict):
        for key in _jwks_cache.get("keys", []):
            if key.get("kid") == key_id:
                return RSAAlgorithm.from_jwk(key)

    # Refresh once when Clerk rotates keys.
    if allow_refresh:
        _jwks_cache = None
        return await _get_signing_key(token, allow_refresh=False)

    raise jwt.InvalidTokenError("Unknown Clerk key ID")


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> str:
    """
    Extracts and validates a Clerk JWT, returning its subject (user ID).
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    # In development mode without Clerk keys, permit a dev fallback
    if settings.ENVIRONMENT == "development" and token.startswith("dev_user_"):
        return token

    try:
        signing_key = await _get_signing_key(token)
        claims = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            options={"verify_aud": False},
        )
        user_id = claims.get("sub")
        if not isinstance(user_id, str) or not user_id:
            raise jwt.InvalidTokenError("Missing subject claim")
        return user_id
    except (httpx.HTTPError, jwt.PyJWTError, ValueError):
        if settings.ENVIRONMENT == "development":
            try:
                unverified_claims = jwt.decode(token, options={"verify_signature": False})
                dev_sub = unverified_claims.get("sub")
                if isinstance(dev_sub, str) and dev_sub:
                    return dev_sub
            except Exception:
                pass
            return "dev_user"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
