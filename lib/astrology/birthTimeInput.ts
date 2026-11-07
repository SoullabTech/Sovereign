/**
 * Reads a typed birth time (founder walk 2026-11-07: Safari's time picker
 * refused "02:43 PM" until its AM/PM segment was set separately).
 *
 * Accepts 24-hour "14:43" and 12-hour "2:43 pm", "2:43PM", "02:43 p.m.",
 * with ":" or "." between hours and minutes. Returns "HH:MM" (24-hour), or
 * null when the text is not a time. Never guesses: "2:43" with no am/pm is
 * read as 02:43.
 */
export function parseBirthTime(raw: string): string | null {
  const m = /^\s*(\d{1,2})\s*[:.]\s*(\d{2})\s*(?:([ap])\.?\s*m\.?)?\s*$/i.exec(raw);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const half = m[3]?.toLowerCase();
  if (minutes > 59) return null;
  if (half) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (half === 'p' ? 12 : 0);
  } else if (hours > 23) {
    return null;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** "14:43" → "2:43 pm", for confirming how a typed time was read. */
export function twelveHour(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}
