from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, interview
import database
from controller.utils import ensure_ffmpeg_available
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

app = FastAPI()

# Make sure Whisper can find ffmpeg as soon as the app starts.
try:
    ffmpeg_path = ensure_ffmpeg_available()
    print(f"ffmpeg available at: {ffmpeg_path}")
except Exception as exc:
    print(f"Warning: ffmpeg not ready at startup: {exc}")

# Enable CORS for frontend requests
origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}


#-----------------------------------------------------------#
#                         ROUTES                            #
#-----------------------------------------------------------#

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])

#-----------------------------------------------------------#
#                   SERVE REACT (Production)
#-----------------------------------------------------------#

frontend_dir = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if frontend_dir.exists():
    app.mount(
        "/",
        StaticFiles(directory=str(frontend_dir), html=True),
        name="frontend",
    )