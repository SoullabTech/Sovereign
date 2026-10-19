# Cabin 0.5.3 conversation continuity

The prior active-conversation reader selected the oldest 500 rows before taking the last 12 for MAIA. Once a conversation exceeded 500 turns, newer exchanges could be omitted from both the display and subsequent model context.

The Cabin adapter now selects the newest 500 rows belonging to the fixed local owner and selected session, then restores chronological order. Equal timestamps retain insertion order. Model context remains bounded to the latest 12 turns with up to 4,000 characters per earlier turn; no other conversation, manuscript, chart or recall source is added. The room explains this limit. Sanctuary continues using its temporary in-memory turns and canonical per-turn persistence refusal.

Two in-memory SQLite tests pass: a 520-turn fixture with foreign-owner and foreign-session rows proves newest-window selection, and equal-time fixtures prove ordering and bounded context. Packaged fictional-data regression covers actual local MAIA correction, Apply/Undo, export, reopening and interruption; Sanctuary regression covers private context, non-persistence and exit/quit recovery.

This repairs context selection, not full MAIA orchestration or token-level context fitting. Full-platform rooms, physical audio acceptance and unattended Jarvis execution remain unfinished.

The first Sanctuary run stopped at the draft-preservation assertion because the fictional draft had an unexpected extra character. No privacy acceptance was inferred from that run; the unchanged test was repeated.
