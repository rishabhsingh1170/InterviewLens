from config import JWT_ALGORITHM, JWT_EXPIRES_MINUTES, JWT_SECRET_KEY
import bcrypt
from jose import jwt
import datetime

"""Utility functions for password hashing and verification using bcrypt."""

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