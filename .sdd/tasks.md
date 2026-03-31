---
document: tasks
project: "Familienzentrale"
version: 2.0.0
status: Draft
last-updated: "2026-03-31"
depends-on:
  - constitution.md v2.0.0
  - All spec files
supersedes: tasks.md v1 (Replit-oriented, 189 tasks)
builder-tool: Lovable
---

# Build Tasks v2 — Lovable + Supabase

> Work top-to-bottom. Never skip phases. Each task references its spec.
> After completing each task, verify the Interaction Defaults Checklist
> from the Lovable Builder Prompt.
>
> Lovable builds iteratively via prompts. Each "task" below is a prompt
> or series of prompts to Lovable. The PM (you) executes these in order.
>
> **Key difference from Replit tasks:** Lovable handles scaffolding,
> routing, and Supabase integration automatically. Focus on FEATURES
> and DESIGN QUALITY, not boilerplate.

---

## Phase A: Project Setup + Supabase Schema

### A1: Initialize Lovable Project

- [x] TASK-A01: Create new Lovable project "Familienzentrale". Connect Supabase. Enable Tailwind. Install framer-motion, react-hook-form, zod, @tanstack/react-query, lucide-react, recharts, date-fns, react-i18next, @dnd-kit/core, @dnd-kit/sortable, sonner. | type: setup

- [x] TASK-A02: Configure Tailwind with full design token palette from design-tokens.md v2.0.0. DM Sans font from Google Fonts. Custom colors: primary (forest sage), secondary (terracotta), accent (amber), background (warm linen), child palette, gamification colors, semantic colors. | spec: design-tokens §1 | type: setup

- [x] TASK-A03: Create Framer Motion animation presets file (`src/lib/animations.ts`): fadeIn, slideUp, slideInRight, scaleIn, popIn, bounceIn, progressFill, shake, pulse, glow, confetti, slideDown, fadeOut, strikethrough, float, wobble, flame. All with values from design-tokens §8. | spec: design-tokens §8 | type: setup

- [x] TASK-A04: Create SoundEngine service (`src/services/soundEngine.ts`): Web Audio API procedural sounds. 14 functions: playComplete, playXPAward, playGoldDrop, playLevelUp, playStreakFire, playStreakMilestone, playDropChest, playDropOpen, playBadgeEarn, playBossHit, playBossDefeat, playError, playFlowStep, playFlowDone. ±2 semitone randomization. Master volume + mute. | spec: S-3-ENHANCED §3.2, constitution §5 | type: setup

- [x] TASK-A05: Create i18n setup: de.json + en.json with section structure. DE default. All keys organized by page/component. | spec: constitution §4 | type: setup

- [x] TASK-A06: Create PWA manifest (manifest.json): app name "Familienzentrale", theme_color #4E6E5D, background_color #FBF7F0, display standalone. | spec: constitution §2 | type: setup

### A2: Database Schema

- [x] TASK-A07: Create Supabase migration `001_core.sql`: users (profile table linked to auth.users), families, family_members (role enum: adult/child/baby, managed_by_user_id), family_invites, child_permissions (can_create_tasks, can_create_events). RLS policies for all tables. | spec: P-5, constitution §3 | type: schema

- [x] TASK-A08: Create migration `002_tasks_routines.sql`: tasks (title, description, family_id, assigned_to_user_id, visibility, priority, due_date, start_time, end_time, xp_value, icon, photo_required, status, challenge_id, created_by_user_id, timestamps), family_tags, task_tags, task_comments, routines (flow_mode, flow_target_minutes, flow_step_order, photo_required), routine_task_instances. RLS. | spec: P-2, P-3, P-8 | type: schema

- [x] TASK-A09: Create migration `003_events_timeblocks.sql`: events (title, description, family_id, start_at, end_at, is_all_day, assigned_to_user_ids, icon, status enum active/pending, created_by_user_id), time_blocks (family_id, user_id, type enum school/work/nap/unavailable, weekdays, start_time, end_time, label). RLS. | spec: P-2, P-3 | type: schema

