---
document: spec-master-amendments
title: "Master Spec Amendments — All Journeys v2"
project: "Familienzentrale"
version: 2.0.0
status: Draft
last-updated: "2026-03-31"
author: "PM + Atlas"
applies-to: All existing journey specs
read-with: constitution.md v2.0.0, design-constraints.md v2.0.0, design-tokens.md v2.0.0
---

# Master Spec Amendments v2

> This document contains ALL amendments to ALL existing specs.
> The builder MUST read this document alongside any journey spec.
> Amendments are organized by journey ID.
> 
> **Global changes that apply to EVERY spec** are in Section 0.
> Journey-specific changes follow in Sections 1-24.

---

## Section 0: Global Amendments (Apply to ALL Specs)

These changes apply to every single journey spec. Do not repeat
them in each section — they are universal.

### 0.1 Stack References

REPLACE all references to:
- "MUI" → "shadcn/ui"
- "MUI Typography" → "Tailwind text classes"
- "MUI Box/Grid" → "Tailwind flex/grid"
- "MUI theme" → "Tailwind config tokens"
- "MUI DatePicker / TimePicker" → "shadcn/ui date picker"
- "MUI Select" → "shadcn/ui Select"
- "MUI Dialog" → "shadcn/ui Dialog"
- "Mobiscroll" → "shadcn/ui date picker"
- "Express" → "Supabase Edge Function" (for server logic)
- "Drizzle ORM" → "Supabase JS Client"
- "API endpoint" → "Supabase RPC or Edge Function" (for complex) or "Supabase client query" (for simple CRUD)
- "polling on 30-second interval" → "Supabase Realtime subscription"
- "session cookie" → "Supabase Auth session" (adults) or "custom JWT" (children)

### 0.2 Mandatory Interaction Defaults

ADD to every spec's acceptance criteria (if not already present):

- **AC-GLOBAL-01:** The FAB shall be visible on this screen with quick-create options (Task, Event, Routine, Board Note).
- **AC-GLOBAL-02:** All list items on this screen shall be tappable — opening detail view or triggering primary action.
- **AC-GLOBAL-03:** All async data on this screen shall show skeleton loaders (not spinners) during fetch.
- **AC-GLOBAL-04:** All mutations on this screen shall use optimistic updates with undo toast (5s) for destructive actions.
- **AC-GLOBAL-05:** All content sections shall use Framer Motion stagger slideUp entrance animations.
- **AC-GLOBAL-06:** Pull-to-refresh shall be supported on all scrollable views.
- **AC-GLOBAL-07:** This screen shall be responsive at 768px (tablet) and 375px (phone) with no horizontal overflow.
- **AC-GLOBAL-08:** Task cards must display: assignee name (resolved from family_members), priority label text ("Hoch"/"Normal"/"Niedrig") alongside the color accent, and be fully tappable to open a detail/edit dialog.
- **AC-GLOBAL-09:** Photo-required tasks must prompt for photo proof before allowing completion.

### 0.3 Subscription Tier Gates

ADD to every spec that contains gated features:
Reference M-1-monetization.md for which features require which tier.
Implement both client-side gate (hide/show upgrade prompt) and
server-side gate (RLS policy or Edge Function check).

### 0.4 Baby Member Visibility

ADD to every spec that shows family members:
Baby members (role=baby) appear in family member lists with a
pacifier avatar. They appear in calendar views with their own
color-coded row. They do NOT have gamification data, login
capability, or child UI access.

### 0.5 Sound and Haptics

ADD to every spec involving task completion or gamification triggers:
Sound effects play via SoundEngine service. Haptic feedback via
Capacitor plugin (when available). Both respect user settings
(toggle + volume in Settings).

### 0.6 Conflict Detection

ADD to every spec that displays calendar items:
Where two or more items for the same family member overlap in time,
display a conflict indicator (red dot, 8px) at the overlap point.
Tap to reveal both conflicting items in a popover.

---

## Section 1: P-1 — Parent Weekly Overview

