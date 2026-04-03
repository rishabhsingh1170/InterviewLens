from fastapi import HTTPException
from models.user_schema import LoginResponse, UserCreate, UserLogin, UserResponse
from .utils import create_jwt_token, hash_password, verify_password
from database import user_collection, question_Answer_collection, session_collection

#-----------------------------------------------------------#
#                 Authentication Controller                 #
#-----------------------------------------------------------#

#--------------USER SIGNUP----------------#

async def signup(user:UserCreate):
    try:
        existing_user = await user_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error occurred while checking user existence")

    try:
        new_user =  user.model_dump(exclude={"id"})
        new_user["password"] = hash_password(new_user["password"])
        result = await user_collection.insert_one(new_user)

        new_user["id"] = str(result.inserted_id)

        token = create_jwt_token(
        {
            "user_id": str(result.inserted_id),
            "email": new_user["email"]
        }
    )
        return LoginResponse(
            user=UserResponse(**new_user),
            access_token=token
        )
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error occurred while creating user")
    
#--------------USER LOGIN----------------#

async def login(user:UserLogin):
    try:
        is_user_exit =  await user_collection.find_one({"email": user.email})
        if not is_user_exit:
            raise HTTPException(status_code=400, detail="Invalid email or password")
        
        if not verify_password(user.password, is_user_exit["password"]):
            raise HTTPException(status_code=400, detail="Invalid email or password")
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error occurred while checking user existence")  
    
    # JWT token generation
    token = create_jwt_token(
        {
            "user_id": str(is_user_exit["_id"]),
            "email": is_user_exit["email"]
        }
    )

    return LoginResponse(
    user=UserResponse(
        id=str(is_user_exit["_id"]),
        user_name=str(is_user_exit["user_name"]),
        email=str(is_user_exit["email"]),
        sessions=is_user_exit.get("sessions", [])
    ),
    access_token=token
)