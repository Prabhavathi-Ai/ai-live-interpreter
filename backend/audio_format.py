"""Helpers for preserving the container format of browser audio recordings."""

AUDIO_SUFFIXES = {
    "audio/aac": ".aac",
    "audio/mp3": ".mp3",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".mp4",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/webm": ".webm",
    "audio/x-wav": ".wav",
}


def audio_suffix_for_content_type(content_type: str | None) -> str:
    """Return a safe file suffix based on an uploaded audio MIME type."""
    mime_type = (content_type or "").split(";", 1)[0].strip().casefold()
    return AUDIO_SUFFIXES.get(mime_type, ".audio")


def is_supported_audio_content_type(content_type: str | None) -> bool:
    """Return whether an uploaded MIME type maps to a supported audio container."""
    mime_type = (content_type or "").split(";", 1)[0].strip().casefold()
    return mime_type in AUDIO_SUFFIXES
