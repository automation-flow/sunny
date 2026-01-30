# Sunny ERP - Claude Instructions

## MANDATORY: Read Before Any Work

1. **Read hooks first**: `documentation/CLAUDE_HOOKS.md`
2. **Read project context**: `documentation/sunny_implementation_plan.md`

## Quick Rules

- **Soft delete only** - Use `deleted_at` timestamp, never hard delete
- **Filter deleted** - Always add `deleted_at IS NULL` to queries
- **Update docs** - After every change, update `sunny_implementation_plan.md`
- **Verify builds** - Run `npx tsc --noEmit` and `npm run build` after changes

## Post-Task Checklist (ALWAYS DO THIS)

```bash
npx tsc --noEmit  # TypeScript check
npm run build     # Build verification
```

Then update `documentation/sunny_implementation_plan.md` with:
- What changed
- Files modified
- Any issues/solutions discovered

## Tech Stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL + Auth)
- TypeScript
- Tailwind CSS + shadcn/ui
- Recharts (analytics)

## Key Files

| Purpose | Location |
|---------|----------|
| Database schema | `supabase/schema.sql` |
| Full project spec | `documentation/sunny_implementation_plan.md` |
| Workflow hooks | `documentation/CLAUDE_HOOKS.md` |
| Types | `types/index.ts` |
