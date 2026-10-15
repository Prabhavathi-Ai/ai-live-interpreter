AI Live Interpreter 🎙️

An AI-powered English-to-Tamil speech interpretation web application.

AI Live Interpreter allows users to record spoken English, convert speech into text, translate the text into Tamil, and generate Tamil speech for playback through a simple, responsive web interface.

✨ Features

- 🎙️ Speech Recognition: Transcribes recorded speech using OpenAI Whisper.
- 🌐 AI Translation: Translates English text into Tamil using a locally run translation model.
- 🔊 Tamil Text-to-Speech: Generates Tamil audio using a multilingual speech synthesis model.
- 🔄 Language Interface: English and Tamil language cards with a language-swap control.
- 📱 Responsive UI: Designed for desktop and mobile screens.
- ⚡ Backend Health Check: Displays backend connectivity status.
- 🛡️ Input Validation: Validates audio uploads and request inputs.
- 🔒 Configurable CORS: Controls which frontend origins can access the backend.
- 🧩 Modular Architecture: Separates the frontend, API, transcription, translation, and speech generation.

🛠️ Technology Stack

Technology| Purpose
Python| Backend programming language
FastAPI| Backend API framework
Uvicorn| ASGI application server
OpenAI Whisper| Speech-to-text transcription
Hugging Face Transformers| Translation and model integration
Helsinki-NLP translation model| English-to-Tamil translation
Facebook MMS-TTS Tamil| Tamil speech generation
Next.js| Frontend framework
React| Frontend components
TypeScript| Frontend development
CSS| Styling and responsive layout
Git and GitHub| Version control
Vercel| Frontend deployment
Render| Backend deployment

Package versions are maintained in the project's dependency files.

🏗️ Project Architecture

AI_Live_Interpreter/
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── translation_service.py
│   ├── tts_service.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── package.json
│   └── .env.example
│
├── render.yaml
└── README.md

This tree illustrates the main project structure; actual files may differ as development continues.

🔄 How It Works

1. Record: The user records speech through the frontend.
2. Upload: The audio is sent to the FastAPI backend.
3. Transcribe: Whisper converts the speech into text.
4. Translate: The translation model converts English text into Tamil.
5. Generate speech: The Tamil TTS model generates audio.
6. Play: The frontend receives the response and plays the generated Tamil speech.

Microphone
    ↓
Audio Upload
    ↓
Whisper Speech Recognition
    ↓
English-to-Tamil Translation
    ↓
Tamil Text-to-Speech
    ↓
Tamil Audio Playback

The application currently follows a record-and-process workflow rather than guaranteed continuous, real-time simultaneous interpretation.

💻 Local Development Setup

Prerequisites

Install the following:

- Python 3.11.9
- Node.js and npm compatible with the frontend dependencies
- Git
- FFmpeg or the configured FFmpeg-compatible dependency
- Sufficient disk space and memory for the AI models

1. Clone the repository

git clone https://github.com/Prabhavathi-Ai/ai-live-interpreter.git
cd ai-live-interpreter

2. Set up the backend

Open a terminal in the project root:

cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt

Configure the backend environment variables using "backend/.env.example" as a reference. Set the required values for your local environment.

Start the API:

uvicorn main:app --reload --host 127.0.0.1 --port 8000

Backend address:

"http://127.0.0.1:8000"

If API documentation is enabled in development, it may be available at:

"http://127.0.0.1:8000/docs"

3. Set up the frontend

Open a separate terminal:

cd frontend
npm install

Create the local frontend environment file using "frontend/.env.example" as a reference.

For local development, configure:

NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000

Start the frontend:

npm run dev

Open:

"http://localhost:3000"

Keep both the backend and frontend running while testing the application.

⚙️ Environment Configuration

Backend

The backend uses environment variables to control application behavior and production settings.

Important settings may include:

- "APP_ENV" — development or production mode.
- "CORS_ORIGINS" — permitted frontend origins.
- "ENABLE_API_DOCS" — whether API documentation is enabled.
- "KEEP_LATEST_RECORDING" — whether the latest recording is retained.
- Model-cache and upload-directory settings, if configured.

Use the actual ".env.example" and "config.py" files as the source of truth for required variables and defaults.

Never commit real secrets or private credentials.

Frontend

The main frontend setting is:

- "NEXT_PUBLIC_BACKEND_URL" — the base URL of the FastAPI backend.

For deployment, this must point to the actual deployed backend URL rather than localhost.

☁️ Deployment

Frontend — Vercel

