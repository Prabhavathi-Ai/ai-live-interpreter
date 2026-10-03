"""Environment-backed configuration for the local interpreter backend."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit
from typing import Mapping


BACKEND_DIR = Path(__file__).resolve().parent
DEFAULT_CORS_ORIGINS = ("http://localhost:3000", "http://127.0.0.1:3000")


class ConfigurationError(ValueError):
    """Raised when a backend setting is unsafe or malformed."""


@dataclass(frozen=True)
class Settings:
    environment: str
    cors_origins: tuple[str, ...]
    enable_api_docs: bool
    max_audio_bytes: int
    model_dir: Path
    upload_dir: Path
    keep_latest_recording: bool


def _parse_bool(name: str, value: str, *, default: bool) -> bool:
    normalized = value.strip().casefold()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    if not normalized:
        return default
    raise ConfigurationError(f"{name} must be true or false.")


def _resolve_path(value: str | None, default: Path) -> Path:
    candidate = Path(value).expanduser() if value and value.strip() else default
    if not candidate.is_absolute():
        candidate = BACKEND_DIR / candidate
    return candidate.resolve()


def _parse_cors_origins(value: str, *, production: bool) -> tuple[str, ...]:
    origins: list[str] = []
    for entry in value.split(","):
        origin = entry.strip().rstrip("/")
        if not origin:
            continue
        parsed = urlsplit(origin)
        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.hostname
            or parsed.username
            or parsed.password
            or parsed.path
            or parsed.query
            or parsed.fragment
            or "*" in origin
        ):
            raise ConfigurationError(
                "CORS_ORIGINS must contain exact origins such as https://app.example.com."
            )
        try:
            parsed.port
        except ValueError as error:
            raise ConfigurationError("CORS_ORIGINS contains an invalid port.") from error
        if production and parsed.scheme != "https":
            raise ConfigurationError("Production CORS origins must use HTTPS.")
        origins.append(f"{parsed.scheme}://{parsed.netloc}")

    if not origins:
        raise ConfigurationError("Set CORS_ORIGINS to at least one exact frontend origin.")
    return tuple(dict.fromkeys(origins))


def load_settings(environ: Mapping[str, str] | None = None) -> Settings:
    """Load and validate settings; accepts an explicit mapping for unit tests."""
    values = os.environ if environ is None else environ
    environment = values.get("APP_ENV", "development").strip().casefold()
    if environment not in {"development", "production"}:
        raise ConfigurationError("APP_ENV must be development or production.")
    production = environment == "production"

    configured_origins = values.get("CORS_ORIGINS", "").strip()
    if configured_origins:
        cors_origins = _parse_cors_origins(configured_origins, production=production)
    elif production:
        raise ConfigurationError("Set CORS_ORIGINS before starting in production.")
    else:
        cors_origins = DEFAULT_CORS_ORIGINS

    raw_max_audio_bytes = values.get("MAX_AUDIO_BYTES", str(25 * 1024 * 1024))
    try:
        max_audio_bytes = int(raw_max_audio_bytes)
    except ValueError as error:
        raise ConfigurationError("MAX_AUDIO_BYTES must be a positive integer.") from error
    if max_audio_bytes < 1:
        raise ConfigurationError("MAX_AUDIO_BYTES must be a positive integer.")

    return Settings(
        environment=environment,
        cors_origins=cors_origins,
        enable_api_docs=_parse_bool(
            "ENABLE_API_DOCS",
            values.get("ENABLE_API_DOCS", ""),
            default=not production,
        ),
        max_audio_bytes=max_audio_bytes,
        model_dir=_resolve_path(values.get("AI_MODEL_DIR"), BACKEND_DIR / "models"),
        upload_dir=_resolve_path(values.get("UPLOAD_DIR"), BACKEND_DIR / "uploads"),
        keep_latest_recording=_parse_bool(
            "KEEP_LATEST_RECORDING",
            values.get("KEEP_LATEST_RECORDING", ""),
            default=not production,
        ),
    )


settings = load_settings()
