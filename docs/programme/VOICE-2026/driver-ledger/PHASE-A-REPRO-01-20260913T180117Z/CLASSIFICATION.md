# PHASE-A-REPRO-01-20260913T180117Z — PRE-INSTALL · SUBJECT MISMATCH · NOT COUNTED

**Classification (session, 2026-09-14; founder-confirmed facts):** this batch was started at 18:01:17Z on
2026-09-13 with `--subject phase-a` **before repro subject R1 had been installed**. The newest reinstall
record on the device at that moment was `reinstall-20260913T145025Z.txt` — the authorized Stage-B reinstall of
P5-B0 (`24a6fcfa1`, dylib `CC0D3604-…`, 13-step subject). The reinstall line that precedes the batch in the
ruling (repro plan §12) had not been run; the founder started the batch directly.

Consequence: every journal this batch produced was recorded from the **P5-B0 install** under a **Phase-A
subject label**. By the closed classifier those rows are `SUBJECT-MISMATCH` (or, where the driver failed,
infrastructure rows) — none is an R1 sample, and none is a P5-B0 sample either, because the batch declared
a different subject than the one it drove. They are not pooled with any stratum.

The batch was not running when the founder checked (it had ended on its own or been stopped; which is
UNKNOWN and not reconstructed). Its ledger, journals and logs are preserved unaltered as a record of the
sequencing error. **Nothing in this directory is deleted, edited, or counted.**

Lawful R1 execution followed the reinstall records `reinstall-20260914T011645Z.txt` and
`reinstall-20260914T011754Z.txt` (both R1, custody MATCH ×3) and is ledgered as
`PHASE-A-REPRO-01-20260914T011819Z`.
