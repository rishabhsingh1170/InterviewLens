from pydantic import BaseModel, Field
from typing import Optional

class QuestionsAnswers(BaseModel):
    question: str = Field(..., description="Interview Question", example="What is Python?")
    ideal_answer: str = Field(..., description="Ideal answer", example="Python is a programming language.")
    user_answer: Optional[str] = Field(None, description="User's answer to the question", example="Python is a snake.")
    score: Optional[float] = Field(None, description="Score for the user's answer", example=5)
    feedback: Optional[str] = Field(None, description="Feedback for the user's answer", example="Your answer is incorrect. Python is a programming language, not a snake.")

class QuestionsAnswersResponse(QuestionsAnswers):
    id: str = Field(..., description="Unique identifier for the question-answer pair")
    question: str = Field(..., description="Interview Question", example="What is Python?")
    ideal_answer: str = Field(..., description="Ideal answer", example="Python is a programming language.")
    user_answer: Optional[str] = Field(None, description="User's answer to the question", example="Python is a snake.")
    score: Optional[float] = Field(None, description="Score for the user's answer", example=5)
    feedback: Optional[str] = Field(None, description="Feedback for the user's answer", example="Your answer is incorrect. Python is a programming language, not a snake.")    