import { describe, it, expect } from "vitest";
import { formatMessageText } from "../formatMessageText";

describe("formatMessageText", () => {
  it("preserves emphasized words (single asterisk) by removing markers only", () => {
    const input = "The part that still *wants* her to see it.";
    const out = formatMessageText(input);
    expect(out).toContain("wants");
    expect(out).not.toContain("*");
  });

  it("preserves emphasized words (double asterisk) by removing markers only", () => {
    const input = "This is **important** right now.";
    const out = formatMessageText(input);
    expect(out).toContain("important");
    expect(out).not.toContain("**");
  });

  it("preserves meaningful parentheticals", () => {
    const input = "The part that still wants her to see it (and I mean that).";
    const out = formatMessageText(input);
    expect(out).toContain("(and I mean that)");
  });

  it("strips stage directions in asterisks", () => {
    const input = "*smiles gently* The part that still wants her to see it.";
    const out = formatMessageText(input);
    expect(out).toBe("The part that still wants her to see it.");
  });

  it("strips stage directions in parentheses", () => {
    const input = "(softly) The part that still wants her to see it.";
    const out = formatMessageText(input);
    expect(out).toBe("The part that still wants her to see it.");
  });

  it("does NOT strip JSON objects (protects braces from nuking code/data)", () => {
    const input = 'Return this JSON: {"facet_code":"W1","confidence":0.95}';
    const out = formatMessageText(input);
    expect(out).toContain('{"facet_code":"W1","confidence":0.95}');
  });

  it("still strips short meta braces like {thinking} / [pause]", () => {
    const input = "Hello {thinking} world [pause] now.";
    const out = formatMessageText(input);
    expect(out).toBe("Hello world now.");
  });

  it("handles empty input", () => {
    expect(formatMessageText("")).toBe("");
    expect(formatMessageText(null as unknown as string)).toBe("");
  });

  it("handles multiple stage directions", () => {
    const input = "*sighs* I hear you. *pauses* That's real.";
    const out = formatMessageText(input);
    expect(out).toBe("I hear you. That's real.");
  });

  it("preserves multi-line JSON (longer than 80 chars)", () => {
    const input = `Here's the data:
{
  "patterns": ["growth", "shadow"],
  "confidence": 0.92,
  "facet_code": "FIRE-2"
}`;
    const out = formatMessageText(input);
    expect(out).toContain('"patterns"');
    expect(out).toContain('"confidence"');
  });
});
