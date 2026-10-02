import type { ReactNode } from "react";

export type BackendState = "checking" | "healthy" | "offline";
export type Feedback = {
  kind: "info" | "success" | "error";
  message: string;
};

type IconName =
  | "brand"
  | "microphone"
  | "translate"
  | "swap"
  | "arrow"
  | "play"
  | "stop"
  | "speaker"
  | "check"
  | "alert"
  | "spinner";

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const shared = {
    "aria-hidden": true as const,
    className,
    fill: "none",
    height: 20,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    width: 20,
  };

  switch (name) {
    case "brand":
    case "microphone":
      return (
        <svg {...shared}>
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3m-4 0h8" />
        </svg>
      );
    case "translate":
      return (
        <svg {...shared}>
          <path d="M4 5h10M9 3v2m4 0c-.7 4-3.3 7-7 9m1-6c1.1 2.1 2.8 3.7 5 4.8M15 20l3.1-8 3.1 8m-5.1-2h4" />
        </svg>
      );
    case "swap":
      return (
        <svg {...shared}>
          <path d="M7 7h12l-3-3M17 17H5l3 3m6-4 4 4m0-4-4 4" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...shared}>
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      );
    case "play":
      return (
        <svg {...shared} fill="currentColor" stroke="none">
          <path d="M8 5.8c0-.8.9-1.3 1.6-.9l9 6.2a1.1 1.1 0 0 1 0 1.8l-9 6.2c-.7.5-1.6-.1-1.6-.9z" />
        </svg>
      );
    case "stop":
      return (
        <svg {...shared} fill="currentColor" stroke="none">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      );
    case "speaker":
      return (
        <svg {...shared}>
          <path d="M4 10v4h4l5 4V6l-5 4zM16 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12" />
        </svg>
      );
    case "check":
      return (
        <svg {...shared}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "alert":
      return (
        <svg {...shared}>
          <path d="M12 3 2.8 19a1.4 1.4 0 0 0 1.2 2h16a1.4 1.4 0 0 0 1.2-2zM12 9v4m0 4h.01" />
        </svg>
      );
    case "spinner":
      return (
        <svg {...shared} className={`icon-spinner ${className ?? ""}`}>
          <path d="M20 12a8 8 0 1 1-2.3-5.7" />
        </svg>
      );
  }
}

export function BackendIndicator({
  status,
  onCheck,
}: {
  status: BackendState;
  onCheck: () => void;
}) {
  const label =
    status === "healthy"
      ? "Backend Online"
      : status === "checking"
        ? "Checking Backend"
        : "Backend Offline";

  return (
    <button
      type="button"
      className={`backend-status backend-status-${status}`}
      onClick={onCheck}
      aria-label={`${label}. Check connection again.`}
      title="Check backend connection"
    >
      <span className="backend-dot" aria-hidden="true" />
      <span role="status" aria-live="polite">
        {label}
      </span>
    </button>
  );
}

export function LanguageSwitcher({
  sourceLanguage,
  targetLanguage,
  isBusy,
  isSupported,
  onSourceChange,
  onTargetChange,
  onSwap,
}: {
  sourceLanguage: string;
  targetLanguage: string;
  isBusy: boolean;
  isSupported: boolean;
  onSourceChange: (language: string) => void;
  onTargetChange: (language: string) => void;
  onSwap: () => void;
}) {
  return (
    <section className="direction-panel" aria-label="Language direction">
      <div className="language-field">
        <label htmlFor="source-language">From</label>
        <div className="select-wrap">
          <select
            id="source-language"
            aria-describedby="direction-note"
            value={sourceLanguage}
            disabled={isBusy}
            onChange={(event) => onSourceChange(event.target.value)}
          >
            <option>English</option>
            <option disabled>Tamil</option>
            <option disabled>Hindi</option>
          </select>
          <span className="select-chevron" aria-hidden="true" />
        </div>
      </div>

      <button
        type="button"
        className="swap-button"
        onClick={onSwap}
        disabled={isBusy}
        aria-label="Swap source and target languages"
        title="Only English to Tamil translation is available"
      >
        <Icon name="swap" />
      </button>

      <div className="language-field">
        <label htmlFor="target-language">To</label>
        <div className="select-wrap">
          <select
            id="target-language"
            aria-describedby="direction-note"
            value={targetLanguage}
            disabled={isBusy}
            onChange={(event) => onTargetChange(event.target.value)}
          >
            <option>Tamil</option>
            <option disabled>English</option>
            <option disabled>Hindi</option>
          </select>
          <span className="select-chevron" aria-hidden="true" />
        </div>
      </div>

      <p
        className={`direction-note ${isSupported ? "" : "direction-note-warning"}`}
        id="direction-note"
      >
        {isSupported
          ? "English to Tamil"
          : "Reverse translation is not available yet. Switch back to English to Tamil to continue."}
      </p>
    </section>
  );
}

export function TranscriptCard({
  kind,
  title,
  subtitle,
  language,
  text,
  emptyTitle,
  emptyHint,
  isRecording = false,
  isReady = false,
  footer,
}: {
  kind: "original" | "translation";
  title: string;
  subtitle: string;
  language: string;
  text: string;
  emptyTitle: string;
  emptyHint: string;
  isRecording?: boolean;
  isReady?: boolean;
  footer?: ReactNode;
}) {
  const icon = kind === "original" ? "microphone" : "translate";

  return (
    <article
      className={`language-card ${kind}-card`}
      aria-labelledby={`${kind}-heading`}
    >
      <div className="card-heading">
        <span className={`card-icon ${kind}-icon`}>
          <Icon name={icon} />
        </span>
        <div className="card-title-group">
          <h2 id={`${kind}-heading`}>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className="language-chip">{language}</span>
        {isRecording && (
          <span className="recording-badge">
            <span className="recording-badge-dot" aria-hidden="true" />
            Recording
          </span>
        )}
        {isReady && (
          <span className="ready-badge">
            <Icon name="check" />
            Ready
          </span>
        )}
      </div>

      <div className={`card-content ${text ? "card-content-filled" : ""}`}>
        {text ? (
          <p
            className={`transcript-text ${kind === "translation" ? "tamil-text" : ""}`}
            lang={kind === "original" ? "en" : "ta"}
            dir={kind === "translation" ? "auto" : undefined}
          >
            {text}
          </p>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Icon name={icon} />
            </span>
            <p>{emptyTitle}</p>
            <span>{emptyHint}</span>
          </div>
        )}
      </div>

      {footer && <div className="translation-card-footer">{footer}</div>}
    </article>
  );
}

