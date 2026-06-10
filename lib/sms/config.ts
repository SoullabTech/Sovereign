// Co-lab SMS — configuration + dormancy gate.
//
// SMS is an ALERT-ONLY notification channel (no conversation content, no inbound
// replies). It is DORMANT by default: nothing sends, no number can be verified,
// and the prefs API rejects 'sms' writes until BOTH the master flag and the
// required Twilio credentials are present.
//
// Twilio is reached via its REST API (lib/sms/twilioClient.ts) using these creds
// — we deliberately avoid the SDK to keep the dependency surface small and the
// egress path auditable.

export interface TwilioCreds {
  accountSid: string;
  authToken: string;
}

// Master flag. Set SMS_NOTIFICATIONS_ENABLED=1 (or 'true') to lift dormancy.
export function isSmsEnabled(): boolean {
  const v = process.env.SMS_NOTIFICATIONS_ENABLED;
  return v === '1' || v === 'true';
}

export function getTwilioCreds(): TwilioCreds | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  return { accountSid, authToken };
}

// Sending notifications needs a Messaging Service SID (it carries the A2P 10DLC
// campaign + sender pool registration).
export function getMessagingServiceSid(): string | null {
  return process.env.TWILIO_MESSAGING_SERVICE_SID || null;
}

// Phone verification (OTP) needs a Verify Service SID.
export function getVerifyServiceSid(): string | null {
  return process.env.TWILIO_VERIFY_SERVICE_SID || null;
}

// Can MAIA SEND an SMS notification right now?
export function isSmsSendConfigured(): boolean {
  return isSmsEnabled() && getTwilioCreds() !== null && getMessagingServiceSid() !== null;
}

// Can MAIA VERIFY a phone number right now?
export function isSmsVerifyConfigured(): boolean {
  return isSmsEnabled() && getTwilioCreds() !== null && getVerifyServiceSid() !== null;
}

// The member-facing "SMS is available" gate: the full flow (verify a number, then
// receive alerts) is operational. Drives the prefs API + settings UI so there are
// never dead toggles.
export function isSmsConfigured(): boolean {
  return isSmsSendConfigured() && isSmsVerifyConfigured();
}
