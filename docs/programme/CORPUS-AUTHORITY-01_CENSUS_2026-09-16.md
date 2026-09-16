# CORPUS-AUTHORITY-01 · Census and Authority Boundary

**Date:** 2026-09-16
**Base:** `823d040d377d3b55cbd7c65c1b94ce1864e82f6f`
**State:** classification census; no rebuild/embed authorized by this record

**Reconciliation:** canonical advanced only by the record-only SOURCE-CUSTODY production-closure merge (#1309); changed-path overlap with CORPUS-AUTHORITY-01 was zero. Admission tests and root TypeScript were rerun after reconciliation.

## Why this act exists

ACT 4 established that filesystem location cannot confer knowledge-corpus membership. This census finds a second independent axis: **classification does not confer rights or authority either.**

A file may look like published knowledge and still lack an established basis for MAIA to ingest, retrieve, or compose from it.

The corpus therefore needs both:

1. a declared content classification; and
2. a declared, compatible authority basis.

Neither may be inferred from directory, filename, publication status, or a free-text assurance.
## Corpus shape

`data/ain/source` contains **736 flat files**:

- **600** Markdown (`.md`)
- **136** text (`.txt`)

Filename shape is mixed and non-authoritative:

- 75 numeric-prefix files that look like imported publications/exports;
- 85 operational/development-shaped names;
- 105 Soullab/framework-shaped names;
- 471 unresolved by filename shape.

This distribution is evidence against bulk classification. The directory intermixes authored framework material, operational artifacts, development documents, third-party publications, and unresolved material.

Current shipped declaration remains one broad `unclassified_legacy` rule. On the real 736-file population the strengthened guard returns:

`0 admitted · 736 excluded · 0 refused`
## Defence-in-depth detector census

For census only, the existing detector was run as though the broad root had an admitting classification. No declaration was changed and no ingest occurred.

Result:

`697 would pass detector · 39 would be REFUSED by detector`

The 39 are **warning signals, not human-record classifications**. The set contains plausible operational/Beta material, but also obvious false positives such as published books where words like `secret`, `passkey`, or `public domain` occur in ordinary text.

This re-confirms the existing law: the content detector is secondary defence, not the authority boundary.

## Rights-marker census

152 files contain at least one author/copyright/license-like marker somewhere in their text. That does not mean 152 files have corpus authority.

Measured marker counts include:

- 45 files containing `all rights reserved`;
- 5 containing the phrase `public domain`;
- 7 containing Creative Commons-shaped text;
- 1 with an explicit Kelly/Soullab copyright marker.
Direct inspection proves why phrase matching cannot establish rights:

- `Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md` carries `Copyright © 2024 by Kelly Nezat` — an actual authorship/ownership signal.
- `Neuroscientific-View-on-Enneagram-of-Personality.txt` states that the article is distributed under a Creative Commons Attribution License — an actual work-level license signal.
- `37747540-Jung-Alchemy-and-Active-Imagination...txt` says the **article itself is all rights reserved**; its `public domain` phrase applies only to an image.
- `337331895-Architecture-and-Empathy.txt` uses Creative Commons language for individual photographs, not necessarily the full work.
- `The-Master-and-His-Emissary-McGilchrist-Full.txt` uses `public domain` in ordinary prose about knowledge; it is not a license statement.
- `Fractal Shaman.md` and `HOLY FUCKING SHIT!!!.md` say `Release to public domain` as a future action item, not evidence that release occurred.

Therefore **rights language must govern the work itself and the intended corpus use**. A phrase anywhere in a file is not evidence of authority.

## Structural repair

`AdmissionRule` now supports a structured authority object:

- `soullab_owned`
- `public_domain`
- `license`
- `permission`

Compatibility is enforced:

- `published_knowledge` → `soullab_owned`
- `organizational_public` → `soullab_owned`
- `third_party_published` → `public_domain | license | permission`
Every admitting rule must carry mechanically locatable evidence. Supported evidence is either an exact marker that must actually occur in the work, or a record under the dedicated `docs/corpus-authority/` namespace whose declared marker must actually occur in that record. A free-text evidence assertion is not sufficient. Missing, malformed, absent, unreadable, out-of-custody, or incompatible evidence yields **EXCLUDED**.

A free-text `reason` cannot substitute for structured authority. T14 is the falsifier: a rule whose reason literally says `licensed and definitely okay` but carries no structured authority remains excluded.

The existing content detector still runs after classification + authority and can refuse an otherwise admitted rule when human-record signals are present.

## Current result

Admission tests: **20 / 20 PASS**.

The shipped corpus remains fully held:

`0 admitted · 736 excluded · 0 refused`

No corpus build, embed, Living Library force rebuild, or production corpus mutation occurred in this act.

## Next classification law

Classification should proceed **per evidence-bearing collection or item**, not by filename convention. A candidate may move from `unclassified_legacy` only when both content identity and authority are established.

A third-party full text with no work-level public-domain/license/permission evidence remains held even if it is useful, famous, already present in Git, or previously ingested historically.

A Soullab-shaped filename remains held unless authorship/organizational authority is established; naming is not provenance.
## Exact-tree validation

The authority-boundary implementation was validated without changing any corpus membership rule.

- admission/composition suite: **20 / 20 PASS**;
- root TypeScript: **229 errors vs 239 baseline · 0 regressions**;
- `typecheck:scripts`: canonical base **40** error identities; head **40**; head-only **0**; base-only **0**; sets **identical**;
- provider governance: **PASS**;
- no-Supabase: **PASS**;
- design canon: **PASS** — no member-facing UI surfaces changed;
- `git diff --check`: **PASS**.

`typecheck:scripts` remains a legacy-red gate and is not represented as green.

## Standing

`CORPUS MEMBERSHIP = HELD CLOSED`

`AUTHORITY REQUIREMENT = STRUCTURAL · TESTED`

`REBUILD / EMBED / LIVING LIBRARY FORCE = NOT EXECUTED`

The next admissible work is classification of evidence-bearing items or collections. Classification must not infer authorship or rights from title, filename shape, directory location, prior possession, or historical ingestion.
## Independent review amendment

Independent review found that the first implementation still represented `authority.evidence` as an arbitrary string. That would have allowed a future rule to move an unsupported assertion from `reason` into `evidence` and pass the structural gate.

The reviewed implementation closes that gap. Evidence now has one of two mechanically checked forms:

- `in_file` — an exact marker must actually occur in the candidate work;
- `governed_record` — a repository-relative record must remain inside repository custody and must actually contain its declared marker.

T16–T20 are the falsifiers: free-text evidence is excluded, absent in-file evidence is excluded, governed-record evidence must resolve and contain its marker, a governed-record path cannot escape repository custody, and an arbitrary repository file outside `docs/corpus-authority/` cannot masquerade as an authority record.

The corpus remains fully held after this amendment: `0 admitted · 736 excluded · 0 refused`.
