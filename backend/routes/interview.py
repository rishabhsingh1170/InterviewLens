from fastapi import APIRouter, Depends, HTTPException
from controller import interview
from models.sesion_schema import SessionRequest, SessionResponse, SessionCreate

from middleware.get_current_user import get_current_user

router = APIRouter()

# Create a new interview session and quetions for the session
@router.post("/create")
async def create_interview(session: SessionRequest, user_id: str = Depends(get_current_user)):
    return await interview.create_interview(session, user_id)

#get all interview sessions for a user with session id and topic
@router.get("/get_sessions")
async def get_sessions(user_id: str = Depends(get_current_user)):
    return await interview.get_sessions(user_id)

#get all interview questions with questions id and session id for a user
@router.get("/start")
async def start_interview(session_id: str, user_id: str = Depends(get_current_user)):
    return await interview.start_interview(session_id, user_id)

#submit user's answer for a question
@router.post("/save_answer")
async def save_answer(question_id: str, user_answer: str, user_id: str = Depends(get_current_user)):
    return await interview.save_answer(question_id, user_answer)

#save score and feedback for a user answer of a question
@router.post("/save_score_feedback")
async def save_score_and_feedback(question_id: str):
    return await interview.save_score_and_feedback(question_id)