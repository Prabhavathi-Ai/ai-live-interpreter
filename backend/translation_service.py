from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL_NAME = "facebook/m2m100_418M"

print("Loading translation model...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

print("Translation model loaded.")


def translate_text(text: str) -> str:
    if not text.strip():
        return ""

    tokenizer.src_lang = "en"

    inputs = tokenizer(
        text.strip(),
        return_tensors="pt",
    )

    generated_tokens = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.get_lang_id("ta"),
        max_length=256,
    )

    translation = tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True,
    )

    return translation[0]