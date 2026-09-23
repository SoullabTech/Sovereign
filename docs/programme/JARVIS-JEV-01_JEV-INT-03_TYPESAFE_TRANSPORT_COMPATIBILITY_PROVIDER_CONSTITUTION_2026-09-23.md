# JARVIS-JEV-01 · JEV-INT-03
## TypeSafe transport compatibility + provider constitution — DESIGN ONLY

**Date:** 2026-09-23
**Status:** CANDIDATE DESIGN · NOT RATIFIED · TRANSPORT HELD
**Exact canonical base:** `2703cc3091d200c52b6d70f91f618077214e943a`
**Branch:** `feature/jev-int-03-operational-integration-20260923`

**Authority boundary:** design answers only. This act does not register a provider, assign a
capability, authorize disclosure/network/spend/execution, construct an adapter, call TypeSafe,
alter J0/J1, mutate a Work Unit, merge, deploy, or touch production.

## 1 · Evidence bound into this design

Repository-governed identities at the exact base:

```text
J0 constitution          494cd61973ed02c4453067716657631f3f9143e9
J1R4 contract            98eb6cf16223b83b4768e46e1ae253e7881ae5f5
J1 ratification          a76299c1706de594201a88ee21655f9d8a16788b
provider governance      32295be5d1405a5af084bf47162f539735a0166f
provider policy          f6d16c678b0261d15a40709e3c1681eb08924a31
JEV host                 8138beeb387b1264ce386163ea7468108f2d7451
R5B execution law        d9c6e435b9c2bedea18f22a35a0c293a01eab944
```
External product evidence was kept outside canon and hashed as evidence:

```text
TYPESAFE_API_FACTS.md
sha256 105a6ce9b61d2d805dc7ca5615bdbc75e267a7f7e796bdd7ff7e7efc5450606f

typesafe-wire-shape-proof.mjs
sha256 ba782d3305113bce943fd3f9aee774c6214b2e04e633b7acedb1461c377c6685
```

Observed witnesses on this candidate base:

```text
J1 freeze integrity      0 FREEZE INTACT
INT-02H host membrane    26 pass · 0 fail
J1 frozen matrix         63/63 named kills · 0 survivors
TypeSafe wire witness    direct_J1_no_wrapper_compatibility = false
                         wrapper_present = true
                         fixed_adapter_prose_transmitted = true
```

## 2 · Question 1 — can `state/model/questions` be treated as transport only?

**NO.**

J1R4 §2.2 says the question is a member of the packet, not a sibling travelling beside it.
J1R4 §4.1 defines:
```text
OutboundRepresentation := JudgmentPacket
```

and states that there is no envelope, wrapper, sibling field, or second object; the six packet
members are the disclosed representation.

TypeSafe's current hosted `POST /v1/systemone` request instead requires one application JSON
object with three top-level members:

```text
state
model
questions
```

Even when `state` is exactly the six-member `JudgmentPacket`, the full provider-visible
application body is not the packet. It is a wrapper around the packet with two additional
application-level siblings.

The incompatibility is stronger than shape alone: `questions` carries fixed instruction prose.
J1 deliberately makes `question_id` a closed protocol selector so that question prose does not
travel. Fixed prose is still prose on the provider-visible representation; being constant does
not make it non-disclosure.

Ordinary carrier mechanics such as TLS, HTTP framing, authentication, and content type are not
being redefined here as J1 application members. But an API's required JSON body is application
payload, not neutral carrier metadata. INT-03 therefore may not rename `model` and `questions`
as “transport” to evade the closed representation.
## 3 · Question 2 — amend J1, or reject the endpoint?

**The current TypeSafe endpoint is INADMISSIBLE under J1. J1 is not amended by INT-03.**

The vendor interface does not create a constitutional necessity. J1's no-wrapper rule is an
intentional membrane, and the live wire witness exhibits exactly the failure classes already
frozen as lethal: wrapper/envelope, question text, and prose in the representation.

A Soullab-controlled proxy does not cure this if the proxy then sends the wrapper, model field,
or question prose to TypeSafe. The disclosure boundary is what TypeSafe receives, not where the
wrapper was constructed.

A future TypeSafe transport may become admissible without weakening J1 if its application input
can preserve the exact packet as the sole disclosed judgment representation. For example, a
future interface could bind model choice and fixed question definitions outside the submitted
application object, while the submitted object remains exactly the packet. Any such future
claim requires a new observed wire witness; it is not presumed by this design.

A genuinely sovereign/on-prem Jev runtime remains governed by J0's separate eight-condition
runtime witness and does not gain standing from this TypeSafe transport analysis.

Therefore:

```text
current /v1/systemone     HOLD · INADMISSIBLE
J1                         UNCHANGED
adapter construction       NOT AUTHORIZED
external Jev execution     NOT READY
```
## 4 · Question 3 — exact canonical provider identity

The exact proposed provider identity is:

