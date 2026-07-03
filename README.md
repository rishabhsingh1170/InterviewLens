# InterviewLens

InterviewLens is a full-stack interview practice application with a React/Vite frontend and a FastAPI backend. The backend handles authentication, interview APIs, MongoDB persistence, scoring configuration, and Whisper/ffmpeg startup checks.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Zustand, Axios
- Backend: FastAPI, Uvicorn, MongoDB/Motor, OpenAI Whisper, Hugging Face API support
- Deployment: Docker multi-stage build serving the frontend from FastAPI

## Project Structure

```text
.
|-- backend/      # FastAPI application, routes, controllers, database config
|-- frontend/     # React/Vite application
|-- Dockerfile    # Production container build
`-- .dockerignore
```

## Prerequisites

- Node.js 22 or compatible
- Python 3.12 or compatible
- MongoDB connection string
- ffmpeg available on your system for Whisper audio processing

## Environment Variables

Create `backend/.env`:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=60
CORS_ORIGINS=http://localhost:5173
HF_API_KEY=your_huggingface_api_key
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.1
ANSWER_WEIGHT=0.5
COMMUNICATION_WEIGHT=0.3
POSTURE_WEIGHT=0.2
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Run Locally

Install and start the backend:

```bash
cd backend
python -m venv myvenv
myvenv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Install and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite dev server URL shown in the terminal, usually `http://localhost:5173`.

## Useful Commands

Frontend:

```bash
cd frontend
npm run build
npm run lint
npm run preview
```

Backend health check:

```bash
curl http://localhost:8000/health
```

## Docker

Build and run the production image:

```bash
docker build -t interviewlens .
docker run --env-file backend/.env -p 7860:7860 interviewlens
```

The app will be served from `http://localhost:7860`.
