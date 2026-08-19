export default function Home() {
  return (
    <main>
      <h1>AI Live Interpreter</h1>
      <p>Speak. Translate. Understand.</p>

      <div>
        <label>
          From:
          <select>
            <option>English</option>
            <option>Tamil</option>
            <option>Hindi</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          To:
          <select>
            <option>Tamil</option>
            <option>English</option>
            <option>Hindi</option>
          </select>
        </label>
      </div>

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