"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const [backendStatus, setBackendStatus] = useState("Not checked");
  const [audioStatus, setAudioStatus] = useState("No audio uploaded");

  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const swapLanguages = () => {
    const currentSource = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(currentSource);
  };

  const checkBackend = async () => {
    try {
      setBackendStatus("Checking...");

      const response = await fetch(
        "http://127.0.0.1:8000/health"
      );

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      setBackendStatus(data.status);
    } catch (error) {
      console.error(error);
      setBackendStatus("Backend unavailable");
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    try {
      setAudioStatus("Uploading...");

      const formData = new FormData();

      formData.append(
        "file",
        audioBlob,
        "recording.webm"
      );

      const response = await fetch(
        "http://127.0.0.1:8000/audio",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setAudioStatus("Audio uploaded successfully");
      setHasRecording(true);
    } catch (error) {
      console.error(error);
      setAudioStatus("Audio upload failed");
    }
  };

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/webm",
          }
        );

        stream.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;

        await uploadAudio(audioBlob);
      };

      recorder.start();

      setIsRecording(true);
      setHasRecording(false);
      setOriginalText("");
      setTranslatedText("");
      setAudioStatus("Recording...");
    } catch (error) {
      console.error(error);

      alert(
        "Unable to access microphone. Please allow microphone permission."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}

      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              AI Live Interpreter
            </h1>

            <p className="text-sm text-slate-400">
              Speak. Translate. Understand.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                backendStatus === "healthy"
                  ? "bg-green-400"
                  : "bg-slate-500"
              }`}
            />

            <span className="text-slate-300">
              {backendStatus === "healthy"
                ? "Backend Online"
                : "Backend Offline"}
            </span>
          </div>
        </div>
      </header>

      {/* Main */}

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Language controls */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                From
              </label>

              <select
                value={sourceLanguage}
                onChange={(event) =>
                  setSourceLanguage(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option>English</option>
                <option>Tamil</option>
                <option>Hindi</option>
              </select>
            </div>

            <button
              onClick={swapLanguages}
              className="rounded-xl border border-slate-700 px-5 py-3 text-xl transition hover:bg-slate-800"
              title="Swap languages"
            >
              ⇄
            </button>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                To
              </label>

              <select
                value={targetLanguage}
                onChange={(event) =>
                  setTargetLanguage(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option>Tamil</option>
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-slate-400">
            Translating from{" "}
            <span className="font-medium text-white">
              {sourceLanguage}
            </span>{" "}
            to{" "}
            <span className="font-medium text-white">
              {targetLanguage}
            </span>
          </p>
        </section>

        {/* Speech area */}

        <section className="grid gap-6 md:grid-cols-2">
          {/* Original */}

          <div className="min-h-[280px] rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Original Speech
              </h2>

              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {sourceLanguage}
              </span>
            </div>

            {originalText ? (
              <p className="text-lg leading-8 text-slate-200">
                {originalText}
              </p>
            ) : (
              <div className="flex h-40 items-center justify-center text-center text-slate-500">
                <div>
                  <div className="mb-3 text-4xl">🎤</div>
                  <p>Your speech will appear here.</p>
                </div>
              </div>
            )}
          </div>

          {/* Translation */}

          <div className="min-h-[280px] rounded-2xl border border-blue-900/50 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Translation
              </h2>

              <span className="rounded-full bg-blue-950 px-3 py-1 text-xs text-blue-300">
                {targetLanguage}
              </span>
            </div>

            {translatedText ? (
              <p className="text-lg leading-8 text-slate-200">
                {translatedText}
              </p>
            ) : (
              <div className="flex h-40 items-center justify-center text-center text-slate-500">
                <div>
                  <div className="mb-3 text-4xl">🌐</div>
                  <p>Your translation will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Recording controls */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <button
            onClick={handleRecording}
            className={`rounded-full px-10 py-5 text-lg font-semibold shadow-lg transition ${
              isRecording
                ? "bg-red-600 hover:bg-red-500"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {isRecording
              ? "⏹ Stop Recording"
              : "🎤 Start Speaking"}
          </button>

          <p className="mt-4 text-sm text-slate-400">
            {isRecording
              ? "🔴 Listening to your voice..."
              : "Click the microphone and start speaking"}
          </p>

          {hasRecording && (
            <p className="mt-3 text-sm text-green-400">
              ✓ Recording uploaded successfully
            </p>
          )}

          <p className="mt-2 text-xs text-slate-500">
            {audioStatus}
          </p>
        </section>

        {/* Translation audio */}

        <section className="mt-6 flex justify-center">
          <button
            disabled={!translatedText}
            className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🔊 Play Translation
          </button>
        </section>

        {/* Backend */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold">
                Backend Connection
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                FastAPI + Local AI services
              </p>
            </div>

            <button
              onClick={checkBackend}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm transition hover:bg-slate-800"
            >
              Check Backend
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Status:{" "}
            <span className="text-white">
              {backendStatus}
            </span>
          </p>
        </section>
      </div>

      {/* Footer */}

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-600">
        AI Live Interpreter • Local AI Project
      </footer>
    </main>
  );
}