**Quality assessment:** Good structure, clear ACs. Missing: calendar
item interactions, baby support, conflict detection, drag-and-drop,
quick-create. References Mobiscroll (removed).

### REMOVE Constraints:
```
- DO NOT implement drag-and-drop rescheduling on this journey
- DO NOT build a custom calendar rendering engine — use Mobiscroll
- DO NOT implement real-time updates (WebSocket) — polling sufficient
```

### REPLACE with:
```
- Drag-and-drop IS implemented on this screen (items draggable to
  new day or new person row). See design-constraints §3.
- Calendar views are custom-built with Tailwind + Framer Motion.
- Real-time updates via Supabase Realtime subscription (not polling).
```

### ADD Acceptance Criteria:
- **AC-024:** Baby members visible in week matrix with pacifier avatar.
- **AC-025:** Baby time blocks (nap, daycare) render as terracotta bands.
- **AC-026:** Conflict indicator on overlapping items (red dot, tap to reveal).
- **AC-027:** All calendar items clickable → detail popover (title, time, description, edit/delete).
- **AC-028:** All calendar items draggable → reschedule (new day) or reassign (new person row). Optimistic update + undo toast.
- **AC-029:** Empty cells tappable → quick-create popover with date + person pre-filled.
- **AC-030:** Home dashboard includes: quick stats row (open tasks, completed, streak, gold), weekly summary card, TODAY'S TASKS widget (today's open tasks with inline completion + assignee + priority dot), GROCERY LIST widget (top 5 unchecked items + add field + realtime sync), ACTIVE REWARDS & CHALLENGES widget (cards with progress bars + deadlines), task distribution chart, Pinnwand preview (3 notes).
- **AC-031:** Quick stats row uses cards with large numbers (font-size-xxl, font-weight-extrabold) and labeled metrics.
- **AC-032:** Week view uses Google Calendar-style layout: vertical time axis (06:00–22:00, 30-min slots), days as columns. All-day/no-time items in section ABOVE time grid. Timed items positioned vertically by start/end time, height proportional to duration.
- **AC-033:** Time slot height = 40px per 30 min. Item top = (hour - 6) × 80 + (minute / 30) × 40 px. Min item height: 40px.
- **AC-034:** Current time indicator: thin red horizontal line spanning all columns, updating every minute.
- **AC-035:** Empty time slot tappable → quick-create popover with date + time pre-filled.

### ADD to Success Criteria:
- Parent can create an event from the calendar in under 10 seconds (tap empty cell → type title → submit).

### Subscription tier: Free (core feature)

---

## Section 2: P-2 — Add and Adjust Plans

**Quality assessment:** Good flow, clear ACs. Missing: icon picker default (was heart, should be checkbox), edit form parity with create form, drag-based editing on calendar. References Mobiscroll and FAB without specifying always-visible.

### MODIFY AC-007:
BEFORE: "The system shall use Mobiscroll for all date and time picker inputs."
AFTER: "The system shall use shadcn/ui date picker for all date/time inputs."

### MODIFY AC-008:
ADD: "Default icon for tasks: checkbox (CheckSquare). Default icon for events: calendar (Calendar). NOT heart."

### ADD Acceptance Criteria:
- **AC-012:** The task edit form shall display ALL fields present in the creation form: title, description, icon, due date, start/end time, priority, XP value, assignee, photo required toggle, challenge link. No field may be missing from edit that exists in create.
- **AC-013:** Drag-and-drop on calendar items triggers the same PATCH mutation as the edit form (date + assignee fields). Undo toast shown for 5 seconds.
- **AC-014:** The FAB quick-create menu shall be accessible from EVERY page in the app, not just the calendar or tasks page.
- **AC-015:** When creating a task, the default XP value shall be 10 (not 0 or empty).
- **AC-016:** Task completion is possible directly from the task card (inline checkbox) without opening the detail view. Tapping the checkbox triggers the full dopamine loop.

### Subscription tier: Free (core feature)

---

## Section 3: P-3 — Set Predictable Structure

**Quality assessment:** Complete. Minor: references Mobiscroll pickers.

