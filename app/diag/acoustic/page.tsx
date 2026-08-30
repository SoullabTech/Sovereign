// NOTE: `export const dynamic` MUST be the first statement so Next's static
// route-config analysis detects it (same rule as /diag — see that file).
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import AcousticCalibrationClient from './AcousticCalibrationClient';

/**
 * /diag/acoustic — DESKTOP-VOICE-DEVICE-CALIBRATION-HARNESS-01 (TEST-ONLY).
 *
 * A measuring instrument for the acoustic-admission question. It decides
 * nothing: no admission, no refusal, no threshold. It records a capture through
 * the REAL production recorder, reports bounded measurements, and drops the
 * audio without sending it anywhere.
 *
 * SERVER-GATED at REQUEST time, reusing /diag's existing gate rather than
 * inventing a second one: renders ONLY when the dev server was started with
 * NEXT_PUBLIC_MOBILE_FAST_LANE=1. The check runs on the SERVER against the
 * runtime env — not client-inlined, so it cannot be toggled from the client and
 * is OFF by default. The force-dynamic literal also causes
 * scripts/capacitor-patch-routes.sh to exclude this route from the Capacitor
 * static export, so it is never shipped.
 *
 * Members never see this. It exists because the repository contains zero audio
 * fixtures and zero real speech amplitudes, and no admission boundary can be
 * ratified without them.
 */
export default function AcousticCalibrationPage() {
  if (process.env.NEXT_PUBLIC_MOBILE_FAST_LANE !== '1') {
    notFound();
  }
  return <AcousticCalibrationClient />;
}
