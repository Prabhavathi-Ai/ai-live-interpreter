import logging
import os
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

from config import settings
from translation_service import is_translation_model_loaded, translate_text
from tts_service import is_tts_model_loaded, synthesize_speech
from whisper_service import transcribe_audio


class AudioContentLengthLimitMiddleware:
    """Reject oversized audio requests before multipart parsing can spool them."""

    def __init__(self, app, max_request_bytes: int):
        self.app = app
        self.max_request_bytes = max_request_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and scope["path"] == "/audio" and scope["method"] == "POST":
            content_lengths = [
                value.strip()
                for name, value in scope.get("headers", [])
                if name.lower() == b"content-length"
            ]
            if not content_lengths:
                response = JSONResponse(
                    {"detail": "Audio uploads must include a Content-Length header."},
                    status_code=411,
                )
                await response(scope, receive, send)
                return
            if len(content_lengths) != 1:
                response = JSONResponse(
                    {"detail": "The request must include exactly one Content-Length header."},
                    status_code=400,
                )
                await response(scope, receive, send)
                return
            content_length = content_lengths[0]
            try:
                if not content_length.isdigit():
                    raise ValueError("not a decimal byte count")
                request_size = int(content_length)
            except ValueError:
                response = JSONResponse(
                    {"detail": "The request Content-Length header is invalid."},
                    status_code=400,
                )
                await response(scope, receive, send)
                return
            if request_size > self.max_request_bytes:
                response = JSONResponse(
                    {"detail": "Audio request is too large."}, status_code=413
                )
                await response(scope, receive, send)
                return

        await self.app(scope, receive, send)


logger = logging.getLogger(__name__)
api = FastAPI(
    title="AI Live Interpreter",
    docs_url="/docs" if settings.enable_api_docs else None,
    redoc_url="/redoc" if settings.enable_api_docs else None,
    openapi_url="/openapi.json" if settings.enable_api_docs else None,
)
api.add_middleware(
    AudioContentLengthLimitMiddleware,
    max_request_bytes=settings.max_audio_bytes + 1024 * 1024,
)
api.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@api.exception_handler(RequestValidationError)
async def invalid_request_handler(_request, _error):
    """Avoid returning submitted speech text in validation error responses."""
    return JSONResponse({"detail": "The request data is invalid."}, status_code=422)

UPLOAD_DIR = settings.upload_dir
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
LATEST_RECORDING = UPLOAD_DIR / "latest_recording.webm"
MAX_AUDIO_BYTES = settings.max_audio_bytes
app = api


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    target_language: str = Field(default="ta", max_length=16)


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1000)


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
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        logger.exception("Local speech recognition failed")
        raise HTTPException(status_code=503, detail="Local speech recognition failed.") from error

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
        logger.exception("Local translation failed")
        raise HTTPException(status_code=503, detail="Local translation failed.") from error

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
    if not settings.keep_latest_recording or not LATEST_RECORDING.exists():
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
        logger.exception("Local translation failed")
        raise HTTPException(status_code=503, detail="Local translation failed.") from error

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
    content_type = (file.content_type or "").split(";", 1)[0].strip().casefold()
    if not content_type.startswith("audio/"):
        await file.close()
        raise HTTPException(
            status_code=415,
            detail="Upload an audio recording such as WebM, WAV, or MP3.",
        )

    audio_data = await file.read(MAX_AUDIO_BYTES + 1)
    await file.close()
    if not audio_data:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty")
    if len(audio_data) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Audio is too large. The configured limit is {MAX_AUDIO_BYTES} bytes.",
        )

    request_id = uuid4().hex
    processing_path = UPLOAD_DIR / f".recording-{request_id}.webm"
    latest_temp_path = (
        UPLOAD_DIR / f".latest-{request_id}.tmp"
        if settings.keep_latest_recording
        else None
    )
    try:
        await run_in_threadpool(processing_path.write_bytes, audio_data)
        if latest_temp_path is not None:
            await run_in_threadpool(latest_temp_path.write_bytes, audio_data)
            await run_in_threadpool(os.replace, latest_temp_path, LATEST_RECORDING)
        result = await run_in_threadpool(_transcribe_and_translate, processing_path)
    except HTTPException:
        raise
    except OSError as error:
        raise HTTPException(
            status_code=500,
            detail="The backend could not save the uploaded audio.",
        ) from error
    finally:
        processing_path.unlink(missing_ok=True)
        if latest_temp_path is not None:
            latest_temp_path.unlink(missing_ok=True)

    result.update(
        {
            "message": (
                "No English speech was detected."
                if result["status"] == "no_speech"
                else "Audio transcribed and translated successfully"
            ),
            "filename": LATEST_RECORDING.name,
            "size": len(audio_data),
        }
    )
    return result


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
        logger.exception("Local Tamil speech synthesis failed")
        raise HTTPException(status_code=503, detail="Local Tamil speech synthesis failed.") from error

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
