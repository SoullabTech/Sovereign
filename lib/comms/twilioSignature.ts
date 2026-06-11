/**
 * Twilio webhook signature validation.
 *
 * Twilio signs each webhook request with the `X-Twilio-Signature` header:
 *
 *   base64( HMAC-SHA1( authToken, fullURL + concat(sortedKey + value for each POST param) ) )
 *
 * The params are the application/x-www-form-urlencoded POST body params, sorted
 * alphabetically by key and concatenated as key immediately followed by its
 * (decoded) value, with no separators, appended to the exact callback URL.
 *
 * See: https://www.twilio.com/docs/usage/security#validating-requests
 *
 * NOTE: this is intentionally a standalone helper rather than the shared
 * `CommsProvider.verifyWebhookSignature(payload, signature, secret)` interface
 * method — that interface signature cannot express Twilio's URL + sorted-params
 * scheme, and changing it would touch every provider.
 */
import crypto from 'crypto';

export function computeTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
): string {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  return crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');
}

export function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string | null | undefined,
): boolean {
  if (!authToken || !signature) return false;

  const expected = computeTwilioSignature(authToken, url, params);

  // Constant-time comparison (lengths must match first).
  const a = Buffer.from(expected, 'utf-8');
  const b = Buffer.from(signature, 'utf-8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
