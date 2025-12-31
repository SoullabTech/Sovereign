/**
 * Memory Components
 *
 * UI components for MAIA's memory system:
 * - Preference confirmation (drift handling)
 * - Memory transparency (what MAIA remembered)
 * - Pattern drawer (show why MAIA detected patterns)
 * - Pattern chips (clickable pattern indicators)
 */

export {
  PreferenceConfirmation,
  PreferenceConfirmationInline,
  type StalePreference,
} from "./PreferenceConfirmation";

export { PatternDrawer, type PatternMeta } from "./PatternDrawer";
export { PatternChips } from "./PatternChips";
