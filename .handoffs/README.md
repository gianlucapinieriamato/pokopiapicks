# Handoff system

This folder tracks work sessions and progress across Claude Code conversations.

## How it works

- `CURRENT.md` — single source of truth for "where we are right now". Updated at every session boundary. Always read this first when resuming work.
- `history/` — append-only log of completed sessions. One file per sub-phase. Filename format: `YYYY-MM-DD-HHMM--<kebab-slug>.md`. Never modify a history file after creation — they're the project's audit trail.

## When to read

- **Resuming work:** always read `CURRENT.md`. Read history files only if `CURRENT.md` references one or if you need context on a specific past decision.
- **Reviewing project history:** browse `history/` chronologically.
- **Debugging "why did we decide X":** grep `history/` for the decision.

## When to write

When a sub-phase ends (or when context is running low), invoke the `handoff` skill:

1. Append a new file to `history/` documenting the session.
2. Overwrite `CURRENT.md` with the new pointer.
