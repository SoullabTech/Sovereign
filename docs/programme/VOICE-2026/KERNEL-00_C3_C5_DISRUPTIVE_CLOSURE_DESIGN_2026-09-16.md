# KERNEL-00 C3–C5 — Disruptive Closure Witness Design — 2026-09-16

**Status:** DESIGN RETURNED · records only · no phone/device execution authority.

## 1. Purpose

Complete the remaining environment-dependent KERNEL-00 obligations after C1/C2: K00-11 route survival with route-wide K00-06 physiology/coupling, K00-12 interruption, K00-13 media-services reset, K00-14 background/lock policy, and K00-15 endurance. These acts also provide the final dynamic corpus for K00-03, K00-17 and K00-18.

C3–C5 never substitute for C1/C2. They begin only from the accepted SID subject and a clean zero-harness/device-custody boundary, with fresh authority per governed act.

## 2. C3 — Route matrix + route-wide duplex closure

### C3-A · read-only capability census

Before any route mutation, record what the witness device and currently available hardware actually admit. The census is descriptive only:

- current built-in input/output route;
- receiver/system-default route availability;
- connected/available Bluetooth devices and the input/output topology iOS actually exposes;
- the historically named Pi8 route only if it is presently available/admitted;
- unsupported combinations recorded as platform capability, never runtime failure.

No route is invented from historical availability. The ratified law still requires at least one Bluetooth transition when compatible hardware is available.

### C3-B · admitted route transitions

For each admitted topology, execute a predeclared transition sequence from a healthy listening state. At minimum the sequence must cover speaker ↔ receiver/system-default and, when available, built-in ↔ an admitted Bluetooth topology ↔ built-in, with a second Bluetooth transition to prove recurrence rather than a one-off.

Every admitted transition must independently show:

- a `route_changed` observation;
- the corresponding `AudioSessionAuthority` act/mutation, stamped lawfully;
- generation/rebuild behavior consistent with the current route-recovery law;
- input and output return to healthy without a manual microphone tap;
- manual-intervention count remains zero;
- no unstamped session configuration mutation.

A route transition that the OS refuses to admit is capability evidence, not PASS or FAIL on runtime recovery. Once admitted, failure to recover without a tap is K00-11 FAIL.

### C3-C · K00-06 travels with the route

C1 may establish the built-in leg only. C3 must carry independent duplex physiology and coupling evidence on every tested/admitted route so final K00-06 closure travels with K00-11 as already ruled.

The K00-06 physiological law is unchanged. No new acoustic suppression threshold is introduced. The route witness must provide enough rendering-overlap physiology to make each tested route readable under the existing law; the exact route-row population/validity pin must be written prospectively before execution, after the capability census identifies the admitted set. It may reuse the C1 validity-hardened external driver shape if that instrument has already been separately accepted, but cannot silently inherit C1 authority or pool C1 rows.

### C3 reading

- K00-11 PASS only if every admitted transition recovers healthy/no-tap and the required Bluetooth transition is exercised when hardware is available.
- Final K00-06 PASS only if the built-in leg is already green and the route witness establishes the required duplex/coupling evidence for every tested/admitted route without a K00-06 falsifier.
- Any admitted-route physiological falsifier is K00-06 FAIL for that route; any unreadable route remains non-evidence and prevents final closure.

## 3. C4 — interruption / reset / lifecycle

Use **three separately named current-subject invocations** so causality remains readable.

### C4-I · K00-12 interruption

From healthy listening, induce exactly one governed incoming-call / Siri / other-app-audio interruption using the runbook's chosen mechanism. Expected journal:

- `interruption_began` → `audioSession = interrupted` / recovering;
- no dead-organism recovery while the OS owns the interruption;
- interruption end with lawful `interruption_recovery` session reconfiguration/reactivation;
- new/current generation becomes healthy/listening without manual tap;
- any recovery activation is stamped as K00-02 permits.

The historical unplanned interruption remains informative only and is not substituted for this protocol run.

