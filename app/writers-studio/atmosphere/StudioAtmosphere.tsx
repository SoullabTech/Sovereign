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
import {
  CANVAS_SURFACES,
  DEFAULT_CANVAS_SURFACE,
  canvasSurfaceVariables,
  isCanvasSurfaceId,
  type CanvasSurfaceId,
} from './canvasSurfaces';
import { legacySeed } from './legacyCanvasSurface';
import { CANVAS_MANUSCRIPT_PARAM } from '../canvasIdentity';

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
const CANVAS_STORAGE_KEY = 'ws_canvas_surface';

/**
 * TWO INDEPENDENT AXES:
 *
 *   id             the ROOM — header, rails, panels, dock, shell
 *   canvasSurface  the PAGE — the manuscript plane, and nothing else
 *
 * Composable, not alternatives. Carried, stored and written separately so one
 * can never silently reset the other.
 *
 * The room axis was withdrawn on 2026-09-07 as unratified and restored the
 * same day by founder act on their own witness of the rendered rooms. The
 * machinery never left, because a Canvas material IS a room scoped to the
 * writing plane — restoring the axis was adding back a control and a writer.
 */
interface AtmosphereContext {
  /** The room. */
  id: AtmosphereId;
  choose: (id: AtmosphereId) => void;
  /** The page. The one appearance choice a writer makes. */
  canvasSurface: CanvasSurfaceId;
  chooseCanvas: (id: CanvasSurfaceId) => void;
  /** True once the server has answered — never gates rendering. */
  settled: boolean;
}

const Ctx = createContext<AtmosphereContext>({
  id: DEFAULT_ATMOSPHERE,
  canvasSurface: DEFAULT_CANVAS_SURFACE,
  choose: () => {},
  chooseCanvas: () => {},
  settled: false,
});

/**
 * The variables for the writing plane, to be set ON THE WRITING-FIELD ELEMENT.
 *
 * Exported so the Canvas can apply them exactly where they belong. Returns {}
 * for Dark, which is not a fourth colour scheme but the absence of an override
 * — the field then inherits whatever room the writer chose.
 */
export function useCanvasSurfaceVariables(): Record<string, string> {
  const { canvasSurface } = useAtmosphere();
  return canvasSurfaceVariables(CANVAS_SURFACES[canvasSurface]);
}

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

function rememberedCanvas(): CanvasSurfaceId {
  if (typeof window === 'undefined') return DEFAULT_CANVAS_SURFACE;
  try {
    const raw = window.localStorage.getItem(CANVAS_STORAGE_KEY);
    return isCanvasSurfaceId(raw) ? raw : DEFAULT_CANVAS_SURFACE;
  } catch {
    return DEFAULT_CANVAS_SURFACE;
  }
}

/** One writer, one preference row, two fields. Written independently. */
function persist(patch: { atmosphere?: AtmosphereId; canvasSurface?: CanvasSurfaceId }) {
  void apiFetch('/api/sovereign/studio/atmosphere', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  }).catch(() => {
    /* The choice held for this session. Saying "could not save your
       atmosphere" over the writing would cost more than it is worth. */
  });
}

/**
 * The manuscript the writer is looking at, read from the URL.
 *
 * The legacy key was written PER MANUSCRIPT, and this provider mounts in a
 * layout that knows nothing about one. Taking it from the address — where the
 * Canvas already pins it so a reload resolves the same work — is what keeps the
 * seed from being half-built: a migration that can only ever read the
 * browser-wide fallback would silently miss every per-manuscript choice, which
 * is most of them.
 */
function manuscriptFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return new URLSearchParams(window.location.search).get(CANVAS_MANUSCRIPT_PARAM);
  } catch {
    return null;
  }
}

export function StudioAtmosphere({ children }: { children: React.ReactNode }) {
  /* Starts at the default on both server and first client render so the markup
     matches; the remembered choice is applied in an effect. A hydration
     mismatch here would be a visible flicker, not a warning. */
  const [id, setId] = useState<AtmosphereId>(DEFAULT_ATMOSPHERE);
  const [canvasSurface, setCanvasSurface] = useState<CanvasSurfaceId>(DEFAULT_CANVAS_SURFACE);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setId(remembered());
    setCanvasSurface(rememberedCanvas());
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/sovereign/studio/atmosphere', { method: 'GET' });
        if (!live || !res.ok) return;
        const data = await res.json();
        /* The server is the authority, including when it says "no choice".
           Read separately: a writer may have chosen a room and never a page. */
        if (isAtmosphereId(data?.atmosphere)) setId(data.atmosphere);
        if (isCanvasSurfaceId(data?.canvasSurface) && data.canvasSurface !== DEFAULT_CANVAS_SURFACE) {
          setCanvasSurface(data.canvasSurface);
          return;
        }

        /* ── ONE-TIME LEGACY SEED ────────────────────────────────────────
           No stored preference. An older room wrote a per-manuscript
           `writing_surface:<id>` choice that no live path could reach; where
           one exists it seeds this preference ONCE, mapped onto a ruled
           material, and the DB is authoritative from then on.

           ⛔ Read only. The legacy key is left untouched and inert — this pass
           deletes nothing — and it is never consulted again once the DB holds
           a value. It is a migration input, not a second persistence system. */
        const seeded = legacySeed(manuscriptFromUrl());
        if (seeded) {
          setCanvasSurface(seeded);
          persist({ canvasSurface: seeded });
        }
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
    /* Only the room is sent. The page is not mentioned, so it cannot be
       overwritten by a choice that was never about it. */
    persist({ atmosphere: next });
  }, []);

  const chooseCanvas = useCallback((next: CanvasSurfaceId) => {
    setCanvasSurface(next);
    try {
      window.localStorage.setItem(CANVAS_STORAGE_KEY, next);
    } catch {
      /* As above. */
    }
    persist({ canvasSurface: next });
  }, []);

  /* Only the ROOM's variables are set here. The page's are applied by the
     Canvas onto the writing-field element itself, which is what keeps a
     writing surface from ever being able to repaint the Studio. */
  const vars = atmosphereVariables(ATMOSPHERES[id]);

  return (
    <Ctx.Provider value={{ id, canvasSurface, choose, chooseCanvas, settled }}>
      <div style={vars as React.CSSProperties} data-ws-atmosphere={id}>
        {children}
      </div>
    </Ctx.Provider>
  );
}
