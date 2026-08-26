/**
 * GATHER-02A — how an original may be served back.
 *
 * The room stores whatever the writer brought in, faithfully. Serving it back
 * is a different question: a file served with its own MIME type and
 * `Content-Disposition: inline` is rendered by the browser AS A FIRST-PARTY
 * SOULLAB PAGE. An uploaded `.html` or `.svg` would then execute same-origin
 * script — reading cookies, calling authenticated routes, acting as the member.
 *
 * So inline rendering is an ALLOWLIST, not a denylist. Only formats that are
 * inert when rendered are served inline; everything else is preserved exactly
 * and handed over as a download instead. Nothing is refused, altered, or
 * stripped — a writer's SVG is still their SVG, byte for byte. It simply is
 * not executed inside their own session.
 *
 * A denylist was the tempting shape and is the wrong one: the next dangerous
 * type is always the one nobody listed. `image/svg+xml` looks like an image
 * and is a script host; `text/html` is obvious; `application/xhtml+xml`,
 * `text/xml` and MathML are the ones people forget.
 *
 * Later, PDFs and documents can get a sandboxed previewer of their own. That
 * is a real feature, not a MIME header.
 */

/** Rendered inline only if the format cannot carry script. */
const INLINE_SAFE = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
  'audio/mpeg',
  'audio/mp4',
  'audio/aac',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
]);

/**
 * Types that must never be echoed back as themselves, even as a download.
 *
 * A downloaded file is usually harmless, but a browser that sniffs, or a user
 * who opens it from disk, can still land on same-origin-ish execution — and an
 * `X-Content-Type-Options` header only binds the declared type, not the file's
 * own contents. Neutralising the declared type costs nothing: the bytes are
 * unchanged and the filename still says what it is.
 */
const NEVER_ECHO = /^(text\/html|application\/xhtml\+xml|image\/svg\+xml|text\/xml|application\/xml|application\/xhtml|text\/mathml)$/i;

export interface ServingDecision {
  /** The Content-Type header to send. May be neutralised. */
  contentType: string;
  /** 'inline' or 'attachment'. */
  disposition: 'inline' | 'attachment';
  /** Why, for the log and for anyone reading this later. */
  reason: 'inline_safe' | 'not_inline_safe' | 'never_echoed';
}

export function decideServing(
  mimeType: string | null,
  filename: string | null,
): ServingDecision {
  const declared = (mimeType ?? '').trim().toLowerCase().split(';')[0];

  // Extension has the final say for the never-echo set: a browser upload can
  // declare image/png for a file called payload.svg, and the name is what the
  // operating system will act on once it is saved.
  const looksNeverEcho =
    NEVER_ECHO.test(declared) || /\.(svg|html?|xhtml|xml|mhtml|shtml)$/i.test(filename ?? '');

  if (looksNeverEcho) {
    return {
      contentType: 'application/octet-stream',
      disposition: 'attachment',
      reason: 'never_echoed',
    };
  }

  if (declared && INLINE_SAFE.has(declared)) {
    return { contentType: declared, disposition: 'inline', reason: 'inline_safe' };
  }

  // Preserved faithfully, handed over rather than rendered. PDFs, DOCX,
  // Markdown and everything else live here until they have a real previewer.
  return {
    contentType: declared || 'application/octet-stream',
    disposition: 'attachment',
    reason: 'not_inline_safe',
  };
}

/** A filename safe to put inside a quoted Content-Disposition header. */
export function headerFilename(filename: string | null): string {
  const base = (filename ?? 'material').split(/[\\/]/).pop() ?? 'material';
  // Quotes, backslashes and control characters would break out of the quoted
  // string or inject a header; a newline is the one that actually matters.
  const cleaned = base.replace(/["\\]/g, '').replace(/[\r\n\t\x00-\x1f\x7f]/g, '');
  return cleaned.trim() || 'material';
}
