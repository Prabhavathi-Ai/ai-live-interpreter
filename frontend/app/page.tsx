"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BackendIndicator,
  Icon,
  LanguageSwitcher,
  PlaybackButton,
  TranscriptCard,
  VoiceControl,
  type BackendState,
  type Feedback,
} from "./components/interpreter-ui";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "")
).replace(/\/+$/, "");

type ApiPayload = Record<string, unknown>;

async function readJsonResponse(
  response: Response,
  operation: string
): Promise<ApiPayload> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? `${operation} returned an unreadable response.`
        : `${operation} failed (HTTP ${response.status}); the backend returned an unreadable error.`
    );
  }

  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as ApiPayload)
      : null;

  if (!response.ok) {
    throw new Error(requestErrorMessage(response.status, operation));
  }

  if (!payload) {
    throw new Error(`${operation} returned an invalid response.`);
  }

  return payload;
}

function requestErrorMessage(status: number, operation: string): string {
  if (status === 413) return "That recording is too large. Try a shorter clip.";
  if (status === 415) {
    return "This audio format is not supported. Try recording again in your browser.";
  }
  if (status === 422) {
    return operation === "Audio processing"
      ? "We couldn't process that recording. Try speaking clearly and recording again."
      : "This Tamil text couldn't be prepared for speech. Try recording again.";
  }
  if (status === 503) {
    return "A local AI service couldn't finish this request. Please try again.";
  }
  return `We couldn't complete ${operation.toLowerCase()}. Please try again.`;
}

function networkErrorMessage(error: unknown, operation: string): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return `${operation} timed out. Try again with a shorter recording.`;
  }
  if (error instanceof TypeError) {
    return `Cannot reach FastAPI while ${operation.toLowerCase()}. Check that the backend is running.`;
  }
  return `Something went wrong while ${operation.toLowerCase()}. Please try again.`;
}

function microphoneErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "Microphone access was denied. Allow microphone access in your browser and try again.";
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return "No microphone was found. Connect a microphone and try again.";
    }
    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return "The microphone is unavailable or being used by another app.";
    }
  }
  return "Could not start microphone recording. Check your microphone and try again.";
}

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const [backendStatus, setBackendStatus] = useState<BackendState>("checking");
  const [feedback, setFeedback] = useState<Feedback>({
    kind: "info",
    message: "Ready when you are. Start with a short English phrase.",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isPlayingTranslation, setIsPlayingTranslation] = useState(false);

  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const translationAudioRef = useRef<HTMLAudioElement | null>(null);
  const translationAudioUrlRef = useRef<string | null>(null);
  const backendCheckControllerRef = useRef<AbortController | null>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const speechControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);
  const isSupportedDirection =
    sourceLanguage === "English" && targetLanguage === "Tamil";

  const notify = (message: string, kind: Feedback["kind"] = "info") => {
    setFeedback({ message, kind });
  };

  const clearTranslationAudio = () => {
    if (translationAudioRef.current) {
      translationAudioRef.current.onended = null;
      translationAudioRef.current.onerror = null;
      translationAudioRef.current.pause();
      translationAudioRef.current.removeAttribute("src");
      translationAudioRef.current.load();
    }
    translationAudioRef.current = null;

    if (translationAudioUrlRef.current) {
      URL.revokeObjectURL(translationAudioUrlRef.current);
      translationAudioUrlRef.current = null;
    }
  };

  const swapLanguages = () => {
    const nextSource = targetLanguage;
    const nextTarget = sourceLanguage;
    setSourceLanguage(nextSource);
    setTargetLanguage(nextTarget);
    const nextDirectionSupported =
      nextSource === "English" && nextTarget === "Tamil";
    notify(
      nextDirectionSupported
        ? "English to Tamil is ready."
        : "Reverse translation is not available yet. Switch back to English to Tamil to continue.",
      "info"
    );
  };

  const checkBackend = useCallback(async () => {
    const previousController = backendCheckControllerRef.current;
    const controller = new AbortController();
    backendCheckControllerRef.current = controller;
    previousController?.abort();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const data = await readJsonResponse(response, "Backend health check");
      if (data.status !== "healthy") {
        throw new Error("FastAPI reported an unhealthy status.");
      }
      if (backendCheckControllerRef.current === controller) {
        setBackendStatus("healthy");
      }
    } catch {
      if (backendCheckControllerRef.current === controller) {
        setBackendStatus("offline");
      }
    } finally {
      window.clearTimeout(timeout);
      if (backendCheckControllerRef.current === controller) {
        backendCheckControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const initialCheck = window.setTimeout(() => void checkBackend(), 0);
    const interval = window.setInterval(() => void checkBackend(), 15000);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(initialCheck);
      window.clearInterval(interval);
      const backendController = backendCheckControllerRef.current;
      const uploadController = uploadControllerRef.current;
      const speechController = speechControllerRef.current;
      backendCheckControllerRef.current = null;
      uploadControllerRef.current = null;
      speechControllerRef.current = null;
      backendController?.abort();
      uploadController?.abort();
      speechController?.abort();

      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onerror = null;
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      translationAudioRef.current?.pause();
      if (translationAudioUrlRef.current) {
        URL.revokeObjectURL(translationAudioUrlRef.current);
      }
    };
  }, [checkBackend]);

  const uploadAudio = async (audioBlob: Blob) => {
    if (audioBlob.size === 0) {
      setIsProcessing(false);
      notify("No audio was captured. Record a little longer and try again.", "error");
      return;
    }

    const controller = new AbortController();
    uploadControllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 10 * 60 * 1000);

    try {
      setIsProcessing(true);
      notify("Transcribing and translating your speech...");

      const formData = new FormData();

      formData.append(
        "file",
        audioBlob,
        "recording.webm"
      );
      formData.append("source_language", sourceLanguage);
      formData.append("target_language", targetLanguage);

      const response = await fetch(`${BACKEND_URL}/audio`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = await readJsonResponse(response, "Audio processing");

      if (
        (data.status !== "success" && data.status !== "no_speech") ||
        typeof data.text !== "string" ||
        typeof data.translation !== "string"
      ) {
        throw new Error("Audio processing returned an invalid response.");
      }

      setOriginalText(data.text || "");
      setTranslatedText(data.translation || "");
      setHasRecording(data.status === "success");
      notify(
        data.status === "no_speech"
          ? "No English speech was detected. Try recording again."
          : "Translation ready.",
        data.status === "no_speech" ? "error" : "success"
      );
    } catch (error) {
      if (mountedRef.current) {
        notify(networkErrorMessage(error, "audio processing"), "error");
      }
    } finally {
      window.clearTimeout(timeout);
      if (uploadControllerRef.current === controller) {
        uploadControllerRef.current = null;
      }
      if (mountedRef.current) setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    if (isProcessing || isGeneratingSpeech || isRecording) return;
    if (!isSupportedDirection) {
      notify("Only English to Tamil translation is available right now.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      notify(
        "This browser cannot record audio here. Use localhost or an HTTPS page in a supported browser.",
        "error"
      );
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      notify("This browser does not support microphone recording.", "error");
      return;
    }

    let stream: MediaStream | null = null;
    let recordingFailed = false;

    try {
      clearTranslationAudio();
      setIsPlayingTranslation(false);
      const activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream = activeStream;
      if (!mountedRef.current) {
        activeStream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = activeStream;

      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find(
        (type) =>
          typeof MediaRecorder.isTypeSupported === "function" &&
          MediaRecorder.isTypeSupported(type)
      );
      const recorder = new MediaRecorder(
        activeStream,
        mimeType ? { mimeType } : undefined
      );

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        activeStream.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);

        if (!mountedRef.current) return;
        if (recordingFailed) {
          setIsProcessing(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || audioChunksRef.current[0]?.type || "",
        });
        audioChunksRef.current = [];
        await uploadAudio(audioBlob);
      };

      recorder.onerror = () => {
        recordingFailed = true;
        stream?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setIsRecording(false);
        setIsProcessing(false);
        notify("The browser could not finish recording audio. Try again.", "error");
      };

      recorder.start();

      setIsRecording(true);
      setHasRecording(false);
      setOriginalText("");
      setTranslatedText("");
      notify("Recording in progress.");
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      if (mountedRef.current) {
        setIsRecording(false);
        setIsProcessing(false);
        notify(microphoneErrorMessage(error), "error");
      }
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      setIsProcessing(true);
      notify("Finishing recording...");
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        setIsProcessing(false);
        notify(microphoneErrorMessage(error), "error");
      }
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

  const playTranslation = async () => {
    if (isGeneratingSpeech) {
      speechControllerRef.current?.abort();
      notify("Cancelling Tamil speech generation...");
      return;
    }

    if (isPlayingTranslation) {
      clearTranslationAudio();
      setIsPlayingTranslation(false);
      notify("Translation playback stopped.");
      return;
    }

    if (!isSupportedDirection) {
      notify("Switch back to English to Tamil before playing translation.");
      return;
    }

    const controller = new AbortController();
    speechControllerRef.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 5 * 60 * 1000);

    try {
      setIsGeneratingSpeech(true);
      notify("Generating Tamil speech locally...");
      const response = await fetch(`${BACKEND_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translatedText }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await readJsonResponse(response, "Tamil speech generation");
        throw new Error(String(error.detail || "Tamil speech generation failed."));
      }

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (!contentType.includes("audio/wav")) {
        throw new Error("The backend did not return a WAV audio file.");
      }

      clearTranslationAudio();
      const audioBlob = await response.blob();
      if (audioBlob.size <= 44) {
        throw new Error("The backend returned an empty audio file.");
      }
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      translationAudioUrlRef.current = audioUrl;
      translationAudioRef.current = audio;
      audio.onended = () => {
        clearTranslationAudio();
        setIsPlayingTranslation(false);
        notify("Translation playback finished.", "success");
      };
      audio.onerror = () => {
        clearTranslationAudio();
        setIsPlayingTranslation(false);
        notify("The generated speech could not be played. Try again.", "error");
      };

      setIsPlayingTranslation(true);
      notify("Playing Tamil translation.");
      await audio.play();
    } catch (error) {
      clearTranslationAudio();
      if (mountedRef.current) {
        setIsPlayingTranslation(false);
        notify(
          controller.signal.aborted && !timedOut
            ? "Tamil speech generation cancelled."
            : networkErrorMessage(error, "Tamil speech generation"),
          "error"
        );
      }
    } finally {
      window.clearTimeout(timeout);
      if (speechControllerRef.current === controller) {
        speechControllerRef.current = null;
      }
      if (mountedRef.current) setIsGeneratingSpeech(false);
    }
  };

  return (
    <main className="interpreter-app">
      <header className="topbar">
        <div className="page-shell topbar-content">
          <div className="brand-lockup">
            <span className="brand-mark">
              <Icon name="brand" />
            </span>
            <span className="brand-copy">
              <h1 className="brand-name">AI Live Interpreter</h1>
              <span className="brand-caption">
                Real-time English to Tamil interpretation powered by local AI
              </span>
            </span>
          </div>
          <BackendIndicator
            status={backendStatus}
            onCheck={() => void checkBackend()}
          />
        </div>
      </header>

      <div className="page-shell workspace">
        <LanguageSwitcher
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          isBusy={
            isRecording ||
            isProcessing ||
            isGeneratingSpeech ||
            isPlayingTranslation
          }
          isSupported={isSupportedDirection}
          onSourceChange={setSourceLanguage}
          onTargetChange={setTargetLanguage}
          onSwap={swapLanguages}
        />

        <VoiceControl
          isRecording={isRecording}
          isProcessing={isProcessing}
          isGeneratingSpeech={isGeneratingSpeech}
          isPlayingTranslation={isPlayingTranslation}
          hasRecording={hasRecording && Boolean(translatedText)}
          isSupportedDirection={isSupportedDirection}
          feedback={feedback}
          onToggle={handleRecording}
        />

        <section
          className="interpreter-grid"
          aria-label="English speech and Tamil translation"
        >
          <TranscriptCard
            kind="original"
            title="Original Speech"
            subtitle="Recognized from your voice"
            language="English"
            text={originalText}
            emptyTitle="Your spoken English will appear here."
            emptyHint="Start speaking to begin."
            isRecording={isRecording}
          />

          <div className="flow-connector" aria-hidden="true">
            <span className="flow-line" />
            <span className="flow-node">
              <Icon name="arrow" />
            </span>
            <span className="flow-line" />
          </div>

          <TranscriptCard
            kind="translation"
            title="Tamil Translation"
            subtitle="Translated text"
            language="Tamil"
            text={translatedText}
            emptyTitle="Your Tamil translation will appear here."
            emptyHint="The local Tamil voice will be ready after translation."
            isReady={hasRecording && Boolean(translatedText)}
            footer={
              <>
                <div className="voice-caption">
                  <Icon name="speaker" />
                  <span>Listen to Tamil</span>
                </div>
                <PlaybackButton
                  mode={
                    isGeneratingSpeech
                      ? "generating"
                      : isPlayingTranslation
                        ? "playing"
                        : "idle"
                  }
                  disabled={
                    !translatedText ||
                    isProcessing ||
                    isRecording ||
                    !isSupportedDirection
                  }
                  onClick={() => void playTranslation()}
                />
              </>
            }
          />
        </section>
      </div>

      <footer className="app-footer">
        <div className="page-shell footer-content">
          <span>AI Live Interpreter</span>
          <span className="footer-divider" aria-hidden="true" />
          <span>Local AI</span>
          <span className="footer-divider" aria-hidden="true" />
          <span>English to Tamil</span>
        </div>
      </footer>
    </main>
  );
}
