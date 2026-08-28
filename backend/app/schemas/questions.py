from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.config import settings


QuestionType = Literal["multiple_choice", "true_false", "fill_blank", "short_answer"]
Difficulty = Literal["easy", "medium", "hard"]


class GenerateQuestionsRequest(BaseModel):
    notes: str = Field(min_length=settings.MIN_INPUT_LENGTH, max_length=settings.MAX_INPUT_LENGTH)
    question_count: Literal[10] = 10
    difficulty: Difficulty = "medium"

    @field_validator("notes")
    @classmethod
    def notes_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Notes cannot be blank")
        return value


class PracticeQuestion(BaseModel):
    id: str = Field(min_length=1)
    type: QuestionType
    question: str = Field(min_length=1)
    options: list[str] = Field(default_factory=list)
    answer: str = Field(min_length=1)
    explanation: str = Field(min_length=1)


class QuestionGenerationResult(BaseModel):
    questions: list[PracticeQuestion]

    @model_validator(mode="after")
    def must_have_ten_questions(self):
        if len(self.questions) != 10:
            raise ValueError("Question generation must return exactly 10 questions")
        return self