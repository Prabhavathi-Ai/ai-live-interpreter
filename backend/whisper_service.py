"""Local speech-to-text service backed by OpenAI Whisper."""

from __future__ import annotations

import os
import shutil
import subprocess
import threading
from pathlib import Path
from typing import Any

from config import settings

MODEL_NAME = "tiny"
MODEL_DIR = settings.model_dir / "whisper"

_load_lock = threading.Lock()
_inference_lock = threading.Lock()
_model: Any = None


def _ffmpeg_alias_name(platform: str | None = None) -> str:
    """Return the executable alias expected by the current operating system."""
    return "ffmpeg.exe" if (platform or os.name) == "nt" else "ffmpeg"


def _load_model() -> Any:
    global _model

    if _model is None:
        with _load_lock:
            if _model is None:
                import whisper

                # OpenAI Whisper calls an executable literally named ffmpeg.
                # imageio-ffmpeg bundles a versioned executable, so add a
                # platform-appropriate local alias when ffmpeg is not on PATH.
                if not shutil.which("ffmpeg"):
                    try:
                        import imageio_ffmpeg

                        bundled_ffmpeg = Path(imageio_ffmpeg.get_ffmpeg_exe())
                        ffmpeg_dir = MODEL_DIR / "ffmpeg"
                        ffmpeg_dir.mkdir(parents=True, exist_ok=True)
                        ffmpeg_alias = ffmpeg_dir / _ffmpeg_alias_name()
                        if not ffmpeg_alias.exists():
                            try:
                                os.link(bundled_ffmpeg, ffmpeg_alias)
                            except OSError:
                                shutil.copy2(bundled_ffmpeg, ffmpeg_alias)
                        os.environ["PATH"] = (
                            f"{ffmpeg_dir}{os.pathsep}{os.environ.get('PATH', '')}"
                        )
                    except ImportError as error:
                        raise RuntimeError(
                            "FFmpeg is required for audio transcription. Install "
                            "imageio-ffmpeg or add ffmpeg to PATH."
                        ) from error

                MODEL_DIR.mkdir(parents=True, exist_ok=True)
                _model = whisper.load_model(MODEL_NAME, download_root=str(MODEL_DIR))

    return _model


def transcribe_audio(audio_path: str | Path, language: str = "en") -> str:
    """Transcribe one local audio file and return its recognized words."""
    path = Path(audio_path)
    if not path.is_file():
        raise FileNotFoundError(f"Audio file does not exist: {path}")

    try:
        with _inference_lock:
            result = _load_model().transcribe(
                str(path), language=language, fp16=False
            )
    except subprocess.CalledProcessError as error:
        raise ValueError(
            "The uploaded file could not be decoded as a supported audio recording."
        ) from error
    except RuntimeError as error:
        if str(error).startswith("Failed to load audio:"):
            raise ValueError(
                "The uploaded file could not be decoded as a supported audio recording."
            ) from error
        raise

    return result.get("text", "").strip()
