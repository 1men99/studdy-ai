import pytest
from unittest.mock import AsyncMock, patch
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.schemas.questions import QuestionGenerationResult
from app.schemas.simplify import SimplificationResult


def mock_questions_payload():
    return {
        "questions": [
            {
                "id": str(i + 1),
                "type": "multiple_choice" if i < 3 else "true_false" if i < 5 else "fill_blank" if i < 7 else "short_answer",
                "question": f"Question {i + 1} content?",
                "options": ["Opt A", "Opt B", "Opt C", "Opt D"] if i < 3 else [],
                "answer": "Opt A" if i < 3 else "True" if i < 5 else "Answer keyword" if i < 7 else "Short explanation",
                "explanation": f"Explanation for question {i + 1}.",
            }
            for i in range(10)
        ]
    }


def mock_simplify_payload():
    return {
        "plain_language": "This is the simplified plain language explanation that anyone can easily understand.",
        "watch_out_for": [
            {
                "category": "fee",
                "title": "Early Termination Fee",
                "description": "A $200 penalty applies if cancelled early.",
                "severity": "alert",
            },
            {
                "category": "deadline",
                "title": "30-Day Written Notice",
                "description": "Notice must be given 30 days in advance.",
                "severity": "warning",
            },
        ],
    }


@pytest.mark.asyncio
async def test_generate_questions_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        valid_result = QuestionGenerationResult.model_validate(mock_questions_payload())
        with patch("app.api.v1.endpoints.questions.generate_questions", new=AsyncMock(return_value=valid_result)):
            response = await client.post(
                "/api/v1/questions/generate",
                headers={"Authorization": "Bearer dev_user_test"},
                json={
                    "notes": "Cellular respiration is the process by which organisms combine oxygen with foodstuff molecules.",
                    "question_count": 10,
                },
            )
            assert response.status_code == 200
            data = response.json()
            assert "questions" in data
            assert len(data["questions"]) == 10


@pytest.mark.asyncio
async def test_generate_questions_ai_failure():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("app.api.v1.endpoints.questions.generate_questions", side_effect=Exception("AI service unavailable")):
            response = await client.post(
                "/api/v1/questions/generate",
                headers={"Authorization": "Bearer dev_user_test"},
                json={
                    "notes": "Cellular respiration is the process by which organisms combine oxygen with foodstuff molecules.",
                    "question_count": 10,
                },
            )
            assert response.status_code == 502
            data = response.json()
            assert data["status"] == "error"
            assert "Study could not process your request" in data["message"]


@pytest.mark.asyncio
async def test_simplify_text_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        valid_result = SimplificationResult.model_validate(mock_simplify_payload())
        with patch("app.api.v1.endpoints.simplify.simplify_text", new=AsyncMock(return_value=valid_result)):
            response = await client.post(
                "/api/v1/simplify",
                headers={"Authorization": "Bearer dev_user_test"},
                json={
                    "text": "The Lessee shall provide written notice of termination at least thirty (30) days prior to the expiration date.",
                    "text_type": "contract",
                },
            )
            assert response.status_code == 200
            data = response.json()
            assert "plain_language" in data
            assert "watch_out_for" in data
            assert len(data["watch_out_for"]) == 2


@pytest.mark.asyncio
async def test_simplify_text_ai_failure():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("app.api.v1.endpoints.simplify.simplify_text", side_effect=Exception("AI error")):
            response = await client.post(
                "/api/v1/simplify",
                headers={"Authorization": "Bearer dev_user_test"},
                json={
                    "text": "The Lessee shall provide written notice of termination at least thirty (30) days prior to the expiration date.",
                    "text_type": "contract",
                },
            )
            assert response.status_code == 502
            data = response.json()
            assert data["status"] == "error"


@pytest.mark.asyncio
async def test_list_history_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        mock_sessions = [{"_id": "sess_1", "title": "Biology Practice", "type": "practice_questions"}]
        with patch("app.services.convex.client.ConvexClient.run_query", new=AsyncMock(return_value=mock_sessions)):
            response = await client.get(
                "/api/v1/history",
                headers={"Authorization": "Bearer dev_user_test"},
            )
            assert response.status_code == 200
            assert response.json() == mock_sessions


@pytest.mark.asyncio
async def test_list_history_failure():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("app.services.convex.client.ConvexClient.run_query", side_effect=Exception("Convex timeout")):
            response = await client.get(
                "/api/v1/history",
                headers={"Authorization": "Bearer dev_user_test"},
            )
            assert response.status_code == 502
            assert response.json()["status"] == "error"


@pytest.mark.asyncio
async def test_delete_history_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("app.services.convex.client.ConvexClient.run_mutation", new=AsyncMock(return_value=None)):
            response = await client.delete(
                "/api/v1/history/sess_12345",
                headers={"Authorization": "Bearer dev_user_test"},
            )
            assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_history_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("app.services.convex.client.ConvexClient.run_mutation", side_effect=Exception("Session missing")):
            response = await client.delete(
                "/api/v1/history/sess_missing",
                headers={"Authorization": "Bearer dev_user_test"},
            )
            assert response.status_code == 404
            assert response.json()["status"] == "error"
