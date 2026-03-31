---
document: agents
project: "Familienzentrale"
version: 2.0.0
status: Draft
last-updated: "2026-03-31"
depends-on:
  - constitution.md v2.0.0
supersedes: agents.md v1.0.0/v2.0.0
---

# Builder Agent Instructions — Lovable

> You are an AI code generation agent working inside Lovable.
> You build Familienzentrale by following specs exactly.
> When in doubt, read the constitution. When still in doubt, ask the PM.

---

## 1. Identity

- **Builder tool:** Lovable
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime)
- **Frontend:** React + shadcn/ui + Tailwind CSS + Framer Motion
- **Build mode:** Production
- **Language:** TypeScript (strict mode)
- **Locale:** DE primary, EN secondary

---

## 2. File Reading Order (Before Every Task)

1. `.sdd/constitution.md` v2.0.0
2. `.sdd/spec-amendments-v2.md` (amendments to existing specs)
3. The specific spec file for the current task
4. `docs/design-tokens.md` v2.0.0
5. `docs/design-constraints.md` v2.0.0
6. `docs/api-contracts.md` (for endpoint contracts)
7. `docs/lovable-builder-prompt.md` (quick reference)
8. `.sdd/specs/M-1-monetization.md` (tier gate check)

---

## 3. Task Execution

### Per-Task Workflow

1. Read the task from `.sdd/tasks.md`
2. Read the referenced spec + amendments
3. Check: does this feature require a subscription tier? (M-1)
4. Implement following acceptance criteria exactly
5. Run the Interaction Defaults Checklist:
   - [ ] FAB present on the page
   - [ ] All items clickable
   - [ ] Skeleton loaders on async content
   - [ ] All four states (loading, empty, error, success)
   - [ ] Animations on all state changes
   - [ ] Responsive at 768px and 375px
   - [ ] All strings in t()
   - [ ] All colors from Tailwind config
   - [ ] Touch targets ≥ 44px
6. Verify the page at 768px (iPad portrait) first, then 375px
7. If the file exceeds 300 lines, extract sub-components
8. Mark task `[x]` in tasks.md
9. Commit: `feat: [TASK-ID] [description]`

### Handover Tests

At the end of each wave, a HANDOVER TEST verifies:

| Check | How to verify |
|-------|--------------|
| Spec match | Every AC in the spec is implemented |
| States | Loading, empty, error, success all render correctly |
| Animations | Entrance, exit, completion animations work |
| Calendar interactions | Click, drag, quick-create all work (if calendar) |
| Responsive | No overflow at 768px or 375px |
| i18n | Toggle to EN, verify all strings switch |
| Tier gates | Free tier shows upgrade prompt where appropriate |
| FAB | Visible and functional on the page |

---

## 4. Supabase Patterns

### When to use direct client queries
- Simple SELECT, INSERT, UPDATE, DELETE on a single table
- RLS policies handle access control
- No multi-table transaction needed
- No server-side secrets needed

### When to use Edge Functions
- Task completion (gamification transaction — multiple tables)
- Child authentication (username + PIN — custom logic)
- AI API calls (Claude — requires API key)
- Email processing (inbound email parsing)
- Scheduled jobs (nudge evaluation, routine generation)
- Gold spending (atomic balance check + deduction)
- Any operation where the client should not be trusted

### Edge Function Template

```typescript
// supabase/functions/[function-name]/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { taskId, userId } = await req.json();

    // Validate input with Zod
    // Execute business logic
    // Return result

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: "INTERNAL", message: error.message } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

---

## 5. Component Patterns

### Page Component Structure

```typescript
// Max 300 lines. If longer, extract sections into sub-components.
export default function ParentHome() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery(/* ... */);

  if (isLoading) return <HomeSkeletonLoader />;
  if (error) return <ErrorState message={t('error.loadFailed')} onRetry={refetch} />;
  if (!data?.length) return <EmptyState title={t('home.empty.title')} cta={t('home.empty.cta')} />;

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Content with staggered entrance */}
    </motion.div>
  );
}
```

### Card Component Pattern

```typescript
// Every card: tappable, has primary action, has entrance animation
<motion.div
  variants={slideUp}
  className="bg-surface rounded-xl border border-border p-4 shadow-sm
             hover:shadow-md transition-shadow cursor-pointer"
  onClick={() => onItemClick(item)}
>
  {/* Left accent border for priority */}
  {/* Content */}
  {/* Inline action (checkbox, button) — stops propagation */}
</motion.div>
```

---

## 6. Naming Conventions (Quick Reference)

- Components: `PascalCase.tsx`
- Hooks: `use[Name].ts`
- Services: `camelCase.ts`
- Edge Functions: `kebab-case/index.ts`
- DB tables: `snake_case` plural
- DB columns: `snake_case`
- i18n keys: `section.subsection.key`
- Tailwind custom classes: from design tokens config

---

## 7. Boundaries (Quick Reference)

### Always Do
- shadcn/ui for components, Framer Motion for animations
- Tailwind tokens for colors/typography
- t() for all strings
- Zod for validation
- Skeleton loaders (never lone spinners)
- FAB on every page
- Animation on every state change

### Ask First
- Schema changes beyond spec
- New dependency
- New Edge Function
- Auth logic changes
- Tailwind config changes

### Never Do
- Use MUI or Radix directly
- Use Express or any server framework
- Hardcode colors or hex values
- Skip states (loading/empty/error/success)
- Skip animations
- Skip FAB
- Make list items non-clickable
- Use polling instead of Realtime
- Put business logic in components
- Make XP ledger mutable
- Show subscription UI to children

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial agents (Replit) | PM + VEGA |
| 2.0.0 | 2026-03-31 | Complete rewrite for Lovable/Supabase | PM + Atlas |
