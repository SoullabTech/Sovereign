// DISPOSABLE NEGATIVE-CONTROL FIXTURE for the PHI log gate specifically.
// Not real code, not imported anywhere, no production path reachable.
// Contains no real PHI, no member data, no secret, no credential —
// the address below is an RFC 2606 .invalid literal. Deliberately contains
// NOTHING that would trip check:no-supabase / check:no-openai / check:no-vendor-voices /
// check:no-inline-names / check:no-phi-enc, so PHI-gate causal attribution stays
// clean. Deleted, and this branch discarded, the moment the run is confirmed red.
const client_email = 'not-a-real-address@example.invalid';
console.log(`sent to ${client_email}`);
