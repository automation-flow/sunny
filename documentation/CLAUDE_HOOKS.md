# CLAUDE HOOKS - Sunny Project

## Core Principle
Claude is already smart. These hooks provide guardrails and reminders, not detailed specifications. All project-specific details live in `sunny_implementation_plan.md`.

---

## 1. MANDATORY SKILLS

**Always read the relevant skill BEFORE starting work:**

| Task Type | Skill to Read |
|-----------|---------------|
| UI/Frontend work | `/mnt/skills/public/frontend-design/SKILL.md` |
| Complex React artifacts | `/mnt/skills/examples/web-artifacts-builder/SKILL.md` |

**No architecture/backend/finance skills exist in the system.** For these domains, rely on `sunny_implementation_plan.md` which contains all project-specific business logic, database schemas, and financial calculations.

---

## 2. PRE-TASK HOOKS

Before ANY code change:

1. **Read `sunny_implementation_plan.md`** - Contains:
   - Database schema & relationships
   - API endpoint specifications
   - Business logic & calculations (partner balance formula, VAT, etc.)
   - Design system colors & patterns
   - Project structure
   - Known issues & troubleshooting

2. **Check existing code** - Avoid duplicating components or patterns that already exist.

---

## 3. POST-TASK HOOKS

After EVERY significant change:

### 3.1 Verify
```bash
npx tsc --noEmit  # TypeScript check
npm run build     # Build verification
```

### 3.2 Update Documentation

**CRITICAL: Update `sunny_implementation_plan.md` with:**

- New components/files created
- Database schema changes
- API changes
- Bug fixes & solutions
- Architecture decisions
- Any new insights about the codebase

**Format for updates:**
```markdown
## [Date] - [Change Summary]

### Changes Made:
- [List of changes]

### Files Modified:
- `path/to/file` - [what changed]

### Notes:
[Important context for future reference]
```

---

## 4. ARCHITECTURE RULES

These rules are NON-NEGOTIABLE:

| Rule | Reason |
|------|--------|
| Soft delete only (`deleted_at`) | Data integrity, audit trail |
| Filter `deleted_at IS NULL` | Never show deleted records |
| React Query for server state | Consistent data fetching |
| Single source of truth | All specs in implementation plan |

---

## 5. CONTEXT PRESERVATION

When conversation resets, Claude loses context. The `sunny_implementation_plan.md` is the **single source of truth** that must be:

1. **Read at session start** - To understand current state
2. **Updated after changes** - To preserve knowledge for future sessions

**What to preserve:**
- Working solutions to problems
- Architecture decisions with rationale
- Integration details
- Edge cases discovered
- Current project status

---

## Quick Reference

```
┌─────────────────────────────────────────────────┐
│  START OF TASK                                  │
│  1. Read frontend-design skill (if UI work)     │
│  2. Read sunny_implementation_plan.md           │
├─────────────────────────────────────────────────┤
│  END OF TASK                                    │
│  1. Run tsc + build                             │
│  2. Update sunny_implementation_plan.md         │
└─────────────────────────────────────────────────┘
```