- [x] TASK-A10: Create migration `004_gamification.sql`: points_ledger (append-only, user_id, task_id, xp_awarded, gold_awarded, reason, created_at — NO update/delete policy), rewards, reward_fulfillments, streaks, levels, badges, user_badges, challenges (type, target_count, boss_creature_type, boss_hp, boss_current_hp), challenge_progress, family_quests, leaderboard_snapshots, drop_events, streak_freezes, companion_creatures (creature_type, stage enum egg/baby/juvenile/adult, feed_count, hatch_progress), gold_transactions. RLS. | spec: S-3-ENHANCED | type: schema

- [x] TASK-A11: Create migration `005_features.sql`: nudge_rules, task_completion_photos, weekly_recaps, shopping_lists, shopping_items (with category field), child_avatars, avatar_items (with available_from/until for seasonal), board_notes (with image_url, expires_at), notifications, caregiver_links (token, expires_at, visible_member_ids). RLS. | spec: P-8 through P-13, C-5, C-6, S-5 | type: schema

- [x] TASK-A12: Create migration `006_sync_subscriptions.sql`: calendar_connections, external_calendar_events, family_link_requests, care_share_snapshots, subscriptions (family_id, tier enum free/family/familyplus, status, expires_at), email_inbox_items. RLS. | spec: P-6, P-7, S-2, M-1, P-14 | type: schema

- [x] TASK-A13: Create migration `007_functions.sql`: Database functions get_leaderboard, get_care_share, get_gold_balance. | spec: api-contracts §4 | type: schema

- [x] TASK-A14: Seed data: 12 badges (9 standard + 3 streak milestones), 14 starter avatar items, 6 boss creature types, 6 companion creature types. All via INSERT statements. | spec: S-3-ENHANCED, C-6 | type: seed

- [x] TASK-A15: **CHECKPOINT** — All tables created, RLS policies active, seed data loaded, Supabase types generated. | type: verification

---

## Phase B: Auth + App Shell

- [ ] TASK-B01: Build auth pages: Login (adults: email+password via Supabase Auth, children: username+PIN via Edge Function — tab switch between modes). Signup (adults only: name, email, password). shadcn/ui form components, Zod validation, warm linen background, DM Sans font. Framer Motion page transitions. | spec: constitution §2, §5 | type: ui+auth

- [ ] TASK-B02: Create Edge Function `child-auth`: username + PIN verification, JWT generation with custom claims {userId, familyId, role:'child'}. | spec: api-contracts §2 | type: edge-function

- [ ] TASK-B03: Build AppShell: role-aware layout (parent=sage green nav + warm linen bg, child=honey bg + orange accents). Bottom nav (5 items parent, 4 items child) with Framer Motion scale on tap. App bar (family name, notification bell, user avatar, gold counter for children). Desktop sidebar at ≥1280px. | spec: design-constraints §1, §6, §9 | type: ui

- [ ] TASK-B04: Build FAB component: 56px circle, primary color, positioned bottom-right above bottom nav. Opens radial menu (Task, Event, Routine, Board Note) with stagger slideUp. Present on ALL authenticated pages. | spec: design-constraints §1 | type: ui

- [ ] TASK-B05: Build reusable state components: SkeletonLoader (matching content shapes), EmptyState (icon + heading + body + CTA), ErrorState (friendly message + retry), SuccessToast (sonner, 4s). | spec: design-constraints §7 | type: ui

- [ ] TASK-B06: Build notification menu: dropdown from bell icon, list of notifications, mark read, empty state. Supabase Realtime subscription for new notifications. | spec: all | type: ui

- [ ] TASK-B07: Create useAuth hook, useFamily hook, useSubscription hook. Protected routes (redirect to login if unauth, redirect to onboarding if no family). Role-based routing (parent pages vs child pages). | spec: constitution §2 | type: hooks

- [ ] TASK-B08: **CHECKPOINT** — Auth works (adult + child), app shell renders correctly at 768px and 375px, FAB visible, bottom nav functional, role-based routing works. | type: verification

---

## Phase C: Sprint 1 — Parent Calendar + Tasks (Waves 1-2)

### Wave 1: Parent Screens

