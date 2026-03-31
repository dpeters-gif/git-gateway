---
document: spec
title: "Child Daily Experience"
journey-id: "C-1"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - design-constraints.md
  - design-tokens.md
related-entities:
  - Task
  - Event
  - Streak
  - Level
  - Badge
  - UserBadge
  - Challenge
  - ChallengeProgress
  - FamilyQuest
  - Reward
  - PointsLedger
  - ChildPermission
  - Notification
---

# Child Daily Experience

## 1. Context

A child opens the app and needs to immediately feel: "This is MY
space, and today matters." The current app shows children a stripped-down
adult view. The redesigned child experience must feel like opening
Duolingo — a personal daily game screen that shows what to do, what
they've earned, and what they're working toward. If the child doesn't
open the app voluntarily, the gamification has failed.

## 2. Goal

The child sees a personalized, game-like daily screen that shows
today's quests (tasks), their streak, XP/level progress, and active
challenges — motivating them to complete tasks without being told.

## 3. Non-Goals

- This journey does not allow the child to edit or delete calendar
  events created by adults
- This journey does not show Care-Share data
- This journey does not show admin/family management controls
- This journey does not handle task completion animations (that is C-2)
- This journey does not show the full family calendar in adult format
- Child-created events require parent approval (pending status)

## 4. User Stories

- As a child, I want to see my tasks for today as "quests" with XP
  values, so that I know what to do and what I earn for doing it.
- As a child, I want to see my current streak count with a flame icon,
  so that I feel motivated to keep my streak going.
- As a child, I want to see my level and XP progress bar, so that I
  know how close I am to leveling up.
- As a child, I want to see a friendly greeting with my name, so that
  the app feels personal.
- As a child, I want to see active challenges I can contribute to, so
  that I feel part of something bigger.

## 5. Happy Path

**Starting state:** The child is authenticated (username + PIN), belongs
to a family, and has at least 2 tasks assigned for today.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Child | Opens app | System loads child data: today's tasks, streak, XP/level, active challenges, next reward progress. Skeleton loader with playful shapes shown during fetch. | Loading |
| 2 | System | Data loaded | System renders the child daily screen with entrance animations. Sections appear in sequence (staggered slideUp): greeting → streak → today's quests → XP/level → challenge preview. Background uses `color-child-bg`. | Daily view visible |
| 3 | Child | Sees greeting section | Greeting shows: "Hallo Dennis! 👋" (large, extrabold), today's date, and a context-aware message ("Du hast 3 Quests heute" / "You have 3 quests today"). | Welcomed |
| 4 | Child | Sees streak section | Streak card shows: flame icon (animated glow if active), streak count in display size, "Tage in Folge" / "days in a row" label. If streak is 0: "Starte deine Serie!" / "Start your streak!" with a dimmed flame. | Streak visible |
| 5 | Child | Sees today's quests | Task cards listed as "quests" — each showing: title, icon, XP badge (gold coin style with XP value), priority accent, time (if set), completion checkbox (large, 48px). Completed tasks show checkmark with strikethrough and faded style. Both one-off tasks and routine-generated tasks (e.g., "Zähne putzen" / "Brush teeth") appear identically as quests — the child does not need to distinguish them. Routine-sourced quests show a subtle repeat icon (↻) as metadata only. | Quests visible |
| 6 | Child | Sees XP/level section | Horizontal XP progress bar (color-xp fill, 12px height). Above: level badge (circular, level number in extrabold). Below: "42/100 XP bis Level 5" / "42/100 XP to Level 5". | Progress visible |
| 7 | Child | Sees challenge preview | If an active challenge exists: compact card showing challenge title, progress bar (color-challenge), fraction ("3/10 Aufgaben" / "3/10 tasks"). Tap navigates to challenge detail. | Challenge visible |
| 8 | Child | Sees reward preview | If a reward is approaching (>50% progress): compact card showing reward title, progress bar, XP remaining. "Noch 30 XP!" / "30 XP to go!" | Reward teased |
| 9 | Child | Taps "+" button (if parent has enabled canCreateTasks) | System opens a simplified task creation form: title*, icon picker, due date (default: today), XP value (0-100, default: 5), description. No priority selector (defaults to normal). No visibility selector (defaults to shared). | Create form open |
| 10 | Child | Fills and submits task | System creates task assigned to the child. Task appears in quest list. Success toast. | Task created |
| 11 | Child | Taps "Termin vorschlagen" / "Suggest event" (if parent has enabled canCreateEvents) | System opens event suggestion form: title*, icon picker, date/time*. Event is created with status "pending". Success toast: "Vorgeschlagen! Ein Erwachsener muss bestätigen." / "Suggested! An adult needs to approve." Notification sent to parent. | Event suggested |

