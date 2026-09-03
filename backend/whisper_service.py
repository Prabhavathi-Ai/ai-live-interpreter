import whisper

model = whisper.load_model("tiny")


def transcribe_audio(audio_path):
    result = model.transcribe(str(audio_path))
    return result["text"]