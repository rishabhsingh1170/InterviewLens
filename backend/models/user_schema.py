from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    user_name:str = Field(..., description="The name of the user required for registration", example="John Doe", min_length=3, max_length=50)
    email: EmailStr = Field(..., description="The email of the user required for registration")
    password: str = Field(..., description="The password of the user required for registration", min_length=6)
    sessions: Optional[list[str]] = Field(default_factory=list, description="List of session IDs associated with the user")

class UserLogin(BaseModel):
    email:EmailStr = Field(..., description="The email of the user required for login")
    password:str = Field(..., description="The password of the user required for login")

# Use this for API responses — never expose hashed_password
class UserResponse(BaseModel):
    id: str
    user_name: str
    email: str
    sessions: list[str] = Field(default_factory=list)

class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"    