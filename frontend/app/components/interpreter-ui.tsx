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
      return (
        <svg {...shared}>
          <path d="M4 10v4m4-8v12m4-15v18m4-14v10m4-7v4" />
        </svg>
      );
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
  const renderLanguageCard = (
    language: string,
    side: "source" | "target",
    onChange: (language: string) => void
  ) => {
    const isEnglish = language === "English";
    const id = side === "source" ? "source-language" : "target-language";

    return (
      <article
        className={`language-hero-card ${isEnglish ? "language-hero-english" : "language-hero-tamil"}`}
        aria-label={`${side === "source" ? "Source" : "Target"} language: ${language}`}
      >
        <label className="language-select" htmlFor={id}>
          <span className={`language-select-symbol ${isEnglish ? "symbol-globe" : "symbol-tamil"}`} aria-hidden="true">
            {isEnglish ? (
              <svg viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" />
                <path d="M4.5 16h23M16 4c3.2 3.3 4.8 7.3 4.8 12S19.2 24.7 16 28c-3.2-3.3-4.8-7.3-4.8-12S12.8 7.3 16 4Z" />
                <path d="M7.6 8.2c2.4 1.6 5.2 2.4 8.4 2.4s6-.8 8.4-2.4M7.6 23.8c2.4-1.6 5.2-2.4 8.4-2.4s6 .8 8.4 2.4" />
              </svg>
            ) : (
              <span lang="ta">அ</span>
            )}
          </span>
          <select
            id={id}
            aria-label={`${side === "source" ? "Source" : "Target"} language`}
            aria-describedby={!isSupported ? "direction-note" : undefined}
            value={language}
            disabled={isBusy}
            onChange={(event) => onChange(event.target.value)}
          >
            {side === "source" ? (
              <>
                <option>English</option>
                <option disabled>Tamil</option>
                <option disabled>Hindi</option>
              </>
            ) : (
              <>
                <option>Tamil</option>
                <option disabled>English</option>
                <option disabled>Hindi</option>
              </>
            )}
          </select>
          <span className="language-select-chevron" aria-hidden="true" />
        </label>

        <div className="language-art-wrap" aria-hidden="true">
          {isEnglish ? <GlobalLanguageIllustration /> : <TamilCultureIllustration />}
        </div>

        <div className="language-hero-caption">
          <h2>
            {isEnglish ? (
              "English"
            ) : (
              <>
                <span lang="ta">தமிழ்</span> <span className="roman-language">Tamil</span>
              </>
            )}
          </h2>
          <p>
            {isEnglish ? (
              <>A global language<br />that connects the world</>
            ) : (
              <>The language of a rich<br />heritage and timeless culture</>
            )}
          </p>
        </div>
      </article>
    );
  };

  return (
    <section className="language-stage" aria-label="Choose languages">
      {renderLanguageCard(sourceLanguage, "source", onSourceChange)}
      <div className="swap-column">
        <button
          type="button"
          className="language-swap-button"
          onClick={onSwap}
          disabled={isBusy}
          aria-label="Swap source and target languages"
          title="Only English to Tamil translation is available"
        >
          <Icon name="swap" />
        </button>
      </div>
      {renderLanguageCard(targetLanguage, "target", onTargetChange)}
      {!isSupported && (
        <p className="direction-note direction-note-warning" id="direction-note">
          Reverse translation is not available yet. Switch back to English to Tamil to continue.
        </p>
      )}
    </section>
  );
}

