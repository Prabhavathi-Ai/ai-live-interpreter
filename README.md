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
- active listening on both sides 

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

## Current Development Status

The project currently supports:

- 🎤 Browser microphone recording
- 📦 Audio upload to the FastAPI backend
- 💾 Local audio file storage
- 🔍 Audio availability/status checking
- 🌐 English, Tamil, and Hindi language selection
- 🔄 Language swapping
- 🔗 Frontend and backend communication

### AI Pipeline

The next development stage is integrating local AI models for:

1. Speech-to-Text
2. Language Translation
3. Text-to-Speech

The project is designed to run locally using free and open-source AI tools.

## Development

AI Live Interpreter is being developed step by step with a focus on
local, free, and open-source AI processing.


## Backend API

The FastAPI backend currently provides:

| Endpoint | Method | Purpose |
|---|---|---|
| `/` | GET | Backend information |
| `/health` | GET | Health check |
| `/audio` | POST | Upload recorded audio |
| `/audio/status` | GET | Check uploaded audio |

## Project Architecture

```text
Frontend (Next.js)
       ↓
Browser Microphone
       ↓
MediaRecorder
       ↓
Audio Blob
       ↓
FastAPI Backend
       ↓
Local Audio Storage
       ↓
Future: Speech-to-Text
       ↓
Future: Translation
       ↓
Future: Text-to-Speech
