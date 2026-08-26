"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const [backendStatus, setBackendStatus] = useState("Not checked");
  const [uploadStatus, setUploadStatus] = useState("No audio uploaded");

  const [audioStatus, setAudioStatus] = useState("Not checked");
  const [audioSize, setAudioSize] = useState<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  const swapLanguages = () => {
    const currentSource = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(currentSource);
  };

  const checkAudioStatus = async () => {
    try {
      setAudioStatus("Checking...");
      setAudioSize(null);

      const response = await fetch(
        "http://127.0.0.1:8000/audio/status"
      );

      if (!response.ok) {
        throw new Error("Audio status check failed");
      }

      const data = await response.json();

      if (data.status === "audio_available") {
        setAudioStatus(
          `Audio available: ${data.filename}`
        );

        setAudioSize(data.size);
      } else {
        setAudioStatus("No audio recording available");
      }
    } catch (error) {
      console.error("Audio status error:", error);
      setAudioStatus("Unable to check audio");
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    try {
      setUploadStatus(
        "Uploading audio..."
      );

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

      console.log(
        "Audio upload response:",
        data
      );

      setUploadStatus(
        "Audio uploaded successfully"
      );

      await checkAudioStatus();
    } catch (error) {
      console.error(
        "Audio upload error:",
        error
      );

      setUploadStatus(
        "Audio upload failed"
      );
    }
  };

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/webm",
          }
        );

        audioBlobRef.current =
          audioBlob;

        setHasRecording(true);

        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;

        await uploadAudio(audioBlob);
      };

      mediaRecorder.start();

      setIsRecording(true);
      setHasRecording(false);
      setUploadStatus(
        "Recording audio..."
      );
      setAudioStatus("Waiting for upload...");
      setAudioSize(null);
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

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
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

  const checkBackend = async () => {
    try {
      setBackendStatus("Checking...");

      const response = await fetch(
        "http://127.0.0.1:8000/health"
      );

      if (!response.ok) {
        throw new Error(
          "Backend health check failed"
        );
      }

      const data = await response.json();

      setBackendStatus(data.status);
    } catch (error) {
      console.error(
        "Backend connection error:",
        error
      );

      setBackendStatus(
        "Backend unavailable"
      );
    }
  };

  return (
    <main>
      <h1>AI Live Interpreter</h1>

      <p>
        Speak. Translate. Understand.
      </p>

      <div>
        <label>
          From:{" "}
          <select
            value={sourceLanguage}
            onChange={(event) =>
              setSourceLanguage(
                event.target.value
              )
            }
          >
            <option>English</option>
            <option>Tamil</option>
            <option>Hindi</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          To:{" "}
          <select
            value={targetLanguage}
            onChange={(event) =>
              setTargetLanguage(
                event.target.value
              )
            }
          >
            <option>Tamil</option>
            <option>English</option>
            <option>Hindi</option>
          </select>
        </label>
      </div>

      <button onClick={swapLanguages}>
        🔄 Swap Languages
      </button>

      <p>
        Translating from{" "}
        {sourceLanguage} to{" "}
        {targetLanguage}
      </p>

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
            ✅ Audio recording captured
            successfully!
          </p>
        )}

        <p>
          Upload status:{" "}
          {uploadStatus}
        </p>
      </div>

      <section>
        <h2>Audio Status</h2>

        <button
          onClick={checkAudioStatus}
        >
          Check Saved Audio
        </button>

        <p>
          Status: {audioStatus}
        </p>

        {audioSize !== null && (
          <p>
            File size: {audioSize} bytes
          </p>
        )}
      </section>

      <section>
        <h2>Original</h2>
        <p>
          Your speech will appear here.
        </p>
      </section>

      <section>
        <h2>Translation</h2>
        <p>
          Your translation will appear here.
        </p>
      </section>

      <div>
        <button>
          🔊 Play Translation
        </button>
      </div>

      <section>
        <h2>
          Backend Connection
        </h2>

        <button
          onClick={checkBackend}
        >
          Check Backend
        </button>

        <p>
          Status: {backendStatus}
        </p>
      </section>
    </main>
  );
}