**End state:** The child has a clear picture of their day: what to do,
what they've earned, and what they're working toward. They tap a quest
to start completing it (C-2 journey).

## 6. Failure Paths

### 6.1 API error loading child data

**Trigger:** The child data endpoint returns 500.

**System response:** Error state with child-friendly message:
"Ups! Das hat nicht geklappt." / "Oops! Something went wrong."
Retry button with playful label: "Nochmal versuchen" / "Try again".
Child-friendly illustration (not a technical error icon).

**State after:** Error state displayed. Retry re-fetches all data.

### 6.2 Child has no family

**Trigger:** Child account exists but is not linked to a family.

**System response:** Friendly message: "Deine Familie muss dich
erst einladen." / "Your family needs to invite you first." No
action button (child cannot self-resolve this).

**State after:** Waiting screen.

### 6.3 No tasks assigned for today

**Trigger:** Child has no tasks due today.

**System response:** Empty quest section shows: celebration icon +
"Keine Quests heute — genieße den Tag!" / "No quests today —
enjoy your day!" The streak, XP, and challenge sections still
display normally.

**State after:** Partial view (quests empty, other sections populated).

## 7. Edge Cases

### 7.1 Streak about to break

**Condition:** Child has an active streak but has not completed any
task today, and it's after 18:00 (local time).

**Expected behaviour:** Streak card shows a warning state: flame icon
with shake animation, text "Deine Serie ist in Gefahr!" / "Your
streak is at risk!" in warning color. This is a gentle nudge, not
an alarm.

### 7.2 Level-up threshold reached