1. Import the GitHub repository into Vercel.
2. Configure the frontend project and its root directory.
3. Set "NEXT_PUBLIC_BACKEND_URL" to the deployed FastAPI service URL.
4. Deploy the frontend.
5. Verify that the application can communicate with the backend.

Backend — Render

1. Connect the GitHub repository to Render.
2. Configure the backend root directory as specified by the deployment configuration.
3. Use Python 3.11.9.
4. Install the dependencies defined in the backend requirements file.
5. Configure the production environment variables, especially "CORS_ORIGINS".
6. Configure the Uvicorn start command and health-check path.
7. Deploy the backend and verify its health endpoint.

The production CORS allowlist must include the exact Vercel frontend origin.

Deployment URLs should be verified against the current Vercel and Render dashboards.

🤖 AI Models

Speech-to-Text

OpenAI Whisper

Converts recorded audio into text. Processing speed depends on the audio duration, model selection, CPU/GPU availability, and server resources.

Translation

Helsinki-NLP English-to-Tamil translation model

Performs English-to-Tamil text translation using the configured Transformers pipeline.

Text-to-Speech

Facebook MMS-TTS Tamil

Generates Tamil speech from translated text.

Review each model's current license and usage conditions before commercial deployment. In particular, the configured Tamil TTS model has been identified as carrying a CC-BY-NC-4.0 license, which restricts commercial use.

Models may need to be downloaded before first use and require additional storage and memory.

⚡ Performance Considerations

The application performs several computationally intensive tasks for each request:

- Speech recognition
- Machine translation
- Speech synthesis

On a low-resource CPU server, these stages can result in noticeable delays. Free hosting platforms may also suspend inactive services, causing additional cold-start latency.

Potential improvements include:

- Reusing loaded models between requests.
- Measuring individual pipeline-stage processing times.
- Optimizing audio preprocessing.
- Evaluating smaller or optimized inference models.
- Managing concurrent requests safely.
- Considering suitable inference hardware for higher traffic.

Performance improvements should be benchmarked before claiming specific speed gains.

🔐 Security and Privacy

- Validate uploaded audio and request inputs.
- Restrict cross-origin requests through CORS configuration.
- Keep environment secrets out of source control.
- Use HTTPS for production communication.
- Apply appropriate upload and resource limits.
- Configure recording retention according to privacy requirements.
- Avoid logging sensitive audio or transcript content.
- Add appropriate authentication, abuse protection, and rate limiting if required for public access.

Users should be informed about how audio and transcripts are processed and retained.

🧪 Testing and Quality Assurance

Before deployment or merging changes, verify the relevant checks:

Backend

python -m compileall .
pip check

Run the backend test suite using the project's configured test command, if available.

Frontend

npm run lint
npm run build

Git changes

git diff --check
git status

Also test the complete audio-to-text-to-translation-to-speech workflow, invalid audio uploads, backend connectivity, and audio playback.

🚧 Current Limitations

- Processing speed depends on server resources and model performance.
- First-time model downloads and cold starts can increase latency.
- The application is not guaranteed to provide continuous simultaneous interpretation.
- Translation quality depends on the selected model and input speech.
- Concurrent-user capacity must be measured on the deployed infrastructure.
- The Tamil TTS model's license must be reviewed before commercial use.
- Production authentication, rate limiting, monitoring, and scaling requirements should be evaluated before wider public adoption.

🗺️ Future Improvements

- Reduce end-to-end interpretation latency.
- Add additional Indian and international languages.
- Improve streaming audio handling where supported.
- Optimize speech recognition and translation quality.
- Introduce scalable inference infrastructure.
- Improve monitoring and error reporting.
- Strengthen public API abuse protection.
- Evaluate commercially compatible speech synthesis models.
- Add automated performance and integration tests.

🤝 Contributing

1. Create a feature branch.
2. Make focused changes.
3. Run the relevant tests and lint checks.
4. Review the Git diff.
5. Commit meaningful changes with descriptive messages.
6. Submit a pull request for review.

📄 License

The project's overall license has not been specified here. Review the repository license and the individual AI model licenses before redistributing the software or using it commercially.

👩‍💻 Project

AI Live Interpreter

Repository: https://github.com/Prabhavathi-Ai/ai-live-interpreter

Frontend: Next.js

Backend: FastAPI

AI pipeline: Speech recognition → English-to-Tamil translation → Tamil speech synthesis

---

Built to make spoken-language communication more accessible through AI-powered speech processing and translation.
