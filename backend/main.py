from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
def read_root():
    return {
        "message": "AI Live Interpreter backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/audio")
async def receive_audio(file: UploadFile = File(...)):
    audio_data = await file.read()

    file_path = UPLOAD_DIR / "latest_recording.webm"

    with open(file_path, "wb") as audio_file:
        audio_file.write(audio_data)

    return {
        "message": "Audio saved successfully",
        "filename": file_path.name,
        "size": len(audio_data),
    }