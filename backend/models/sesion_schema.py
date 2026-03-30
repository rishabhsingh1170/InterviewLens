from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from .question_answer_schema import QuestionsAnswers as QuestionAnswer

class SessionLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class SessionStatus(str, Enum):
    active = "active"
    complete = "complete"

class SessionCreate(BaseModel):
    user_id: str = Field(..., description="The ID of the user for the session")
    topic: str = Field(..., description="The topic of the interview session", example="Python programming")
    level: SessionLevel = Field(..., description="Difficulty level")
    status: SessionStatus = Field(default=SessionStatus.active)
    overall_score: Optional[float] = Field(None, description="Final average score")
    questions: list[QuestionAnswer] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)  # auto-populates, not None


class SessionResponse(SessionCreate):
    id: str  # returned after DB insert