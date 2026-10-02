"""Tamil speech synthesis using Meta's local MMS VITS checkpoint.

Model: facebook/mms-tts-tam (CC-BY-NC-4.0).
"""

from __future__ import annotations

import io
import threading
import wave
from pathlib import Path
from typing import Any


MODEL_NAME = "facebook/mms-tts-tam"
MODEL_CACHE_DIR = Path(__file__).resolve().parent / "models" / ".hf-cache"
MAX_TEXT_LENGTH = 1000

_load_lock = threading.Lock()
_inference_lock = threading.Lock()
_tokenizer: Any = None
_model: Any = None
_torch: Any = None


def _load_model() -> tuple[Any, Any, Any]:
    global _model, _tokenizer, _torch

    if _model is None:
        with _load_lock:
            if _model is None:
                import torch
                from transformers import AutoTokenizer, VitsModel

                MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)
                _tokenizer = AutoTokenizer.from_pretrained(
                    MODEL_NAME,
                    cache_dir=str(MODEL_CACHE_DIR),
                )
                _model = VitsModel.from_pretrained(
                    MODEL_NAME,
                    cache_dir=str(MODEL_CACHE_DIR),
                ).to("cpu")
                _model.eval()
                _torch = torch

    return _tokenizer, _model, _torch


def synthesize_speech(text: str) -> bytes:
    """Return generated Tamil speech as a mono 16 kHz WAV byte string."""
    text = text.strip()
    if not text:
        raise ValueError("Text is empty.")
    if len(text) > MAX_TEXT_LENGTH:
        raise ValueError(f"Text must be {MAX_TEXT_LENGTH} characters or fewer.")

    tokenizer, model, torch = _load_model()
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    input_ids = inputs["input_ids"]
    if input_ids.numel() == 0 or torch.all(input_ids == tokenizer.pad_token_id):
        raise ValueError("Text has no characters supported by the Tamil speech model.")

    with _inference_lock, torch.inference_mode():
        waveform = model(**inputs).waveform.squeeze().cpu()
        if waveform.numel() == 0:
            raise ValueError("The Tamil speech model returned no audio.")
        samples = (waveform.clamp(-1, 1) * 32767).to(torch.int16).numpy()

    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(model.config.sampling_rate)
        wav_file.writeframes(samples.tobytes())

    return wav_buffer.getvalue()


def is_tts_model_loaded() -> bool:
    return _model is not None
