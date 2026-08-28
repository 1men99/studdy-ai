import pytest
from pydantic import ValidationError

from app.schemas.questions import GenerateQuestionsRequest, QuestionGenerationResult
from app.schemas.simplify import SimplifyTextRequest
from app.services.ai.openai_client import OpenAIClient
from app.services.ai.question_generator import build_question_prompt


def question_payload(number: int) -> dict:
    return {
        "id": str(number),
        "type": "short_answer",
        "question": "What is the concept?",
        "answer": "The concept",
        "explanation": "The notes define it this way.",
    }


def test_input_models_enforce_length_limits():
    with pytest.raises(ValidationError):
        GenerateQuestionsRequest(notes="short")
    with pytest.raises(ValidationError):
        SimplifyTextRequest(text="x" * 20001)


def test_question_result_requires_exactly_ten_questions():
    with pytest.raises(ValidationError):
        QuestionGenerationResult(questions=[question_payload(1)])
    result = QuestionGenerationResult(questions=[question_payload(i) for i in range(10)])
    assert len(result.questions) == 10


def test_question_prompt_is_grounded_and_requests_distribution():
    request = GenerateQuestionsRequest(notes="These are enough class notes to pass the minimum length check.")
    prompt = build_question_prompt(request)
    assert request.notes in prompt
    assert "3 multiple_choice, 2 true_false, 2 fill_blank, and 3 short_answer" in prompt


@pytest.mark.asyncio
async def test_openai_client_retries_malformed_json():
    responses = iter(["not json", '{"questions": []}', "still not json"])

    async def fake_generate(_prompt: str, _schema: str) -> str:
        return next(responses)

    with pytest.raises(ValueError, match="invalid structured JSON"):
        await OpenAIClient(generate_fn=fake_generate).generate_structured(
            "prompt", QuestionGenerationResult
        )