# JARVIS-VISUAL-FIELD-01 · R2A — Camera Physics

**Base:** `cd97315aa2605f29702a65a2193b3ce1cac691b1`  
**Branch:** `feature/jarvis-visual-field-r2a-20260929`  
**Worktree:** `/private/tmp/jarvis-visual-field-r2a`  
**Standing:** authorized local prototype only

## Founder authorization

Founder accepted the cellular visual language and authorized continuation into R2A.

Additional founder direction:

> The Living Field should become a magical way to explore the full platform — a true Soul lab.

R2A therefore builds camera/navigation physics that can later carry cross-room return addresses without wiring those rooms yet.
## R2A scope

Implement:
- cursor-anchored mouse-wheel / trackpad zoom;
- two-pointer pinch zoom;
- background pan;
- click-to-enter existing world and node focus;
- one-level Widen;
- Whole / Home recovery;
- bounded camera;
- stable topology during camera movement;
- reduced-motion parity;
- keyboard-accessible zoom recovery controls.

Do not implement:
- new semantic depth;
- dynamic child loading;
- live platform-room portals;
- durable navigation memory;
- MAIA interpretation;
- LOD semantic rules beyond existing presentation.
## Camera laws

### Anchor law
The point under the cursor or pinch center remains visually stable during continuous zoom.

### Topology law
Camera movement may change viewpoint; it does not recompute semantic geography.

### Recovery law
The whole field is always recoverable in one explicit action.

### Click law
Click means intentional semantic entry. Wheel/pinch means exploratory change of scale.

### Pan law
Background drag moves viewpoint without altering node membership or relation standing.

### Bounds law
The member may explore around the field without becoming lost in meaningless empty space.
## Soul Lab compatibility

The camera state must be representable as:
- center x;
- center y;
- scale;
- semantic focus when one exists.

Later cross-room navigation may add:
- room;
- semantic object;
- path;
- return address.

R2A does not yet persist that state beyond the current runtime.

## Mechanical acceptance

Require proof that:
1. cursor-anchored wheel zoom preserves the anchor within a small visual tolerance;
2. zoom clamps to safe minimum and maximum;
3. background pan changes camera but not node coordinates;
4. click world and node focus still work;
5. Widen reverses one semantic level;
6. Whole returns to scale 1 and center;
7. pinch changes scale around pinch center;
8. reduced-motion mode remains functional;
9. browser page errors = 0.
## Founder acceptance question

> **Does changing scale feel like approaching and withdrawing from one living world rather than operating a diagram?**

## Stop

STOP after R2A founder witness.

R2B Level-of-Detail Resolver remains closed until R2A is accepted.

## Verification evidence

### Compile / repository hygiene

- scoped TypeScript compile: PASS;
- `git diff --check`: PASS;
- temporary public-demo witness harness restored after testing;
- browser page errors: **0**.

### Cursor-anchored zoom

At an off-center field coordinate:
- camera scale: **1.000 → 1.241**;
- camera center: **500 / 360 → 461.147 / 377.399**;
- world-under-cursor anchor error: **0.08 field units**.

Residual D3 node settling during the same interval: **0.36 field units**.
Camera zoom did not re-layout semantic geography.
### Real wheel / page custody

Real browser wheel packets:
- scale: **1.000 → 2.373**;
- page scroll: **0 → 0**.

A native non-passive wheel listener gives the field gesture custody while the pointer is over the SVG.

### Background pan

From Whole:
- start camera: **500 / 360 / 1.0**;
- panned camera: **439.13 / 325.217 / 1.0**;
- Calling residual physical settling during pan witness: **0.49 field units**.

Pan changes viewpoint, not semantic membership or relation standing.
### Semantic entry / recovery

Verified reduced-motion camera targets:
- Whole: **1.00×**;
- Air: **1.48×**;
- Calling: **1.90×**;
- Widen Calling → Air: **1.48×**;
- Whole recovery: **500 / 360 / 1.00** exactly.

World labels are explicit world-entry targets so cell interaction halos do not make parent-world entry ambiguous.

### Input parity

- keyboard zoom: **1.00 → 1.22**;
- keyboard Whole: PASS;
- two-pointer pinch: **1.00 → 1.80**;
- minimum clamp: **0.86×**;
- maximum clamp: **3.40×**.
### Ordinary-motion visual witness

Desktop:
- Whole field screenshot: PASS;
- Air → Calling deep view: **1.90×**;
- page errors: **0**.

Mobile:
- Whole field screenshot: PASS;
- pinch view: **1.714×**;
- page errors: **0**.

Evidence:
- `docs/design/contracts/screenshots/living-field-r2a-whole-desktop.png`
- `docs/design/contracts/screenshots/living-field-r2a-calling-desktop.png`
- `docs/design/contracts/screenshots/living-field-r2a-whole-mobile.png`
- `docs/design/contracts/screenshots/living-field-r2a-pinch-mobile.png`
## Open experiential seam

The existing right-side insight panel intercepts gestures over its own visual area.

This is not a camera-mechanics failure, but founder witness should determine whether that panel breaks the felt continuity of the field.

No panel redesign is authorized inside R2A unless founder returns it as a camera/continuity defect.

## Current standing

**R2A IMPLEMENTED CANDIDATE — READY FOR FOUNDER CAMERA-PHYSICS WITNESS**

Mechanical verification proves camera continuity and recovery.

It does not prove the movement feels magical, natural, or like approaching one living world.

R2B remains closed.
