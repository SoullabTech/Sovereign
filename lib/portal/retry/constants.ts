/**
 * Retry dispatch version constants.
 *
 * Bump these when the dispatch payload shape or email templates change materially.
 * The version is part of the canonical hash, so bumping forces re-dispatch
 * even if the booking state hasn't changed.
 */

/** Notification template version — bump when email templates change */
export const NOTIFICATION_TEMPLATE_VERSION = '1';

/** Calendar dispatch version — bump when calendar event shape changes */
export const CALENDAR_DISPATCH_VERSION = '1';
