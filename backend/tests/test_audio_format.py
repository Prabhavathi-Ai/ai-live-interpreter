import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import imageio_ffmpeg
from audio_format import (
    audio_suffix_for_content_type,
    is_supported_audio_content_type,
    is_valid_audio_file,
)


class AudioFormatTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory()
        cls.samples = {}
        sample_specs = (
            ("audio/aac", ".aac", "aac"),
            ("audio/mp3", ".mp3", "libmp3lame"),
            ("audio/mp4", ".mp4", "aac"),
            ("audio/ogg", ".ogg", "libvorbis"),
            ("audio/wav", ".wav", "pcm_s16le"),
            ("audio/webm", ".webm", "libopus"),
        )
        for content_type, suffix, codec in sample_specs:
            sample_path = Path(cls.temp_dir.name) / f"sample{suffix}"
            subprocess.run(
                [
                    imageio_ffmpeg.get_ffmpeg_exe(),
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-f",
                    "lavfi",
                    "-i",
                    "sine=frequency=440:sample_rate=48000",
                    "-t",
                    "0.25",
                    "-ac",
                    "1",
                    "-c:a",
                    codec,
                    str(sample_path),
                ],
                check=True,
                capture_output=True,
                timeout=20,
            )
            cls.samples[content_type] = sample_path

    @classmethod
    def tearDownClass(cls):
        cls.temp_dir.cleanup()

    def test_preserves_supported_browser_recording_containers(self):
        for content_type, suffix in (
            ("audio/webm;codecs=opus", ".webm"),
            ("audio/mp4", ".mp4"),
            ("audio/ogg", ".ogg"),
            ("audio/wav", ".wav"),
        ):
            with self.subTest(content_type=content_type):
                self.assertEqual(audio_suffix_for_content_type(content_type), suffix)

    def test_unknown_type_uses_a_non_misleading_suffix(self):
        self.assertEqual(audio_suffix_for_content_type("audio/custom"), ".audio")
        self.assertEqual(audio_suffix_for_content_type(None), ".audio")

    def test_only_known_audio_containers_are_supported(self):
        self.assertTrue(is_supported_audio_content_type("audio/webm;codecs=opus"))
        self.assertFalse(is_supported_audio_content_type("audio/custom"))
        self.assertFalse(is_supported_audio_content_type("image/png"))

    def test_valid_supported_audio_samples_decode(self):
        for content_type, path in self.samples.items():
            with self.subTest(content_type=content_type):
                self.assertTrue(is_valid_audio_file(path, content_type))

    def test_declared_content_type_must_match_the_container(self):
        for path, content_type in (
            (self.samples["audio/wav"], "audio/webm"),
            (self.samples["audio/mp4"], "audio/ogg"),
            (self.samples["audio/webm"], "audio/mp4"),
        ):
            with self.subTest(path=path, content_type=content_type):
                self.assertFalse(is_valid_audio_file(path, content_type))

    def test_empty_truncated_text_and_unrelated_files_are_rejected(self):
        invalid_contents = {
            "empty": b"",
            "truncated": b"\x1a\x45\xdf\xa3",
            "ordinary text": b"This is ordinary text, not an audio recording.",
            "unrelated bytes": b"\x00\x01\x02\x03\x04\x05",
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            for label, contents in invalid_contents.items():
                path = Path(temp_dir) / f"{label.replace(' ', '-')}.webm"
                path.write_bytes(contents)
                with self.subTest(label=label):
                    self.assertFalse(is_valid_audio_file(path, "audio/webm"))

    def test_unsupported_mime_type_is_not_decoded(self):
        with patch("audio_format.subprocess.run") as run:
            self.assertFalse(
                is_valid_audio_file(self.samples["audio/webm"], "audio/custom")
            )
        run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
