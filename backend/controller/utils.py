import datetime
import shutil
import os
import tempfile
import whisper
import bcrypt
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
from fastapi import UploadFile, File, Depends, HTTPException

from config import JWT_ALGORITHM, JWT_EXPIRES_MINUTES, JWT_SECRET_KEY
"""Utility functions for password hashing and verification using bcrypt."""

# Load once globally
model = whisper.load_model("base")

def hash_password(password: str) -> str:

    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8') 

def verify_password(password: str, hashed_password: str) -> bool:

    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

"""creation of JWT token and verification of JWT token"""

def create_jwt_token(data:dict) -> str:
    current_time = datetime.datetime.utcnow()
    payload = {
        "data": data,
        "exp": current_time + datetime.timedelta(minutes=JWT_EXPIRES_MINUTES),
        "iat": current_time
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


"""Verification of JWT token and extraction of data from JWT token"""
def verify_jwt_token(token: str) -> str:
    token = token.replace("Bearer ", "")  # Remove "Bearer " prefix if present
    
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        token_data = payload.get("data") or {}
        user_id = token_data.get("user_id")
        if user_id is None:
            raise ValueError("Invalid token: user_id not found")
        return user_id
    except ExpiredSignatureError:
        raise ValueError("Token has expired")
    except JWTError:
        raise ValueError("Invalid token")


def ensure_ffmpeg_available() -> str:
    """Ensure an ffmpeg executable exists on PATH for Whisper."""
    existing = shutil.which("ffmpeg")
    if existing:
        return existing

    try:
        import imageio_ffmpeg

        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        if ffmpeg_exe and os.path.exists(ffmpeg_exe):
            ffmpeg_dir = os.path.dirname(ffmpeg_exe)
            current_path = os.environ.get("PATH", "")
            if ffmpeg_dir not in current_path:
                os.environ["PATH"] = ffmpeg_dir + os.pathsep + current_path
            os.environ["IMAGEIO_FFMPEG_EXE"] = ffmpeg_exe
            return ffmpeg_exe
    except Exception as exc:
        raise RuntimeError(
            "ffmpeg is not available and imageio-ffmpeg could not provide a bundled executable. "
            "Install ffmpeg or ensure the imageio-ffmpeg package is installed. "
            f"Original error: {exc}"
        ) from exc

    raise RuntimeError(
        "ffmpeg is not available on PATH. Install ffmpeg or add it to PATH before transcribing audio."
    )


# convert audio to text using whisper
def _load_audio_with_ffmpeg(file_path: str, sample_rate: int = 16000):
    import numpy as np
    import subprocess

    ffmpeg_exe = ensure_ffmpeg_available()
    command = [
        ffmpeg_exe,
        "-nostdin",
        "-threads",
        "0",
        "-i",
        file_path,
        "-f",
        "s16le",
        "-ac",
        "1",
        "-acodec",
        "pcm_s16le",
        "-ar",
        str(sample_rate),
        "-",
    ]

    try:
        output = subprocess.run(command, capture_output=True, check=True).stdout
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.decode(errors="ignore") if exc.stderr else str(exc)
        raise RuntimeError(f"Failed to load audio for transcription: {stderr}") from exc

    return np.frombuffer(output, np.int16).flatten().astype(np.float32) / 32768.0


# Import here to avoid circular dependency: middleware.get_current_user needs verify_jwt_token
from middleware.get_current_user import get_current_user

async def transcribe(
    audio: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    temp_file_path = None

    try:
        suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(await audio.read())
            temp_file_path = temp_file.name

        transcript = transcribe_audio(temp_file_path)

        return {
            "transcript": transcript
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to transcribe audio: {exc}",
        ) from exc

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


def transcribe_audio(file_path: str) -> str:

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    try:
        audio = _load_audio_with_ffmpeg(file_path)
        result = model.transcribe(audio, fp16=False)

        return result["text"]

    except Exception as exc:
        raise RuntimeError(f"Transcription failed: {exc}") from exc