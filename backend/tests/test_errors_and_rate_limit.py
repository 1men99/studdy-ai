import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.config import settings


@pytest.mark.asyncio
async def test_unauthenticated_request_returns_standard_401():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/questions/generate",
            json={"notes": "Short text", "question_count": 10},
        )
        assert response.status_code == 401
        data = response.json()
        assert data["status"] == "error"
        assert "message" in data


@pytest.mark.asyncio
async def test_input_too_short_returns_standard_400_or_422():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/questions/generate",
            headers={"Authorization": "Bearer dev_user_test"},
            json={"notes": "Too short", "question_count": 10},
        )
        assert response.status_code in [400, 422]
        data = response.json()
        assert data["status"] == "error"
        assert "message" in data


@pytest.mark.asyncio
async def test_input_too_long_returns_standard_413():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        huge_text = "A" * (settings.MAX_INPUT_LENGTH + 500)
        response = await client.post(
            "/api/v1/questions/generate",
            headers={"Authorization": "Bearer dev_user_test"},
            json={"notes": huge_text, "question_count": 10},
        )
        assert response.status_code == 413
        data = response.json()
        assert data["status"] == "error"
        assert "message" in data
        assert "too long" in data["message"].lower()


@pytest.mark.asyncio
async def test_cors_headers_on_options_request():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.options(
            "/api/v1/health",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
