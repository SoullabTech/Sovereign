'use client';

/**
 * The astrologer's place in each Pro panel, kept for the open chart.
 *
 * Panels unmount whenever the private chart is hidden (blur, hidden tab), and
 * would come back reset. A panel that keeps a value with `usePanelState`
 * gets it back when the chart is shown again. The memory belongs to one
 * scope — the verified member and chart revision — and is wiped when the scope
 * changes or ends, so nothing outlives a close, a sign-out or another chart.
 * A write from a panel mounted under an earlier scope (a late reply after the
 * chart closed) is dropped.
 */
import { createContext, useContext, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

interface Memory {
  values: Map<string, unknown>;
  generation: number;
}

const PanelMemory = createContext<Memory | null>(null);

export function PanelMemoryProvider({ scope, children }: { scope: string | null; children: ReactNode }) {
  const memory = useRef<Memory>({ values: new Map(), generation: 0 });
  const current = useRef<string | null>(scope);
  if (current.current !== scope) {
    current.current = scope;
    memory.current.values = new Map();
    memory.current.generation += 1;
  }
  return <PanelMemory.Provider value={memory.current}>{children}</PanelMemory.Provider>;
}

/** Like `useState`, but the value returns when the panel remounts for the same chart. */
export function usePanelState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const memory = useContext(PanelMemory);
  const [generation] = useState(() => memory?.generation ?? 0);
  const [value, setValue] = useState<T>(() => {
    if (memory && memory.values.has(key)) return memory.values.get(key) as T;
    return typeof initial === 'function' ? (initial as () => T)() : initial;
  });
  const set: Dispatch<SetStateAction<T>> = (next) => {
    setValue((previous) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(previous) : next;
      if (memory && memory.generation === generation) memory.values.set(key, resolved);
      return resolved;
    });
  };
  return [value, set];
}
