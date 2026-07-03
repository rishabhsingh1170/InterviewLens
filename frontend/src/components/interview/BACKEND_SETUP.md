# Interview System - Setup & Backend Requirements

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install zustand axios
```

### 2. Configure Environment

Create `.env.local` or update `.env`:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Update Routing

Ensure your router includes the interview route:

```javascript
// In your router configuration
import { lazy } from "react";

const Interview = lazy(() => import("./pages/interview"));

const routes = [
  {
    path: "/interview",
    element: <Interview />,
    name: "Interview",
  },
  // ... other routes
];
```

### 4. Verify Dashboard Integration

The dashboard already has the integration:

- ✅ "Start Interview" button navigates to `/interview?id={sessionId}`
- ✅ Review button expands cards to show session details
- ✅ Removed Details modal

## Backend Requirements

### 1. Interview Questions Endpoint

**GET `/api/interview/questions`**

```python
# FastAPI example
@router.get("/questions")
async def get_interview_questions(interviewId: str):
    # Fetch questions from database
    questions = db.get_questions(interviewId)
    return {
        "interviewId": interviewId,
        "questions": [
            {"id": q.id, "question": q.text}
            for q in questions
        ]
    }
```

### 2. Audio Transcription Endpoint

**POST `/api/interview/transcribe`**

```python
# FastAPI example with OpenAI Whisper
from openai import OpenAI
import librosa
import soundfile as sf

client = OpenAI()

@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    # Save temporary audio file
    temp_path = f"/tmp/{audio.filename}"
    content = await audio.read()

    with open(temp_path, "wb") as f:
        f.write(content)

    # Transcribe with Whisper
    with open(temp_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en"
        )

    # Cleanup
    import os
    os.remove(temp_path)

    return {"transcript": transcript.text}
```

**Requirements:**

- OpenAI API key in environment: `OPENAI_API_KEY`
- Install: `pip install openai librosa soundfile`

### 3. Interview Submission Endpoint

**POST `/api/interview/submit`**

```python
@router.post("/submit")
async def submit_interview(
    interviewId: str = Form(...),
    answers: str = Form(...),  # JSON string
    video: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    import json

    # Parse answers
    answers_data = json.loads(answers)

    # Save interview video
    if video:
        video_path = f"uploads/interviews/{interviewId}.webm"
        content = await video.read()
        with open(video_path, "wb") as f:
            f.write(content)

    # Process answers (optional: call evaluation service)
    # evaluation = await evaluate_answers(interviewId, answers_data)

    # Save session as completed
    session = db.get_session(interviewId)
    session.status = "complete"
    session.answers = answers_data
    session.video_path = video_path if video else None
    db.save_session(session)

    return {
        "success": True,
        "message": "Interview submitted successfully",
        "sessionId": interviewId
    }
```

**Answer Format:**

```json
[
  {
    "questionId": "q1",
    "answer": "User's transcribed answer",
    "timestamp": "2024-05-18T10:30:00Z"
  },
  {
    "questionId": "q2",
    "answer": "Another answer",
    "timestamp": "2024-05-18T10:35:00Z"
  }
]
```

### 4. Session Details Endpoint

**GET `/api/interview/session/{sessionId}`**

```python
@router.get("/session/{sessionId}")
async def get_session_details(sessionId: str, current_user: dict = Depends(get_current_user)):
    session = db.get_session(sessionId)

    if not session or session.user_id != current_user['id']:
        raise HTTPException(status_code=404, detail="Session not found")

    # Enrich with question details
    questions = []
    for answer in session.answers:
        q = db.get_question(answer['questionId'])
        questions.append({
            "id": q.id,
            "question": q.text,
            "user_answer": answer['answer'],
            "ideal_answer": q.ideal_answer,  # Optional
            "feedback": answer.get('feedback', ''),  # Optional
        })

    return {
        "sessionId": sessionId,
        "topic": session.topic,
        "level": session.level,
        "status": session.status,
        "overall_score": session.score,  # Optional
        "questions": questions,
        "createdAt": session.created_at,
        "completedAt": session.completed_at
    }
```

### 5. Middleware: Authentication

```python
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthCredential

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthCredential = Security(security)):
    token = credentials.credentials

    try:
        # Verify JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return {"id": user.id, "email": user.email}

    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

## Database Schema

### Suggested Tables

