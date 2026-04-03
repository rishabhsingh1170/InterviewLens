from pydantic import BaseModel, Field
from typing import Optional

class ScoreCreate(BaseModel):
    session_id: str = Field(..., description="The ID of the interview session")
    user_id: str = Field(..., description="The ID of the user")
    answer_response_score: float = Field(..., description="The score given to answer quality")
    communication_score: float = Field(..., description="The score given to the communication skills")
    posture_score: float = Field(..., description="The score given to the posture")
    overall_score: float = Field(..., description="Weighted overall score")
    feedback: Optional[str] = Field(None, description="Feedback about the response")

class ScoreResponse(ScoreCreate):
    id: str = Field(..., description="Unique identifier for the score document")
    answer_response_score: float = Field(..., description="The score given to answer quality")
    communication_score: float = Field(..., description="The score given to the communication skills")  
    posture_score: float = Field(..., description="The score given to the posture")
    overall_score: float = Field(..., description="Weighted overall score")
        