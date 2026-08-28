import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded
from limits import parse as parse_limit
from pydantic import BaseModel, Field

from app.core.limiter import get_rate_limit_key
from app.core.errors import (
    build_error_response,
    http_exception_handler,
    validation_exception_handler,
    rate_limit_exceeded_handler,
    unhandled_exception_handler,
)
from app.services.convex.client import ConvexClient
from app.services.ai.groq_client import GroqClient
from app.core.config import settings


class DummySchema(BaseModel):
    title: str = Field(min_length=3)
    count: int


@pytest.mark.asyncio
async def test_convex_client_mutation_and_query(monkeypatch):
    monkeypatch.setattr(settings, "CONVEX_URL", "https://mock.convex.cloud")

    mock_response = MagicMock()
    mock_response.json.return_value = {"value": {"success": True}}
    mock_response.raise_for_status = MagicMock()

    with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=mock_response)):
        client = ConvexClient()
        mut_res = await client.run_mutation("sessions:create", {"title": "Test"}, token="mock_token")
        assert mut_res == {"success": True}

        query_res = await client.run_query("sessions:get", {"id": "1"}, token="mock_token")
        assert query_res == {"success": True}


@pytest.mark.asyncio
async def test_convex_client_empty_url(monkeypatch):
    monkeypatch.setattr(settings, "CONVEX_URL", "")
    client = ConvexClient()
    assert await client.run_mutation("test", {}) is None
    assert await client.run_query("test", {}) == []


def test_get_rate_limit_key_logic():
    # Dev token
    mock_req = MagicMock(spec=Request)
    mock_req.headers = {"Authorization": "Bearer dev_user_abc123"}
    assert get_rate_limit_key(mock_req) == "user:dev_user_abc123"

    # Raw token without sub
    mock_req.headers = {"Authorization": "Bearer token_only_string"}
    key = get_rate_limit_key(mock_req)
    assert key.startswith("token:")

    # Fallback to IP
    mock_req.headers = {}
    mock_req.client.host = "127.0.0.1"
    assert get_rate_limit_key(mock_req) == "127.0.0.1"


@pytest.mark.asyncio
async def test_groq_client_real_http_flow(monkeypatch):
    monkeypatch.setattr(settings, "GROQ_API_KEY", "gsk_mock_api_key")
    monkeypatch.setattr(settings, "GROQ_MODEL", "llama-3.3-70b-versatile")

    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": '{"title": "Valid Dummy", "count": 10}'
                }
            }
        ]
    }
    mock_resp.raise_for_status = MagicMock()

    with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=mock_resp)):
        client = GroqClient()
        result = await client.generate_structured("Generate dummy", DummySchema)
        assert result.title == "Valid Dummy"
        assert result.count == 10


@pytest.mark.asyncio
async def test_error_handlers():
    req = MagicMock(spec=Request)
    req.url.path = "/api/v1/test"

    # HTTP Exception
    http_exc = HTTPException(status_code=403, detail="Forbidden action")
    resp = await http_exception_handler(req, http_exc)
    assert resp.status_code == 403

    # Rate Limit Exceeded
    rl_exc = MagicMock(spec=RateLimitExceeded)
    rl_exc.detail = "30 per 1 minute"
    rl_exc.retry_after = 30
    resp_rl = await rate_limit_exceeded_handler(req, rl_exc)
    assert resp_rl.status_code == 429
    assert resp_rl.headers.get("Retry-After") == "30"

    # Unhandled Exception
    unhandled_exc = RuntimeError("Fatal crash")
    resp_500 = await unhandled_exception_handler(req, unhandled_exc)
    assert resp_500.status_code == 500

    # Validation Error for generic invalid type
    val_exc = RequestValidationError(errors=[{"type": "missing", "loc": ["body", "text"], "msg": "Field required"}])
    resp_422 = await validation_exception_handler(req, val_exc)
    assert resp_422.status_code == 422