### MODIFY: Replace all Mobiscroll references with shadcn/ui date picker.

### ADD Acceptance Criteria:
- **AC-020:** When creating a time block for a baby member, the system shall offer "Kita / Daycare" and "Mittagsschlaf / Nap" as pre-filled templates alongside "Schule / School" and "Arbeit / Work".
- **AC-021:** Time blocks shall be reorderable via drag-and-drop in the settings list view.

### Subscription tier:
- Time blocks: Free
- Routines: Family tier

---

## Section 4: P-4 — Manage Rewards and Challenges

**Quality assessment:** Complete. Missing: boss battle visual spec (deferred to S-3-ENHANCED). Gold integration for reward purchasing.

### ADD Acceptance Criteria:
- **AC-023:** Challenges of type "boss_battle" shall display a boss creature SVG silhouette with a health bar. Each qualifying task completion reduces boss HP. When HP reaches 0: celebration animation + bonus XP for all contributors.
- **AC-024:** Rewards can optionally be purchasable with Gold (parent sets Gold price alongside or instead of XP threshold). This creates a "Gold shop" experience for children.

### Subscription tier: Family tier (rewards + challenges are gamification)

---

## Section 5: P-5 — Family Management

**Quality assessment:** Functional but missing baby CRUD, role promotion, and subscription member limits.

### ADD User Stories:
- As a parent, I want to add a baby to the family without credentials.
- As a parent, I want to promote a baby to a child when they're ready.

### ADD Happy Paths:

**Baby Creation:**
1. Parent taps "Add member" → role selection (Adult, Child 6-12, Baby 0-5)
2. Baby form: name only, color picker. No username, no PIN.
3. FamilyMember created with role=baby, managed_by_user_id=current parent.
4. Baby appears in member list with pacifier avatar.

**Baby → Child Promotion:**
1. Parent opens baby profile → "Promote to child" button
2. Form: username (unique) + PIN (4 digits)
3. System creates User record, changes role baby→child, creates ChildPermission defaults, awards creature egg.
4. All existing calendar data preserved.

### ADD Acceptance Criteria:
- **AC-020:** Baby creation: name only, no credentials.
- **AC-021:** Baby avatar: pacifier icon, distinct from child avatars.
- **AC-022:** Promotion: creates User + changes role + awards creature egg.
- **AC-023:** Promotion preserves all calendar data.
- **AC-024:** Member count checked against subscription tier limit before adding.

### Subscription tier: Free (up to 3 members), Family (up to 8), Family+ (up to 12)

---

## Section 6: P-6 — Calendar Sync

**Quality assessment:** Complete but references Express/server architecture.

### MODIFY Architecture:
- Google OAuth flow handled by Supabase Edge Function (not Express routes)
- Token encryption uses Supabase Vault or Edge Function environment variables
- External events stored in Supabase, displayed via Supabase client query
- Sync triggered by Edge Function (manual or scheduled)

### ADD Acceptance Criteria:
- **AC-020:** External (Google) events render with a distinct visual style: dashed border, Google icon badge, read-only. Cannot be edited or deleted within Familienzentrale.
- **AC-021:** External events appear in both week matrix and day view alongside native events.

### Subscription tier: Family tier

---

## Section 7: P-7 — Care-Share

**Quality assessment:** Complete. Lightweight spec (read-only analytics).

### ADD Acceptance Criteria:
- **AC-010:** Care-Share chart uses recharts donut with the warm palette (primary + secondary colors for adults, accent for highlights).
- **AC-011:** Chart must show actual meaningful distribution — not just 100% for one person. If only one adult has data, show a message encouraging partner to contribute.

### Subscription tier: Family+ tier

---

## Section 8: P-8 — Routine Flow Mode

**Quality assessment:** Complete. Well-specced full-screen flow.

### ADD Acceptance Criteria:
- **AC-010:** Flow mode step completion triggers: sound (playFlowStep()), XP popIn for that step, progress bar advance animation.
- **AC-011:** Flow mode completion triggers: playFlowDone() sound, total XP summary, under-time bonus message with celebratory animation.
- **AC-012:** Flow mode is accessible from: the routine detail view AND a direct "Flow starten" button on the child's My Day if a flow-enabled routine is scheduled.

