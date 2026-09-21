/** Explicit permission for this request only; never inferred from editing latitude. */
export function authorizeEditorialProcessing(): 'anthropic' | undefined {
  return window.confirm(
    'Send this passage, nearby manuscript text, and this editorial conversation with its saved directions and revisions to Anthropic so MAIA can respond? Your manuscript changes only when you apply a revision.',
  ) ? 'anthropic' : undefined;
}
