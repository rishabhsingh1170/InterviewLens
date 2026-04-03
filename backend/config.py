import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB connection URL
MONGO_URL = os.getenv("MONGO_URL")
# JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", 60))

# LLM configuration (Hugging Face Inference API)
HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.1")

# Weighted scoring configuration
ANSWER_WEIGHT = float(os.getenv("ANSWER_WEIGHT", 0.5))
COMMUNICATION_WEIGHT = float(os.getenv("COMMUNICATION_WEIGHT", 0.3))
POSTURE_WEIGHT = float(os.getenv("POSTURE_WEIGHT", 0.2))
