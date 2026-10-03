import unittest

from config import ConfigurationError, load_settings


class SettingsTests(unittest.TestCase):
    def test_development_defaults_keep_existing_local_behavior(self):
        settings = load_settings({})

        self.assertEqual(settings.environment, "development")
        self.assertEqual(
            settings.cors_origins,
            ("http://localhost:3000", "http://127.0.0.1:3000"),
        )
        self.assertTrue(settings.enable_api_docs)
        self.assertTrue(settings.keep_latest_recording)
        self.assertEqual(settings.max_audio_bytes, 25 * 1024 * 1024)

    def test_production_requires_exact_https_origins_and_disables_dev_defaults(self):
        settings = load_settings(
            {
                "APP_ENV": "production",
                "CORS_ORIGINS": "https://interpreter.example.com",
            }
        )

        self.assertEqual(settings.cors_origins, ("https://interpreter.example.com",))
        self.assertFalse(settings.enable_api_docs)
        self.assertFalse(settings.keep_latest_recording)

    def test_production_requires_explicit_cors_origin(self):
        with self.assertRaises(ConfigurationError):
            load_settings({"APP_ENV": "production"})

    def test_production_rejects_wildcard_and_insecure_origins(self):
        for origins in ("*", "http://interpreter.example.com"):
            with self.subTest(origins=origins):
                with self.assertRaises(ConfigurationError):
                    load_settings(
                        {"APP_ENV": "production", "CORS_ORIGINS": origins}
                    )

    def test_invalid_upload_size_and_boolean_are_rejected(self):
        for values in (
            {"MAX_AUDIO_BYTES": "0"},
            {"MAX_AUDIO_BYTES": "large"},
            {"ENABLE_API_DOCS": "sometimes"},
        ):
            with self.subTest(values=values):
                with self.assertRaises(ConfigurationError):
                    load_settings(values)


if __name__ == "__main__":
    unittest.main()
