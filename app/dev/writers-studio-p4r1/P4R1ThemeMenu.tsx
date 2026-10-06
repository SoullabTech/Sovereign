'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ATMOSPHERE_LIST } from '@/app/writers-studio/atmosphere/atmospheres';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { useStudioTopbarAccessoriesHost } from './useStudioTopbarAccessoriesHost';

export default function P4R1ThemeMenu() {
  const { id, choose } = useAtmosphere();
  const [open, setOpen] = useState(false);
  const topbarHost = useStudioTopbarAccessoriesHost();
  const selected = ATMOSPHERE_LIST.find((item) => item.id === id);
  if (!topbarHost) return null;
  return createPortal(
    <div className="p4r1-theme-menu" data-p4r1-theme-menu>
      <button type="button" className="p4r1-theme-trigger" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="p4r1-theme-swatch" style={{ background: selected?.ground.field, borderColor: selected?.gold.base }} />
        Theme · {selected?.name ?? 'Day'}
      </button>
      {open ? (
        <div className="p4r1-theme-popover" role="menu" aria-label="Writer’s Studio theme">
          <div className="p4r1-theme-title">Studio theme</div>
          {ATMOSPHERE_LIST.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitemradio"
              aria-checked={item.id === id}
              className="p4r1-theme-option"
              onClick={() => { choose(item.id); setOpen(false); }}
            >
              <span className="p4r1-theme-swatch" style={{ background: item.ground.field, borderColor: item.gold.base }} />
              <span>{item.name}</span>
              {item.id === id ? <span aria-hidden="true">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    topbarHost,
  );
}
