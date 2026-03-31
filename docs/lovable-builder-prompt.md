# Familienzentrale v2 — Lovable Builder Master Prompt

You are building Familienzentrale from scratch — a tablet-first family
operating system with Habitica/Duolingo-level gamification. There is
NO existing codebase. This is a Production-grade greenfield build
using Lovable + Supabase.

## CRITICAL: Read These Files Before EVERY Task

1. `.sdd/constitution.md` v2.0.0 — Non-negotiable architectural rules (Lovable/Supabase/shadcn stack)
2. `.sdd/agents.md` — Your operational instructions
3. `.sdd/tasks.md` — The ordered task list. Work top-to-bottom.
4. The specific spec file referenced in the task
5. `docs/design-tokens.md` v2.0.0 — All colors, spacing, typography, animation values
6. `docs/design-constraints.md` v2.0.0 — All UI rules including MANDATORY interaction defaults
7. `docs/api-contracts.md` — Supabase RPC + Edge Function contracts
8. `.sdd/specs/S-3-ENHANCED-gamification-animation.md` — Read before ANY gamification task
9. `.sdd/spec-amendments-v2.md` — All amendments to existing specs
10. `.sdd/specs/M-1-monetization.md` — Subscription tier gates

## Architecture Rules (Constitution v2)

- **shadcn/ui** is the ONLY component library. No MUI, no Radix direct, no Chakra.
- **Tailwind CSS** for ALL styling. Custom config with design tokens. No arbitrary hex values.
- **Framer Motion** for ALL animations. No CSS transitions for interactive elements.
- **Supabase** is the backend. No Express, no custom server.
- **Supabase Edge Functions** for complex logic (gamification, AI, scheduled jobs).
- **Supabase client** for simple CRUD with Row Level Security.
- **Supabase Realtime** for live sync (shopping list, notifications). NOT polling.
- **Supabase Storage** for file uploads (photos, images).
- **Web Audio API** for all gamification sounds. Procedural synthesis.
- **DM Sans** font. Loaded from Google Fonts.
- All user-facing strings wrapped in `t()` for i18n (DE primary, EN secondary).
- All forms use React Hook Form + Zod.
- Page components max 300 lines. Extract sub-components beyond that.
- XP is NEVER spent. Gold is the spendable currency. Separate systems.
- points_ledger is append-only. NO UPDATE or DELETE.

## Mandatory Interaction Defaults — CHECK EVERY PAGE

Before marking any page task complete, verify ALL of these:

1. [ ] FAB visible (bottom-right, opens quick-create menu)
2. [ ] All list items are clickable (open detail or trigger action)
3. [ ] All cards have inline primary action (checkbox, expand, etc.)
4. [ ] Skeleton loaders during async data fetch (never spinners alone)
5. [ ] Empty state with illustration + heading + CTA
6. [ ] Error state with friendly message + retry button
7. [ ] Entrance animations on all content (stagger slideUp)
8. [ ] Exit animations on removed items (fadeOut)
9. [ ] Optimistic updates on mutations
10. [ ] Undo support on destructive actions (toast with undo, 5s)
11. [ ] Responsive at 768px (tablet) AND 375px (phone)
12. [ ] All strings in t() for i18n
13. [ ] All colors from Tailwind config tokens (no hardcoded hex)
14. [ ] Touch targets ≥ 44px

## Calendar Specific — CRITICAL

The calendar is the core feature. Every calendar view must have:

1. [ ] Items are CLICKABLE → open detail popover with edit/delete
2. [ ] Items are DRAGGABLE → drag to new day/person = reschedule/reassign
3. [ ] Empty cells are TAPPABLE → quick-create popover with date pre-filled
4. [ ] Conflict indicator (red dot) on overlapping events
5. [ ] Time block bands render BEHIND items (lower z-index)
6. [ ] Baby members visible with pacifier avatar
7. [ ] Today highlighted with primary-light background
8. [ ] Swipe gestures for day navigation on phone
9. [ ] Pull-to-refresh

## Gamification — The Dopamine Loop

The task completion animation sequence is the PRODUCT. Get this right:

```
T+0ms     Haptic + Checkbox morph (spring, 300ms)
T+200ms   Sound: playComplete() (±2 semitone)
T+300ms   Card pulse + glow
T+350ms   "+{n} XP" popIn + "+{n} Gold" popIn
T+500ms   First-of-day? → Streak flame + sound
T+600ms   XP bar progressFill (500ms)
T+900ms   20% chance: Treasure chest bounceIn → open → reveal
T+1100ms  Level-up? → Full-screen overlay + confetti + sound
T+1200ms  Card strikethrough + fadeOut + slide to completed
```

## Two Distinct UIs — Role-Aware

**Parent/Adult:**
- Background: #FBF7F0 (warm linen)
- CTA: #4E6E5D (forest sage)
- Nav: Home, Calendar, Tasks, Rewards, Settings
- Week matrix default, Family Board on Home
- Professional-warm tone

**Child:**
- Background: #FFF8EB (honey tint)
- CTA: #FF6B35 (orange — NOT green)
- Nav: My Day, Quests, Progress, Rewards
- Quest cards with XP badges, creature companion
- Game-like, encouraging language

## Subscription Tier Awareness

Every feature has a tier gate. Check M-1 spec before implementing:
- Free tier features: always accessible, no upgrade prompt on core actions
- Family tier features: show upgrade prompt where feature would be
- Family+ features: show teaser/upgrade prompt
- Server-side: RLS policies + Edge Function checks enforce tiers
- NEVER show pricing UI to children

## Supabase Patterns

### Simple CRUD (frontend)
```typescript
// Fetch
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('family_id', familyId);

// Create
const { data, error } = await supabase
  .from('tasks')
  .insert({ title, family_id, xp_value, assigned_to_user_id })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('tasks')
  .update({ title: newTitle })
  .eq('id', taskId)
  .select()
  .single();
```

### Edge Function call (complex logic)
```typescript
// Task completion with full gamification
const { data, error } = await supabase.functions.invoke('complete-task', {
  body: { taskId, userId }
});
// Returns: { xpAwarded, goldAwarded, leveledUp, dropEvent, streakCount, ... }
```

### Realtime subscription
```typescript
supabase
  .channel('shopping-list')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'shopping_items',
    filter: `list_id=eq.${listId}`
  }, (payload) => {
    // Update local state
  })
  .subscribe();
```

## Before Adding ANY Dependency

If the task requires a package not in constitution.md Approved Libraries:
1. State what it does
2. State why an approved library cannot do it
3. STOP and ask for PM approval

## Workflow Per Task

1. Read task description + referenced spec(s)
2. Check constitution v2 + design-constraints v2
3. Check spec-amendments-v2 for any amendments to the spec
4. Check M-1 for tier requirements
5. Implement following acceptance criteria exactly
6. Verify interaction defaults checklist (above)
7. Test at 768px AND 375px
8. Commit: `feat: [TASK-ID] [description]`
