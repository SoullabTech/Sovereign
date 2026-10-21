-- Per-recipient reminder consent on practitioner_clients
--
-- Client appointment reminders (SMS/WhatsApp) are sent to practitioner_clients.phone — the
-- client themselves. Consent to contact the client at that number therefore belongs on the
-- client's own record, NOT on client_contacts (which is reserved for third-party contacts:
-- parent / caregiver / teacher, and is never the recipient of a client reminder).
--
-- This supersedes the earlier client_contacts-based gate (branch fix/client-reminder-consent-gate,
-- commit c69e65336): because nothing ever writes client_contacts, that gate's lookup always
-- returned no row and failed closed for EVERY client — reminders would silently never send.
--
-- Channel-agnostic for now. Per-channel granularity (sms_consent / whatsapp_consent) is a
-- deliberate later follow-up, intentionally NOT in this migration.
--
-- Default-deny (Class B covenant — external send): reminder_consent defaults FALSE, so no
-- existing client is assumed to have consented. Reminders stay suppressed for a client until
-- consent is explicitly granted (e.g. via the studio clients API). NOT NULL keeps the gate
-- null-safe — the runtime check treats anything other than TRUE as "not consented".

ALTER TABLE practitioner_clients
  ADD COLUMN IF NOT EXISTS reminder_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reminder_consent_at TIMESTAMPTZ;

COMMENT ON COLUMN practitioner_clients.reminder_consent IS
  'Client has consented to receive appointment reminders (SMS/WhatsApp) at practitioner_clients.phone. Default FALSE = fail-closed; reminders are suppressed until explicitly granted. Consent for third-party contacts lives separately in client_contacts.consent_given.';
COMMENT ON COLUMN practitioner_clients.reminder_consent_at IS
  'Timestamp reminder_consent was last set TRUE (consent provenance / audit trail). NULL when consent has never been granted or has been revoked.';
