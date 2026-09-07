'use client';

import { useState } from 'react';
import { CANVAS_SURFACE_LIST } from './canvasSurfaces';
import { useAtmosphere } from './StudioAtmosphere';

/**
 * The writer chooses the page — reachable from inside the editor.
 *
 * ⛔ ONE AXIS, and the narrowing is a founder ruling (2026-09-07), not a
 * simplification. An earlier build offered a second list here for the Studio
 * itself. That axis was withdrawn from this deploy: the Studio's ground is a
 * sampled, frozen design contract and making it selectable is a separate act
 * that has not been ruled. A Canvas feature must not carry it in.
 *
 *   The Studio is the room. The Canvas is the surface you choose to write upon.
 *
 * The room is not currently a choice. The page is.
 *
 * ⛔ A writer must never have to leave their manuscript to change either. This
 * is the editor's door onto the SAME preference the Home control writes; it is
 * not a second setting that can disagree with it.
 *
 * ⛔ Not bound to any Home arrival branch. Wherever the Canvas renders, this
 * renders — the reachability failure that made the cover chooser invisible in
 * the ORIENT state was the same shape, and cost a founder witness to find.
 */
export function AppearanceMenu() {
  const { canvasSurface, chooseCanvas } = useAtmosphere();
  const [open, setOpen] = useState(false);

  const Row = ({
    label,
    swatch,
    note,
    selected,
    onClick,
  }: {
    label: string;
    swatch: React.CSSProperties;
    note?: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={selected ? 'true' : undefined}
        className="w-full flex items-center gap-3 min-h-[40px] px-3 pr-8 text-[13.5px] whitespace-nowrap rounded-[2px] text-left transition-opacity"
        style={{ color: 'var(--ws-ink-primary, #F3EDE4)', opacity: selected ? 1 : 0.6 }}
      >
        {/* The choice shown as itself — its own ground, its own accent. */}
        <span
          aria-hidden="true"
          className="inline-block w-4 h-4 rounded-full border shrink-0"
          style={swatch}
        />
        <span className="min-w-0">
          <span className="block">{label}</span>
          {note ? <span className="block text-[11.5px] opacity-45">{note}</span> : null}
        </span>
      </button>
    </li>
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-2 min-h-[40px] px-3 text-[11.5px] tracking-[0.18em] uppercase opacity-45 hover:opacity-90 transition-opacity"
        style={{ color: 'var(--ws-ink-primary, #F3EDE4)' }}
      >
        <span
          aria-hidden="true"
          className="inline-block w-3 h-3 rounded-full border"
          style={{
            background: 'var(--ws-ground-raised, #221B12)',
            borderColor: 'var(--ws-gold, #C9A227)',
          }}
        />
        Appearance
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-2 z-30 p-3 rounded-[3px] border"
          style={{
            background: 'var(--ws-ground-deepest, #15120D)',
            borderColor: 'var(--ws-rule, #4A4238)',
            /* The menu belongs to the ROOM even when it is opened from a
               paper Canvas — otherwise the control for choosing the page would
               itself be wearing the page. */
            color: 'var(--ws-ink-primary, #F3EDE4)',
          }}
        >
          {/* ⛔ NO STUDIO AXIS HERE. Founder ruling 2026-09-07: a selectable
              Studio atmosphere touches the frozen, sampled ground contract and
              is a separate design act. It may not ride into this deploy on the
              back of a Canvas feature. The Studio stays the dark room it is;
              only the page is the writer's to choose. */}
          <h3 className="text-[10px] tracking-[0.28em] uppercase opacity-35 px-3 mb-1.5">
            Canvas
          </h3>
          <ul className="flex flex-col">
            {CANVAS_SURFACE_LIST.map((surface) => (
              <Row
                key={surface.id}
                label={surface.name}
                note={surface.character}
                selected={surface.id === canvasSurface}
                onClick={() => chooseCanvas(surface.id)}
                swatch={
                  surface.room
                    ? { background: surface.room.ground.field, borderColor: surface.room.gold.base }
                    : {
                        /* Dark is the absence of an override, so its swatch is
                           the Studio's own field — whatever room is chosen. */
                        background: 'var(--ws-ground-field, #1D1812)',
                        borderColor: 'var(--ws-gold, #C9A227)',
                      }
                }
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
