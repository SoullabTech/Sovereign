'use client';

/**
 * SAFETY-CRISIS-01 / Option A disclosure (founder ruling 2026-10-01).
 *
 * Option A has no human alert channel, so members must be told plainly that no
 * person is watching and where to turn in an emergency. Shown once per device
 * until acknowledged, on the MAIA conversation surface. Onboarding alone would
 * miss every existing member.
 *
 * Acknowledgement is stored in localStorage only, so a member sees it again on a
 * new device or after clearing site data. That is deliberate: re-showing a safety
 * notice is harmless; a server record would need a migration and is not needed
 * for honesty. If storage is unavailable, the notice is shown, never skipped.
 */
import React, { useEffect, useRef, useState } from 'react';

export const NOT_MONITORED_ACK_KEY = 'maia_not_monitored_ack_v1';

export const NOT_MONITORED_NOTICE = {
  heading: 'Before you talk with MAIA',
  body: 'MAIA is an AI. Your conversations are private and are not monitored by a person. No one is watching in real time, and no one will be notified about what you share.',
  crisis: "If you're in crisis or thinking about harming yourself, call or text 988, or text HOME to 741741. If you're in immediate danger, call 911.",
  acknowledge: 'I understand',
} as const;

function alreadyAcknowledged(): boolean {
  try {
    return localStorage.getItem(NOT_MONITORED_ACK_KEY) !== null;
  } catch {
    return false;
  }
}

export default function NotMonitoredNotice() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!alreadyAcknowledged()) setOpen(true);
  }, []);

  useEffect(() => {
    if (open) buttonRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const acknowledge = () => {
    try {
      localStorage.setItem(NOT_MONITORED_ACK_KEY, new Date().toISOString());
    } catch {
      /* storage unavailable: the notice simply shows again next time */
    }
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="not-monitored-heading"
      aria-describedby="not-monitored-body"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1b2e] p-6 text-white shadow-xl">
        <h2 id="not-monitored-heading" className="mb-3 text-lg font-medium">
          {NOT_MONITORED_NOTICE.heading}
        </h2>
        <div id="not-monitored-body" className="space-y-3 text-[15px] leading-relaxed text-white/80">
          <p>{NOT_MONITORED_NOTICE.body}</p>
          <p className="font-medium text-white/90">{NOT_MONITORED_NOTICE.crisis}</p>
        </div>
        <button
          ref={buttonRef}
          type="button"
          onClick={acknowledge}
          className="mt-6 w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          {NOT_MONITORED_NOTICE.acknowledge}
        </button>
      </div>
    </div>
  );
}
