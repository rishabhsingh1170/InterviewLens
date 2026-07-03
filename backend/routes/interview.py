
import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, utils
from controller import interview
from controller import utils
from controller.utils import transcribe_audio
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

#get full details of a specific session
@router.get("/session_details")
async def get_session_details(session_id: str, user_id: str = Depends(get_current_user)):
    return await interview.get_session_details(session_id, user_id)

# transcribe an audio chunk using Whisper
@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    return await utils.transcribe(audio, user_id)

# submit the full interview payload and score it
@router.post("/submit")
async def submit_interview(
    interviewId: str = Form(...),
    answers: str = Form("[]"),
    user_id: str = Depends(get_current_user),
):
    parsed_answers = json.loads(answers) if answers else []
    return await interview.submit_interview(interviewId, parsed_answers, user_id)

#submit user's answer for a question
@router.post("/save_answer")
async def save_answer(question_id: str, user_answer: str, user_id: str = Depends(get_current_user)):
    return await interview.save_answer(question_id, user_answer)

#save score and feedback for a user answer of a question
@router.post("/save_score_feedback")
async def save_score_and_feedback(session_id: str, user_id: str = Depends(get_current_user)):
    return await interview.save_score_and_feedback(session_id, user_id)

#get completed session review with all questions, answers, feedback and scores
@router.get("/review")
async def review_session(session_id: str, user_id: str = Depends(get_current_user)):
    return await interview.get_session_details(session_id, user_id)