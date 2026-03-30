from fastapi import FastAPI, HTTPException
from routes import auth
import database
from models.user_schema import UserCreate, UserLogin, UserResponse
from models.sesion_schema import SessionCreate, SessionResponse
from models.question_answer_schema import QuestionsAnswers
from database import user_collection, question_Answer_collection, session_collection

app = FastAPI()

@app.get("/")
def home():
    return {"message": "server is running"}


#-----------------------------------------------------------#
#                         ROUTES                            #
#-----------------------------------------------------------#

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])