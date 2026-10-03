import unittest

from main import AudioContentLengthLimitMiddleware


class UploadContentLengthTests(unittest.IsolatedAsyncioTestCase):
    async def call_middleware(self, headers, *, max_bytes=100):
        reached_app = False
        sent = []

        async def app(scope, receive, send):
            nonlocal reached_app
            reached_app = True
            await send({"type": "http.response.start", "status": 200, "headers": []})
            await send({"type": "http.response.body", "body": b"ok"})

        async def receive():
            return {"type": "http.request", "body": b"", "more_body": False}

        async def send(message):
            sent.append(message)

        middleware = AudioContentLengthLimitMiddleware(app, max_request_bytes=max_bytes)
        await middleware(
            {
                "type": "http",
                "method": "POST",
                "path": "/audio",
                "headers": headers,
                "asgi": {"version": "3.0", "spec_version": "2.3"},
            },
            receive,
            send,
        )
        status = next(
            message["status"]
            for message in sent
            if message["type"] == "http.response.start"
        )
        return status, reached_app

    async def test_missing_content_length_is_rejected_before_multipart_parse(self):
        status, reached_app = await self.call_middleware([])

        self.assertEqual(status, 411)
        self.assertFalse(reached_app)

    async def test_oversized_request_is_rejected_before_multipart_parse(self):
        status, reached_app = await self.call_middleware(
            [(b"content-length", b"101")]
        )

        self.assertEqual(status, 413)
        self.assertFalse(reached_app)

    async def test_duplicate_content_length_is_rejected(self):
        status, reached_app = await self.call_middleware(
            [(b"content-length", b"10"), (b"content-length", b"10")]
        )

        self.assertEqual(status, 400)
        self.assertFalse(reached_app)

    async def test_request_within_limit_continues(self):
        status, reached_app = await self.call_middleware(
            [(b"content-length", b"100")]
        )

        self.assertEqual(status, 200)
        self.assertTrue(reached_app)


if __name__ == "__main__":
    unittest.main()