### C4-R · K00-13 media-services reset

From healthy listening, invoke the OS's exercisable Media Services reset exactly once through the declared Settings → Developer path. Expected:

- `media_services_reset` observation;
- floor/session moves through resetting rather than pretending continuity;
- lawful `media_services_reset_recovery` session activation/configuration;
- graph rebuilt under a new generation;
- old-generation callbacks cannot act;
- healthy/listening returns without manual tap.

### C4-L · K00-14 lock/background HOLD policy

From healthy listening, perform the predeclared lock/unlock and background/foreground sequence without changing the policy. `UIBackgroundModes: audio` and HOLD are already structural facts; this invocation proves behavior:

- lifecycle records bracket each state change;
- journal says whether session/input/output were held as declared;
- no silent session loss or undeclared reconfiguration;
- healthy/listening state is restored/preserved as the HOLD policy requires;
- manual-intervention count remains zero.

### C4 cross-readings

All three journals must replay cleanly for K00-17 and preserve truthful UI projection for K00-18. K00-03 is re-read across all lawful recovery mutations: only route/interruption/reset mutations explicitly allowed by the acceptance law may occur.

## 4. C5 — endurance + final integrated witness

C5 is opened only after C1–C4 are adjudicated green enough that endurance is meaningful. The ratified K00-15 protocol is exact:

- 60 minutes;
- ≥50 listen/play cycles;
- ≥3 route changes;
- ≥2 interruptions;
- 1 media-services reset;
- zero manual taps/interventions;
- zero unstamped configuration mutations;
- zero unbounded recovery loops.

The endurance run is not a place to discover missing witness controls. Its route/interruption/reset acts use the already accepted C3/C4 shapes. No new threshold, retry policy, route rule or lifecycle policy is introduced inside C5.

At the end, export the journal once and produce the final acceptance packet.

## 5. Final acceptance packet

The packet is a separate records/adjudication act. It must bind exact organism/build/product/device identity and list K00-01…K00-18 explicitly. Every row must be PASS; 0 FAIL, 0 WARN, 0 SKIP, 0 MISSING.

Required synthesis:

- K00-01 and K00-16 exact-tree/current-journal evidence from C0;
- K00-02/07/08/09/10 from C2;
- K00-04 and K00-05 already adjudicated PASS, never rerun merely for completeness;
- K00-06 from C1 built-in + C3 route-wide physiology/coupling;
- K00-11 from C3;
- K00-12/13/14 from C4;
- K00-15 from C5;
- K00-03 re-read across the complete accepted closure corpus;
- K00-17 replay across every automatic act in the complete closure corpus, zero orphan/unattributed/broken-causality;
- K00-18 static C0 evidence plus dynamic truth across C2–C5, never displaying listening without healthy input.

Only after that packet contains eighteen PASS rows may a founder act accept KERNEL-00. Acceptance does not automatically open BRIDGE-01; BRIDGE-01 still receives its own opening custody/authority.

## 6. Global falsifiers / boundaries

- no historical engine/K00/R1 result substitutes for current VPIO-02/SID device evidence;
- no route capability is inferred from a prior day; census current availability;
- no unsupported route is manufactured into a failure;
- no admitted-route failure is softened into capability limitation;
- no manual mic tap is hidden from the journal;
- no threshold/policy/backoff is loosened after observing a miss;
- no rerun/top-up/drop-row under the same authority;
- no C5 endurance begins while a prerequisite closure obligation is still knowingly unmeasured;
- no KERNEL-00 acceptance, KERNEL-01, BENCH-01, BRIDGE-01, MIGRATE-01 or production deployment is implied by a partial green C3/C4/C5 result.

## 7. Standing

C3–C5 design returned. **Execution CLOSED · implementation CLOSED unless a needed external-driver surface is separately authorized · fresh device authority NONE.** Current next executable work remains subject to a founder opening act for C1 or C2 after their designs are accepted.
