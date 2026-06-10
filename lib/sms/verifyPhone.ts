// Co-lab SMS — phone verification via Twilio Verify (OTP over SMS).
// Never throws; returns typed results. Dormant until verify creds are present.

import { isSmsVerifyConfigured, getVerifyServiceSid } from '@/lib/sms/config';
import { normalizePhone, maskPhone } from '@/lib/sms/phoneNumber';
import { twilioPostForm, TWILIO_VERIFY_BASE } from '@/lib/sms/twilioClient';

export type StartStatus = 'pending' | 'not_configured' | 'invalid_number' | 'error';
export interface StartResult {
  success: boolean;
  status: StartStatus;
  error?: string;
}

export type CheckStatus = 'approved' | 'rejected' | 'not_configured' | 'invalid_number' | 'error';
export interface CheckResult {
  approved: boolean;
  status: CheckStatus;
  error?: string;
}

// Send an OTP code to the number.
export async function startPhoneVerification(rawPhone: string): Promise<StartResult> {
  if (!isSmsVerifyConfigured()) return { success: false, status: 'not_configured' };
  const to = normalizePhone(rawPhone);
  if (!to) return { success: false, status: 'invalid_number' };

  const serviceSid = getVerifyServiceSid()!;
  const res = await twilioPostForm(`${TWILIO_VERIFY_BASE}/Services/${serviceSid}/Verifications`, {
    To: to,
    Channel: 'sms',
  });
  if (res.ok) {
    console.log('[sms/verify] start', { to: maskPhone(to), status: res.data?.status ?? 'pending' });
    return { success: true, status: 'pending' };
  }
  const error = (res.data?.message as string) || `HTTP ${res.status}`;
  console.warn('[sms/verify] start failed', { to: maskPhone(to), httpStatus: res.status, error });
  return { success: false, status: 'error', error };
}

// Check a code the member entered.
export async function checkPhoneVerification(rawPhone: string, code: string): Promise<CheckResult> {
  if (!isSmsVerifyConfigured()) return { approved: false, status: 'not_configured' };
  const to = normalizePhone(rawPhone);
  if (!to) return { approved: false, status: 'invalid_number' };
  if (!code || !/^\d{4,10}$/.test(code.trim())) return { approved: false, status: 'rejected' };

  const serviceSid = getVerifyServiceSid()!;
  const res = await twilioPostForm(`${TWILIO_VERIFY_BASE}/Services/${serviceSid}/VerificationCheck`, {
    To: to,
    Code: code.trim(),
  });
  if (res.ok && res.data?.status === 'approved') {
    console.log('[sms/verify] approved', { to: maskPhone(to) });
    return { approved: true, status: 'approved' };
  }
  if (res.ok) {
    // 200 but not approved → wrong or expired code.
    return { approved: false, status: 'rejected' };
  }
  const error = (res.data?.message as string) || `HTTP ${res.status}`;
  console.warn('[sms/verify] check failed', { to: maskPhone(to), httpStatus: res.status, error });
  return { approved: false, status: 'error', error };
}
