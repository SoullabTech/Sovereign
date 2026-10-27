export type DatabaseConfigurationErrorCode =
  | 'DATABASE_URL_REQUIRED'
  | 'DATABASE_URL_INVALID';

export class DatabaseConfigurationError extends Error {
  readonly code: DatabaseConfigurationErrorCode;

  constructor(code: DatabaseConfigurationErrorCode, message: string) {
    super(message);
    this.name = 'DatabaseConfigurationError';
    this.code = code;
  }
}

/**
 * Validate explicit PostgreSQL authority without disclosing credential-bearing
 * input in errors. No caller may substitute an implicit host or database.
 */
export function requireDatabaseUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) {
    throw new DatabaseConfigurationError(
      'DATABASE_URL_REQUIRED',
      '[POSTGRES] DATABASE_URL is required; implicit local database fallback is disabled',
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new DatabaseConfigurationError(
      'DATABASE_URL_INVALID',
      '[POSTGRES] DATABASE_URL must be a valid PostgreSQL URL',
    );
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || parsed.pathname.length <= 1) {
    throw new DatabaseConfigurationError(
      'DATABASE_URL_INVALID',
      '[POSTGRES] DATABASE_URL must name a PostgreSQL database',
    );
  }

  return value;
}
