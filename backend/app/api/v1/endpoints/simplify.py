import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import get_current_user_id
from app.schemas.simplify import SimplificationResult, SimplifyTextRequest
from app.services.ai.plain_language import simplify_text

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/simplify", response_model=SimplificationResult)
@limiter.limit(settings.RATE_LIMIT)
async def simplify_text_endpoint(
    request: Request,
    response: Response,
    payload: SimplifyTextRequest,
    user_id: str = Depends(get_current_user_id),
):
    try:
        result = await simplify_text(payload)
        logger.info(
            "simplification_succeeded",
            extra={"ai_status": "completed", "user_id_hash": user_id[:12]},
        )
        return result
    except Exception as error:
        logger.exception("simplification_failed", extra={"ai_status": "failed", "user_id_hash": user_id[:12]})
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Study could not process your request.",
        ) from error