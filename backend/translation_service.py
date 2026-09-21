def translate_text(text: str, target_language: str = "ta") -> str:
    """
    Translation service placeholder.

    The actual free local translation model will be connected here.
    """
    if not text or not text.strip():
        return ""

    return text