"""Helpers for preserving the container format of browser audio recordings."""

import subprocess
from pathlib import Path

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

AUDIO_DEMUXERS = {
    "audio/aac": "aac",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/mp4": "mov",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/webm": "webm",
    "audio/x-wav": "wav",
}


def _normalized_content_type(content_type: str | None) -> str:
    return (content_type or "").split(";", 1)[0].strip().casefold()


def audio_suffix_for_content_type(content_type: str | None) -> str:
    """Return a safe file suffix based on an uploaded audio MIME type."""
    mime_type = _normalized_content_type(content_type)
    return AUDIO_SUFFIXES.get(mime_type, ".audio")


def is_supported_audio_content_type(content_type: str | None) -> bool:
    """Return whether an uploaded MIME type maps to a supported audio container."""
    mime_type = _normalized_content_type(content_type)
    return mime_type in AUDIO_SUFFIXES


def is_valid_audio_file(path: str | Path, content_type: str | None) -> bool:
    """Decode the declared audio container and require non-zero audio duration."""
    demuxer = AUDIO_DEMUXERS.get(_normalized_content_type(content_type))
    if demuxer is None:
        return False

    try:
        import imageio_ffmpeg
    except ImportError as error:
        raise RuntimeError("FFmpeg audio validation is unavailable.") from error

    try:
        result = subprocess.run(
            [
                imageio_ffmpeg.get_ffmpeg_exe(),
                "-hide_banner",
                "-nostdin",
                "-v",
                "error",
                "-xerror",
                "-err_detect",
                "explode",
                "-f",
                demuxer,
                "-i",
                str(path),
                "-map",
                "0:a:0",
                "-vn",
                "-sn",
                "-dn",
                "-progress",
                "pipe:1",
                "-nostats",
                "-f",
                "null",
                "-",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=60,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return False

    if result.returncode != 0:
        return False

    decoded_durations = [
        line.partition(b"=")[2]
        for line in result.stdout.splitlines()
        if line.startswith(b"out_time_us=")
    ]
    try:
        return int(decoded_durations[-1]) > 0
    except (IndexError, ValueError):
        return False
