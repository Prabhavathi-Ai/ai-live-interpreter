"use client";

import { useRef, useState } from "react";

export default function Home() {
  // Language state
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  // Backend connection state
  const [backendStatus, setBackendStatus] = useState("Not checked");

  // Stores microphone stream
  const streamRef = useRef<MediaStream | null>(null);

  // Stores the MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Stores audio chunks while recording
  const audioChunksRef = useRef<Blob[]>([]);

  // Stores the final recorded audio
  const audioBlobRef = useRef<Blob | null>(null);

  // Swap source and target languages
  const swapLanguages = () => {
    const currentSource = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(currentSource);
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Create the final audio Blob when recording stops
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        audioBlobRef.current = audioBlob;
        setHasRecording(true);

        // Stop and release microphone
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setHasRecording(false);
    } catch (error) {
      console.error("Microphone recording error:", error);
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

  // Handle Speak / Stop Recording button
  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Check connection to FastAPI backend
  const checkBackend = async () => {
    try {
      setBackendStatus("Checking...");

      const response = await fetch("http://127.0.0.1:8000/health");

      const data = await response.json();

      setBackendStatus(data.status);
    } catch (error) {
      console.error("Backend connection error:", error);
      setBackendStatus("Backend unavailable");
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
            onChange={(event) => setSourceLanguage(event.target.value)}
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
            onChange={(event) => setTargetLanguage(event.target.value)}
          >
            <option>Tamil</option>
            <option>English</option>
            <option>Hindi</option>
          </select>
        </label>
      </div>

      {/* Swap languages */}
      <button onClick={swapLanguages}>🔄 Swap Languages</button>

      {/* Translation direction */}
      <p>
        Translating from {sourceLanguage} to {targetLanguage}
      </p>

      {/* Recording controls */}
      <div>
        <button onClick={handleRecording}>
          {isRecording ? "⏹ Stop Recording" : "🎤 Speak"}
        </button>

        <p>
          {isRecording ? "🔴 Recording..." : "⚪ Ready to speak"}
        </p>

        {hasRecording && (
          <p>✅ Audio recording captured successfully!</p>
        )}
      </div>

      {/* Original speech */}
      <section>
        <h2>Original</h2>
        <p>Your speech will appear here.</p>
      </section>

      {/* Translation */}
      <section>
        <h2>Translation</h2>
        <p>Your translation will appear here.</p>
      </section>

      {/* Audio playback */}
      <div>
        <button>🔊 Play Translation</button>
      </div>

      {/* Backend connection */}
      <section>
        <h2>Backend Connection</h2>

        <button onClick={checkBackend}>Check Backend</button>

        <p>Status: {backendStatus}</p>
      </section>
    </main>
  );
}