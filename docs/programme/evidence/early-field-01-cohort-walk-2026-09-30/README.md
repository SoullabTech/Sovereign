# EARLY-FIELD-01 real-stack cohort witness

Date: 2026-09-30

The witness used the real Mac Studio Next stack and a disposable PostgreSQL
database with two synthetic members.

With `EARLY_FIELD_ENABLED=true` and only member A listed:
- admitted A saw the R1R3 instrument;
- authenticated non-cohort B did not;
- B retained the ordinary Living Field and authored dimension access;
- query-string and localStorage spoof attempts did not grant the instrument;
- ordinary dimension entry did not auto-start MAIA.

Result: **9/9 passed.**

The server was then restarted with `EARLY_FIELD_ENABLED=false` while the
listed member remained configured. The instrument disappeared while the room
and authored dimension remained accessible.

Rollback result: **4/4 passed.**

No production/member content was used. These are pre-deployment witnesses only.