- [ ] TASK-C01: Build WeekMatrix component: family members as rows, days (Mon-Sun) as columns. Today highlighted (primary-light bg). Time block bands rendered BEHIND cards (lower z-index). Baby members shown with pacifier avatar. Responsive: full matrix ≥768px, day tabs <768px. | spec: P-1, design-constraints §3 | type: ui

- [ ] TASK-C02: Build calendar item components: CalendarEventCard (info-blue accent, time range, assignee avatar), CalendarTaskCard (priority accent, XP chip, checkbox inline, assignee avatar, strikethrough when complete). Both clickable → detail popover. Both draggable (dnd-kit). | spec: P-1, design-constraints §2, §3 | type: ui

- [ ] TASK-C03: Build TimeBlockBand component: colored background band (school=info, work=primary, nap=secondary, unavailable=gray). Renders behind calendar items. | spec: P-1, design-tokens §1 | type: ui

- [ ] TASK-C04: Build DayTabSelector + DayView (phone <768px): horizontal swipeable day tabs, single-column view, swipe gestures for day navigation. | spec: P-1 | type: ui

- [ ] TASK-C05: Build calendar drag-and-drop: DndContext wrapping calendar, items draggable to new day (reschedule) or new person row (reassign). DragOverlay shows cloned item. On drop: optimistic update + undo toast (5s). | spec: P-2, design-constraints §3 | type: ui

- [ ] TASK-C06: Build QuickCreatePopover: triggered by tapping empty calendar cell. Title input (auto-focus), type toggle (Task/Event), submit. Pre-fills date + person from clicked cell. | spec: P-2, design-constraints §3 | type: ui

- [ ] TASK-C07: Build ItemDetailPopover: shown on item click. Title, full time range, description, assignee, action buttons (Edit, Delete, Complete for tasks). Edit opens full form. Delete shows confirmation + undo toast. | spec: P-2 | type: ui

- [ ] TASK-C08: Build conflict detection: scan calendar items for time overlaps per person. Red dot (8px) indicator at overlap point. Tap reveals popover with both conflicting items. | spec: P-1 amendment AC-026 | type: ui

- [ ] TASK-C09: Build EventCreateForm: dialog (≥768px) or bottom sheet (<768px). Fields: title*, icon picker (default: Calendar), date picker, time pickers, all-day toggle, description, assign to member(s). Pre-fill from calendar cell click. | spec: P-2 | type: ui

- [ ] TASK-C10: Build TaskCreateForm: dialog/bottom sheet. Fields: title*, icon picker (default: CheckSquare NOT heart), due date, start/end time, priority select, XP value (default: 10), assignee, description, photo required toggle, challenge link (if challenges exist). | spec: P-2, amendment AC-012 | type: ui

- [ ] TASK-C11: Build IconPicker: grid of Lucide icons in bottom sheet. Search/filter. Selected icon shown next to title field. | spec: P-2 | type: ui

- [ ] TASK-C12: Build parent Home page: quick stats row (open tasks, completed, streak, gold — large numbers), member filter chips, weekly summary card, task distribution donut (recharts), Pinnwand preview (3 notes), calendar preview (compact week matrix). Wire to Supabase queries. All 4 states. Stagger entrance animations. | spec: P-1, P-13, design-constraints §7 | type: ui+wiring

- [ ] TASK-C13: Build parent Calendar page: view mode toggle (Day/Week/Month), WeekMatrix as default, member filter, all calendar interactions (click, drag, quick-create, conflict dots). Wire to Supabase. | spec: P-1, P-2 | type: ui+wiring

- [ ] TASK-C14: Build parent Tasks page: list of all tasks with filters (open/completed/all, by member, by priority). Task cards with inline completion checkbox. Create via FAB. | spec: P-2 | type: ui+wiring

- [ ] TASK-C15: Build time block + routine management: list view in Settings, create/edit forms, day+time selection, routine with task steps (reorderable via drag), flow mode toggle. | spec: P-3, P-8 | type: ui+wiring

