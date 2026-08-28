from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.core.config import settings


TextType = Literal["general", "textbook", "bill", "contract"]
WatchOutCategory = Literal["deadline", "fee", "penalty", "cancellation", "obligation", "other"]
Severity = Literal["info", "warning", "alert"]


class SimplifyTextRequest(BaseModel):
    text: str = Field(min_length=settings.MIN_INPUT_LENGTH, max_length=settings.MAX_INPUT_LENGTH)
    text_type: TextType = "general"

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Text cannot be blank")
        return value


class WatchOutItem(BaseModel):
    category: WatchOutCategory
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    severity: Severity


class SimplificationResult(BaseModel):
    plain_language: str = Field(min_length=1)
    watch_out_for: list[WatchOutItem] = Field(default_factory=list)