from typing import Any

import httpx

from app.core.config import settings


class ConvexClient:
    """Small adapter for invoking Convex mutations from FastAPI."""

    async def run_mutation(self, path: str, args: dict[str, Any], token: str | None = None) -> Any:
        if not settings.CONVEX_URL:
            return None

        headers = {"Authorization": f"Bearer {token}"} if token else {}
        async with httpx.AsyncClient(base_url=settings.CONVEX_URL, timeout=15, headers=headers) as client:
            response = await client.post("/api/mutation", json={"path": path, "args": args})
            response.raise_for_status()
            return response.json().get("value")

    async def run_query(self, path: str, args: dict[str, Any], token: str | None = None) -> Any:
        if not settings.CONVEX_URL:
            return []
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        async with httpx.AsyncClient(base_url=settings.CONVEX_URL, timeout=15, headers=headers) as client:
            response = await client.post("/api/query", json={"path": path, "args": args})
            response.raise_for_status()
            return response.json().get("value")