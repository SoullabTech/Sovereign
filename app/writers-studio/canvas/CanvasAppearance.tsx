/**
 * CANVAS APPEARANCE — one control, both writing surfaces.
 *
 * Ruled 2026-09-07 (`WRITERS-STUDIO-CANVAS-PRESENCE-01`, question C):
 *
 *   ⭐ Choose the room. Choose the page.
 *
 * This is the page half. The room half — Studio atmosphere — is NOT built and
 * is held for its own ruling; nothing here reaches the shell, the rails, the
 * outline, the MAIA column or the dock.
 *
 * ── FEW CHOICES, DERIVED BEHAVIOUR ────────────────────────────────────────
 *
 * Founder direction, 2026-09-07: *"there's only a few options to make but it
 * needs to be able to do so intelligently."* Read as a design constraint with
 * two halves, and both halves are obligations:
 *
 *   FEW      the writer is offered four materials and nothing else. Every
 *            further axis of presentation must be DERIVED, not asked. A
 *            preference panel is the failure mode, not the goal.
 *
 *   DERIVED  size, leading and measure answer the viewport by construction
 *            (`CANVAS_TYPE`), so the Canvas is already right on a phone and on
 *            a wide desktop without the writer having been made responsible
 *            for it. A question not asked is the intelligent version of a
 *            question answered well.
 *
 * ── WHY A SHARED COMPONENT AND NOT A SECOND COPY ──────────────────────────
 *
 * C2 is precisely that the control existed in ONE surface. A long book renders
 * as a section-addressable draft, so the writer most likely to sit with a
 * Canvas for hours was the writer who could not reach it. Duplicating the
 * swatches into the second surface would satisfy the symptom and re-create the
 * defect the moment the two copies drift. There is one control, mounted twice.
 *
 * ⛔ Appearance is not part of the Work. It never enters the draft, a save, a
 * kept version, provenance, export, or a collaborator's view. It is browser-
 * local, per writer, and carries no meaning the system may later read back.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CANVAS_MATERIALS,
  DEFAULT_MATERIAL,
  MATERIAL_ORDER,
  loadCanvasMaterial,
  saveCanvasMaterial,
  type CanvasMaterial,
} from '@/lib/writersStudio/canvasMaterial';
import { StudioHint } from '../studio/StudioHint';

/**
 * The writer's material for this browser.
 *
 * ⚠️ Hydration: the first render MUST be the default on both server and
 * client. Reading localStorage during render would make the server's HTML and
 * the client's first pass disagree, and React would discard the tree — under a
 * writer's cursor. So the stored value arrives in an effect, one frame later.
 *
 * `manuscriptId` is here only for the one-time legacy migration (C1): the Work
 * the writer happens to be looking at seeds the Canvas-level preference. After
 * that first read it is never used again, and nothing keyed by manuscript is
 * ever written.
 */
export function useCanvasMaterial(manuscriptId: string | null): {
  material: CanvasMaterial;
  choose: (m: CanvasMaterial) => void;
} {
  const [material, setMaterial] = useState<CanvasMaterial>(DEFAULT_MATERIAL);

  useEffect(() => {
    setMaterial(loadCanvasMaterial(manuscriptId));
  }, [manuscriptId]);

  const choose = useCallback((m: CanvasMaterial) => {
    setMaterial(m);
    saveCanvasMaterial(m);
  }, []);

  return { material, choose };
}

/**
 * The swatches. Four, and no fifth axis.
 *
 * Each is a real button with its material's name — a member who cannot see the
 * colours still knows what they are choosing, and `aria-pressed` says which one
 * they are on. The swatch is drawn in the material it selects, which is the
 * whole of its explanation.
 */
export function CanvasAppearance({
  material,
  onChoose,
}: {
  material: CanvasMaterial;
  onChoose: (m: CanvasMaterial) => void;
}) {
  return (
    <StudioHint
      label="What does the canvas look like?"
      anchor={
        <span
          role="group"
          aria-label="Canvas appearance"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          {MATERIAL_ORDER.map((id) => {
            const m = CANVAS_MATERIALS[id];
            const chosen = material === id;
            return (
              <button
                key={id}
                type="button"
                title={m.label}
                aria-label={m.label}
                aria-pressed={chosen}
                onClick={() => onChoose(id)}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: m.bg,
                  border: `1px solid ${chosen ? m.caret : 'currentColor'}`,
                  opacity: chosen ? 1 : 0.45,
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            );
          })}
        </span>
      }
    >
      Changes how this page looks to you, on this browser. It is not part of the
      work — nothing here reaches your draft, a kept version, or anyone you
      share with. The size of the writing adjusts to your screen on its own.
    </StudioHint>
  );
}
