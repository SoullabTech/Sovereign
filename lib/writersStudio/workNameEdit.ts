/**
 * Renaming a Work in the Work drawer — the keyboard contract.
 *
 * Writer walk, 2026-11-21: a writer renaming her Work typed the new name and
 * got "Alchemists of AtlantisThe Reluctant Alchemist". The box opened with the
 * old name in it and the caret at the end, Enter did nothing, and in the narrow
 * drawer the "keep" button sat out of view to the right. Renaming was possible,
 * but only for someone who already knew how it behaved.
 *
 * The drawer now selects the old name when the box opens (typing replaces it),
 * and the keys below do what a writer expects. Pure, so it can be tested
 * without mounting the drawer.
 *
 * ⛔ An IME composition is never a save: Enter while composing (Japanese,
 * Chinese, Korean input) confirms the character, not the name.
 */
export type NameEditKeyAction = 'save' | 'cancel' | null;

export function nameEditKeyAction(key: string, isComposing: boolean): NameEditKeyAction {
  if (isComposing) return null;
  if (key === 'Enter') return 'save';
  if (key === 'Escape') return 'cancel';
  return null;
}
