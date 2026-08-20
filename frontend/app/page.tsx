"use client";

import { useState } from "react";

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");

  const swapLanguages = () => {
    const currentSource = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(currentSource);
  };

  return (
    <main>
      <h1>AI Live Interpreter</h1>

      <p>Speak. Translate. Understand.</p>

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

      <button onClick={swapLanguages}>🔄 Swap Languages</button>

      <p>
        Translating from {sourceLanguage} to {targetLanguage}
      </p>

      <div>
        <button>🎤 Speak</button>
      </div>

      <section>
        <h2>Original</h2>
        <p>Your speech will appear here.</p>
      </section>

      <section>
        <h2>Translation</h2>
        <p>Your translation will appear here.</p>
      </section>

      <div>
        <button>🔊 Play Translation</button>
      </div>
    </main>
  );
}