- [ ] TASK-C16: Build family management in Settings: member list (adults, children, babies), add member (3 role options), edit member, promote baby→child (via Edge Function), invite adult, child permissions toggles. Subscription member limit check. | spec: P-5, amendment | type: ui+wiring

- [ ] TASK-C17: Create Edge Function `promote-baby`: creates User, updates role, creates permissions, awards creature egg. | spec: P-5 amendment, api-contracts §2 | type: edge-function

- [ ] TASK-C18: **HANDOVER TEST — Sprint 1 Parent** — Weekly overview loads with data, calendar items clickable + draggable, quick-create works, events/tasks CRUD complete, time blocks render as bands, baby members visible, conflict dots shown, FAB on every page, all 4 states handled, responsive at 768px + 375px, skeleton loaders on all async. | type: verification

### Wave 2: Child UI + Basic Gamification

- [ ] TASK-C19: Build child My Day page: personalized greeting (name + date + quest count), streak card (flame icon + count, glow when active, dim when 0), quest list (today's tasks as quest cards with XP badges + large 48px checkboxes), XP/level section (circular badge + progress bar + fraction text), challenge preview card, reward preview card, companion creature display, board note preview. All with stagger slideUp entrance. Honey background. | spec: C-1 | type: ui

- [ ] TASK-C20: Create Edge Function `complete-task`: FULL gamification transaction (XP + Gold + drops + streak + creature + badges + challenge). See api-contracts §2 for complete logic. This is the most complex Edge Function. | spec: C-2, S-3-ENHANCED, api-contracts §2 | type: edge-function

- [ ] TASK-C21: Build dopamine loop animation sequence: triggered on task completion response. Choreographed per design-tokens §8 timing (T+0ms through T+1200ms). Haptic → sound → card pulse → XP/Gold popIn → streak check → XP bar fill → drop chance → level-up check → card strikethrough. Queue animations sequentially, never overlap. | spec: C-2, S-3-ENHANCED, design-tokens §8 | type: ui

- [ ] TASK-C22: Build level-up celebration overlay: full-screen, bounceIn level number, confetti particles, playLevelUp() sound. Auto-dismiss after 3s or tap to dismiss. | spec: C-2 | type: ui

- [ ] TASK-C23: Build child Progress page: large level badge (80px, bounceIn), streak history (30-day calendar heat map), badge collection (grid, earned=glow, unearned=gray silhouette, tap=detail), family leaderboard (weekly/monthly tabs, position change arrows, current child highlighted, never "last place" framing). | spec: C-3 | type: ui

- [ ] TASK-C24: Build child Quests page: full quest list (all assigned tasks, sorted: today first, then upcoming), quest cards with completion checkbox, filter by status. | spec: C-1 | type: ui

- [ ] TASK-C25: Build child Rewards page: available rewards (XP threshold met), upcoming rewards (progress shown), reward history. | spec: P-4 (child view) | type: ui

- [ ] TASK-C26: Wire all child pages to Supabase. Use complete-task Edge Function for completions. | type: wiring

- [ ] TASK-C27: **HANDOVER TEST — Sprint 1 Child** — Child login works (username+PIN), My Day loads with quest data, task completion triggers full dopamine loop (sound + animation + XP + Gold), streak updates, level-up celebration fires, progress page shows badges + leaderboard, responsive at 768px + 375px. | type: verification

---

## Phase D: Sprint 2 — Gamification Deep + Onboarding (Waves 3-4)

- [ ] TASK-D01: Create Edge Function `spend-gold`: atomic balance check + deduction + item award. | spec: S-3-ENHANCED §2.1, api-contracts §2 | type: edge-function

- [ ] TASK-D02: Build Gold Shop: list of purchasable items (streak freezes, avatar items). Gold balance display. Purchase confirmation dialog. Insufficient gold message. | spec: S-3-ENHANCED §2.1 | type: ui

- [ ] TASK-D03: Build drop event display: treasure chest bounceIn animation after task completion (20% chance). Chest opens → item reveal popIn. Drop types: bonus XP, bonus Gold, streak freeze, avatar item, creature food. | spec: S-3-ENHANCED §2.2 | type: ui

- [ ] TASK-D04: Build streak freeze system: freeze icon in streak card when freeze available. Auto-activate when streak would break. Purchase in Gold Shop (10 Gold). Freeze crystal animation. | spec: S-3-ENHANCED §2.3 | type: ui

- [ ] TASK-D05: Build challenge detail + boss battle view: progress bar, contributor list, boss creature SVG silhouette, HP bar, attack animation on task contribution, boss defeat celebration. | spec: C-4, S-3-ENHANCED §2.6 | type: ui

- [ ] TASK-D06: Build parent Rewards page: create/edit rewards (XP threshold + optional Gold price), create/edit challenges (individual/family, boss battle type), fulfill rewards, view challenge progress. | spec: P-4 | type: ui+wiring

- [ ] TASK-D07: Build companion creature display: 3 growth stages (egg → baby → juvenile → adult), feeding animation (heart float), evolution animation, creature visible on My Day. SVG placeholder creatures (6 types, geometric style). | spec: S-3-ENHANCED §2.7, C-6 | type: ui

- [ ] TASK-D08: Build avatar editor: category tabs, item grid, preview, locked items with level/badge requirements shown. Purchase with Gold. Avatar displayed in app bar + nav + leaderboard. | spec: C-6 | type: ui

- [ ] TASK-D09: **HANDOVER TEST — Gamification** — Gold economy works (earn + spend), drops trigger randomly, streak freezes activate, boss battles track HP, creatures grow, avatar items purchasable, all animations fire correctly. | type: verification

- [ ] TASK-D10: Build onboarding flow (6 steps): Welcome → Family name → Members (child + baby options) → School/daycare times → First task (with suggestions) → Complete (creature egg + calendar preview). Each step on one screen, slideInRight transitions, skip options on optional steps. Resume on re-login. | spec: S-1, amendments | type: ui+wiring

- [ ] TASK-D11: **HANDOVER TEST — Onboarding** — New user completes flow in <5 min, baby creation works, calendar populates, creature egg appears, resume works after abandon. | type: verification

---

## Phase E: Sprint 3 — Full Feature Set (Waves 5-7)

- [ ] TASK-E01: Build Family Board: section on Home (3 recent notes + add button), full view (scrollable, all notes), note creation (text + image upload to Supabase Storage + expiry date), delete (author or admin), image lightbox. Board visible on child My Day too. | spec: P-13 | type: ui+wiring

- [ ] TASK-E02: Build Shopping List: sticky add field with auto-complete from history, items with category icons (auto-categorized), grouped by category with headers, check/uncheck with slide animation, clear checked, drag-to-reorder. Supabase Realtime for instant cross-device sync. | spec: P-11, amendments | type: ui+wiring

- [ ] TASK-E03: Build Routine Flow Mode: full-screen single-step view, countdown timer, progress bar, step-complete sound (playFlowStep), XP per step, completion summary (total XP, time, under-time bonus). Accessible from routine detail + child My Day. | spec: P-8 | type: ui+wiring

- [ ] TASK-E04: Build Smart Nudge system: Edge Function `evaluate-nudges` (scheduled), nudge config UI in Settings (per-child times, enable/disable, parent alert toggle, quiet hours). Push notification support for Family+ tier. | spec: P-9, amendments | type: ui+edge-function

- [ ] TASK-E05: Build Photo Proof: camera capture UI (Capacitor camera or file input fallback), upload to Supabase Storage, photo required toggle on task/routine forms, photo display in task detail with lightbox. | spec: C-5 | type: ui+wiring

- [ ] TASK-E06: Build Weekly Recap: Edge Function `weekly-recap` (Monday generation), recap card on Home, full detail view (per-member stats, streak status, badges, challenge progress, week-over-week comparison), child mini-recap on My Day. Share button → generates summary image. | spec: P-10, amendments | type: ui+edge-function

- [ ] TASK-E07: Build AI Task Suggestions: Edge Function `ai-suggestions` (Claude API call), suggestion chips in TaskCreateForm (3 suggestions, shimmer loading, tap to pre-fill), contextual reasons. Privacy: anonymized data only. | spec: P-12 | type: ui+edge-function

- [ ] TASK-E08: **HANDOVER TEST — Full Features** — Board, shopping list (realtime sync), flow mode, nudges, photo proof, recap, AI suggestions all functional. | type: verification

---

## Phase F: Sprint 4 — Platform + Polish (Waves 8-10)

- [ ] TASK-F01: Build Calendar Sync: Google OAuth via Edge Function, connection UI in Settings, external event display (dashed border, Google icon, read-only), sync trigger. | spec: P-6 | type: ui+edge-function

- [ ] TASK-F02: Build Multi-Household: household switcher in app bar, link-child flow (username + PIN confirm), context switching, unified gamification across households. | spec: S-2 | type: ui+wiring

- [ ] TASK-F03: Build Adult Member restrictions: same parent UI but restricted editing (own items only), hidden admin sections. API-level enforcement via RLS. | spec: A-1/A-2 | type: ui+rls

- [ ] TASK-F04: Build Care-Share: donut chart (recharts, warm palette), adult distribution, weekly/monthly toggle, adults-only access. | spec: P-7 | type: ui+wiring

- [ ] TASK-F05: Build Grandparent View: share link generation in Settings (token, label, expiry, member selection), public read-only page (simplified week matrix, no auth required, no gamification data). | spec: S-5 | type: ui+wiring

- [ ] TASK-F06: Build subscription management: plan comparison in Settings, upgrade flow (in-app purchase), upgrade prompts at feature gates (positive language, never interruptive), tier checking in hooks + RLS. | spec: M-1 | type: ui+wiring

- [ ] TASK-F07: Build Email-to-Calendar: family inbox address display in Settings, Edge Function `email-to-calendar` (webhook + Claude API), Posteingang section on Home (pending items, add/dismiss), one-tap event creation from extracted data. | spec: P-14 | type: ui+edge-function

- [ ] TASK-F08: States audit: verify every screen has all 4 states (loading/empty/error/success). Add missing skeleton loaders, empty states, error states. | type: quality

- [ ] TASK-F09: i18n audit: verify every visible string is in t(). Complete en.json translation. Verify locale toggle in Settings works. | type: quality

- [ ] TASK-F10: Animation audit: verify every state change has animation. Add missing entrance/exit animations. Verify dopamine loop timing. | type: quality

- [ ] TASK-F11: Responsive audit: test every screen at 768px (tablet), 375px (phone), 1280px (desktop). Fix any overflow, touch target, or layout issues. | type: quality

- [ ] TASK-F12: Security audit: verify all RLS policies, test cross-family access (must fail), test child accessing adult endpoints (must fail), verify points_ledger immutability. | type: security

- [ ] TASK-F13: Performance: verify LCP <2.5s on 4G for Home and My Day. Optimize Supabase queries (indexes, select columns). | type: performance

- [ ] TASK-F14: PWA: service worker with workbox (offline shell, asset caching), test install flow on iOS Safari + Android Chrome. | type: platform

- [ ] TASK-F15: **FINAL HANDOVER** — All 27 journeys functional, all states handled, all animations working, responsive at all breakpoints, i18n complete, security verified, performance within targets. App ready for user testing. | type: verification

---

## Total: 67 tasks across 6 phases

| Phase | Tasks | Focus |
|-------|-------|-------|
| A (Setup) | 15 | Project + schema + seed data |
| B (Shell) | 8 | Auth + app shell + FAB + state components |
| C (Sprint 1) | 27 | Parent calendar + tasks + child UI + basic gamification |
| D (Sprint 2) | 11 | Deep gamification + onboarding |
| E (Sprint 3) | 8 | Full feature set (board, shopping, flow, nudges, AI) |
| F (Sprint 4) | 15 | Platform, polish, audits, launch readiness |

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial tasks (Replit, 189 tasks, 10 waves) | PM + VEGA |
| 2.0.0 | 2026-03-31 | Complete rewrite for Lovable. 67 tasks, 6 phases. Consolidated from 189 → 67 by grouping related work into prompt-sized units. Added interaction defaults verification to every handover test. | PM + Atlas |
