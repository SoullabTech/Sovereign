import type { ReactNode } from 'react';

/**
 * THE AIN CANVAS — extension contract.
 *
 * "The AIN Canvas is an identifiable, ceremonial, reliable place where human
 *  work can grow — from a fleeting thought to a lifetime of contribution."
 *
 * Every studio — writing, journal, research, course building, workbook,
 * practice development, book design — plugs into ONE shell instead of
 * inventing a new interface. The Canvas is the constant; deployments supply
 * what surrounds the work.
 *
 * Two design laws are encoded here rather than left to discipline:
 *
 *   1. ABSENCE OVER EMPTINESS. A panel declares `isRelevant`; when it has
 *      nothing true to show it does not render at all — no empty shell, no
 *      placeholder, no "coming soon". The calm of the Canvas is structural.
 *
 *   2. THE WORK IS THE CENTER. The registry can furnish the navigator, the
 *      context column, and the toolbar. It can NEVER furnish the center —
 *      the work at the center belongs to the deployment alone. There is
 *      deliberately no `registerSurface`.
 *
 * Registries are created per deployment and passed explicitly. There is no
 * module-global mutable registry: hidden global state survives hot reloads
 * badly and makes "what is in this room?" unanswerable by reading one file.
 */

/**
 * What the Canvas knows about the work at its center. Deployments name their
 * own modes; the shell never interprets them.
 *
 * Sovereignty rider: everything here is a member-authored fact or a session
 * fact (what they declared, what they opened, the gesture they just made) —
 * never an inference about the person.
 */
export interface CanvasContext {
  /** Which studio is inhabiting the Canvas ('writer', 'book', 'journal'…). */
  deployment: string;
  /** The Work, when the member has declared one. */
  workId: string | null;
  /** The object at the center (a manuscript, a page, an entry). */
  objectId: string | null;
  /** The deployment's own word for what is happening ('writing', 'editing'…). */
  mode: string;
  /** Deployment-specific facts a panel may need. Opaque to the shell. */
  data?: Record<string, unknown>;
}

export type CanvasRegion = 'navigator' | 'context';

export interface CanvasPanel {
  id: string;
  /** Shown as the panel's quiet heading. The member's world, not ours. */
  label: string;
  region: CanvasRegion;
  /** Lower sorts first. Panels without an order follow, in registration order. */
  order?: number;
  /**
   * Absence over emptiness: return false and the panel is not rendered —
   * not greyed, not empty, not present. Default is to always render.
   */
  isRelevant?: (ctx: CanvasContext) => boolean;
  render: (ctx: CanvasContext) => ReactNode;
}

export interface CanvasAction {
  id: string;
  label: string;
  order?: number;
  /** Same law: an action that cannot honestly be taken does not appear. */
  isAvailable?: (ctx: CanvasContext) => boolean;
  run: (ctx: CanvasContext) => void | Promise<void>;
}

export interface CanvasRegistry {
  registerPanel(panel: CanvasPanel): CanvasRegistry;
  registerAction(action: CanvasAction): CanvasRegistry;
  /** Panels for a region that are relevant right now, in order. */
  panelsFor(region: CanvasRegion, ctx: CanvasContext): CanvasPanel[];
  /** Actions available right now, in order. */
  actionsFor(ctx: CanvasContext): CanvasAction[];
}

const byOrder = <T extends { order?: number }>(a: T, b: T) =>
  (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);

export function createCanvasRegistry(): CanvasRegistry {
  const panels: CanvasPanel[] = [];
  const actions: CanvasAction[] = [];

  const registry: CanvasRegistry = {
    registerPanel(panel) {
      /* Re-registration replaces rather than duplicates: a deployment that
         re-renders must not accumulate copies of its own rooms. */
      const at = panels.findIndex((p) => p.id === panel.id);
      if (at >= 0) panels[at] = panel;
      else panels.push(panel);
      return registry;
    },
    registerAction(action) {
      const at = actions.findIndex((a) => a.id === action.id);
      if (at >= 0) actions[at] = action;
      else actions.push(action);
      return registry;
    },
    panelsFor(region, ctx) {
      return panels
        .filter((p) => p.region === region && (p.isRelevant?.(ctx) ?? true))
        .sort(byOrder);
    },
    actionsFor(ctx) {
      return actions.filter((a) => a.isAvailable?.(ctx) ?? true).sort(byOrder);
    },
  };
  return registry;
}