function GlobalLanguageIllustration() {
  return (
    <svg className="language-art global-art" viewBox="0 0 460 270" role="img" aria-label="A globe surrounded by world landmarks and a travel route">
      <defs>
        <radialGradient id="earth-ocean" cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#75c7e6" />
          <stop offset="1" stopColor="#1683bc" />
        </radialGradient>
        <linearGradient id="earth-land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b8da82" />
          <stop offset="1" stopColor="#62b882" />
        </linearGradient>
        <clipPath id="earth-clip">
          <circle cx="230" cy="163" r="79" />
        </clipPath>
        <filter id="earth-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#467c9d" floodOpacity=".2" />
        </filter>
      </defs>
      <path d="M36 190c14-16 39-17 53-2 10-22 45-24 59-3 21-12 45 0 50 17H37Z" fill="#dceef6" opacity=".7" />
      <path d="M268 202c12-17 39-18 52-3 11-20 43-20 55 0 19-13 46-3 51 14H267Z" fill="#e7f1f5" opacity=".86" />
      <g fill="#9dc9df" opacity=".68">
        <path d="m83 205 17-42 7 11 7-14 20 45v8H83Z" />
        <path d="m132 207 13-49 11 16 8-27 18 60v7h-50Z" />
        <path d="m344 206 12-41 8 12 7-28 18 57v7h-45Z" />
      </g>
      <g fill="#86b6d0" stroke="#86b6d0" strokeLinejoin="round">
        <path d="M103 207h27l-4-10-3-28-5-7-1-18 4-6-5-3-5 4 3 8-3 4-2-12-3 1 2 15-5 8-1 23-4 9Z" />
        <path d="m112 135 4-11 4 11m-11 4 10 4 9-4" fill="none" strokeWidth="2" />
      </g>
      <g fill="#b77756">
        <path d="M164 190h30v-43h-5v-27h-4v-13h-4v13h-4v27h-4v-19h-4v19h-5Z" />
        <path d="M165 120h31v5h-31zM169 143h24v4h-24zM168 171h25v4h-25z" fill="#e7ad6c" />
        <path d="M184 107h5v12h-5zm-5 57h5v26h-5zm-8-4h4v30h-4zm17-12h4v12h-4z" fill="#a8664d" />
      </g>
      <g fill="#7784a1">
        <path d="m347 203 21-64 21 64h-8l-13-42-13 42z" />
        <path d="M363 178h10v4h-10m-6 11h23v4h-23m-13 10h47v4h-47" />
        <path d="M368 130h2v-10h-2zM365 120h8v3h-8z" />
      </g>
      <g filter="url(#earth-shadow)">
        <circle cx="230" cy="163" r="79" fill="url(#earth-ocean)" />
        <g clipPath="url(#earth-clip)" fill="url(#earth-land)">
          <path d="M163 111 179 95l20 2 6 12 19 5 1 13-11 7-1 13-14 6-5 20-13-4-8-18-12-8-4-16-11-5Z" />
          <path d="m209 155 13-4 11 8 2 14-8 8-1 15-10 20-9-5-2-19-10-14 3-13Z" />
          <path d="m244 103 16-9 17 4 7 10 16 2 11 16-8 11-17-4-8 10-14-3-10 8-12-9-13 3-11-11 6-16Z" />
          <path d="m290 147 15-5 17 8 4 16-9 18-12 4-7 19-15-6-6-15-12-3 2-18 12-12Z" />
          <path d="m186 91 9-11 21-5 8 8-6 11-19 8Z" />
        </g>
        <path d="M172 129c17-25 44-40 72-42M160 159c24-15 46-22 69-22M178 203c17 12 37 20 57 21" fill="none" stroke="#ffffff" strokeOpacity=".24" strokeWidth="1.5" />
      </g>
      <ellipse cx="230" cy="166" rx="100" ry="29" transform="rotate(-13 230 166)" fill="none" stroke="#edae54" strokeWidth="6" />
      <ellipse cx="230" cy="166" rx="105" ry="33" transform="rotate(-13 230 166)" fill="none" stroke="#fff8e9" strokeOpacity=".78" strokeWidth="1.5" />
      <path d="M278 72c27-20 57-22 80-9" fill="none" stroke="#73bfe0" strokeDasharray="6 7" strokeWidth="2" />
      <path d="m357 56 20 4-15 13-1-8-8-3Z" fill="#4f9fc7" />
      <g fill="#fff" opacity=".85">
        <circle cx="81" cy="181" r="4" /><circle cx="389" cy="124" r="3" /><circle cx="300" cy="69" r="3" />
      </g>
      <path d="M68 219h324" stroke="#c9e0e8" strokeWidth="2" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}

function TamilCultureIllustration() {
  return (
    <svg className="language-art tamil-art" viewBox="0 0 460 270" role="img" aria-label="Tamil Nadu temple, palm trees, and state silhouette">
      <path d="m289 16 21-7 12 10 20-3 8 12 18-3 2 14 17 9-5 15 12 15-12 11 4 17-13 12 4 18-17 8-2 19-19 7-4 16-17 5-6 21-19 9-11 17-12-8-3-17-17-12 6-18-14-13 8-18-6-17 16-15-1-15 18-12-1-16 13-10Z" fill="#f2bb61" opacity=".38" />
      <g fill="#f5cb85" opacity=".72">
        <path d="M35 191c15-18 45-17 57 1 12-20 43-18 54 2 16-12 39-5 46 9H31Z" />
        <path d="M319 202c12-14 37-14 49 1 10-18 38-18 49 1 17-11 39-2 43 13H315Z" />
      </g>
      <g fill="none" stroke="#efc274" strokeWidth="1.4" opacity=".63">
        <path d="M416 72c24 20 24 39 0 59-24-20-24-39 0-59Zm0 0v59m-29-30h58m-50-21 42 42m0-42-42 42" />
        <path d="M414 137c22 17 22 34 0 51-22-17-22-34 0-51Zm0 0v51m-25-25h50m-43-18 36 36m0-36-36 36" />
      </g>
      <g fill="none" stroke="#56845d" strokeWidth="5" strokeLinecap="round">
        <path d="M99 219c3-28 4-50 0-76M365 219c-3-29-4-51 0-77" />
      </g>
      <g fill="#6c9b60">
        <path d="M99 145c-22-27-42-27-54-22 15 0 30 12 48 28-27-13-40-8-49-1 21-5 36 3 52 13-23-3-34 4-39 12 15-8 27-6 42-1-18 6-23 16-24 23 9-12 18-14 28-16-12 12-14 23-12 30 8-14 17-19 24-25-3 18 1 27 5 32 1-21 7-30 16-44 5-11 1-18-10-20-10-2-18-6-27-9Z" />
        <path d="M365 144c22-27 42-27 54-22-15 0-30 12-48 28 27-13 40-8 49-1-21-5-36 3-52 13 23-3 34 4 39 12-15-8-27-6-42-1 18 6 23 16 24 23-9-12-18-14-28-16 12 12 14 23 12 30-8-14-17-19-24-25 3 18-1 27-5 32-1-21-7-30-16-44-5-11-1-18 10-20 10-2 18-6 27-9Z" />
      </g>
      <path d="M119 224c19-11 39-16 60-15m103 0c23-4 48 1 69 14" fill="none" stroke="#b68b42" strokeWidth="2" opacity=".7" />
      <g>
        <path d="M180 207h133l-10-12h-113z" fill="#9d5726" />
        <path d="M191 195h111v-12H191z" fill="#be7134" />
        <path d="m184 184 7-9h111l8 9Z" fill="#8a491f" />
        <path d="M198 174h100v-12H198z" fill="#d1843b" />
        <path d="m193 162 7-9h96l8 9Z" fill="#9f5d29" />
        <path d="M207 153h82v-12h-82z" fill="#d18b42" />
        <path d="m202 141 7-9h78l7 9Z" fill="#a25d29" />
        <path d="M216 132h64v-12h-64z" fill="#d18b42" />
        <path d="m211 120 8-9h55l8 9Z" fill="#a45d29" />
        <path d="M224 111h45V99h-45z" fill="#d18b42" />
        <path d="m219 99 8-9h39l8 9Z" fill="#a45d29" />
        <path d="M232 90h29V78h-29z" fill="#d18b42" />
        <path d="m227 78 9-9h20l9 9Z" fill="#994f24" />
        <path d="m236 69 6-15 6 15Z" fill="#dba14c" />
        <circle cx="242" cy="52" r="3" fill="#9c5627" />
        <path d="M198 207v-26h12v26m71 0v-26h12v26" fill="#f0c47b" />
        <path d="M232 207v-21a12 12 0 0 1 24 0v21Z" fill="#673b25" />
        <path d="M218 207v-13a8 8 0 0 1 16 0v13m25 0v-13a8 8 0 0 1 16 0v13" fill="#754329" />
        <g fill="#f5d28f">
          <circle cx="204" cy="188" r="2"/><circle cx="220" cy="188" r="2"/><circle cx="237" cy="188" r="2"/><circle cx="254" cy="188" r="2"/><circle cx="281" cy="188" r="2"/>
          <circle cx="210" cy="157" r="2"/><circle cx="228" cy="157" r="2"/><circle cx="247" cy="157" r="2"/><circle cx="269" cy="157" r="2"/>
          <circle cx="220" cy="136" r="2"/><circle cx="241" cy="136" r="2"/><circle cx="265" cy="136" r="2"/>
          <circle cx="229" cy="115" r="2"/><circle cx="251" cy="115" r="2"/>
          <circle cx="237" cy="94" r="2"/><circle cx="255" cy="94" r="2"/>
        </g>
      </g>
      <g fill="#9b5b2d" stroke="#72401e" strokeWidth="2">
        <path d="M330 210v-26l10-8 10 8v26z" />
        <path d="m325 184 15-14 15 14Z" />
        <path d="M333 210v-11a7 7 0 0 1 14 0v11Z" fill="#e4b96c" />
      </g>
      <path d="M113 222c37 12 75 18 116 18s79-6 116-18" fill="none" stroke="#77a16a" strokeWidth="5" strokeLinecap="round" opacity=".75" />
      <path d="M76 228h310" stroke="#edc87c" strokeWidth="1.5" opacity=".75" />
    </svg>
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
              : "Tap to speak";
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
              : "Speak in English to hear the Tamil interpretation.";
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
        <span className="mic-wave mic-wave-left" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </span>
        <span className="mic-wave mic-wave-right" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </span>
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
