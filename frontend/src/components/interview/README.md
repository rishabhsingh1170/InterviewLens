# AI Interview System - Frontend Documentation

## Architecture Overview

This is a comprehensive AI-powered interview system built with React, Tailwind CSS, Zustand, and modern Web APIs.

## Project Structure

```
frontend/src/
├── stores/
│   └── interviewStore.js          # Zustand store for interview state
├── hooks/
│   ├── useMediaRecorder.js        # Media recording hook (video + audio)
│   ├── useSpeechSynthesis.js      # Browser text-to-speech hook
│   ├── useWhisperTranscription.js # Speech-to-text via OpenAI Whisper
│   ├── useInterviewFlow.js        # Main interview orchestration
│   └── index.js                   # Export all hooks
├── services/
│   └── interviewAPI.js            # Backend API communication
├── components/interview/
│   ├── InterviewContainer.jsx     # Main interview component
│   ├── WebcamPreview.jsx          # Live webcam with status indicators
│   ├── QuestionCard.jsx           # Current question display
│   ├── TranscriptBox.jsx          # Live transcript of user answer
│   ├── ProgressIndicator.jsx      # Interview progress tracking
│   └── InterviewControls.jsx      # Interview buttons and controls
└── pages/
    └── interview.jsx              # Interview page route
```

## Key Features

### 1. **Media Recording**

- Continuous video + audio recording throughout interview
- MediaRecorder API with WebM codec support
- Automatic fallback for codec compatibility
- Proper cleanup on interview end

### 2. **Speech Synthesis**

- Browser SpeechSynthesis API to speak questions
- Callback system to start microphone after speech ends
- Automatic speech cancellation on cleanup

### 3. **Speech-to-Text Transcription**

- OpenAI Whisper API integration via backend
- Real-time transcript display
- Audio chunk collection and conversion to WAV format
- Backend handles Whisper API calls

### 4. **State Management**

- Zustand store for global interview state
- Tracks questions, answers, media streams, and UI state
- Computed selectors for progress and current question

### 5. **Interview Flow Control**

- Questions fetched once at interview start
- Sequential question progression on frontend
- Minimum answer duration enforcement (3 seconds)
- Automatic video blob generation on completion

## Components

### InterviewContainer

Main orchestrator component that:

- Initializes interview and fetches questions
- Manages permissions and error states
- Coordinates all sub-components
- Handles completion screen

### WebcamPreview

Shows:

- Live camera feed
- Recording indicator
- Microphone active status
- AI speaking status
- Answer duration timer

### QuestionCard

Displays:

- Current question number and text
- AI speaking animation
- Instructions for user

### TranscriptBox

Shows:

- Live transcript as user speaks
- Recording status
- Help text during recording

### ProgressIndicator

Displays:

- Overall progress bar
- Question list with completion status
- Current question highlight

### InterviewControls

Provides:

- Answer submission button (when mic active)
- Next question button
- End interview confirmation
- Duration requirement messaging

## State Management (Zustand Store)

```javascript
// Questions
questions: []; // All interview questions
currentQuestionIndex: 0; // Current question position

// Interview State
answers: {
} // { questionId: { text, timestamp } }
transcript: ""; // Live transcript
interviewStarted: false;
interviewCompleted: false;
recordingState: ""; // 'idle', 'recording', 'processing'

// Media State
mediaStream: null; // getUserMedia stream
mediaRecorder: null; // MediaRecorder instance
recordedChunks: []; // Video chunks

// UI State
isAISpeaking: boolean;
isMicActive: boolean;
permissionError: string;
currentAnswerDuration: number;
```

## Hooks

### useMediaRecorder

```javascript
const {
  recordingActive, // Is recording active
  requestPermissions, // Request camera/mic permission
  startRecording, // Start video recording
  stopRecording, // Stop and get video blob
  stopMediaStream, // Clean up media stream
  resetRecording, // Reset chunks
  mediaStream,
} = useMediaRecorder();
```

### useSpeechSynthesis

```javascript
const {
  speakQuestion, // Play question audio
  cancelSpeech, // Cancel ongoing speech
  isSpeaking,
} = useSpeechSynthesis();
```

### useWhisperTranscription

```javascript
const {
  startAudioCapture, // Prepare audio capture
  stopAudioCapture, // Clean up audio capture
  transcribeAudio, // Send audio to Whisper API
  resetAudioCapture,
} = useWhisperTranscription();
```

### useInterviewFlow

Main orchestrator that coordinates all other hooks:

