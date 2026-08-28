from typing import List
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Study AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # CORS
    ALLOWED_ORIGINS: list[str] | str = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Clerk Authentication
    CLERK_SECRET_KEY: str = ""
    CLERK_ISSUER: str = ""

    # OpenAI AI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Convex Database
    CONVEX_URL: str = ""

    # Rate Limiting
    RATE_LIMIT: str = "30/minute"

    # Input Limits
    MIN_INPUT_LENGTH: int = 50
    MAX_INPUT_LENGTH: int = 20000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_production_secrets(self):
        if self.ENVIRONMENT == "production":
            missing = [
                name
                for name, value in {
                    "CLERK_SECRET_KEY": self.CLERK_SECRET_KEY,
                    "CLERK_ISSUER": self.CLERK_ISSUER,
                    "OPENAI_API_KEY": self.OPENAI_API_KEY,
                    "CONVEX_URL": self.CONVEX_URL,
                }.items()
                if not value
            ]
            if missing:
                raise ValueError(
                    f"Missing required production environment variables: {', '.join(missing)}"
                )
        return self

    def require_openai_key(self) -> str:
        if not self.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is required to use OpenAI services")
        return self.OPENAI_API_KEY

    @property
    def allowed_origins(self) -> list[str]:
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip().rstrip("/") for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        return [origin.rstrip("/") for origin in self.ALLOWED_ORIGINS]


settings = Settings()