```text
provider_id = typesafe-jev
tier        = lab
posture     = external hosted advisory
```

`typesafe-jev` is intentionally narrower than `typesafe`. A vendor-wide provider id could
later be read as authority over other TypeSafe services. It is also more accurate than plain
`jev`: Jev names the evaluator/instrument, while TypeSafe presently hosts the external service.

If a future transport becomes admissible, route/execution authority would therefore be exact:

```text
provider.execute:typesafe-jev
```

The provider id does not fix a model id. A future executable binding must pin one exact model id
observed from TypeSafe's then-current model inventory. INT-03 does not invent or canonize a
`latest` alias, and it creates no adapter id.

Provider identity is naming only. It grants no data class, network authority, spend authority,
disclosure authority, or provider execution authority.

## 5 · Question 4 — exact one-class assignment

The only repository data capability this design permits TypeSafe-hosted Jev ever to be proposed
for under the present J0/J1 architecture is:

```text
repository_derived_metadata
```
If a future Class-A authorization record is separately authorized, founder-adjudicated, and
ratified, that distinct later record must have this exact semantic tuple:

```json
{
  "instrument": "repository-provider-assignment/v1",
  "status": "ratified",
  "tier": "lab",
  "provider": "typesafe-jev",
  "capability": "repository_derived_metadata"
}
```

This document is **not** that authorization record and does not create it.

Only after that exact record is separately founder-adjudicated and canonically admitted may a
later assignment candidate cite it through the existing three-pin gate:

```text
record_path
record_blob
record_commit
```

The corresponding future policy assignment is exactly one key:

```text
lab/typesafe-jev/repository_derived_metadata
```

and the provider capability array must contain exactly:

```json
["repository_derived_metadata"]
```
That later assignment must remove only `repository_derived_metadata` from the governed
`unassigned_repository_classes` set. It must leave both of these unassigned:

```text
repository_source
constitutional_canon
```

It must not add `chat`, `benchmark`, `member_data`, `member_audio`, repository source,
constitutional text, prose, paths, filenames, symbols, diffs, commit messages, prompts, or any
other capability.

Assignment remains distinct from every execution authority. A future lawful call still requires,
independently:

```text
network.external
disclosure.repository_derived_metadata
provider.spend
provider.execute:typesafe-jev
```

and the applicable R5B one-shot human execution grant. None is created here.

## 6 · Sequencing consequence

The originally contemplated implementation chain is **not open** while the only observed
TypeSafe transport violates J1.

The correct standing is:

```text
provider identity design        FIXED · typesafe-jev
future assignment shape         FIXED · one data class only
current TypeSafe transport      INADMISSIBLE
provider registration           UNSPENT
repository capability assignment UNSPENT
adapter                          NOT AUTHORIZED
R5B execution                    NOT REACHABLE
production                       UNTOUCHED
```
INT-03 therefore refuses a dormant permission build. Provider registration and assignment
should not be admitted merely so that an incompatible adapter can exist later. The next
state-changing act must follow evidence, not vendor convenience.

Two lawful reopen conditions exist:

1. **Compatible hosted transport evidence** — a fresh TypeSafe wire witness shows the exact J1
   packet can be the sole application judgment representation without wrapper/question prose.
2. **Separate constitutional act** — the founder explicitly reopens J1 and adjudicates a changed
   disclosure law. INT-03 neither requests nor presumes that outcome.

## 7 · Design falsifiers

This candidate is defeated by any later design that does one of the following:

- calls `state/model/questions` “transport only” while TypeSafe receives those JSON members;
- transmits fixed or variable question prose beside the packet;
- wraps the packet in any application object and claims J1 identity;
- uses a proxy to hide the fact that TypeSafe still receives a wider representation;
- registers plain `typesafe` and thereby creates vendor-wide execution identity;
- treats `jev` alone as the external provider identity;
- grants any repository class other than `repository_derived_metadata`;
- treats capability assignment as network, disclosure, spend, or execution authority;
- cites an assignment record that was not previously canonically admitted;
- binds an unverified moving model alias into an authority-bearing execution route.

## 8 · Stop and next boundary

This act changes one documentary candidate only.

⛔ No J0/J1 edit · ⛔ no freeze edit · ⛔ no provider-policy edit · ⛔ no assignment record ·
⛔ no TypeSafe provider registration · ⛔ no transport code · ⛔ no credential lookup ·
⛔ no external network · ⛔ no provider spend · ⛔ no disclosure · ⛔ no inference ·
⛔ no Work Unit mutation · ⛔ no merge · ⛔ no deploy · ⛔ production untouched.

**Next boundary:**

> **FOUNDER ADJUDICATION — `JARVIS-JEV-01 / JEV-INT-03` DESIGN ONLY**

If accepted, the current endpoint remains held. A later implementation act is eligible only
after one of the two reopen conditions in §6 is independently evidenced and authorized.
