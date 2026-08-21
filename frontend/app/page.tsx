"use client";

import { useState } from "react";

export default function Home() {
  // Language state
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);

  // Swap source and target languages
  const swapLanguages = () => {
    const currentSource = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(currentSource);
  };

  // Start/stop recording state
  const toggleRecording = () => {
    setIsRecording(!isRecording);
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

      {/* Current translation direction */}
      <p>
        Translating from {sourceLanguage} to {targetLanguage}
      </p>

      {/* Recording controls */}
      <div>
        <button onClick={toggleRecording}>
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