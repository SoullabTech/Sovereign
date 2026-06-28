// Pure, dependency-free parsing of chat message bodies into text + link segments.
// Used by the team Co-lab chat to render clickable, optionally-named hyperlinks
// without pulling in a full markdown renderer (which would reinterpret other
// syntax like #, *, _ and silently change how existing messages look).

export interface MessageSegment {
  type: 'text' | 'link';
  /** Display text: plain text, a link label, or the raw URL for bare links. */
  value: string;
  /** Resolved, scheme-checked href — present only when type === 'link'. */
  href?: string;
}

// Scanned left-to-right with the global flag:
//   [label](url)         → group 1 (label) + group 2 (url)
//   bare http(s)/www URL → group 3
// Bare URLs stop before trailing sentence punctuation so "see https://x.com."
// doesn't swallow the period. The markdown alternative only accepts an http(s)
// target, so `[x](javascript:…)` never matches here in the first place.
const LINK_RE =
  /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)\]'"»])/g;

/**
 * Normalize a candidate href, returning null if it isn't a safe web URL.
 * Only http(s) passes — this is the guard against `javascript:`/`data:`
 * injection via a crafted `[click me](…)` link.
 */
export function safeHref(raw: string): string | null {
  let href = raw.trim();
  if (/^www\./i.test(href)) href = 'https://' + href;
  if (!/^https?:\/\//i.test(href)) return null;
  return href;
}

/** Split a message body into ordered text/link segments. */
export function parseMessageSegments(body: string): MessageSegment[] {
  if (!body) return [];
  const segments: MessageSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;

  while ((match = LINK_RE.exec(body)) !== null) {
    const [full, mdLabel, mdUrl, bareUrl] = match;
    const href = safeHref(mdUrl ?? bareUrl ?? '');
    // Rejected scheme → leave the raw text in place rather than linkifying it.
    if (!href) continue;

    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: body.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'link', value: mdLabel ?? bareUrl, href });
    lastIndex = match.index + full.length;
  }

  if (lastIndex < body.length) {
    segments.push({ type: 'text', value: body.slice(lastIndex) });
  }
  return segments;
}
