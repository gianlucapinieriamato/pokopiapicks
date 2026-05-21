# Overnight unsupervised run — instructions

## Context

Pre-deploy project, no users, no critical data. Prioritize progress over caution.

## Phase 0 — Pre-flight (BEFORE any plan work)

### Initial reading

1. `.handoffs/CURRENT.md` if exists
2. `CLAUDE.md`
3. `pokopia-wiki-plan.md`
4. `.claude/skills/handoff/SKILL.md`
5. Repo state: `git status`, `git log --oneline -10`, `git branch`

### Configuration checks

1. `.gitignore` covers `/scripts/cache/`. Add if missing.
2. Git auto-commit works (test with dummy commit/revert).
3. Current branch. If `main`/`master`, recommend `feat/tiers-1-and-beyond`.
4. `python3 --version` + `requests` available.
5. `node --version` + `npm --version`.
6. Verify Vercel MCP is connected and functional. Test with a non-destructive command (list projects, get user info). If MCP is broken, treat Phase 3.4 as blocked and continue with Tier 3.
7. Confirm `index.html` is Tier 0 version (i18n, mirrored icons, "goes well with").
8. List existing `/data/` files if any.

### Questions to surface

List anything ambiguous. Examples:

- UX decisions for Tier 3 not covered by plan
- Tier 4 algorithm decisions
- Slug naming conventions for edge cases
- shadcn/ui vs vanilla Tailwind for Tier 3
- Whether to add tests
- Vercel project visibility preference (public/private)

### Pre-flight output format

```
## Pre-flight Report

### Repo state
- Branch / Last commit / Uncommitted changes / CURRENT.md status

### Config checks
- Each item: ✓/✗ with action if ✗

### Risks identified
- [bullets]

### Questions for the user
1. [Question] — Default if no answer: [proposal]

### Plan summary
[Estimated sub-phases, blockers]
```

STOP and wait for user approval before starting work.

## Working mode (after pre-flight approved)

### Rules

1. Plan's "pause between sub-phases" rule is SUSPENDED. Advance continuously.
2. Execute handoff skill at end of every sub-phase (history entry + CURRENT.md).
3. Granular commits, one per sub-phase, descriptive English messages.

### Known blockers

None. Vercel MCP is connected, so deploy in Phase 3.4 can run autonomously. If the MCP fails for any reason, document and skip — Tier 3 still works on `npm run dev` locally.

### Decision protocol

**Minor (default-resolvable):** take conservative option, document explicitly in history entry (what found, decision, alternatives, reasoning).

**Major (architectural):** use judgment. For Tier 3/4 UI: match current `index.html` style (Fraunces + DM Mono + Nunito, warm cozy palette).

**Tier 4 Matchmaker scoring:**

- Base: shared items in `categories`
- Multiplier: +50% if specialties are different (complementary)
- Hard filter: same `habitat`
- Adjust formula with judgment, document changes

**Edge cases:**

- Regional variants/forms: separate Pokémon entries, slugs follow icon filename pattern
- Unusual slugs (apostrophes, parens): kebab-case URL-safe
- Serebii 404s: retry 3x with backoff, log, continue
- Broken cross-references in validation: re-scrape page; if still broken, document and exclude

### Chat progress reports

After each sub-phase:

```
✓ Sub-phase X.Y complete
   Summary: [one line]
   Next: X.Z
```

### Stop conditions

Stop when:

1. End of plan (Tier 4 sub-phase 4.3) reached
2. Vercel MCP failed AND everything else done
3. Context significantly degraded
4. Real blocker no default resolves

In any stop:

- CURRENT.md reflects actual state
- Last history entry explains why stopped
- Final chat message clear about what's done and what remains
