// Co-lab SMS — phone number normalization + masking (pure, no deps).
//
// Pragmatic E.164 normalizer. Bare 10-digit input defaults to US (+1) since the
// current cohort is US-based; an explicit + prefix is honoured for any country.
// Twilio is the authoritative validator at send/verify time — this is a cheap
// guard for both client and server, not a full libphonenumber parse.

const E164 = /^\+[1-9]\d{7,14}$/;

export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d]/g, '');
  if (!digits) return null;

  let candidate: string;
  if (hasPlus) {
    candidate = `+${digits}`;
  } else if (digits.length === 10) {
    candidate = `+1${digits}`; // bare US 10-digit
  } else if (digits.length === 11 && digits.startsWith('1')) {
    candidate = `+${digits}`; // US with country code, no +
  } else {
    candidate = `+${digits}`; // assume already includes a country code
  }
  return E164.test(candidate) ? candidate : null;
}

export function isValidPhone(input: string | null | undefined): boolean {
  return normalizePhone(input) !== null;
}

// "+16172165533" → "•••• 5533". Use everywhere a number would otherwise be
// logged or shown — never surface a full number.
export function maskPhone(e164: string | null | undefined): string | null {
  if (!e164) return null;
  const digits = e164.replace(/[^\d]/g, '');
  if (digits.length < 4) return '••••';
  return `•••• ${digits.slice(-4)}`;
}
