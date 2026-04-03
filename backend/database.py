
from pymongo.mongo_client import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
from config import MONGO_URL

# Create a new client and connect to the server
client = AsyncIOMotorClient(MONGO_URL)
db = client["interviewlens"]

user_collection = db.get_collection("users")
question_Answer_collection = db.get_collection("question_answer")
session_collection = db.get_collection("sessions")
score_collection = db.get_collection("scores")

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)