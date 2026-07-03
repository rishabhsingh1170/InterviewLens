from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, interview
import database
from controller.utils import ensure_ffmpeg_available

app = FastAPI()

# Make sure Whisper can find ffmpeg as soon as the app starts.
try:
    ffmpeg_path = ensure_ffmpeg_available()
    print(f"ffmpeg available at: {ffmpeg_path}")
except Exception as exc:
    print(f"Warning: ffmpeg not ready at startup: {exc}")

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