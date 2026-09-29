export type OnboardingEvent =
  | 'begin_opened' | 'email_submitted' | 'magic_link_sent'
  | 'magic_link_opened' | 'token_redeemed' | 'session_created'
  | 'profile_saved' | 'faq_started' | 'faq_completed'
  | 'prefs_started' | 'prefs_completed' | 'onboarding_completed'
  | 'first_maia_entry' | 'onboarding_resumed' | 'cross_device_recovery'
  | 'magic_link_resent' | 'token_invalid' | 'token_expired'
  | 'token_already_used' | 'session_missing_after_verify'
  | 'redirect_loop_detected' | 'registration_failed' | 'email_already_exists';

export interface TelemetryPayload {
  event: OnboardingEvent;
  memberId?: string | null;
  email?: string | null;
  path?: string;
  metadata?: Record<string, string | number | boolean | null>;
}
