/**
 * Writer's Studio draft sections carry the structural heading at the start of
 * their editable text. Production renders the stored heading separately.
 *
 * Remove only one exact leading structural heading followed by line breaks.
 * Similar prose, later occurrences, and heading-less sections remain untouched.
 */
export function workingDraftBody(text: string, heading: string | null): string {
  const structuralHeading = heading?.trim();
  if (!structuralHeading || !text.startsWith(structuralHeading)) return text;
  const remainder = text.slice(structuralHeading.length);
  if (!/^\r?\n/.test(remainder)) return text;
  return remainder.replace(/^(?:\r?\n)+/, '');
}
