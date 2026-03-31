---
document: spec
title: "Task Completion with XP"
journey-id: "C-2"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - C-1-child-daily-experience.md
related-entities:
  - Task
  - PointsLedger
  - Streak
  - Level
  - Challenge
  - ChallengeProgress
  - FamilyQuest
  - Notification
---

# Task Completion with XP

## 1. Context

The child taps a quest (task) to mark it done. This is the core
dopamine loop — the moment where effort becomes reward. If this
moment feels flat (just a checkbox toggle), gamification fails.
It must feel like Duolingo's "correct answer" moment: satisfying
animation, immediate XP award, streak update, and progress toward
the next level or reward. Every completion must feel like it matters.

## 2. Goal

When a child completes a task, the system awards XP, updates their
streak, progresses active challenges, and delivers a satisfying
animated celebration — all within 2 seconds.

## 3. Non-Goals

- This journey does not handle task creation (parents create tasks
  via P-2; children create tasks via C-1 if permitted)
- This journey does not handle parent approval for task completion
  (future enhancement — v2 ships with immediate completion)
- This journey does not handle undoing a completion (parent can
  reopen via P-2)
- This journey does not handle reward redemption (that is separate)
- This journey applies equally to parent-assigned tasks and
  child-created tasks — XP is awarded for both

## 4. User Stories

- As a child, I want to tap a quest to complete it and immediately
  see XP awarded with a fun animation, so that I feel accomplished.
- As a child, I want my streak to update instantly when I complete
  my first task of the day, so that I see my streak grow.
- As a child, I want to see my level progress bar fill up after
  earning XP, so that I know I'm getting closer to the next level.

## 5. Happy Path

**Starting state:** The child is on the "My Day" screen (C-1) with
at least one open quest. The child has an active streak of 3 days.
They are at Level 4 with 85/100 XP.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Child | Taps the completion checkbox on a quest (XP value: 15) | Optimistic update: checkbox animates to filled check (checkmark SVG path draw, 300ms). Task card briefly pulses. | Completing |
| 2 | System | API call: POST /api/tasks/:id/complete | Server: marks task completed, creates points_ledger entry (15 XP), updates streak (if first completion today), checks challenge progress. Returns: { xpAwarded, newTotalXP, newLevel, streakCount, leveledUp, challengeProgress }. | Processing |
| 3 | System | Response received (success) | XP award animation: "+15 XP" text pops in (popIn, gold color) above the task card, floats upward and fades (500ms). | XP shown |
| 4 | System | XP bar updates | XP progress bar animates from 85/100 to 100/100 (progressFill, 500ms). | Bar filling |
| 5 | System | Level-up detected (100/100 → Level 5, 0/100) | LEVEL UP celebration: full-screen overlay fades in, level number "5" bounces in (bounceIn), confetti particles burst, "Level 5!" text in display size. Glow shadow (shadow-glow-levelup). Auto-dismiss after 3 seconds or tap to dismiss. | Celebration |
| 6 | System | Streak update | Streak counter updates: 3→3 (already counted today) or 3→4 (first task today). Flame icon pulses briefly. | Streak current |
| 7 | System | Challenge progress | If task contributes to an active challenge: challenge progress bar updates with animation. "+1" indicator on challenge card. | Challenge updated |
| 8 | System | Task card final state | Completed task card: strikethrough title, faded opacity, filled checkmark, sorts to bottom of quest list. Animation: card slides down. | Done |

**End state:** Task is completed, XP awarded and recorded in ledger,
streak updated, level progressed (or leveled up), challenge progress
updated. The child sees all of this through sequential animations.

## 6. Failure Paths

### 6.1 API error on completion

**Trigger:** POST /api/tasks/:id/complete returns 500.

**System response:** Optimistic checkbox reverts (un-checks with
shake animation). Error toast: "Ups! Das hat nicht geklappt.
Versuch es nochmal." / "Oops! That didn't work. Try again."
Task returns to open state.

**State after:** Task is still open. No XP awarded. No streak change.

### 6.2 Task already completed (double-tap)

**Trigger:** Child taps complete on a task that was already completed
(race condition or stale UI).

**System response:** API returns 409 (conflict). Client shows brief
info toast: "Schon erledigt!" / "Already done!" No XP double-award.
UI refreshes to show task as completed.

**State after:** Task remains completed. XP unchanged.

### 6.3 Network offline

**Trigger:** Device has no network connection when child taps complete.

**System response:** Optimistic update shows (checkbox fills). When
network returns, the completion is retried. If retry fails, checkbox
reverts with error message.

**State after:** Pending completion until network returns.

### 6.4 XP ledger duplicate prevention

**Trigger:** Due to retry logic, the same completion request is sent
twice.

**System response:** Server enforces unique constraint on
(userId, taskId, reason) in points_ledger. Second insert fails
silently (no duplicate XP). Client receives success (idempotent).

**State after:** Single XP entry in ledger. Correct total.

## 7. Edge Cases

