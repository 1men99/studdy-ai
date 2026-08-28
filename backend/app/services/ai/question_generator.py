from app.schemas.questions import GenerateQuestionsRequest, QuestionGenerationResult
from app.services.ai.groq_client import GroqClient


def build_question_prompt(request: GenerateQuestionsRequest) -> str:
    return f"""You are an academic study assistant. Use only the supplied notes; do not add outside facts.
Generate exactly 10 questions at {request.difficulty} difficulty in valid JSON matching QuestionGenerationResult.
Use this exact distribution: 3 multiple_choice, 2 true_false, 2 fill_blank, and 3 short_answer.
Every question needs a unique id, answer, and concise explanation. Include options only where useful.

NOTES:
{request.notes}
"""


async def generate_questions(
    request: GenerateQuestionsRequest, client: GroqClient | None = None
) -> QuestionGenerationResult:
    return await (client or GroqClient()).generate_structured(
        build_question_prompt(request), QuestionGenerationResult
    )