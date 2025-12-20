import { useEffect, useState } from "react";

const KEY = "maia:trustReceiptsEnabled";

export function getTrustReceiptsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "true";
}

export function setTrustReceiptsEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, String(v));
}

export function useTrustReceiptsEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(getTrustReceiptsEnabled());
  }, []);

  const update = (v: boolean) => {
    setEnabled(v);
    setTrustReceiptsEnabled(v);
  };

  return { enabled, setEnabled: update };
}