```javascript
const {
  initializeInterview, // Fetch questions from backend
  startInterview, // Request permissions and start recording
  askCurrentQuestion, // Speak question and start mic recording
  stopMicrophoneRecording, // Stop mic and transcribe
  nextQuestion, // Move to next question
  endInterview, // Submit answers and video
  isLoading,
} = useInterviewFlow();
```

## Backend API Integration

### Endpoints Used

**GET `/api/interview/questions`**

- Fetches all interview questions
- Returns: `{ interviewId, questions: [{ id, question }, ...] }`

**POST `/api/interview/transcribe`**

- Sends audio blob for transcription
- Uses OpenAI Whisper API on backend
- Returns: `{ transcript: "..." }`

**POST `/api/interview/submit`**

- Submits answers and interview video
- Body: FormData with answers (JSON) and video blob
- Returns: Success response

### API Service (`interviewAPI.js`)

- Axios configured with auth token
- Error handling and logging
- FormData support for multipart uploads

## Interview Flow

1. **Initialization**
   - User clicks "Start Interview" on dashboard
   - Navigates to `/interview?id={sessionId}`
   - Requests camera/microphone permissions

2. **Question Flow** (for each question)
   - AI speaks the question using TTS
   - Microphone starts recording automatically
   - User speaks their answer
   - Live transcript updates in real-time
   - User clicks "Next" or timer completes

3. **Answer Processing**
   - Microphone recording stops
   - Audio sent to Whisper API via backend
   - Transcript saved with question ID
   - Auto-advances to next question

4. **Completion**
   - All questions answered
   - Video blob generated from recording
   - Submission to backend with answers + video
   - Redirect to dashboard

## Configuration

### Minimum Answer Duration

```javascript
const MIN_ANSWER_DURATION = 3000; // 3 seconds
```

Change in `useInterviewFlow.js`

### Video Quality

```javascript
videoBitsPerSecond: 2500000; // Adjust in useMediaRecorder.js
```

### Speech Synthesis Options

```javascript
utterance.rate = 0.9; // Speech speed
utterance.pitch = 1; // Voice pitch
utterance.volume = 1; // Volume level
```

Customize in `useSpeechSynthesis.js`

## Error Handling

The system handles:

- Camera/microphone permission denials
- Speech synthesis errors
- Transcription API failures
- Video recording errors
- Network issues during submission

Error messages displayed in UI with user-friendly descriptions.

## Browser Compatibility

- **MediaRecorder API**: Chrome 47+, Firefox 25+, Edge 79+, Safari 14.1+
- **Speech Synthesis**: Chrome 25+, Firefox 44+, Safari 6+
- **getUserMedia**: Chrome 53+, Firefox 36+, Safari 11+
- **Web Audio API**: Chrome 10+, Firefox 25+, Safari 6+

## Dependencies

```json
{
  "zustand": "^4.x",
  "axios": "^1.x",
  "react": "^18.x",
  "react-router-dom": "^6.x"
}
```

## Security Considerations

1. **API Authentication**
   - Access token stored in localStorage
   - Sent in Authorization header for all requests

2. **Backend Validation**
   - Answers validated on backend
   - Video blob integrity checked
   - User session verification

3. **Data Privacy**
   - Audio/video data sent via HTTPS only
   - Backend should store securely
   - Consider encryption at rest

## Performance Optimizations

1. **Media Stream Management**
   - Tracks cleaned up properly
   - Audio context closed after use

2. **State Updates**
   - Zustand prevents unnecessary re-renders
   - Selector usage for granular updates

3. **Component Memoization**
   - Video element optimized
   - Progress bar updates smoothly

## Troubleshooting

### Microphone not recording

- Check browser permissions
- Ensure HTTPS is used
- Verify audioContext initialization

### Transcript not appearing

- Check backend Whisper API configuration
- Verify audio chunks collection
- Check network requests in DevTools

### Video not uploading

- Check file size limits on backend
- Verify CORS configuration
- Monitor network in DevTools

### Permission denied errors

- Ensure HTTPS connection
- Check browser security settings
- Try different browser

## Future Enhancements

1. **Real-time Feedback**
   - Display score after each answer
   - Provide hints during interview

2. **Advanced Analytics**
   - Speech analysis
   - Confidence scoring
   - Topic coverage detection

3. **Multi-language Support**
   - Interview in different languages
   - Whisper API language detection

4. **Recording Quality Options**
   - User-selectable quality levels
   - Adaptive bitrate encoding

5. **Resume Functionality**
   - Save interview state
   - Resume interrupted interviews
