from fastapi import APIRouter
from controller import auth

router = APIRouter()

@router.post("/signup", response_model=auth.LoginResponse)
async def signup(user:auth.UserCreate):
    return await auth.signup(user)

@router.post("/login", response_model=auth.LoginResponse)
async def login(user:auth.UserLogin):
    return await auth.login(user)

