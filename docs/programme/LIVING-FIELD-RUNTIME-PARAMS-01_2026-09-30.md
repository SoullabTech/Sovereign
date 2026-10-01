# LIVING-FIELD-RUNTIME-PARAMS-01
Date: 2026-09-30
Base: auth convergence commit `fe8806d28`
Status: implementation witnessed; merge/deploy not authorized

## Trigger

The real-stack witness after auth convergence proved that session-backed identity
now reaches the dynamic Living Field routes. That immediately exposed the next
inherited failure: every `[fieldKey]` handler still treated Next route params as
a synchronous object.

On the current Next runtime, `params` is a Promise. The server emitted the
runtime warning that `params.fieldKey` must be unwrapped before use. The
observable consequences included:

- detail GET returning a misleading 200 gathering stub for an undefined key;
- sources and field PATCH attempting to write a NULL `field_key`;
- encounter open failing after authentication had already succeeded;
- consent operations using an undefined field key.

This defect predates the auth repair and is independent of it.
## Repair law

> A dynamic Living Field route must unwrap its route parameters before using
> them. No field operation may proceed with an undefined route identity.

Six dynamic route files are in scope:

- `[fieldKey]/route.ts`
- `[fieldKey]/gathering/route.ts`
- `[fieldKey]/sources/route.ts`
- `[fieldKey]/refine/route.ts`
- `[fieldKey]/consent/route.ts`
- `[fieldKey]/encounter/route.ts`

Each handler now declares `params: Promise<{ fieldKey: string }>` and reads
the key only through `await params`. A dedicated falsifier covers the full
six-file surface and rejects synchronous reads.

## Witness

Before the repair the falsifier failed 12 of 13 assertions. After the repair it
passes 13/13.

A real browser walk then exercised the repaired routes through the actual
sanitized proxy, real Next handlers, and a disposable PostgreSQL database.
It passed 24/24 checks, including detail, gathering, sources, refine, consent,
states, spirals, field PATCH, encounter open, encounter member mark, and
encounter close.

The witness also confirms a separate consent question remains: opening a
dimension automatically starts a MAIA encounter once the route is functional.
This record does not authorize changing that behavior.
