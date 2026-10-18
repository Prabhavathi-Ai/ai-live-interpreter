import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyTextButton } from "./interpreter-ui";

const clipboardWriteText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  clipboardWriteText.mockReset();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: clipboardWriteText },
  });
});

afterEach(() => {
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("CopyTextButton", () => {
  it("copies the exact English transcript", () => {
    const transcript = "Good morning! How are you today?";
    render(
      <CopyTextButton
        text={transcript}
        label="Copy recognized English transcript"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy recognized English transcript" }));

    expect(clipboardWriteText).toHaveBeenCalledOnce();
    expect(clipboardWriteText).toHaveBeenCalledWith(transcript);
  });

  it("copies the exact Tamil translation with Unicode punctuation", () => {
    const translation = "வணக்கம்! இன்று நீங்கள் எப்படி இருக்கிறீர்கள்?";
    render(
      <CopyTextButton
        text={translation}
        label="Copy Tamil translation"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy Tamil translation" }));

    expect(clipboardWriteText).toHaveBeenCalledOnce();
    expect(clipboardWriteText).toHaveBeenCalledWith(translation);
  });

  it.each([
    ["English transcript", "Copy recognized English transcript"],
    ["Tamil translation", "Copy Tamil translation"],
  ])("disables the %s copy button when its text is empty", (_name, label) => {
    render(<CopyTextButton text="" label={label} />);

    expect(screen.getByRole("button", { name: label })).toBeDisabled();
  });

  it("shows the existing error feedback when clipboard permission is denied", async () => {
    clipboardWriteText.mockRejectedValueOnce(
      new DOMException("Permission denied", "NotAllowedError"),
    );
    render(
      <CopyTextButton
        text="A transcript"
        label="Copy recognized English transcript"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy recognized English transcript" }));

    expect(
      await screen.findByText(
        "Clipboard access was blocked. Please allow access and try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy recognized English transcript" })).toHaveTextContent(
      "Try again",
    );
  });
});
