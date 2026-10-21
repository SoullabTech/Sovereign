import { getDoorwayAudience } from '../doorways';

export const EXPERIENCE_POLICY = 'writers-first-experience-v1' as const;
export const EXPERIENCE_RETENTION_DAYS = 30;
export const EXPERIENCE_COLLECTION_OPEN = false; // Requires a separately witnessed rollout act.
export const EXPERIENCE_ACTIVITIES = ['discussed_passage', 'considered_revision'] as const;
export const EXPERIENCE_USEFULNESS = ['helped', 'partly', 'not_sure', 'did_not_help', 'prefer_not_to_answer'] as const;
export type ExperienceActivity = typeof EXPERIENCE_ACTIVITIES[number];
export type ExperienceUsefulness = typeof EXPERIENCE_USEFULNESS[number];
export interface ExperienceSubmission {
  policy: typeof EXPERIENCE_POLICY;
  agreement: 'submit_this_report_once';
  activity: ExperienceActivity;
  usefulness: ExperienceUsefulness;
  invitation?: { id: string; confirmed: true };
}
export type SubmissionParse = { ok: true; value: ExperienceSubmission } | { ok: false; reason: 'invalid_submission' };

/** Closed categorical vocabulary. No authored text or inferred consent enters the store. */
export function parseExperienceSubmission(raw: unknown): SubmissionParse {
  const no: SubmissionParse = { ok: false, reason: 'invalid_submission' };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return no;
  const value = raw as Record<string, unknown>;
  const required = ['policy', 'agreement', 'activity', 'usefulness'];
  if (required.some(key => !Object.prototype.hasOwnProperty.call(value, key)) ||
      Object.keys(value).some(key => ![...required, 'invitation'].includes(key))) return no;
  if (value.policy !== EXPERIENCE_POLICY || value.agreement !== 'submit_this_report_once' ||
      !EXPERIENCE_ACTIVITIES.some(id => id === value.activity) ||
      !EXPERIENCE_USEFULNESS.some(id => id === value.usefulness)) return no;
  let invitation: ExperienceSubmission['invitation'];
  if (Object.prototype.hasOwnProperty.call(value, 'invitation')) {
    const candidate = value.invitation;
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return no;
    const item = candidate as Record<string, unknown>;
    if (Object.keys(item).length !== 2 || item.confirmed !== true ||
        typeof item.id !== 'string' || !getDoorwayAudience('writers-studio', item.id)) return no;
    invitation = { id: item.id, confirmed: true };
  }
  return { ok: true, value: {
    policy: EXPERIENCE_POLICY, agreement: 'submit_this_report_once',
    activity: value.activity as ExperienceActivity, usefulness: value.usefulness as ExperienceUsefulness,
    ...(invitation ? { invitation } : {}),
  } };
}
