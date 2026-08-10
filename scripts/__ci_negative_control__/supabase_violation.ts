// DISPOSABLE NEGATIVE-CONTROL FIXTURE — not real code, not imported anywhere,
// not reachable from any production path. Exists only to trip
// scripts/check-no-supabase.ts on a throwaway branch/PR so that remote CI
// failure propagation can be observed in GitHub Actions. Contains no PHI, no
// secret, no credential — 'placeholder-url' / 'placeholder-key' are inert
// literals. Deleted, and this branch discarded, the moment the run is
// confirmed red.
import { createClient } from '@supabase/supabase-js';
export const _ciNegativeControlProbe = createClient('placeholder-url', 'placeholder-key');