export function PlaybackButton({
  mode,
  disabled,
  onClick,
}: {
  mode: "idle" | "generating" | "playing";
  disabled: boolean;
  onClick: () => void;
}) {
  const label =
    mode === "generating"
      ? "Cancel generation"
      : mode === "playing"
        ? "Playing..."
        : "Play Translation";

  return (
    <button
      type="button"
      className={`play-button ${mode === "playing" ? "play-button-active" : ""}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={
        mode === "generating"
          ? "Cancel Tamil speech generation"
          : mode === "playing"
            ? "Stop Tamil translation playback"
            : "Play Tamil translation"
      }
    >
      <Icon
        name={
          mode === "generating"
            ? "spinner"
            : mode === "playing"
              ? "stop"
              : "play"
        }
      />
      <span>{label}</span>
    </button>
  );
}

export function VoiceControl({
  isRecording,
  isProcessing,
  isGeneratingSpeech,
  isPlayingTranslation,
  hasRecording,
  isSupportedDirection,
  feedback,
  onToggle,
}: {
  isRecording: boolean;
  isProcessing: boolean;
  isGeneratingSpeech: boolean;
  isPlayingTranslation: boolean;
  hasRecording: boolean;
  isSupportedDirection: boolean;
  feedback: Feedback;
  onToggle: () => void;
}) {
  const mode = isRecording
    ? "recording"
    : isProcessing
      ? "processing"
      : isGeneratingSpeech
        ? "generating"
        : isPlayingTranslation
          ? "playing"
          : hasRecording
            ? "ready"
            : "idle";
  const buttonIcon =
    mode === "recording"
      ? "stop"
      : mode === "processing" || mode === "generating"
        ? "spinner"
        : "microphone";
  const buttonLabel =
    mode === "recording"
      ? "Stop Recording"
      : mode === "processing"
        ? "Processing..."
        : mode === "generating"
          ? "Please wait..."
          : "Start Recording";
  const statusTitle =
    mode === "recording"
      ? "Listening..."
      : mode === "processing"
        ? "Processing your speech..."
        : mode === "generating"
          ? "Generating Tamil voice..."
          : mode === "playing"
            ? "Playing Tamil translation..."
            : mode === "ready"
              ? "Translation ready"
              : "Start speaking";
  const statusDescription =
    mode === "recording"
      ? "Speak naturally in English. Tap the microphone again to finish."
      : mode === "processing"
        ? "Your recording is being transcribed and translated locally."
        : mode === "generating"
          ? "Preparing the Tamil audio for playback."
          : mode === "playing"
            ? "Your Tamil translation is playing."
            : mode === "ready"
              ? "Your English transcript and Tamil translation are ready."
              : "Tap the microphone and speak in English.";
  const showFeedback =
    feedback.kind !== "info" ||
    (!isRecording &&
      !isProcessing &&
      !isGeneratingSpeech &&
      !isPlayingTranslation &&
      feedback.message !== "Ready when you are. Start with a short English phrase.");

  return (
    <section className={`voice-stage voice-stage-${mode}`} aria-label="Voice controls">
      <div className={`mic-orbit ${isRecording ? "mic-orbit-active" : ""}`}>
        <span className="mic-orbit-ring mic-orbit-ring-outer" aria-hidden="true" />
        <span className="mic-orbit-ring mic-orbit-ring-inner" aria-hidden="true" />
        <button
          type="button"
          className={`mic-button ${isRecording ? "mic-button-recording" : ""}`}
          onClick={onToggle}
          disabled={
            isProcessing ||
            isGeneratingSpeech ||
            (!isSupportedDirection && !isRecording)
          }
          aria-label={isRecording ? "Stop recording" : buttonLabel}
          aria-pressed={isRecording}
        >
          <Icon name={buttonIcon} />
        </button>
      </div>

      <div className="voice-live-copy" aria-live="polite" role="status">
        <h2>{statusTitle}</h2>
        <p>{statusDescription}</p>
      </div>

      {isRecording && (
        <div className="audio-activity" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      )}

      {isProcessing && (
        <div className="processing-callout" role="status" aria-live="polite">
          <div className="processing-callout-heading">
            <Icon name="spinner" />
            <span>Transcribing and translating</span>
          </div>
          <div className="processing-track" aria-hidden="true">
            <span />
          </div>
        </div>
      )}

      {isGeneratingSpeech && (
        <div className="speech-callout" role="status" aria-live="polite">
          <Icon name="spinner" />
          <span>Generating Tamil voice</span>
        </div>
      )}

      {showFeedback && (
        <div
          className={`feedback-banner feedback-${feedback.kind}`}
          role={feedback.kind === "error" ? "alert" : "status"}
          aria-live={feedback.kind === "error" ? "assertive" : "polite"}
        >
          <Icon name={feedback.kind === "error" ? "alert" : "check"} />
          <p>{feedback.message}</p>
        </div>
      )}

    </section>
  );
}
