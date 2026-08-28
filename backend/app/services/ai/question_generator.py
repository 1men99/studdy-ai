from app.schemas.questions import GenerateQuestionsRequest, QuestionGenerationResult
from app.services.ai.groq_client import GroqClient


def build_question_prompt(request: GenerateQuestionsRequest) -> str:
    return f"""You are an academic study assistant. Use only the supplied notes; do not add outside facts.
Generate exactly 10 questions at {request.difficulty} difficulty.
Format your output as a single JSON object matching QuestionGenerationResult with a key "questions" containing an array of 10 question objects.

Each question object must match this schema:
- "id": string (e.g., "q1", "q2", ..., "q10")
- "type": one of "multiple_choice", "true_false", "fill_blank", "short_answer"
- "question": string
- "options": array of strings (for multiple_choice provide 4 choices; for true_false provide ["True", "False"]; for fill_blank/short_answer provide [])
- "answer": string (exact answer matching one of the options or correct response)
- "explanation": concise string explaining why the answer is correct

Distribution requirement: 3 multiple_choice, 2 true_false, 2 fill_blank, and 3 short_answer questions.

NOTES:
{request.notes}
"""


async def generate_questions(
    request: GenerateQuestionsRequest, client: GroqClient | None = None
) -> QuestionGenerationResult:
    return await (client or GroqClient()).generate_structured(
        build_question_prompt(request), QuestionGenerationResult
    )