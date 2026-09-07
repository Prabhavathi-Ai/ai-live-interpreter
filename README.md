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