### Subscription tier: Family tier

---

## Section 9: P-9 — Smart Nudge Notifications

**Quality assessment:** Good. Needs push notification upgrade.

### REMOVE Constraint:
```
- DO NOT implement push notifications or email — in-app only
```

### ADD:
- Push notifications for Family/Family+ subscribers via Capacitor or Web Push
- In-app bell notifications for all tiers
- Parents can enable/disable push per child
- Parents can set quiet hours (e.g., 21:00-07:00 no push)

### ADD Acceptance Criteria:
- **AC-030:** Push notifications available for Family/Family+ tiers.
- **AC-031:** Push content matches in-app nudge text.
- **AC-032:** Quiet hours configurable per child.
- **AC-033:** Free tier shows push as upgrade prompt in nudge settings.

### Subscription tier: Family+ tier (smart nudges). Push: Family tier.

---

## Section 10: P-10 — Weekly Family Recap

**Quality assessment:** Complete. Missing: shareable recap card.

### ADD Acceptance Criteria:
- **AC-010:** Recap includes a "Teilen" / "Share" button that generates a summary image (card with family name, week stats, creature status). Suitable for WhatsApp/Instagram sharing.
- **AC-011:** Shared image contains NO personal data (no children's names or photos — only family name + aggregate stats + creature illustration).

### Subscription tier: Family+ tier

---

## Section 11: P-11 — Shopping List

**Quality assessment:** Basic. Missing: visual icons, auto-categorization, real-time sync, drag-to-reorder.

### ADD Acceptance Criteria:
- **AC-010:** Category icon displayed next to each item (auto-matched from name). 8 categories: dairy, produce, meat, bakery, drinks, frozen, household, other.
- **AC-011:** Items auto-grouped by category with section headers.
- **AC-012:** Add field shows auto-complete from family history.
- **AC-013:** Items drag-to-reorder within category.
- **AC-014:** Real-time sync via Supabase Realtime — cross-device update within 1 second.
- **AC-015:** Check-off animation: item slides right with strikethrough, moves to checked section with fadeOut.

### Subscription tier: Free (1 list), Family (multiple lists)

---

## Section 12: P-12 — AI Task Suggestions

**Quality assessment:** Complete. Well-specced privacy boundaries.

### MODIFY: AI API calls via Supabase Edge Function (not Express endpoint).

### Subscription tier: Family+ tier

---

## Section 13: P-13 — Family Board

**Quality assessment:** Complete. Well-specced layout and validation.

### ADD Acceptance Criteria:
- **AC-050:** Board note creation animation: new note slides in from top with popIn. Delete: fadeOut + collapse.
- **AC-051:** Board visible on both parent Home AND child My Day screens.

### Subscription tier: Free (5 notes), Family (unlimited)

---

## Section 14: C-1 — Child Daily Experience

**Quality assessment:** Excellent. Duolingo-inspired, detailed happy path.

### ADD Acceptance Criteria:
- **AC-030:** Quest cards have inline completion checkbox (48px). Tapping checkbox triggers full dopamine loop WITHOUT opening detail view first.
- **AC-031:** Companion creature displayed prominently on My Day (below greeting, above quests). Creature reacts to daily activity: happy when quests done, sleepy when no activity, excited at streak milestones.
- **AC-032:** Gold balance displayed in app bar next to notification bell (coin icon + count).
- **AC-033:** Board note preview section visible below quests (same as parent Home — family-wide notes).

### MODIFY Constraint:
REMOVE: "DO NOT show raw XP numbers without context"
ADD: Show XP numbers WITH context (progress bar + fraction text like "42/100 XP bis Level 5").

### Subscription tier: Free (basic quests + XP + streaks). Gold/creatures/drops: Family tier.

---

## Section 15: C-2 — Task Completion XP

**Quality assessment:** Complete. Core dopamine loop well-specced.

### ADD (from S-3-ENHANCED):
- **AC-020:** Task completion triggers the FULL animation sequence per design-tokens §8 dopamine loop: haptic → sound → card pulse → XP/Gold popIn → streak check → XP bar fill → drop chance → level-up check → card strikethrough.
- **AC-021:** Gold awarded alongside XP (1 Gold per 5 XP, minimum 1). Gold popIn appears slightly after XP popIn.
- **AC-022:** 20% chance of drop event after each completion. Drop types: bonus XP, bonus Gold, streak freeze, avatar item, creature food. Evaluated server-side (Edge Function).

### REMOVE old constraint:
```
- DO NOT implement sound effects — animation only for v2
```

### Subscription tier: Free (XP + streaks). Gold/drops: Family tier.

---

## Section 16: C-3 — Child Progress

**Quality assessment:** Complete. Good leaderboard anti-shame design.

### ADD Acceptance Criteria:
- **AC-020:** Streak calendar heat map uses warm palette: color-streak for active days, color-surface-subtle for inactive, color-streak-light for partial (1 task but not all).
- **AC-021:** Badge collection uses a grid layout with revealed badges having glow animation on first view.

### Subscription tier: Free (level + streak view). Full progress + leaderboard: Family tier.

---

## Section 17: C-4 — Family Quest and Challenge Participation

**Quality assessment:** Complete.

### ADD Acceptance Criteria:
- **AC-020:** Boss battle challenges show: boss creature SVG, health bar (color-boss-hp), HP fraction text, attack animation when tasks contribute to damage.
- **AC-021:** Boss defeat triggers: playBossDefeat() sound, explosion animation, bonus XP for all contributors, creature feeding event.

### MODIFY:
REPLACE "polling" with "Supabase Realtime" for challenge progress updates.

### Subscription tier: Family tier

---

## Section 18: C-5 — Photo Proof of Completion

**Quality assessment:** Complete.

### ADD Acceptance Criteria:
- **AC-010:** Camera UI uses Capacitor camera plugin (when available) or browser file input (PWA fallback).
- **AC-011:** Photo upload to Supabase Storage bucket with family_id-scoped access policy.
- **AC-012:** Parents can view proof photos in the task detail view with lightbox.

### Subscription tier: Free

---

## Section 19: C-6 — Child Avatar and Character

**Quality assessment:** Complete.

### ADD Acceptance Criteria:
- **AC-020:** Avatar displayed in: child app bar, My Day greeting, leaderboard rows, board note authorship, parent family member views.
- **AC-021:** Avatar items fetched from database (not hardcoded) to support content pipeline extensibility.
- **AC-022:** Creature displayed alongside avatar on My Day. Creature has 3 growth stages with visual evolution.

### Subscription tier: Free (basic avatar). Avatar items + creatures: Family tier.

---

## Section 20: S-1 — Onboarding

**Quality assessment:** Good flow. Missing: baby option, creature egg, emotional tone.

### MODIFY Step 3 (Members):
Add "Baby / Kleinkind (0-5)" card alongside "Kind (6-12)". Baby: name only.

### ADD Step (after task creation):
Creature egg moment: each child receives an egg with wobble animation.
"[Name] bekommt ein Begleiter-Ei!"

### ADD Emotional Tone Notes:
- Step 1: Warm. "Willkommen!" One button. No feature dump.
- Step 2: Personal. "Wie heißt deine Familie?"
- Step 3: Inclusive. "Wer gehört dazu?" Baby visible.
- Step 4: Competent. Calendar preview animates as blocks are set.
- Step 5: Encouraging. Suggestions visible. One-tap add.
- Step 6: Celebratory. Creature egg. "Du hast es geschafft!"

### MODIFY AC-002:
6 steps (welcome, family name, members with baby option, school/daycare,
first task, complete with creature egg).

### Subscription tier: N/A (pre-subscription)

---

## Section 21: S-2 — Multi-Household

**Quality assessment:** Complete.

### MODIFY: Architecture changes for Supabase (Edge Functions for link request flow).

### Subscription tier: Family+ tier

---

## Section 22: S-3 — Gamification Engine (Base)

**Quality assessment:** Superseded by S-3-ENHANCED. Use S-3-ENHANCED as the canonical gamification spec.

### NOTE: S-3 and S-3-ENHANCED should be merged into a single document. The builder should read S-3-ENHANCED as the authoritative spec for all gamification mechanics.

---

## Section 23: S-3-ENHANCED — Enhanced Gamification

**Quality assessment:** Excellent. Most detailed spec in the set. Missing: content pipeline section.

### ADD Section §5: Content Pipeline

All gamification content (creatures, bosses, items, badges) fetched
from database. New content added via INSERT statements only — no code
changes required. See spec-amendments-v2.md Section 6 for full details.

### ADD:
- **AC-CONTENT-01:** Creature types, boss data, avatar items, and badges must be database-driven. No hardcoded lists in frontend code.
- **AC-CONTENT-02:** Each content entity supports: available_from, available_until dates for seasonal content.

### Subscription tier: Family tier (full gamification)

---

## Section 24: A-1/A-2 — Adult Member Participation

**Quality assessment:** Complete but minimal (permission matrix only, no UI spec).

### ADD Acceptance Criteria:
- **AC-010:** Adult member UI is identical to admin parent UI EXCEPT: no Settings → Family Management, no Settings → Rewards, no Settings → Routines/Time Blocks editing. These sections are hidden, not grayed out.
- **AC-011:** When adult member tries to edit an item they didn't create, show: "Nur der Ersteller kann bearbeiten" / "Only the creator can edit" — not an error, a friendly message.
- **AC-012:** Adult member's own tasks/events are editable normally via the same forms as admin.

### Subscription tier: N/A (role-based, not tier-based)

---

## Appendix: Gap Summary by Severity

### Critical Gaps (would cause Replit-style failures)

| Gap | Affected Specs | Fix |
|-----|---------------|-----|
| No interaction defaults (items not clickable/draggable) | P-1, P-2, all calendar specs | Section 0.2 + Section 1-2 |
| No FAB requirement on every page | All specs | Section 0.2 AC-GLOBAL-01 |
| No animation requirements | All specs | Section 0.2 AC-GLOBAL-05 |
| Task edit form missing fields vs create form | P-2 | Section 2 AC-012 |
| Task completion only from detail view (not inline) | P-2, C-1 | Section 2 AC-016, Section 14 AC-030 |
| Default icon wrong (heart instead of checkbox) | P-2 | Section 2 AC-008 modification |
| No skeleton loaders specified | Most specs | Section 0.2 AC-GLOBAL-03 |
| No optimistic updates specified | Most specs | Section 0.2 AC-GLOBAL-04 |
| No real-time sync (shopping list, notifications) | P-11, P-9 | Sections 11, 9 |

### Important Gaps (competitive parity)

| Gap | Affected Specs | Fix |
|-----|---------------|-----|
| No baby persona | P-1, P-5, S-1 | Sections 1, 5, 20 |
| No subscription gates | All specs | Section 0.3 |
| No push notifications | P-9 | Section 9 |
| No visual shopping list icons | P-11 | Section 11 |
| No calendar conflict detection | P-1 | Section 1 AC-026 |
| No shareable recap | P-10 | Section 10 |
| No content pipeline | S-3-ENHANCED | Section 23 |
| Mobiscroll references throughout | P-1, P-2, P-3, P-6, S-1 | Section 0.1 |
| Express/Drizzle references | All API-related specs | Section 0.1 |

### Nice-to-Have Gaps (post-launch)

| Gap | Fix |
|-----|-----|
| No grandparent view | S-5 (new spec, already written) |
| No email-to-calendar | P-14 (new spec, already written) |
| No customizable backgrounds via XP | Future enhancement, not specced |
| No meal-to-shopping-list bridge | Future P-11 enhancement |

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 2.0.0 | 2026-03-31 | Complete audit of all 24 journey specs. Global amendments + per-journey fixes for Lovable/Supabase stack, interaction defaults, baby persona, monetization gates, and Replit failure lessons. | PM + Atlas |
