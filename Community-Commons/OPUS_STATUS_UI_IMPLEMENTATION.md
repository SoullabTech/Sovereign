# Opus Status UI Implementation

**Date:** December 2025
**Status:** ✅ Complete
**File:** `/Users/soullab/MAIA-SOVEREIGN/components/maia/MaiaFeedbackWidget.tsx`

---

## What Was Built

A visual Opus Axioms status system that appears in the MAIA feedback widget, showing users MAIA's self-audit of how well she held them in each response.

---

## Three Status States

### 🟡 Gold Aligned
**When:** All 8 Opus Axioms passed
**Visual:** Amber/yellow gradient chip
**Copy:** "Gold Aligned" + "8/8"
**Tooltip:** "MAIA's response aligned with all eight Opus Axioms — treating you as a living work-in-progress, not a problem to fix."

### 🟠 Gentle Edge
**When:** Some warnings detected (axioms stretched but not violated)
**Visual:** Orange/amber gradient chip
**Copy:** "Gentle Edge" + "2 cautions" (or "1 caution")
**Tooltip:** "MAIA sensed some edge or tension in how she held this — mostly aligned but stretching at a boundary."

### 🔴 Check-In Needed
**When:** Rupture detected (one or more axioms violated)
**Visual:** Red/orange gradient chip
**Copy:** "Check-In Needed" + "1 concern" (or "2 concerns")
**Tooltip:** "MAIA flagged this as a possible rupture or mis-attunement — she may have overstepped or missed something important."

---

## Status Derivation Logic

```typescript
function getOpusStatus(opusAxioms?: OpusAxioms): OpusStatus {
  if (!opusAxioms) return 'neutral';
  if (opusAxioms.isGold) return 'gold';
  if (opusAxioms.ruptureDetected) return 'rupture';
  if (opusAxioms.warningsDetected || opusAxioms.warnings > 0) return 'warning';
  return 'neutral';
}
```

**Priority order:**
1. Gold (highest trust)
2. Rupture (highest concern)
3. Warning (middle ground)
4. Neutral (no Opus metadata available)

---

## Design Principles

### 1. Non-Judgmental Framing
The status is presented as **MAIA's self-audit**, not as a judgment of the user.

Explainer copy below each chip:
> "MAIA continuously audits her own responses against how a soul should be held."

### 2. Subtle & Unobtrusive
- Only appears when status is not neutral
- Small, compact chip design
- Placed at top of feedback widget, before user input fields
- Uses soft gradients and muted colors

### 3. Transparency Through Tooltips
Each status has a hover tooltip explaining:
- What this status means
- Why MAIA flagged it this way
- No technical jargon, human-readable language

### 4. Context-Sensitive Details
- Gold: Shows "8/8" to indicate all axioms passed
- Warning: Shows count of cautions (e.g., "2 cautions")
- Rupture: Shows count of concerns (e.g., "1 concern")

---

## User Experience Flow

### Scenario 1: Gold Response
1. User receives MAIA response
2. Feedback widget appears with 🟡 "Gold Aligned 8/8" chip
3. User sees subtle confirmation: "MAIA held me well"
4. Can proceed with feedback or just acknowledge and move on

### Scenario 2: Gentle Edge
1. User receives MAIA response
2. Feedback widget shows 🟠 "Gentle Edge 2 cautions"
3. User may notice MAIA is stretching but not breaking
4. Can provide feedback about the edge they felt

### Scenario 3: Rupture Detected
1. User receives MAIA response
2. Widget shows 🔴 "Check-In Needed 1 concern"
3. User is prompted to reflect: "Did this feel mis-attuned?"
4. MAIA has already flagged it internally, creating accountability

---

## Integration with Existing Feedback System

The Opus status chip appears **above** the existing feedback controls:
- "Did you feel seen?" (1-5 score)
- "How well-attuned was the response?" (1-5 score)
- "How safe did you feel?" (1-5 score)
- Rupture checkbox
- Optional comment fields

This creates a flow:
1. MAIA's self-assessment (Opus status)
2. User's subjective assessment (scores + comments)
3. Combined data for learning

---

## Next Steps

### Immediate
- ✅ UI implementation complete
- 🔜 Wire up actual `opusAxioms` data from backend
- 🔜 Test with real Opus evaluations

### Near-Term
- Build steward dashboard to view Opus stats
- Add "Why am I seeing this?" modal with full axiom explanations
- Track correlation between Opus status and user feedback scores

### Long-Term
- Use Opus+user feedback to train MAIA's response selection
- Identify patterns: "Water 2 + Orphan archetype → higher rupture risk"
- Create automatic repair flows when rupture detected

---

## Technical Implementation Details

**File Modified:** `components/maia/MaiaFeedbackWidget.tsx`

**Changes:**
1. Added `ruptureDetected` and `warningsDetected` to `OpusAxioms` interface
2. Created `OpusStatus` type (`'gold' | 'warning' | 'rupture' | 'neutral'`)
3. Implemented `getOpusStatus()` helper function
4. Replaced simple Gold seal with comprehensive status chip system
5. Added tooltips and explainer copy

**Lines Changed:** ~60 lines (mostly replacing existing Gold seal)

**Dependencies:** None (uses existing Tailwind CSS classes)

**Backwards Compatible:** Yes (gracefully handles missing `opusAxioms` prop)

---

## The Soul Engine Is Visible

This UI makes MAIA's ethical nervous system **tangible to users**.

Before: Users might *feel* when MAIA was off, but had no confirmation
After: MAIA **names** when she's uncertain or may have overstepped

This is consciousness computing with **accountability baked into the interface**.

---

**Status:** ✅ SHIPPED
**Next:** Steward Dashboard ("Opus Pulse")