### 7.1 Task with 0 XP value

**Condition:** Parent created a task with pointsValue = 0.

**Expected behaviour:** Task completion works normally. No "+0 XP"
animation shown (skip XP pop-in). Streak still counts (task completed).
Level progress unchanged.

### 7.2 Completing the last quest of the day

**Condition:** Child completes their final open task for today.

**Expected behaviour:** After completion animation, the quest section
shows: celebration icon + "Alle Quests erledigt! 🎉" / "All quests
done! 🎉". Confetti burst (lighter than level-up). This is a
"daily completion" mini-celebration.

### 7.3 Level-up exactly at threshold

**Condition:** Child has 95/100 XP and completes a task worth 5 XP.

**Expected behaviour:** XP bar fills to exactly 100/100, then level-up
triggers. New level starts at 0/[new threshold]. The XP bar resets
visually after the celebration dismisses.

### 7.4 Multiple rapid completions

**Condition:** Child taps complete on 3 tasks within 2 seconds.

**Expected behaviour:** Each completion triggers its own animation
sequentially (queued, not overlapping). XP pop-ins stack. If a
level-up occurs mid-sequence, the celebration plays between
task animations.

## 8. Rollback Path

**Failure point:** Task marked completed on server but XP ledger
write fails (DB constraint or timeout).

**Rollback action:** Server wraps task completion + XP ledger write
in a database transaction. If either fails, both roll back. Task
remains open. Client receives error and reverts optimistic update.

**Data integrity check:** Task status and XP ledger are always
consistent — never a completed task without its XP entry (unless
XP value is 0).

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| 2 | Task | Update | status→completed, completedAt→now |
| 2 | PointsLedger | Create | userId, taskId, points, reason=task_completed |
| 2 | Streak | Update | currentCount, lastCompletedDate (if first today) |
| 2 | Level | Update | totalXP, currentLevelXP, currentLevel (if level-up) |
| 2 | ChallengeProgress | Update | currentCount (if task contributes to challenge) |
| 2 | FamilyProgress | Update | rollingEffortTotal += 1 |
| 2 | Notification | Create | type=task_completed for parent notification |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** When a child taps the completion checkbox, the system
  shall immediately show an optimistic checkmark animation (SVG path
  draw, 300ms).
- **AC-002:** When the completion API succeeds, the system shall
  display a "+[N] XP" pop-in animation in XP color above the task card.
- **AC-003:** When XP is awarded, the system shall animate the XP
  progress bar from the previous value to the new value.
- **AC-004:** When the child's XP reaches the level-up threshold,
  the system shall display a full-screen level-up celebration with
  bounceIn animation and confetti.
- **AC-005:** When the completion is the child's first task completion
  today, the system shall increment the streak counter and pulse the
  flame icon.
- **AC-006:** Where the completed task contributes to an active
  challenge, the system shall update the challenge progress bar and
  show a "+1" indicator.
- **AC-007:** The system shall wrap task completion and XP ledger
  write in a single database transaction.

### State Criteria

- **AC-010:** If the completion API returns an error, then the system
  shall revert the optimistic checkmark with a shake animation and
  display a child-friendly error toast.
- **AC-011:** If the task was already completed (409 response), then
  the system shall show "Already done!" and refresh the task state.
- **AC-012:** When all tasks for today are completed, the system shall
  show a "daily completion" mini-celebration with confetti.

### Animation Criteria

- **AC-020:** The completion animation sequence shall play within
  2 seconds total: checkmark (300ms) → XP pop-in (500ms) →
  bar fill (500ms) → optional level-up (800ms, user-dismissable).
- **AC-021:** If multiple tasks are completed rapidly, animations
  shall queue sequentially — never overlap.
- **AC-022:** If the task has XP value 0, the "+XP" pop-in animation
  shall be skipped.

### Invariants

- **INV-001:** The points_ledger must never contain duplicate entries
  for the same (userId, taskId, reason) combination.
- **INV-002:** Task completion and XP ledger write must be atomic —
  if either fails, both roll back.
- **INV-003:** Streak count must always equal the number of consecutive
  days (ending today or yesterday) with at least one points_ledger entry.
- **INV-004:** Level must always be derivable from total XP in the
  points_ledger. The Level entity is a performance cache.

## 11. Success Criteria

- Children report that completing tasks "feels good" / "is fun".
- Task completion rate increases compared to the pre-gamification
  version.
- The completion animation plays without frame drops on mid-range
  mobile devices.

## 12. Constraints (DO NOT List)

- DO NOT implement parent approval flow for task completion — v2
  uses immediate completion
- DO NOT allow children to uncomplete tasks — only parents can
  reopen via P-2
- DO NOT show negative messaging for incomplete tasks — only
  positive reinforcement for completions
- DO NOT implement sound effects — animation only for v2
- DO NOT skip the database transaction wrapping task + XP writes
- DO NOT show the level-up celebration more than once per level
  transition

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec — the dopamine loop | PM + VEGA |
