---
name: handoff
description: Use whenever a work session ends — either because a sub-phase is complete, context is running low, or the user signals end of session. Appends a timestamped record to `.handoffs/history/` and updates `.handoffs/CURRENT.md` so the next conversation can resume cleanly.
---

# Session handoff protocol

This skill is used at the boundary between conversations to preserve state and build a permanent changelog.

## When to invoke

Trigger this skill in these situations:

- **End of a sub-phase** (Tier 1.1, 1.2, etc. from `pokopia-wiki-plan.md`) — always, even if context is fine.
- **Context running low** — when your context window is meaningfully consumed and you'd start losing fidelity.
- **User signals end of session** — phrases like "let's continue tomorrow", "stop here", "good for now".
- **Before any destructive operation that might lose state** — e.g., before suggesting the user reset something.

## What to do

### Step 1 — Gather state

1. Read current `.handoffs/CURRENT.md` for the prior state.
2. Identify which sub-phase just completed by checking `pokopia-wiki-plan.md`.
3. Get git context: `git log --oneline -20` and `git status` and `git diff --stat HEAD~5..HEAD` (or whatever range covers this session's commits).

### Step 2 — Append history entry

Create a new file at `.handoffs/history/{YYYY-MM-DD-HHMM}--{kebab-slug}.md` where:

- `{YYYY-MM-DD-HHMM}` is current UTC timestamp
- `{kebab-slug}` is a short kebab-case description (e.g., `tier-1-2-specialties`, `tier-1-5-pokemon-details`, `context-low-mid-tier-1-4`)

Use the template at `.claude/skills/handoff/handoff_template.md`. **Do NOT modify existing history files** — they are immutable record.

### Step 3 — Update CURRENT.md

Overwrite `.handoffs/CURRENT.md` with:

```markdown
# Current state

**Last updated:** {timestamp}

## Where we are

{One-paragraph summary of project state right now.}

## Next sub-phase

{X.Y from pokopia-wiki-plan.md, with name.}

## Most recent handoff file

`.handoffs/history/{filename just created}`

## Open questions for the user

{Any pending questions. Or "none".}

## Active warnings or gotchas

{Anything the next Claude needs to know that isn't in the plan. Examples: a flaky Serebii endpoint, a decision pending user input, a half-done refactor. Or "none".}
```

CURRENT.md should be SHORT — under 30 lines typically. It's a pointer, not a summary of work done. Work-done summaries go in the history file.

### Step 4 — Surface to user

After writing both files, give the user a clear message:

- **Session ending naturally:** "Handoff written to `.handoffs/history/{filename}`. CURRENT.md updated. Open a new Claude Code conversation when ready — it'll pick up automatically."
- **Context low:** "I'm running low on context — recommend handing off here. State is saved at `.handoffs/CURRENT.md`. Start a new conversation and say 'resume from handoff'. Do NOT continue this conversation past this point — quality will degrade."

## What NOT to do

- Don't write handoff files silently — always tell the user what was written and what to do next.
- Don't continue working after writing a low-context handoff. Stop.
- Don't summarize the handoff content in chat — that defeats the point. Point the user to the files.
- Don't modify files in `.handoffs/history/` after creation. They're immutable.
- Don't skip the timestamp on history filenames — it's how chronology is preserved.

## When resuming a conversation

If `.handoffs/CURRENT.md` exists:

1. Read it FIRST, before `CLAUDE.md` or `pokopia-wiki-plan.md`.
2. Read `CLAUDE.md` and `pokopia-wiki-plan.md` for full context.
3. Optionally: if `CURRENT.md` references "active warnings" or "open questions" that need context, read the most recent handoff file in `history/`.
4. Echo back to the user a one-paragraph summary of "where we are" and "what's next." Wait for user confirmation before doing work.

If `.handoffs/CURRENT.md` does NOT exist, this is the first session. Initialize the system:

- Create `.handoffs/` and `.handoffs/history/` folders.
- Create `.handoffs/README.md` (template in this skill's folder).
- Create initial `.handoffs/CURRENT.md` pointing to the first sub-phase of the plan.
- Then proceed normally.
