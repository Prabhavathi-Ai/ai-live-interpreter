# AI Live Interpreter

An AI-powered live speech interpreter that records spoken audio, processes it locally, and translates speech between languages.

## Features

- 🎤 Microphone-based voice recording
- 🌐 Multiple language selection
- 🔄 Source and target language swapping
- 📤 Audio upload to a FastAPI backend
- 💾 Local audio recording storage
- 🧠 Local speech-to-text processing
- 🔊 Translation playback
- ❤️ Backend health monitoring

## Supported Languages

Currently planned:

- English
- Tamil
- Hindi

More languages can be added later.

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- MediaRecorder API

### Backend

- Python
- FastAPI
- Uvicorn

### AI

- Whisper
- Local speech-to-text processing

## Project Structure

```text
AI_Live_Interpreter/
│
├── frontend/
│   └── app/
│       └── page.tsx
│
├── backend/
│   ├── main.py
│   ├── .gitignore
│   └── uploads/
│
└── README.md