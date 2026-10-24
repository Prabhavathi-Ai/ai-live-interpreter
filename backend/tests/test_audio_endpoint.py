import io
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

import main


def _valid_wav_bytes():
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as recording:
        recording.setnchannels(1)
        recording.setsampwidth(2)
        recording.setframerate(48000)
        recording.writeframes(b"\x00\x00" * 1200)
    return buffer.getvalue()


class AudioEndpointTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)

    def test_missing_audio_file_returns_validation_error(self):
        response = self.client.post("/audio", data={"source_language": "en"})

        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json(), {"detail": "The request data is invalid."})

    def test_non_audio_upload_returns_unsupported_media_type(self):
        response = self.client.post(
            "/audio",
            files={"file": ("recording.png", b"not audio", "image/png")},
        )

        self.assertEqual(response.status_code, 415)
        self.assertIn("Unsupported audio file type", response.json()["detail"])

    def test_unknown_audio_subtype_is_rejected(self):
        response = self.client.post(
            "/audio",
            files={"file": ("recording.audio", b"not audio", "audio/custom")},
        )

        self.assertEqual(response.status_code, 415)

    def test_empty_audio_upload_returns_bad_request(self):
        response = self.client.post(
            "/audio",
            files={"file": ("recording.webm", b"", "audio/webm")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Uploaded audio file is empty")

    def test_oversized_audio_upload_returns_payload_too_large(self):
        with patch.object(main, "MAX_AUDIO_BYTES", 4):
            response = self.client.post(
                "/audio",
                files={"file": ("recording.webm", b"12345", "audio/webm")},
            )

        self.assertEqual(response.status_code, 413)
        self.assertIn("configured limit is 4 bytes", response.json()["detail"])

    def test_transcription_decode_error_returns_safe_client_error(self):
        with patch.object(
            main,
            "transcribe_audio",
            side_effect=ValueError("private decoder details"),
        ):
            response = self.client.post(
                "/audio",
                files={"file": ("recording.wav", _valid_wav_bytes(), "audio/wav")},
            )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.json()["detail"],
            "Uploaded audio could not be decoded as a supported recording.",
        )
        self.assertNotIn("private decoder details", response.text)

    def test_invalid_content_is_rejected_before_transcription(self):
        invalid_uploads = (
            ("text disguised as WebM", b"ordinary text", "audio/webm"),
            ("WAV declared as WebM", _valid_wav_bytes(), "audio/webm"),
            ("truncated WebM", b"\x1a\x45\xdf\xa3", "audio/webm"),
        )
        with patch.object(main, "transcribe_audio") as transcribe_audio:
            for label, contents, content_type in invalid_uploads:
                with self.subTest(label=label):
                    response = self.client.post(
                        "/audio",
                        files={
                            "file": ("recording.webm", contents, content_type)
                        },
                    )
                    self.assertEqual(response.status_code, 422)
                    self.assertEqual(
                        response.json()["detail"],
                        (
                            "Uploaded audio is malformed or does not match its "
                            "declared type."
                        ),
                    )
            transcribe_audio.assert_not_called()

    def test_unsupported_translation_language_returns_validation_error(self):
        response = self.client.post(
            "/translate",
            json={"text": "hello", "target_language": "fr"},
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.json()["detail"],
            "The local translation model currently supports Tamil only.",
        )

    def test_temporary_files_are_removed_after_success(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            upload_dir = Path(temp_dir)
            with (
                patch.object(main, "UPLOAD_DIR", upload_dir),
                patch.object(
                    main, "LATEST_RECORDING", upload_dir / "latest_recording.webm"
                ),
                patch.object(
                    main,
                    "_transcribe_and_translate",
                    return_value={
                        "status": "success",
                        "text": "hello",
                        "translation": "வணக்கம்",
                        "source_language": "en",
                        "target_language": "ta",
                    },
                ),
            ):
                response = self.client.post(
                    "/audio",
                    files={
                        "file": ("recording.wav", _valid_wav_bytes(), "audio/wav")
                    },
                )

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["text"], "hello")
            self.assertTrue((upload_dir / "latest_recording.webm").is_file())
            self.assertEqual(
                {path.name for path in upload_dir.iterdir()},
                {"latest_recording.webm"},
            )

    def test_temporary_files_are_removed_after_transcription_failure(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            upload_dir = Path(temp_dir)
            with (
                patch.object(main, "UPLOAD_DIR", upload_dir),
                patch.object(
                    main, "LATEST_RECORDING", upload_dir / "latest_recording.webm"
                ),
                patch.object(
                    main,
                    "transcribe_audio",
                    side_effect=RuntimeError("private details"),
                ),
            ):
                response = self.client.post(
                    "/audio",
                    files={
                        "file": ("recording.wav", _valid_wav_bytes(), "audio/wav")
                    },
                )

            self.assertEqual(response.status_code, 503)
            self.assertEqual(response.json()["detail"], "Local speech recognition failed.")
            self.assertNotIn("private details", response.text)
            self.assertEqual(
                {path.name for path in upload_dir.iterdir()},
                {"latest_recording.webm"},
            )

    def test_translation_failure_returns_safe_service_error_and_cleans_up(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            upload_dir = Path(temp_dir)
            with (
                patch.object(main, "UPLOAD_DIR", upload_dir),
                patch.object(
                    main, "LATEST_RECORDING", upload_dir / "latest_recording.webm"
                ),
                patch.object(main, "transcribe_audio", return_value="hello"),
                patch.object(
                    main,
                    "translate_text",
                    side_effect=RuntimeError("private details"),
                ),
            ):
                response = self.client.post(
                    "/audio",
                    files={
                        "file": ("recording.wav", _valid_wav_bytes(), "audio/wav")
                    },
                )

            self.assertEqual(response.status_code, 503)
            self.assertEqual(response.json()["detail"], "Local translation failed.")
            self.assertNotIn("private details", response.text)
            self.assertEqual(
                {path.name for path in upload_dir.iterdir()},
                {"latest_recording.webm"},
            )


if __name__ == "__main__":
    unittest.main()
