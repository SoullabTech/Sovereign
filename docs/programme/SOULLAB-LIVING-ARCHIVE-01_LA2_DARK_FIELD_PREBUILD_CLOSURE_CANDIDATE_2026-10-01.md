# SOULLAB-LIVING-ARCHIVE-01 · LA2 / Dark Field Prebuild Closure

**Status:** CANDIDATE · evidence-backed prebuild closure · 2026-10-01. No runtime implementation. No Source Vault schema. No production change.

This record continues §30a–36 after the Dark Field candidate and closes the work that can be closed without founder ratification of the remaining entry policy.

## 1. LA2 cataloguing unit — resolved as candidate

The Dark Field point unit is the **provenance-bearing object as it was made**.

Examples: one notebook, one dream record, one audio file, one programme record, one AI conversation export, one photograph, one code commit, one diagram.

Pages, excerpts, clips, frames, transcript spans, code hunks and sections are **sub-artifacts**. They may be addressed and exhibited, but never counted as independent Dark Field points unless they were originally created and preserved as independent objects.

A later re-cataloguing rule may not retroactively present increased density as newly recovered history. Unit changes require a visible catalogue changelog.

This closes the granularity gap behind LA-27 and gives LA30-F7 an evaluable boundary.

## 2. LA2 privacy classes — resolved as candidate

Two classes remain distinct:

- **SEALED (SELF):** founder-owned/private material. It may have a point for authenticated members if founder policy allows it, but its content remains closed.
- **WITHHELD (THIRD PARTY):** material carrying another person's intimate or identifying life. It has no point, no coordinates, no thread adjacency, no localized count and no withdrawal trace.

If classification is uncertain, the item is **WITHHELD**.

This makes LA-29 operational: another person's life cannot become visible merely as a shadow in the archive geometry.

## 3. Known gaps

"Absent" is not inferred from empty visual space. It exists only as a **catalogued known-gap record** with:

- the object/period believed missing;
- why its absence is known;
- approximate date range;
- source of the gap claim.

Unlabelled darkness is layout only.

## 4. Entry policy — provisional build contract, not ratified law

Until founder ratification, use the least-exposing layered model as the design baseline:

- **Anonymous visitor:** PUBLIC artifacts only; no sealed points; bookmarks remain local to the browser.
- **Authenticated member:** PUBLIC + member-eligible artifacts; founder SEALED points may appear only as sealed; account bookmarks require an explicit save act.
- **WITHHELD:** invisible at every member-facing level, including founder-facing Dark Field views. It remains Source Vault metadata only.

This preserves the option of an open public archive without making authentication a precondition for historical encounter.

## 5. Telemetry audit — current infrastructure finding

The current canonical `Caddyfile` has ordinary access logging enabled for the main site:

```caddy
log {
    output file /var/log/caddy/access.log {
        roll_size 10mb
        roll_keep 5
    }
}
```

Therefore **request paths are infrastructure-visible**. Any design such as `/archive/thread/why-the-elements` or query-string thread identity would create navigation telemetry even if the application stores nothing.

### Required archive transport rule

Thread choice and artifact wandering must be **client-state navigation**, not path-encoded navigation.

Permitted pattern:

- one stable archive route, e.g. `/archive`;
- public artifact fetches by artifact identifier only where the identifier itself is already public;
- thread state remains in-memory/browser-local and is not sent to the server merely because a visitor chooses a path;
- authenticated bookmark persistence occurs only after an explicit save action.

If future architecture requires server round-trips for thread state, Caddy/app logging must be redesigned and independently witnessed before LA-28 can be claimed.

This closes the present LA30-F10 infrastructure question: **current logging would capture path-encoded thread choices.**

## 6. Stable-coordinate contract

Coordinates must remain stable under catalogue growth and must not encode privacy status.

Use a versioned deterministic layout function:

`coord_v1 = f(archive_id, normalized_date_bucket, public_layout_salt_v1)`

Constraints:

1. `archive_id` is immutable.
2. `normalized_date_bucket` is the admitted archival date/range bucket, not insertion order.
3. `public_layout_salt_v1` is fixed for the layout version and contains no member secret.
4. Neighbour count, catalogue size, popularity, thread choice and access frequency are forbidden inputs.
5. Growth does not move existing points.
6. A layout-version migration is explicit and never presented as historical movement.
7. WITHHELD artifacts never enter the coordinate function used by member-facing geometry.
8. A founder-owned withdrawal may leave a labeled trace at the same coordinate; a third-party withdrawal leaves none.

This is sufficient to make LA30-F11 testable before any visual engine exists.

## 7. Falsifier defeat candidates

- **F1 Decorative scale:** renderer accepts only admitted catalogue records; no free point constructor.
- **F2 Collapsed darkness:** fixtures separately exercise uncatalogued haze, sealed-self point and known-gap darkness.
- **F3 Recommended thread:** no ranking input exists in thread rendering API.
- **F4 Completion pressure:** no progress/completion concept exists in archive journey state.
- **F5 Narrated awe:** MAIA archive guide contract forbids scale claims beyond catalogue evidence.
- **F6 Wandering penalized:** `stay_with_field` is a first-class lawful state, not an abandonment state.
- **F7 Granularity inflation:** one source object produces one point regardless of sub-artifact count.
- **F8 Performed haze:** v1 haze has uniform visual intensity and no quantity-bearing parameter.
- **F9 Shadow disclosure:** withheld fixtures produce zero render records and zero coordinate material.
- **F10 Telemetry drift:** thread selection changes no URL/path/query and triggers no network request.
- **F11 Coordinate drift:** adding unrelated artifacts leaves every pre-existing `coord_v1` unchanged.

## 8. Gate before implementation

The Dark Field remains **not buildable** until:

1. founder ratifies or revises the layered entry policy;
2. LA-27, LA-28 and LA-29 standing is explicitly ruled;
3. the Source Vault schema can represent object/sub-artifact, sealed/withheld and known-gap distinctions;
4. the eleven falsifiers have executable fixtures against a reference candidate.

**Standing after this record:** LA2 gaps materially closed as candidate; telemetry infrastructure audited; coordinate contract specified; falsifier defeats authored; entry model still provisional; no runtime build authorized.
