# Interview System - Quick Start Guide

## 📋 Overview

A production-ready AI Interview system with:

- Real-time webcam and microphone recording
- AI-powered question narration (TTS)
- Live speech-to-text transcription (Whisper)
- Complete interview video/audio capture
- Responsive React UI with Tailwind CSS
- Zustand state management

## 🚀 Quick Setup

### Frontend (5 minutes)

1. **Install dependencies**

   ```bash
   cd frontend
   npm install zustand axios
   ```

2. **Add route** (if not already configured)

   ```javascript
   import Interview from './pages/interview';

   // Add to router
   { path: '/interview', element: <Interview /> }
   ```

3. **Configure API URL**
   Create `.env.local`:

   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Done!** The dashboard now navigates to the interview page

### Backend Requirements

Your backend needs these endpoints:

```python
# 1. Get questions
GET /api/interview/questions?interviewId=...
Response: {
    "interviewId": "...",
    "questions": [
        {"id": "q1", "question": "What is...?"},
        {"id": "q2", "question": "How do...?"}
    ]
}

# 2. Transcribe audio (uses OpenAI Whisper)
POST /api/interview/transcribe
Content-Type: multipart/form-data
Body: audio file
Response: {"transcript": "..."}

# 3. Submit completed interview
POST /api/interview/submit
Content-Type: multipart/form-data
Body: interviewId, answers (JSON), video (webm)
Response: {"success": true}

# 4. Get session details (for dashboard review)
GET /api/interview/session/{sessionId}
Response: {
    "questions": [
        {
            "id": "...",
            "question": "...",
            "user_answer": "...",
            "ideal_answer": "...",
            "feedback": "..."
        }
    ]
}
```

## 🎯 User Flow

1. **Dashboard** → User clicks "Start Interview"
2. **Permission Dialog** → Grant camera + microphone access
3. **Interview Starts** → Questions asked one-by-one
4. **Answer Recording** → Automatic microphone starts after AI speech
5. **Transcription** → Speech converted to text in real-time
6. **Next Question** → User clicks next or waits for automatic advance
7. **Completion** → Video + answers uploaded to backend
8. **Dashboard** → User returns to dashboard

## 📁 File Structure

```
src/
├── stores/interviewStore.js          # Global state
├── hooks/
│   ├── useMediaRecorder.js           # Video/audio recording
│   ├── useSpeechSynthesis.js         # Text-to-speech
│   ├── useWhisperTranscription.js    # Speech-to-text
│   └── useInterviewFlow.js           # Main orchestration
├── services/interviewAPI.js          # API calls
├── components/interview/
│   ├── InterviewContainer.jsx        # Main component
│   ├── WebcamPreview.jsx             # Camera display
│   ├── QuestionCard.jsx              # Question display
│   ├── TranscriptBox.jsx             # Live transcript
│   ├── ProgressIndicator.jsx         # Progress bar
│   └── InterviewControls.jsx         # Buttons
└── pages/interview.jsx               # Route
```

## ⚙️ Configuration

### Minimum Answer Duration

```javascript
// In useInterviewFlow.js
const MIN_ANSWER_DURATION = 3000; // milliseconds
```

### Video Quality

```javascript
// In useMediaRecorder.js
videoBitsPerSecond: 2500000; // Adjust as needed
```

### Speech Speed

```javascript
// In useSpeechSynthesis.js
utterance.rate = 0.9; // 0.1 to 10
```

## 🔧 State Management (Zustand)

All state in one store:

```javascript
import { useInterviewStore } from "@/stores/interviewStore";

const {
  questions,
  currentQuestion,
  answers,
  transcript,
  isMicActive,
  recordingState,
} = useInterviewStore();
```

## 🎬 Interview Lifecycle

```
INIT → REQUEST PERMISSIONS → START RECORDING
→ SPEAK QUESTION → START MIC RECORDING → RECORD ANSWER
→ TRANSCRIBE → SAVE ANSWER → NEXT QUESTION (repeat)
→ COMPLETE INTERVIEW → UPLOAD VIDEO + ANSWERS
```

## 📊 Component Communication

```
InterviewContainer
├─ WebcamPreview (shows: mediaStream, recordingState, isMicActive)
├─ QuestionCard (shows: questions, currentQuestionIndex, isAISpeaking)
├─ TranscriptBox (shows: transcript, isMicActive)
├─ ProgressIndicator (shows: questions, currentQuestionIndex)
└─ InterviewControls (handles: nextQuestion, endInterview)
```

## 🔒 Authentication

Token automatically added to all requests:

```javascript
// In interviewAPI.js interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🐛 Debugging

### Enable verbose logging:

```javascript
// In InterviewContainer.jsx
console.log("Interview State:", useInterviewStore.getState());
```

### Check network requests:

1. Open DevTools → Network tab
2. Filter by `/api/interview/`
3. Verify responses

### Check browser permissions:

1. Click lock icon in URL bar
2. Check Camera/Microphone settings
3. Ensure they're allowed

## ✅ Testing Checklist

- [ ] User can grant permissions
- [ ] Webcam preview shows
- [ ] Question reads aloud
- [ ] Microphone starts after speech
- [ ] Transcript updates live
- [ ] Next question works
- [ ] Video uploads on completion
- [ ] Dashboard shows completed session

## 🚀 Deployment

### Frontend

```bash
npm run build
# Deploy dist/ folder to hosting
```

### Backend

- Set `OPENAI_API_KEY` environment variable
- Ensure video upload directory exists
- Configure CORS for your domain

## 📱 Browser Support

- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

## 🤝 API Integration

The system is designed to work with any backend following the spec:

### Required Endpoints:

1. `GET /api/interview/questions` - Fetch questions
2. `POST /api/interview/transcribe` - Transcribe audio (Whisper)
3. `POST /api/interview/submit` - Submit interview
4. `GET /api/interview/session/{id}` - Get session details

### Data Format:

All APIs use JSON except transcribe (multipart) and submit (multipart with video).

## 💡 Tips

1. **For testing without backend:**
   - Mock the API responses
   - Comment out actual API calls

2. **For better performance:**
   - Reduce video bitrate on slower networks
   - Use audio-only recording if video not needed

3. **For production:**
   - Enable HTTPS (required for getUserMedia)
   - Monitor API quota and costs
   - Implement video cleanup/archival
   - Add analytics and error tracking

## 📚 Full Documentation

- See `README.md` for detailed architecture
- See `BACKEND_SETUP.md` for backend implementation examples

## ❓ Common Issues

| Issue                 | Solution                                   |
| --------------------- | ------------------------------------------ |
| "Permission denied"   | Use HTTPS, check browser settings          |
| "Transcript empty"    | Check OpenAI API key, verify audio quality |
| "Video won't upload"  | Check file size limits, network connection |
| "Question won't play" | Check browser SpeechSynthesis support      |

## 🎓 Learning Resources

- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- Speech Synthesis: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- Zustand: https://github.com/pmndrs/zustand
- OpenAI Whisper: https://platform.openai.com/docs/guides/speech-to-text

---

**Ready to go!** Your interview system should now work end-to-end. 🎉
