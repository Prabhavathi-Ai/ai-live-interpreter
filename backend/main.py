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

    return {
        "message": "Audio received successfully",
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(audio_data),
    }