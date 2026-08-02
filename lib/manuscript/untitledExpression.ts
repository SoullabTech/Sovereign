/**
 * What an expression the member has not named is called, when something must
 * name it out loud.
 *
 * ── Why this constant has its own module (2026-08-02) ──────────────────────
 *
 * The string was born in `app/press/studio/shellIdentity.ts`, which is client
 * code. Once `member_manuscripts.title` became nullable, a SERVER boundary —
 * the render/export route — also had to say something for an unnamed
 * expression. Importing the studio module there would have dragged a client
 * hook graph into an API route; copying the literal would have created two
 * homes for one word, free to drift apart.
 *
 * So the word lives here, and both sides import it. `shellIdentity` re-exports
 * it so its own consumers are unchanged.
 *
 * ── The rule that governs it ───────────────────────────────────────────────
 *
 * This is a **display and export fallback. It is never persisted.** Nothing
 * writes it to `title`; the column stays NULL. The absence of a name is a
 * legitimate state — the member has not performed that declaration yet — and
 * this constant exists so that absence can be *rendered* without being
 * *resolved*.
 *
 * Sibling of "Your work" for an unnamed Living Work, and deliberately a
 * DIFFERENT word for a DIFFERENT absence: the work's name answers "what am I
 * in relationship with?", the expression's title answers "what is this
 * called?". Two declarations, two absences, two words. They must never
 * substitute for each other — `shellIdentity`'s test suite pins that.
 *
 * Explicitly NOT: "Untitled", "New manuscript", "Draft 1", a generated
 * filename, the Living Work's name, or the literal string "null".
 */
export const UNTITLED_EXPRESSION = 'Your writing';
