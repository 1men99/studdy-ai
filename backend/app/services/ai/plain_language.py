# pyrefly: ignore [missing-import]
from app.schemas.simplify import SimplificationResult, SimplifyTextRequest
# pyrefly: ignore [missing-import]
from app.services.ai.openai_client import OpenAIClient


def build_simplification_prompt(request: SimplifyTextRequest) -> str:
    return f"""You explain difficult material clearly without giving professional legal or financial advice.
Rewrite the supplied {request.text_type} text in plain language. Identify only details explicitly supported by
the source under watch_out_for, including deadlines, fees, penalties, cancellation terms, and obligations.
Return valid JSON matching SimplificationResult. Use an empty watch_out_for list when none are present.

SOURCE TEXT:
{request.text}
"""


async def simplify_text(
    request: SimplifyTextRequest, client: OpenAIClient | None = None
) -> SimplificationResult:
    return await (client or OpenAIClient()).generate_structured(
        build_simplification_prompt(request), SimplificationResult
    )