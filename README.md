AI Live Interpreter 🌐

Breaking language barriers with AI-powered speech translation.

AI Live Interpreter is a web-based application designed to convert spoken English into Tamil using Artificial Intelligence and Speech Processing technologies.

The project aims to make communication easier for people who face language barriers, especially English-to-Tamil speakers.

🚀 Features

- 🎤 Speech Recording – Record voice through the browser microphone.
- 📝 Speech-to-Text – Convert recorded speech into text using Whisper.
- 🌍 Language Translation – Translate English text into Tamil.
- 🔊 Text-to-Speech – Generate Tamil speech audio.
- ▶️ Audio Playback – Listen to the generated Tamil translation.
- 💻 Web Interface – Simple and responsive user interface.
- 🔗 Backend Integration – Connect the frontend with the AI processing backend.

🛠️ Technology Stack

Category| Technologies
Frontend| Next.js, React, TypeScript
Backend| Python, FastAPI
Server| Uvicorn
Speech Recognition| OpenAI Whisper
Translation| Hugging Face Transformers, Helsinki-NLP
Text-to-Speech| Facebook MMS-TTS Tamil
Version Control| Git, GitHub
Frontend Deployment| Vercel
Backend Deployment| Render

⚙️ How It Works

1. The user records speech using the microphone.
2. The frontend sends the recorded audio to the backend.
3. Whisper converts the audio into text.
4. The translation model converts English text into Tamil.
5. The Tamil text-to-speech model generates audio.
6. The generated Tamil audio is returned to the frontend.
7. The user can listen to the translated speech.

🏗️ System Architecture

       User
        |
        v
  Microphone Recording
        |
        v
   Next.js Frontend
        |
        v
    FastAPI Backend
        |
        v
   Whisper Speech-to-Text
        |
        v
   English-to-Tamil
      Translation
        |
        v
   Tamil Text-to-Speech
        |
        v
   Generated Audio
        |
        v
   Frontend Playback

🌐 Live Demo

- Frontend: https://ai-live-interpreter.vercel.app
- Backend: https://ai-live-interpreter.onrender.com

💻 Local Setup

Prerequisites

- Python
- Node.js and npm
- Git

1. Clone the Repository

git clone https://github.com/Prabhavathi-Ai/ai-live-interpreter.git

2. Backend Setup

cd ai-live-interpreter/backend
python -m venv .venv

Activate the virtual environment on Windows:

.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Start the backend:

uvicorn main:app --reload

3. Frontend Setup

Open another terminal:

cd ai-live-interpreter/frontend
npm install
npm run dev

Open the application:

http://localhost:3000

Note: Configure the required backend environment variables and frontend backend URL according to the project configuration before running or deploying the application.

📌 Current Project Status

The current implementation supports recorded-audio processing and playback.

The application is designed as a foundation for future real-time speech translation and live multilingual communication.

🔮 Future Enhancements

- Real-time speech translation.
- Two-way multilingual communication.
- Support for additional Indian languages.
- Faster AI model inference.
- Improved audio quality and response time.
- Mobile application support.
- Better scalability for multiple users.

👩‍💻 Developer

Prabhavathi Ayyasamy

- GitHub: "Prabhavathi-Ai" (https://github.com/Prabhavathi-Ai)

📄 License

A license has not yet been specified for this repository. Model and dataset licenses should also be checked before commercial use.

---

AI Live Interpreter – Making communication easier through Artificial Intelligence.
