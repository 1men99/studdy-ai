import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import get_current_user_id
from app.schemas.questions import GenerateQuestionsRequest, QuestionGenerationResult
from app.services.ai.question_generator import generate_questions

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/questions/generate", response_model=QuestionGenerationResult)
@limiter.limit(settings.RATE_LIMIT)
async def generate_practice_questions(
    request: Request,
    response: Response,
    payload: GenerateQuestionsRequest,
    user_id: str = Depends(get_current_user_id),
):
    try:
        result = await generate_questions(payload)
    except Exception as error:
        logger.exception("question_generation_failed", extra={"ai_status": "failed", "user_id_hash": user_id[:12]})
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Study could not process your request.",
        ) from error

    logger.info("question_generation_succeeded", extra={"ai_status": "completed", "user_id_hash": user_id[:12]})
    return result