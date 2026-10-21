import unittest

from audio_format import audio_suffix_for_content_type


class AudioFormatTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
