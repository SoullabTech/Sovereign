// DISPOSABLE NEGATIVE-CONTROL FIXTURE for the merge-binding proof.
// Same fixture as PR #1002's already-proven remote rejection. Reused here to
// prove that a failing `sovereignty` check now concretely blocks merge
// (mergeable_state), not just appears as a required context in config.
// No real PHI, no secret, no credential, RFC 2606 .invalid literal, not
// imported anywhere, no production path reachable.
const client_email = 'not-a-real-address@example.invalid';
console.log(`sent to ${client_email}`);
