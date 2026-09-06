# Circle Boundary Verifier — specification

**Status:** SPECIFICATION ONLY. ⛔ **Writing it is not authorized.**
**Derived from:** the draft Constitution. **Blocked on:** A-01, A-03, A-04, A-06, A-10, A-13,
A-14, A-16 — *the verifier can only falsify what has been ratified.*
**Model:** `scripts/verify-constitution-colab.ts` (people · DM threads · sessions · encounters ·
colab-scope atoms · colab-scope files — **Circles are absent from it**, Gap G-12).

---

## 1. Contract

- Proposed name: `scripts/verify-constitution-circles.ts`.
- **Read-only.** Creates its fixtures inside a transaction and rolls back; leaves no rows.
  *(Learned from WS2-08, where cleanup of 12 transient rows turned later reruns into failures.)*
- Exits non-zero on any failure. **Pass condition is `0 failed`, never the total** — a total moves
  whenever checks are added, and a total quoted without a run behind it is a claim, not evidence.
- Runs in the deploy smoke path **and** manually before any cohort wave.
- **Two real member identities minimum.** A verifier that tests one identity against itself proves
  nothing about a boundary.

## 2. Assertions

### Group 1 — membership scoping *(the floor)*
1. Member A cannot read Circle B's feed · members · inquiries · pulse · settings.
2. Member A cannot share into Circle B.
3. Member A cannot respond to an inquiry in Circle B.
4. A cross-Circle query returns nothing from a Circle the caller does not belong to.
5. An unauthenticated caller reaches nothing.
6. A caller with a valid session but a mismatched `x-member-id` is **rejected**, not silently
   preferred either way.

### Group 2 — consent and revocation
7. A revoked share disappears from the feed.
8. **The original source item is intact after revocation** — the invariant the whole model rests on.
9. Only the sharing member may revoke their own artifact.
10. Withdrawing consent (`manual → not_now`) revokes that member's active shares in that Circle.
11. Sharing with consent withdrawn is refused.

### Group 3 — leaving and removal `[blocked on A-10]`
12. Leaving revokes the leaver's shares.
13. Leaving cuts read access.
14. **Removal cuts access AND cascades revocation identically to leaving.** ⚠️ Would **fail today**
    — `status='removed'` has no writer (B-03). *The verifier is what makes that latent defect
    visible.*
15. Rejoining does not resurrect previously revoked shares.

### Group 4 — invitation integrity
16. An invite cannot redirect to a different Circle than it was issued for.
17. A revoked invite cannot be redeemed.
18. Regenerating an invite revokes all prior tokens.
19. Only the circle creator may regenerate. `[A-10 may widen this]`
20. An invite token is not guessable and is not enumerable from any response.

### Group 5 — role integrity `[blocked on A-10]`
21. A `member` cannot open an inquiry.
22. A member cannot self-escalate to `helper` / `facilitator` by any route.
23. Only the opener may close an inquiry.

### Group 6 — contribute-before-see `[blocked on A-06]`
24. A member who has not responded receives `responses: []` **from the service, not the UI.**
25. A member who has responded receives all responses.
26. A member cannot respond twice.
27. `[A-06 dependent]` The **feed** either does or does not require contribution — **whichever is
    ratified, asserted server-side.** *An unasserted answer here is how the doctrine and the code
    drifted apart in the first place.*

### Group 7 — the never-crosses list `[blocked on A-16]`
28. **No private MAIA conversation content** appears in any Circle surface.
29. **No inferred material** (`member_theme_signals` or successor) reaches the field pulse.
    *(Guards the 2026-07-17 ruling structurally rather than by comment.)*
30. **No Sanctuary content** anywhere, by any path.
31. A Circle's interior is not visible to another Circle. `[Constellation, future]`
32. Membership never arrives as a side effect of any crossing.
33. No count, score, rank, streak, badge or trust level is rendered in a Circle surface.

### Group 8 — discovery `[blocked on A-13]`
34. Discovery reads **declared interests only** — never conversation, atoms, semantic memory,
    anchors, or inferred themes.
35. Discovery does not disclose a member's Circle memberships.
36. Discovery does not reveal the existence of an invite-only Circle to a non-member.

## 3. Coverage rule

> **Every membrane in the Constitution owes at least one assertion. A membrane with no assertion is
> not a membrane — it is a description.**

Groups 1–7 cover Personal↔Circle. Group 8 covers the Commons discovery membrane.
Circle↔Constellation, Circle↔Commons and Circle↔Co-Lab **owe assertions before those surfaces
exist** — the assertion is written with the membrane, never after it.

## 4. Release gate

Proposed addition to `CLAUDE.md`, **after ratification and a passing production run — not before:**

> **No Circle cohort invite unless `scripts/verify-constitution-circles.ts` passes with 0 failed in
> production.**
> Triggers: Circle changes · membership/roles · sharing/revocation · inquiries · invitations ·
> discovery · any migration touching those tables.

⛔ Jarvis does not add this line. It is a founder act, and it must not be written before a run
exists to stand behind it.
