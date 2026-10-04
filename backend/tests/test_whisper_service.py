import unittest

from whisper_service import _ffmpeg_alias_name


class WhisperPlatformTests(unittest.TestCase):
    def test_ffmpeg_alias_uses_windows_executable_suffix(self):
        self.assertEqual(_ffmpeg_alias_name("nt"), "ffmpeg.exe")

    def test_ffmpeg_alias_uses_unix_executable_name(self):
        self.assertEqual(_ffmpeg_alias_name("posix"), "ffmpeg")


if __name__ == "__main__":
    unittest.main()
