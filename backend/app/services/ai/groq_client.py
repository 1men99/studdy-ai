# Alias wrapper for backwards compatibility
from app.services.ai.openai_client import OpenAIClient as GroqClient

__all__ = ["GroqClient"]