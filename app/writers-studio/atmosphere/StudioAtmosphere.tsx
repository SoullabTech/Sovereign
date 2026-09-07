'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  ATMOSPHERES,
  DEFAULT_ATMOSPHERE,
  atmosphereVariables,
  isAtmosphereId,
  type AtmosphereId,
} from './atmospheres';

/**
 * Carries the chosen atmosphere through the whole Studio.
 *
 * ── How it propagates ─────────────────────────────────────────────────────
 * By setting CSS custom properties on the Studio's wrapper. Every surface
 * already passes theme tokens into inline styles, and those tokens are
 * `var(--ws-*, <Atelier value>)` — so one element carries the room, and a
 * component that this provider never wraps still renders correctly. There is
 * no prop to thread and no component to convert.
 *
 * ── Why localStorage AND the server ───────────────────────────────────────
 * The server holds the choice; localStorage holds it too, only so the room is
 * already right on the first paint. Without it a member who chose Midnight
 * gets a flash of Atelier on every load — the Studio contradicting their own
 * decision for 200ms, every time. The server remains the authority: when the
 * fetch lands it wins, including when it says the member never chose anything.
 *
 * ⛔ Nothing here infers. There is no time-of-day default, no system
 * colour-scheme sniffing, no "MAIA noticed". Absence of a choice is Atelier.
 */

const STORAGE_KEY = 'ws_atmosphere';

interface AtmosphereContext {
  id: AtmosphereId;
  /** A member act. Applies immediately; persists in the background. */
  choose: (id: AtmosphereId) => void;
  /** True once the server has answered — never gates rendering. */
  settled: boolean;
}

const Ctx = createContext<AtmosphereContext>({
  id: DEFAULT_ATMOSPHERE,
  choose: () => {},
  settled: false,
});

export function useAtmosphere(): AtmosphereContext {
  return useContext(Ctx);
}

function remembered(): AtmosphereId {
  if (typeof window === 'undefined') return DEFAULT_ATMOSPHERE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isAtmosphereId(raw) ? raw : DEFAULT_ATMOSPHERE;
  } catch {
    /* Private windows and blocked site data throw on access. A member who
       cannot store a preference still gets a working Studio. */
    return DEFAULT_ATMOSPHERE;
  }
}

export function StudioAtmosphere({ children }: { children: React.ReactNode }) {
  /* Starts at the default on both server and first client render so the markup
     matches; the remembered choice is applied in an effect. A hydration
     mismatch here would be a visible flicker, not a warning. */
  const [id, setId] = useState<AtmosphereId>(DEFAULT_ATMOSPHERE);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setId(remembered());
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/sovereign/studio/atmosphere', { method: 'GET' });
        if (!live || !res.ok) return;
        const data = await res.json();
        /* The server is the authority, including when it says "no choice". */
        if (isAtmosphereId(data?.atmosphere)) setId(data.atmosphere);
      } catch {
        /* Offline keeps the remembered room rather than snapping to default. */
      } finally {
        if (live) setSettled(true);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const choose = useCallback((next: AtmosphereId) => {
    setId(next); // the room changes now; the network is not in the way
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Not being able to remember is not a reason to refuse the change. */
    }
    void apiFetch('/api/sovereign/studio/atmosphere', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atmosphere: next }),
    }).catch(() => {
      /* The choice held for this session. Saying "could not save your
         atmosphere" over the writing would cost more than it is worth. */
    });
  }, []);

  const vars = atmosphereVariables(ATMOSPHERES[id]);

  return (
    <Ctx.Provider value={{ id, choose, settled }}>
      <div style={vars as React.CSSProperties} data-ws-atmosphere={id}>
        {children}
      </div>
    </Ctx.Provider>
  );
}
