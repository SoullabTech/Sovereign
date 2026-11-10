'use client';

/**
 * The cockpit's one MAIA dock (founder direction 2026-11-09: "bring MAIA
 * Mentor / Ask MAIA into all aspects").
 *
 * Each instrument that MAIA can read offers a subject to the dock ("these
 * transits", "the composite") with the request that would be sent for it. The
 * dock shows one subject at a time: the one the astrologer last pointed it at.
 * An instrument that closes withdraws its subject. Nothing here sends anything;
 * a question goes only when the astrologer asks it in the dock.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ProAskRequest } from './ProAskMaiaPanel';

export interface MaiaSubject {
  /** Stable for one subject: its conversation is kept under this key. */
  key: string;
  request: ProAskRequest;
  /** Whose charts MAIA will read, said before anything is sent. */
  readsWhose: string;
  /** What the subject is, for the dock's heading: "these transits". */
  subjectLabel: string;
}

interface Dock {
  subjects: ReadonlyMap<string, MaiaSubject>;
  focusKey: string | null;
  open: boolean;
  offer: (subject: MaiaSubject) => void;
  withdraw: (key: string) => void;
  /** Point the dock at a subject (opening it unless told not to); null returns it to where the astrologer is. */
  focus: (key: string | null, andOpen?: boolean) => void;
  setOpen: (open: boolean) => void;
}

const MaiaDock = createContext<Dock | null>(null);

export function MaiaDockProvider({ children, defaultOpen = true }: { children: ReactNode; defaultOpen?: boolean }) {
  const [subjects, setSubjects] = useState<Map<string, MaiaSubject>>(() => new Map());
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [open, setOpen] = useState(defaultOpen);

  const offer = useCallback((subject: MaiaSubject) => {
    setSubjects((current) => {
      const before = current.get(subject.key);
      if (before && JSON.stringify(before) === JSON.stringify(subject)) return current;
      const next = new Map(current);
      next.set(subject.key, subject);
      return next;
    });
  }, []);
  const withdraw = useCallback((key: string) => {
    setSubjects((current) => {
      if (!current.has(key)) return current;
      const next = new Map(current);
      next.delete(key);
      return next;
    });
    setFocusKey((current) => (current === key ? null : current));
  }, []);
  const focus = useCallback((key: string | null, andOpen = true) => { setFocusKey(key); if (andOpen) setOpen(true); }, []);

  const value = useMemo(() => ({ subjects, focusKey, open, offer, withdraw, focus, setOpen }),
    [subjects, focusKey, open, offer, withdraw, focus]);
  return <MaiaDock.Provider value={value}>{children}</MaiaDock.Provider>;
}

export function useMaiaDock(): Dock | null {
  return useContext(MaiaDock);
}

/** Offer a subject to the dock for as long as the calling instrument is mounted. */
export function useMaiaSubject(subject: MaiaSubject | null): void {
  const dock = useContext(MaiaDock);
  const offer = dock?.offer;
  const withdraw = dock?.withdraw;
  const serial = subject ? JSON.stringify(subject) : null;
  const lastKey = useRef<string | null>(null);
  useEffect(() => {
    if (!offer || !withdraw) return;
    const next: MaiaSubject | null = serial ? JSON.parse(serial) : null;
    if (lastKey.current && lastKey.current !== next?.key) withdraw(lastKey.current);
    lastKey.current = next?.key ?? null;
    if (next) offer(next);
  }, [offer, withdraw, serial]);
  useEffect(() => () => { if (lastKey.current && withdraw) withdraw(lastKey.current); }, [withdraw]);
}
