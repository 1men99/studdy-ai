from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import get_current_user_id
from app.services.convex.client import ConvexClient

router = APIRouter()


def bearer_token(request: Request) -> str:
    return request.headers.get("authorization", "").removeprefix("Bearer ").strip()


@router.get("/history")
@limiter.limit(settings.RATE_LIMIT)
async def list_history(request: Request, response: Response, user_id: str = Depends(get_current_user_id)):
    try:
        return await ConvexClient().run_query("sessions:listMine", {}, bearer_token(request))
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Study history is unavailable.") from error


@router.delete("/history/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit(settings.RATE_LIMIT)
async def delete_history(session_id: str, request: Request, response: Response, user_id: str = Depends(get_current_user_id)):
    try:
        await ConvexClient().run_mutation("sessions:remove", {"sessionId": session_id}, bearer_token(request))
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study session not found.") from error