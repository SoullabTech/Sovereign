/**
 * WS-BETA-R3 — an editable manuscript section must expose its entire value.
 * Counting characters or explicit newline rows cannot predict soft wraps.
 * Resize the text control to its DOM-measured content height rather than
 * concealing the end of an author-owned draft with overflow:hidden.
 */
export function sizeTextareaToContent(field: HTMLTextAreaElement): void {
  field.style.height = 'auto';
  const full = field.scrollHeight;
  if (Number.isFinite(full) && full > 0) {
    field.style.height = String(full) + 'px';
  }
}