```sql
-- Sessions/Interviews
CREATE TABLE interview_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    level ENUM('beginner', 'intermediate', 'advanced'),
    status ENUM('active', 'in_progress', 'complete'),
    answers JSON,  -- Stores answers array
    video_path VARCHAR(255),
    overall_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Questions
CREATE TABLE interview_questions (
    id VARCHAR(36) PRIMARY KEY,
    topic VARCHAR(255),
    level ENUM('beginner', 'intermediate', 'advanced'),
    question_text TEXT NOT NULL,
    ideal_answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question Sets (map questions to sessions)
CREATE TABLE interview_question_sets (
    session_id VARCHAR(36),
    question_id VARCHAR(36),
    PRIMARY KEY (session_id, question_id),
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id),
    FOREIGN KEY (question_id) REFERENCES interview_questions(id)
);
```

## CORS Configuration

Update your FastAPI CORS settings:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Environment Variables Required

```env
# Backend
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_db_url
JWT_SECRET_KEY=your_secret_key
UPLOAD_DIR=./uploads/interviews

# Frontend
VITE_API_URL=http://localhost:8000
```

## Deployment Checklist

### Frontend

- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Build: `npm run build`
- [ ] Test in production environment
- [ ] Verify HTTPS is enforced

### Backend

- [ ] Verify OpenAI API key is set
- [ ] Configure video upload storage (S3 / local)
- [ ] Set up database backups
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/TLS
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting

## Testing the Interview Flow

### Manual Testing Steps

1. **Start Interview**

   ```
   Navigate to dashboard
   Click "Create Session"
   Click "Start" on active session
   Should redirect to /interview?id=...
   ```

2. **Permissions**

   ```
   Accept camera/microphone permissions
   Should show webcam preview
   ```

3. **Question Asking**

   ```
   Wait for AI to speak question
   Should see "AI is reading question..." indicator
   Microphone should activate automatically
   ```

4. **Answer Recording**

   ```
   Speak an answer (minimum 3 seconds)
   Should see live transcript updating
   Should see duration timer
   ```

5. **Submit Answer**
   ```
   Click "Next" or "Complete"
   Should process transcription
   Should move to next question or complete
   ```

### Backend Testing

Use curl to test endpoints:

```bash
# Get questions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/interview/questions?interviewId=test-123

# Submit transcription
curl -F "audio=@test.wav" \
  http://localhost:8000/api/interview/transcribe

# Submit interview
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "interviewId=test-123" \
  -F "answers=[{...}]" \
  -F "video=@interview.webm" \
  http://localhost:8000/api/interview/submit
```

## Troubleshooting

### Issue: "Failed to access camera/microphone"

**Solution:**

- Check browser permissions settings
- Ensure HTTPS is used (required for getUserMedia)
- Try in different browser
- Check if another app is using camera

### Issue: "Transcription failed"

**Solution:**

- Verify OpenAI API key is set
- Check API quota and billing
- Verify audio format is WAV
- Check audio quality (min 100ms)

### Issue: "Video upload fails"

**Solution:**

- Increase multipart form data size limit on backend
- Check disk space on server
- Verify file permissions on upload directory
- Monitor network bandwidth

### Issue: Questions not loading

**Solution:**

- Check backend questions endpoint
- Verify JWT token is valid
- Check database connection
- Monitor backend logs

## Performance Tuning

### Video Encoding

```javascript
// Reduce bitrate for lower bandwidth
videoBitsPerSecond: 1500000; // Instead of 2500000
```

### Audio Chunk Size

```javascript
// Larger chunks = faster processing
processor = audioContext.createScriptProcessor(8192, 1, 1);
```

### Question Fetching

```python
# Cache questions in memory
from functools import lru_cache

@lru_cache(maxsize=128)
def get_questions(topic: str, level: str):
    return db.query(Question).filter_by(...)
```

## Production Deployment

### AWS Example Setup

```bash
# 1. Deploy backend on EC2
# 2. Configure S3 for video storage
# 3. Set up CloudFront CDN for frontend
# 4. Enable CloudWatch logging
# 5. Configure SSL/TLS certificates

# Upload video to S3 instead of storing locally
import boto3

s3_client = boto3.client('s3')

async def submit_interview(..., video: UploadFile):
    s3_key = f"interviews/{interviewId}.webm"
    s3_client.put_object(
        Bucket="interview-videos",
        Key=s3_key,
        Body=await video.read()
    )
```

## Support & Debugging

For issues:

1. Check browser console for errors
2. Check backend logs
3. Verify network requests in DevTools
4. Check OpenAI API status
5. Review authentication tokens
