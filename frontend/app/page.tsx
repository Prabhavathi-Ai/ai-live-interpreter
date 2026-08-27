"use client";

import { useRef, useState } from "react";

export default function Home() {
  // Language state
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  // Backend state
  const [backendStatus, setBackendStatus] = useState("Not checked");

  // Audio status
  const [audioStatus, setAudioStatus] = useState("No audio uploaded");

  // Microphone stream
  const streamRef = useRef<MediaStream | null>(null);

  // MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Audio chunks
  const audioChunksRef = useRef<Blob[]>([]);

  // Final audio Blob
  const audioBlobRef = useRef<Blob | null>(null);

  // Swap languages
  const swapLanguages = () => {
    const currentSource = sourceLanguage;

    setSourceLanguage(targetLanguage);
    setTargetLanguage(currentSource);
  };

  // Check backend
  const checkBackend = async () => {
    try {
      setBackendStatus("Checking...");

      const response = await fetch(
        "http://127.0.0.1:8000/health"
      );

      if (!response.ok) {
        throw new Error("Backend health check failed");
      }

      const data = await response.json();

      setBackendStatus(data.status);
    } catch (error) {
      console.error("Backend connection error:", error);

      setBackendStatus("Backend unavailable");
    }
  };

  // Check uploaded audio
  const checkAudioStatus = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/audio/status"
      );

      if (!response.ok) {
        throw new Error("Audio status check failed");
      }

      const data = await response.json();

      if (data.status === "audio_available") {
        setAudioStatus("Audio available on backend");
      } else {
        setAudioStatus("No audio found");
      }
    } catch (error) {
      console.error("Audio status error:", error);

      setAudioStatus("Audio status unavailable");
    }
  };

  // Upload audio
  const uploadAudio = async (audioBlob: Blob) => {
    try {
      setAudioStatus("Uploading audio...");

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
        throw new Error("Audio upload failed");
      }

      const data = await response.json();

      console.log("Audio upload response:", data);

      setAudioStatus("Audio uploaded successfully");

      // Check that backend saved the audio
      await checkAudioStatus();
    } catch (error) {
      console.error("Audio upload error:", error);

      setAudioStatus("Audio upload failed");
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/webm",
          }
        );

        audioBlobRef.current = audioBlob;

        setHasRecording(true);

        // Release microphone
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;

        // Upload recording
        await uploadAudio(audioBlob);
      };

      mediaRecorder.start();

      setIsRecording(true);
      setHasRecording(false);
      setAudioStatus("Recording...");
    } catch (error) {
      console.error(
        "Microphone recording error:",
        error
      );

      alert(
        "Unable to access the microphone. Please allow microphone permission."
      );
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  // Recording button
  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <main>
      <h1>AI Live Interpreter</h1>

      <p>Speak. Translate. Understand.</p>

      {/* Source language */}
      <div>
        <label>
          From:{" "}
          <select
            value={sourceLanguage}
            onChange={(event) =>
              setSourceLanguage(event.target.value)
            }
          >
            <option>English</option>
            <option>Tamil</option>
            <option>Hindi</option>
          </select>
        </label>
      </div>

      {/* Target language */}
      <div>
        <label>
          To:{" "}
          <select
            value={targetLanguage}
            onChange={(event) =>
              setTargetLanguage(event.target.value)
            }
          >
            <option>Tamil</option>
            <option>English</option>
            <option>Hindi</option>
          </select>
        </label>
      </div>

      {/* Swap languages */}
      <button onClick={swapLanguages}>
        🔄 Swap Languages
      </button>

      <p>
        Translating from {sourceLanguage} to{" "}
        {targetLanguage}
      </p>

      {/* Recording */}
      <div>
        <button onClick={handleRecording}>
          {isRecording
            ? "⏹ Stop Recording"
            : "🎤 Speak"}
        </button>

        <p>
          {isRecording
            ? "🔴 Recording..."
            : "⚪ Ready to speak"}
        </p>

        {hasRecording && (
          <p>
            ✅ Audio recording captured successfully!
          </p>
        )}

        <p>
          Audio status: {audioStatus}
        </p>
      </div>

      {/* Original speech */}
      <section>
        <h2>Original</h2>

        <p>
          Your speech will appear here.
        </p>
      </section>

      {/* Translation */}
      <section>
        <h2>Translation</h2>

        <p>
          Your translation will appear here.
        </p>
      </section>

      {/* Translation audio */}
      <div>
        <button>
          🔊 Play Translation
        </button>
      </div>

      {/* Backend connection */}
      <section>
        <h2>Backend Connection</h2>

        <button onClick={checkBackend}>
          Check Backend
        </button>

        <p>
          Status: {backendStatus}
        </p>
      </section>
    </main>
  );
}