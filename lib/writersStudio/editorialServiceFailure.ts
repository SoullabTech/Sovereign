/** Fixed writer-facing messages only. Never display a raw provider error body. */
export function editorialServiceFailureMessage(error: unknown, detail?: unknown): string | null {
  if (error !== 'structured_refused') return null;
  if (detail === 'provider_billing_required') {
    return 'MAIA could not respond because the AI service’s API credit balance is too low. '
      + 'Your working copy is unchanged; no edit was generated. The account owner needs to add API credit before retrying.';
  }
  if (detail === 'not_configured' || detail === 'invalid_inference_mode') {
    return 'The writing service is not configured correctly for this session. '
      + 'Your working copy is unchanged; no edit was generated. The account owner needs to check the service configuration.';
  }
  if (detail === 'structured_inference_unavailable') {
    return 'The configured writing service cannot provide this kind of editing response. '
      + 'Your working copy is unchanged. No other provider was used.';
  }
  return 'MAIA could not complete that request. Your working copy is unchanged; no edit was generated. '
    + 'The writing service needs attention before you try again.';
}