**Condition:** Child's current XP equals or exceeds the XP needed
for the next level (but level-up hasn't been processed yet).

**Expected behaviour:** On data load, the system detects the level-up
condition, increments the level, resets current-level XP, and triggers
the level-up celebration animation (full-screen overlay, bounceIn,
confetti). This happens once per level-up.

### 7.3 Many tasks (10+) assigned for one day

**Condition:** A child has 10+ tasks assigned for today.

**Expected behaviour:** Quest list scrolls vertically. First 5 quests
visible without scroll. No pagination — continuous scroll. Completed
quests sort to the bottom of the list.

### 7.4 Child with no streak history

**Condition:** New child account, no tasks ever completed.

**Expected behaviour:** Streak shows 0 with dimmed flame and
encouraging text: "Erledige eine Quest, um deine Serie zu starten!"
/ "Complete a quest to start your streak!" XP shows 0/[threshold]
at Level 1.

## 8. Rollback Path

**Failure point:** This is a read-only journey (display only). The
one exception is the level-up detection in edge case 7.2.

**Rollback action for level-up:** If the level increment API call
fails, the client shows the celebration animation anyway (optimistic)
and retries the API call silently. On next load, the server recalculates
the correct level from the XP ledger.

**Data integrity check:** Level is always derivable from total XP
in the points ledger. The Level entity is a cache, not source of truth.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| 7.2 | Level | Update | currentLevel, currentLevelXP (if level-up detected on load) |
| 10 | Task | Create | title, icon, dueDate, xpValue, assignedToUserId=self, familyId, createdByUserId=child (if permitted) |
| 11 | Event | Create | title, icon, startAt, endAt, status=pending, createdByUserId=child (if permitted) |
| 11 | Notification | Create | type=event_suggested, payload with event details, for all adult members |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** When a child opens the app, the system shall display
  a personalized greeting with the child's name and today's date.
- **AC-002:** The system shall display the child's current streak
  count with an animated flame icon (glow animation when streak > 0,
  dimmed when streak = 0).
- **AC-003:** The system shall display today's assigned tasks as
  "quests" with title, XP badge, priority accent, and completion
  checkbox.
- **AC-004:** The system shall display the child's current level
  as a circular badge and XP progress as a horizontal bar with
  fraction text.
- **AC-005:** Where an active challenge exists, the system shall
  display a compact challenge card with title and progress bar.
- **AC-006:** Where a reward is more than 50% progressed, the system
  shall display a reward preview card with remaining XP.
- **AC-007:** The system shall use `color-child-bg` as the page
  background and `color-child-accent` for primary CTA elements.
- **AC-008:** The system shall use staggered Framer Motion slideUp
  animations for section entrance (greeting → streak → quests →
  XP → challenges).
- **AC-009:** Completed quests shall sort to the bottom of the quest
  list and display with strikethrough text and faded opacity.

### Child Creation Criteria

- **AC-040:** Where the parent has enabled `canCreateTasks` for this
  child, the system shall display a "+" button on the quest section
  to create a new task.
- **AC-041:** When a child creates a task, the system shall default:
  assignee to self, priority to normal, visibility to shared_in_family,
  due date to today. The child can set title, icon, XP value (0-100),
  and description.
- **AC-042:** Where the parent has enabled `canCreateEvents` for this
  child, the system shall display a "Termin vorschlagen" / "Suggest
  event" option. Child-created events shall be created with status
  "pending" and require parent approval before appearing on the
  family calendar.
- **AC-043:** When a child submits an event suggestion, the system
  shall create a notification for all adult family members.
- **AC-044:** Where the parent has not enabled creation permissions,
  the system shall not display the "+" button or event suggestion
  option.

### State Criteria

- **AC-010:** While data is loading, the system shall display skeleton
  loaders with playful shapes matching the daily view layout.
- **AC-011:** While no tasks are assigned for today, the system shall
  display a friendly empty state in the quest section with a
  celebration icon.
- **AC-012:** If the API returns an error, then the system shall display
  a child-friendly error message with a retry button.
- **AC-013:** When a level-up is detected, the system shall display a
  full-screen celebration overlay with bounceIn animation and confetti.

### Layout Criteria

- **AC-020:** The child daily view shall use `font-size-md` (17px) as
  the base text size.
- **AC-021:** All touch targets on the child view shall be at least
  48×48px.
- **AC-022:** The child view shall not display: Care-Share data,
  admin settings, family management controls, or adult-only events.
- **AC-023:** The child bottom navigation shall show 4 items: My Day,
  Quests, Progress, Rewards.
- **AC-024:** On tablet (≥ 768px), the quest list shall display in a
  two-column grid. On phone (< 768px), single column.
- **AC-025:** Gamification elements (level badge, XP bar, streak card)
  shall be sized generously for tablet — readable at arm's length
  (kitchen counter distance).

### Streak Criteria

- **AC-030:** If the child has an active streak and has not completed
  any task today after 18:00, then the system shall display a streak
  warning with shake animation on the flame icon.
- **AC-031:** The streak count shall be calculated from the points
  ledger as consecutive days with at least one task completion.

### Invariants

- **INV-001:** The child view must never display data belonging to
  other family members' private tasks or adult-only events.
- **INV-002:** Level must always be derivable from total XP — the
  Level entity is a cache, not source of truth.
- **INV-003:** Streak count must always reflect consecutive days
  from the points ledger — never manually set or overridden.

## 11. Success Criteria

- A child voluntarily opens the app at least once daily to check
  their quests and streak.
- The child daily view loads within 2.5 seconds on 4G.
- Children complete more tasks when the gamified view is active
  compared to the current basic view.

## 12. Constraints (DO NOT List)

- DO NOT show the adult calendar format to children — children see
  "My Day" with quests, not a calendar grid
- DO NOT allow children to edit or delete events created by adults
- DO NOT allow children to create tasks or events unless the parent
  has explicitly enabled the corresponding permission for that child
- DO NOT show raw XP numbers without context — always show as
  progress toward the next level or reward
- DO NOT implement social comparison between children in a
  demotivating way — leaderboard shows positions but never
  "you are last"
- DO NOT show negative feedback for broken streaks — only positive
  encouragement to restart
- DO NOT use adult-oriented error messages — use child-friendly
  language and illustrations
- DO NOT allow child-created events to appear on the family calendar
  without parent approval

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec — Duolingo-inspired child daily experience | PM + VEGA |
