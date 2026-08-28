from fastapi import APIRouter
from app.api.v1.endpoints import health, history, questions, simplify

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(questions.router, tags=["Questions"])
api_router.include_router(simplify.router, tags=["Simplify"])
api_router.include_router(history.router, tags=["History"])
