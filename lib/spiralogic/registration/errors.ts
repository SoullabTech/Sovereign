/**
 * SH-11 — out-of-vocabulary input: THROW.
 *
 * The grammar refuses rather than repairs. The Q4 Moon split (explicit,
 * flagged) is the sole sanctioned degradation; everything else invalid is
 * a typed RegistrationInputError, never a silent drop (Finding 9 fix-shape).
 */

export type RegistrationInputErrorCode =
  | 'missing_body'
  | 'unknown_body'
  | 'non_finite_longitude'
  | 'longitude_out_of_range'
  | 'invalid_moon_branches';

export class RegistrationInputError extends Error {
  readonly code: RegistrationInputErrorCode;
  /** The offending body, when the error is body-scoped. */
  readonly body?: string;

  constructor(code: RegistrationInputErrorCode, message: string, body?: string) {
    super(message);
    this.name = 'RegistrationInputError';
    this.code = code;
    this.body = body;
  }
}
