const AUDIO_FILE_EXTENSIONS: Record<string, string> = {
  "audio/aac": "aac",
  "audio/mp3": "mp3",
  "audio/mpeg": "mp3",
  "audio/mp4": "mp4",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/webm": "webm",
  "audio/x-wav": "wav",
};

export function recordingFileName(mimeType: string): string {
  const normalizedMimeType = mimeType.split(";", 1)[0].trim().toLowerCase();
  return `recording.${AUDIO_FILE_EXTENSIONS[normalizedMimeType] ?? "audio"}`;
}
