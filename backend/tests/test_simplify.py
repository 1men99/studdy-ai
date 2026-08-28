import pytest
from pydantic import ValidationError

from app.schemas.simplify import SimplifyTextRequest
from app.services.ai.plain_language import build_simplification_prompt


def test_simplify_request_rejects_short_text():
    with pytest.raises(ValidationError):
        SimplifyTextRequest(text="too short")


def test_simplify_prompt_keeps_source_and_type():
    request = SimplifyTextRequest(
        text="This contract clause explains a cancellation deadline and a possible fee for ending early.",
        text_type="contract",
    )
    prompt = build_simplification_prompt(request)
    assert request.text in prompt
    assert "contract" in prompt