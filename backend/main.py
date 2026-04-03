from fastapi import FastAPI
from routes import auth, interview
import database

app = FastAPI()

@app.get("/")
def home():
    return {"message": "server is running"}


#-----------------------------------------------------------#
#                         ROUTES                            #
#-----------------------------------------------------------#

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])