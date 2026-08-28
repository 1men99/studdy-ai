import pytest
import jwt
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.core.security import get_current_user_id, _get_signing_key
from app.core.config import settings


@pytest.mark.asyncio
async def test_get_current_user_id_missing_credentials():
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user_id(None)
    assert exc_info.value.status_code == 401
    assert "Missing authentication credentials" in exc_info.value.detail


@pytest.mark.asyncio
async def test_get_current_user_id_dev_fallback(monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "development")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="dev_user_12345")
    user_id = await get_current_user_id(credentials)
    assert user_id == "dev_user_12345"


@pytest.mark.asyncio
async def test_get_current_user_id_invalid_jwt(monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "CLERK_ISSUER", "https://clerk.example.com")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid.token.structure")

    with patch("app.core.security._get_signing_key", side_effect=jwt.InvalidTokenError("Bad key")):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user_id(credentials)
        assert exc_info.value.status_code == 401
        assert "Invalid authentication token" in exc_info.value.detail


@pytest.mark.asyncio
async def test_get_current_user_id_valid_jwt(monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "CLERK_ISSUER", "https://clerk.example.com")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="valid.mock.token")

    fake_signing_key = "fake-rsa-key"
    with patch("app.core.security._get_signing_key", return_value=fake_signing_key), \
         patch("jwt.decode", return_value={"sub": "user_29abcXYZ"}):
        user_id = await get_current_user_id(credentials)
        assert user_id == "user_29abcXYZ"


@pytest.mark.asyncio
async def test_get_current_user_id_missing_sub(monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "CLERK_ISSUER", "https://clerk.example.com")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="valid.mock.token")

    with patch("app.core.security._get_signing_key", return_value="fake-rsa-key"), \
         patch("jwt.decode", return_value={"sub": None}):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user_id(credentials)
        assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_signing_key_jwks_resolution(monkeypatch):
    monkeypatch.setattr(settings, "CLERK_ISSUER", "https://clerk.example.com")

    mock_jwks = {
        "keys": [
            {
                "kty": "RSA",
                "kid": "test-key-id",
                "use": "sig",
                "alg": "RS256",
                "n": "u1...mock",
                "e": "AQAB",
            }
        ]
    }

    mock_response = MagicMock()
    mock_response.json.return_value = mock_jwks
    mock_response.raise_for_status = MagicMock()

    with patch("jwt.get_unverified_header", return_value={"kid": "test-key-id"}), \
         patch("httpx.AsyncClient.get", new=AsyncMock(return_value=mock_response)), \
         patch("jwt.algorithms.RSAAlgorithm.from_jwk", return_value="parsed-rsa-key"):
        key = await _get_signing_key("dummy.jwt.token")
        assert key == "parsed-rsa-key"
