from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class SessionLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class SessionStatus(str, Enum):
    active = "active"
    complete = "complete"

class SessionCreate(BaseModel):
    session_id: Optional[str] = Field(None, description="Unique identifier for the session")
    user_id: str = Field(..., description="The ID of the user for the session")
    topic: str = Field(..., description="The topic of the interview session", example="Python programming")
    level: SessionLevel = Field(..., description="Difficulty level")
    status: SessionStatus = Field(default=SessionStatus.active)
    overall_score: Optional[float] = Field(None, description="Final average score")
    scores_id: Optional[str] = Field(None, description="The ID of the associated scores document")
    questions: list[str] = Field(default_factory=list, description="List of question document IDs")
    created_at: datetime = Field(default_factory=datetime.utcnow)  # auto-populates, not None

class SessionRequest(BaseModel):
    topic: str = Field(..., description="The topic of the interview session", example="Python programming")
    level: SessionLevel = Field(..., description="Difficulty level")
    status: SessionStatus = Field(default=SessionStatus.active)
    overall_score: Optional[float] = Field(None, description="Final average score")
    scores_id: Optional[str] = Field(None, description="The ID of the associated scores document")
    questions: list[str] = Field(default_factory=list, description="List of question document IDs")


class SessionResponse(SessionCreate):
    id: str = Field(..., description="Unique identifier for the session")
    