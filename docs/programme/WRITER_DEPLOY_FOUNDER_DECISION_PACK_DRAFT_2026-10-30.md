# Writer's Studio deploy: what you would be approving (DRAFT, 30 Oct 2026)

**This authorizes nothing.** It is the one page to read before you say yes or no. Production is untouched.

## What goes live
Candidate `5edf87170`: the full Writer's Studio (upload and paste import, Develop, MAIA companion, the field repairs). The 56-step fictional journey passed on the earlier `b27c92d6`. `5edf87170` adds the Home/F6 fixes, and its own browser run has not posted a receipt yet.

## What is NOT in it
- The OTP anti-abuse fix (the shared-address limit still resets on a successful sign-in). Deploying now ships that known weakness.
- No independent security review exists. You would be the reviewer of record.

## The one real risk found
Six database changes run before the new app swaps in. One of them replaces a key that production's current app writes to when someone joins a Session Room encounter through the public link. In the few minutes between the change and the swap, that one route fails. Production has 1 encounter and 0 consent events. Writers do not use it.

## What you would be ruling
"I accept that route being blocked at the proxy for the cutover window, as a recorded founder exception. The migration step runs outside the deploy gate's automatic check, with the freeze, the dump and the verification kept."

## The steps (each needs your yes at the time)
1. Fix the preconditions: the baseline commit reaches minisforum; the old-reader patch is accepted by you; the Home/F6 receipt is read.
2. Freeze writes, take a fresh dump, check it restores. About 35 seconds.
3. Block the public threshold-join write at the proxy.
4. Apply the six migrations with the lane's runner. Read the output and the ledger, not just the exit code (the runner exits 0 when its lock is refused).
5. Swap to `5edf87170`, check the version, health, outside reachability and the Co-Lab gate. Keep the freeze until they pass.
6. Reopen the route, lift the freeze, watch for 30 minutes.

## If something goes wrong
- Before the migrations: lift the freeze. Nothing changed.
- During the migrations: each file is its own transaction. Stop, restore the dump only if the state is uncertain.
- After the swap: roll the container back. Restoring the dump would lose newer writes, so that is a separate decision.

## Your choices
- **Yes, as written.**
- **Wait** until the OTP fix is committed and the Home/F6 receipt is read (slower, closes the known weakness).
- **No.**
