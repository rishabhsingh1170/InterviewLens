from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, interview
import database

app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "server is running"}


#-----------------------------------------------------------#
#                         ROUTES                            #
#-----------------------------------------------------------#

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])