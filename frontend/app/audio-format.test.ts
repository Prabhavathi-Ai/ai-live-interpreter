import { describe, expect, it } from "vitest";
import { recordingFileName } from "./audio-format";

describe("recordingFileName", () => {
  it.each([
    ["audio/webm;codecs=opus", "recording.webm"],
    ["audio/mp4", "recording.mp4"],
    ["audio/ogg", "recording.ogg"],
  ])("uses the matching extension for %s", (mimeType, expected) => {
    expect(recordingFileName(mimeType)).toBe(expected);
  });

  it("does not label an unknown container as WebM", () => {
    expect(recordingFileName("audio/custom")).toBe("recording.audio");
  });
});
