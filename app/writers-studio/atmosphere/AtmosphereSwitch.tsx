'use client';

import { useState } from 'react';
import { ATMOSPHERE_LIST } from './atmospheres';
import { useAtmosphere } from './StudioAtmosphere';

/**
 * The writer chooses the light. Quiet by default, never a settings carnival.
 *
 * A row of named rooms, each shown as its own ground with its own accent — so
 * the choice is made by looking, not by reading. No colour picker, no sliders,
 * no preview modal, and no "recommended" room.
 */
export function AtmosphereSwitch() {
  const { id, choose } = useAtmosphere();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-2 min-h-[44px] px-3 text-[12px] tracking-[0.18em] uppercase opacity-45 hover:opacity-90 transition-opacity"
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
        Atmosphere
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-2 z-20 p-2 rounded-[3px] border"
          style={{
            background: 'var(--ws-ground-deepest, #15120D)',
            borderColor: 'var(--ws-rule, #4A4238)',
          }}
        >
          <ul className="flex flex-col">
            {ATMOSPHERE_LIST.map((atm) => (
              <li key={atm.id}>
                <button
                  type="button"
                  onClick={() => {
                    choose(atm.id);
                    setOpen(false);
                  }}
                  aria-current={atm.id === id ? 'true' : undefined}
                  className="w-full flex items-center gap-3 min-h-[44px] px-3 pr-8 text-[14px] whitespace-nowrap rounded-[2px] transition-opacity"
                  style={{
                    color: 'var(--ws-ink-primary, #F3EDE4)',
                    opacity: atm.id === id ? 1 : 0.6,
                  }}
                >
                  {/* The room, shown as itself: its ground, its accent. */}
                  <span
                    aria-hidden="true"
                    className="inline-block w-5 h-5 rounded-full border shrink-0"
                    style={{ background: atm.ground.field, borderColor: atm.gold.base }}
                  />
                  {atm.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
