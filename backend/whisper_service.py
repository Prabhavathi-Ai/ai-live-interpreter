import whisper

model = whisper.load_model("tiny")


def transcribe_audio(audio_path: str) -> str:
    try:
        result = model.transcribe(audio_path)
        return result["text"].strip()
    except Exception as error:
        print(f"Whisper transcription error: {error}")
        return ""