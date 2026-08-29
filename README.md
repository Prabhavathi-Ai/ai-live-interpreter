# AI Live Interpreter

An AI-powered live interpreter that records speech, processes audio locally, and translates between languages.

## Current Features

- 🎤 Browser microphone recording
- 🌐 English, Tamil, and Hindi language selection
- 🔄 Source/target language swapping
- ⚡ Next.js frontend
- 🚀 FastAPI backend
- 📤 Audio upload from frontend to backend
- 💾 Local audio recording storage
- 🧠 Local Whisper speech-to-text setup
- 🔒 Local Whisper model and recordings are excluded from Git

## Project Structure

```text
AI_Live_Interpreter/
├── frontend/
│   └── app/
│       └── page.tsx
│
└── backend/
    ├── main.py
    ├── models/
    │   └── ggml-base.bin
    ├── uploads/
    └── .gitignore