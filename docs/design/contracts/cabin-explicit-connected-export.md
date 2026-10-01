---
room: Cabin Explicit Connected Export
human_activity: deliberately exporting a chosen continuity envelope into a portable Cabin artifact
surfaces:
  - lib/cabin/connectedContextExport.ts
  - lib/cabin/__tests__/connectedContextExport.test.ts
change_class: architecture
principles:
  - ONE_COMMAND — one explicit invocation joins assembly and writing
  - ASSEMBLY_SINGLETON — H3.4 remains the only connected source assembler
  - WRITER_SINGLETON — H3.3 remains the only artifact writer
  - FAIL_BEFORE_WRITE — selection rejection happens before any artifact write
  - NO_AUTOMATION — the command has no trigger or scheduling authority
reference_surfaces:
  - docs/design/contracts/cabin-connected-export-assembly.md
  - docs/design/contracts/cabin-context-export.md
shared_with_house: explicit member choice and authority-preserving continuity
distinct_to_room: this is the command seam that makes an explicit connected export operational without creating a new source or storage authority
---

# Cabin Explicit Connected Export — Architecture Contract

## The command

H3.5 composes two already-governed operations:

    H3.4 assembly → H3.3 writer

It does not reimplement either operation.

## Failure ordering

The assembly must complete before the writer is invoked.

Therefore:

- invalid selection → no writer call;
- foreign source → no writer call;
- rejected memory → no writer call;
- malformed selection → no writer call.

Only a fully governed H2.4 package reaches H3.3.

## Empty export

An explicit empty selection is valid.

It produces the ordinary H2.4 empty package through H3.3.

No discovery occurs to fill the empty selection.

## What the command cannot do

The command cannot:

- discover current or recent material;
- rank memories;
- infer relationships;
- choose manuscripts;
- synthesize meaning;
- add identity;
- write to canonical sources;
- create another artifact format;
- synchronize;
- schedule itself;
- remount the Cabin;
- invoke MAIA cognition.
