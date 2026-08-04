/**
 * Defensive JSON parsing for model output — shared by the Portrait (Part I) and
 * Year Ahead (Part II) generators.
 *
 * Both generators previously carried a byte-identical private copy of this
 * function; the second observed use is what justifies extracting it here.
 *
 * Why this is more than JSON.parse: an output contract that DEMONSTRATES its
 * shape in JSON-with-comments invites the model to echo those comments back.
 * A single `// 6-8 key placements` after a property value is enough to fail the
 * whole generation ("Expected ',' or '}' after property value"). The contract no
 * longer contains comments (portraitPrompt.ts), and this parser tolerates them
 * if a model produces them anyway. Trailing commas get the same treatment.
 *
 * Nothing here repairs MEANING — only formatting slips outside string values.
 * Malformed content still throws, and a throw is still a refused draft.
 */

/**
 * Remove `//` and block comments and trailing commas that sit OUTSIDE string
 * literals. String contents (including any `//` inside prose) are untouched.
 */
function stripJsonNoise(s: string): string {
  let out = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (inString) {
      out += c;
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
      continue;
    }

    if (c === '"') {
      inString = true;
      out += c;
      continue;
    }

    // Line comment — drop to end of line, keeping the newline.
    if (c === '/' && s[i + 1] === '/') {
      while (i < s.length && s[i] !== '\n') i++;
      out += '\n';
      continue;
    }

    // Block comment — drop through the terminator.
    if (c === '/' && s[i + 1] === '*') {
      i += 2;
      while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) i++;
      i++; // land on '/', loop increment steps past it
      continue;
    }

    out += c;
  }

  // Trailing commas before a closer, now that comments are gone.
  return out.replace(/,(\s*[}\]])/g, '$1');
}

/** A readable window around a parse failure — so a bad draft is diagnosable. */
function errorWindow(s: string, message: string): string {
  const at = /position (\d+)/.exec(message);
  if (!at) return s.slice(0, 200);
  const pos = Number(at[1]);
  return s.slice(Math.max(0, pos - 120), pos + 120);
}

/**
 * Strip markdown fences and parse the model's JSON defensively.
 * Throws the original SyntaxError, after logging the offending window.
 */
export function parseModelJson(raw: string, label: string): any {
  let s = (raw || '').trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);

  try {
    return JSON.parse(s);
  } catch (err: any) {
    const cleaned = stripJsonNoise(s);
    try {
      const parsed = JSON.parse(cleaned);
      console.warn(`[${label}] model JSON needed noise-stripping (comments/trailing commas) — recovered`);
      return parsed;
    } catch {
      // Log the ORIGINAL failure window — the cleaned one hides what the model did.
      console.error(
        `[${label}] unparseable model JSON (${err?.message}) — near: ${JSON.stringify(errorWindow(s, String(err?.message)))}`,
      );
      throw err;
    }
  }
}
