from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from translation_service import is_translation_model_loaded, translate_text
from tts_service import is_tts_model_loaded, synthesize_speech
from whisper_service import transcribe_audio


app = FastAPI(title="AI Live Interpreter")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
LATEST_RECORDING = UPLOAD_DIR / "latest_recording.webm"


class TranslationRequest(BaseModel):
    text: str
    target_language: str = "ta"


class SpeechRequest(BaseModel):
    text: str


def _validate_languages(source_language: str, target_language: str) -> None:
    if source_language.strip().casefold() not in {"en", "english"}:
        raise HTTPException(
            status_code=422,
            detail="The local speech pipeline currently supports English speech only.",
        )
    if target_language.strip().casefold() not in {"ta", "tamil", "ta-in"}:
        raise HTTPException(
            status_code=422,
            detail="The local translation model currently supports Tamil only.",
        )


def _transcribe_and_translate(audio_path: Path) -> dict[str, str]:
    try:
        transcript = transcribe_audio(audio_path, language="en")
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"Local speech recognition failed: {error}",
        ) from error

    if not transcript:
        return {
            "status": "no_speech",
            "text": "",
            "translation": "",
            "source_language": "en",
            "target_language": "ta",
        }

    try:
        translation = translate_text(transcript, target_language="ta")
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"Local translation failed: {error}",
        ) from error

    return {
        "status": "success",
        "text": transcript,
        "translation": translation,
        "source_language": "en",
        "target_language": "ta",
    }


@app.get("/")
def read_root():
    return {
        "message": "AI Live Interpreter backend is running",
        "version": "1.2.0",
        "status": "ready",
        "service": "FastAPI",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/audio/status")
def audio_status():
    if not LATEST_RECORDING.exists():
        return {"status": "no_audio", "message": "No audio recording found"}

    return {
        "status": "uploaded",
        "filename": LATEST_RECORDING.name,
        "size": LATEST_RECORDING.stat().st_size,
    }


@app.post("/translate")
def translate(request: TranslationRequest):
    try:
        translated_text = translate_text(request.text, request.target_language)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"Local translation failed: {error}",
        ) from error

    return {
        "text": request.text,
        "translation": translated_text,
        "source_language": "en",
        "target_language": "ta",
    }


@app.post("/audio")
async def receive_audio(
    file: UploadFile = File(...),
    source_language: str = Form("en"),
    target_language: str = Form("ta"),
):
    _validate_languages(source_language, target_language)
    audio_data = await file.read()
    if not audio_data:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty")

    LATEST_RECORDING.write_bytes(audio_data)
    result = await run_in_threadpool(_transcribe_and_translate, LATEST_RECORDING)
    result.update(
        {
            "message": "Audio transcribed and translated successfully",
            "filename": LATEST_RECORDING.name,
            "size": len(audio_data),
        }
    )
    return result


@app.get("/audio/transcribe")
def transcribe_latest_audio():
    if not LATEST_RECORDING.exists():
        return {"status": "no_audio", "message": "No audio recording found"}

    return _transcribe_and_translate(LATEST_RECORDING)


@app.get("/translation/status")
def translation_status():
    return {
        "status": "loaded" if is_translation_model_loaded() else "not_loaded",
        "model": "Helsinki-NLP/opus-mt-en-dra",
        "target_language": "ta",
    }


@app.post("/tts")
def text_to_speech(request: SpeechRequest):
    try:
        audio = synthesize_speech(request.text)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"Local Tamil speech synthesis failed: {error}",
        ) from error

    return Response(
        content=audio,
        media_type="audio/wav",
        headers={"Content-Disposition": "inline; filename=translation.wav"},
    )


@app.get("/tts/status")
def tts_status():
    return {
        "status": "loaded" if is_tts_model_loaded() else "not_loaded",
        "model": "facebook/mms-tts-tam",
        "language": "ta",
    }
