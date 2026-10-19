'use client';

/**
 * Stage Q: a visible, user-controlled resolution to incomplete server sign-out.
 * Local exit is separate from revocation; closing the dialogue changes neither.
 */
import { useEffect, useRef } from 'react';

interface SignOutIncompleteDialogProps {
  detail: string | null;
  onStay: () => void;
  onLeaveDevice: () => void;
}

export function SignOutIncompleteDialog({
  detail, onStay, onLeaveDevice,
}: SignOutIncompleteDialogProps) {
  const stayButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (detail) stayButton.current?.focus();
  }, [detail]);

  if (!detail) return null;

  return (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/85 px-4 py-8">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="signout-incomplete-title"
        aria-describedby="signout-incomplete-description"
        className="w-full max-w-md rounded-2xl border border-amber-400/30 bg-[#101827] p-6 shadow-2xl"
      >
        <h2 id="signout-incomplete-title" className="text-xl font-medium text-amber-100">
          Sign-out could not be confirmed
        </h2>
        <p id="signout-incomplete-description" className="mt-3 text-sm leading-relaxed text-slate-200">
          {detail}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          You can stay here, or remove this device's saved sign-in information.
          Leaving this device does not revoke an unconfirmed server session or
          sign out other devices.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            ref={stayButton}
            onClick={onStay}
            className="min-h-11 flex-1 rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            Stay here
          </button>
          <button
            type="button"
            onClick={onLeaveDevice}
            className="min-h-11 flex-1 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Leave this device only
          </button>
        </div>
      </div>
    </div>
  );
}
