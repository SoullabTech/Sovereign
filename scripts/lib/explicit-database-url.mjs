/** Validate an explicitly supplied PostgreSQL authority without echoing it. */
export function requireDatabaseUrl(raw, variable = 'DATABASE_URL') {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) throw new Error(`${variable}_REQUIRED: explicit PostgreSQL authority is required`);
  let parsed;
  try { parsed = new URL(value); } catch {
    throw new Error(`${variable}_INVALID: expected a PostgreSQL URL`);
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || parsed.pathname.length <= 1) {
    throw new Error(`${variable}_INVALID: expected a named PostgreSQL database`);
  }
  return value;
}
