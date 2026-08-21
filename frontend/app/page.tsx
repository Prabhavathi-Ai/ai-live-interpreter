"use client";

import { useRef, useState } from "react";

export default function Home() {
  // Language state
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);

  // Stores the microphone stream
  const streamRef = useRef<MediaStream | null>(null);

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
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Unable to access the microphone. Please allow microphone permission.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  // Handle recording button
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
          From:
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
          To:
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

      {/* Real microphone controls */}
      <div>
        <button onClick={handleRecording}>
          {isRecording ? "⏹ Stop Recording" : "🎤 Speak"}
        </button>

        <p>
          {isRecording ? "🔴 Recording..." : "⚪ Ready to speak"}
        </p>
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
    </main>
  );
}