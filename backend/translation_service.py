"""Local English-to-Tamil translation using the public OPUS-MT model."""

from __future__ import annotations

import re
import threading
from typing import Any

from config import settings

MODEL_NAME = "Helsinki-NLP/opus-mt-en-dra"
MODEL_CACHE_DIR = settings.model_dir / ".hf-cache"
MAX_CHUNK_TOKENS = 350

_load_lock = threading.Lock()
_inference_lock = threading.Lock()
_tokenizer: Any = None
_model: Any = None
_torch: Any = None


def _load_model() -> tuple[Any, Any, Any]:
    """Load the translation model once; its files stay in backend/models."""
    global _model, _tokenizer, _torch

    if _model is None:
        with _load_lock:
            if _model is None:
                import torch
                from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

                MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)
                _tokenizer = AutoTokenizer.from_pretrained(
                    MODEL_NAME,
                    cache_dir=str(MODEL_CACHE_DIR),
                )
                _model = AutoModelForSeq2SeqLM.from_pretrained(
                    MODEL_NAME,
                    cache_dir=str(MODEL_CACHE_DIR),
                ).to("cpu")
                _model.eval()
                _torch = torch

    return _tokenizer, _model, _torch


def _split_into_chunks(text: str, tokenizer: Any) -> list[str]:
    """Keep long transcripts within the model's input limit."""
    chunks: list[str] = []
    current = ""

    for sentence in re.split(r"(?<=[.!?])\s+", text.strip()):
        if not sentence:
            continue

        candidate = f"{current} {sentence}".strip()
        token_count = len(tokenizer(candidate, add_special_tokens=False)["input_ids"])
        if token_count <= MAX_CHUNK_TOKENS:
            current = candidate
            continue

        if current:
            chunks.append(current)
            current = ""

        words: list[str] = []
        for word in sentence.split():
            candidate = " ".join([*words, word])
            token_count = len(tokenizer(candidate, add_special_tokens=False)["input_ids"])
            if words and token_count > MAX_CHUNK_TOKENS:
                chunks.append(" ".join(words))
                words = [word]
            else:
                words.append(word)

        current = " ".join(words)

    if current:
        chunks.append(current)

    return chunks


def translate_text(text: str, target_language: str = "ta") -> str:
    """Translate English text into Tamil with an on-device neural model.

    The public OPUS-MT English-to-Dravidian checkpoint supports Tamil via its
    ``>>tam<<`` target-language token. The model downloads on its first use and
    is then read from the local cache.
    """
    if not text or not text.strip():
        return ""

    if target_language.strip().casefold() not in {"ta", "tamil", "ta-in"}:
        raise ValueError("The local translation model currently supports Tamil only.")

    tokenizer, model, torch = _load_model()
    translated_chunks: list[str] = []

    with _inference_lock, torch.inference_mode():
        for chunk in _split_into_chunks(text, tokenizer):
            inputs = tokenizer(
                f">>tam<< {chunk}",
                return_tensors="pt",
                truncation=True,
                max_length=384,
            )
            output = model.generate(
                **inputs,
                max_length=512,
                num_beams=4,
            )
            translated_chunks.append(
                tokenizer.decode(output[0], skip_special_tokens=True).strip()
            )

    return " ".join(part for part in translated_chunks if part).strip()


def is_translation_model_loaded() -> bool:
    return _model is not None
