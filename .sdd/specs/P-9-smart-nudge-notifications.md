---
document: spec
title: "Smart Nudge Notifications"
journey-id: "P-9"
version: 1.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - C-1-child-daily-experience.md
  - S-3-gamification-engine.md
related-entities:
  - Notification
  - Task
  - Streak
  - FamilyMember
  - NudgeRule
---

# Smart Nudge Notifications

## 1. Context

Dumb reminders ("Task due at 16:00") are ignored. Context-aware nudges
that understand urgency, streaks, and progress create real behaviour
change. A child with an at-risk streak needs a different message than
a child who has already completed all quests. Parents need proactive
alerts about incomplete tasks — not after the fact.

## 2. Goal

The system sends context-aware in-app nudges to children and parents
at configurable times, based on task completion state, streak risk,
and daily progress — replacing static reminders with intelligent,
motivating messages.

## 3. Non-Goals

- This journey does not implement push notifications (browser or native)
  — in-app notifications only (bell icon)
- This journey does not implement email notifications
- This journey does not implement real-time WebSocket delivery — polling
- This journey does not let children configure their own nudge settings

## 4. User Stories

- As a parent, I want to set nudge times per child (e.g., 15:00 and
  18:00), so that my children get reminders at the right moments.
- As a child, I want to receive a motivating nudge when my streak is
  at risk, so that I remember to complete at least one quest.
- As a parent, I want to receive an alert when a child has overdue
  high-priority tasks, so that I can intervene if needed.
- As a parent, I want to disable nudges entirely or per child, so
  that I have control over notification frequency.

## 5. Happy Path

**Starting state:** Parent has configured nudge times for Dennis
(15:00 and 18:00). It is 15:00. Dennis has 3 uncompleted quests
and an active 5-day streak.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | System | Nudge trigger fires at 15:00 | System evaluates Dennis's state: 3 incomplete tasks, active streak. Generates nudge: "Hey Dennis! Du hast noch 3 Quests — und deine 5-Tage-Serie läuft! 🔥" / "Hey Dennis! 3 quests left — and your 5-day streak is going! 🔥" | Nudge created |
| 2 | System | Creates notification | Notification stored with type=nudge, payload includes context (task count, streak). Bell icon badge increments. | Notification stored |
| 3 | Dennis | Opens app, sees bell badge | Notification menu shows the nudge with flame icon accent. | Nudge visible |
| 4 | Dennis | Taps nudge | Navigates to My Day (C-1) with quest list. Nudge marked as read. | Navigated |

**Parent nudge path:**

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | System | 19:00 check | Dennis has 2 overdue high-priority tasks. System generates parent nudge: "Dennis hat 2 wichtige Aufgaben nicht erledigt" / "Dennis has 2 important tasks not completed." | Parent nudge |
| 2 | Parent | Sees notification | Can tap to view Dennis's task list (filtered). | Navigated |

## 6. Failure Paths

### 6.1 No tasks for today
**Trigger:** Nudge fires but child has 0 tasks assigned today.
**System response:** No nudge generated. System skips this trigger.
**State after:** No notification created.

### 6.2 All tasks already completed
**Trigger:** Nudge fires but child completed all tasks.
**System response:** Generates congratulatory nudge: "Alle Quests
erledigt! Mega gemacht! 🎉" / "All quests done! Amazing! 🎉"
**State after:** Positive reinforcement nudge stored.

### 6.3 Nudges disabled
**Trigger:** Parent has disabled nudges for this child.
**System response:** No nudge generated.
**State after:** No notification.

## 7. Edge Cases

### 7.1 Streak broken today
**Condition:** Child's streak was broken yesterday (missed a full day).
**Expected behaviour:** Nudge text adapts: "Neue Serie starten? Du
hast 2 Quests heute!" / "Start a new streak? You have 2 quests today!"
No mention of the broken streak — positive framing only.

### 7.2 Multiple nudge times close together
**Condition:** Parent sets nudges at 15:00, 15:30, 16:00.
**Expected behaviour:** Each trigger evaluates independently. If state
hasn't changed between triggers, the system suppresses duplicate nudges
(same message within 30 minutes = skip).

### 7.3 Child has zero-XP tasks only
**Condition:** All tasks today have 0 XP.
**Expected behaviour:** Nudge references task count, not XP. "Du hast
noch 2 Aufgaben" / "You have 2 tasks left." No XP mention.

## 8. Rollback Path

Nudges are read-only notifications. No rollback needed.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Nudge trigger | Notification | Create | type=nudge, userId, payload (context) |
| Parent overdue alert | Notification | Create | type=parent_alert, userId (parent), payload |
| NudgeRule config | NudgeRule | Create/Update | childUserId, times[], enabled, parentAlertEnabled |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall evaluate nudge rules at each configured
  time and generate context-aware notifications.
- **AC-002:** The system shall include task count, streak status, and
  urgency level in nudge message composition.
- **AC-003:** Where all tasks are completed at nudge time, the system
  shall generate a congratulatory nudge instead.
- **AC-004:** Where no tasks exist for the day, the system shall skip
  the nudge without creating a notification.
- **AC-005:** The system shall suppress duplicate nudges (identical
  message type within 30 minutes for the same user).
- **AC-006:** The system shall generate parent alerts for overdue
  high-priority tasks after a configurable evening time.

### Configuration Criteria

- **AC-010:** The system shall allow parents to configure nudge times
  per child (1-3 times per day).
- **AC-011:** The system shall allow parents to enable or disable
  nudges per child.
- **AC-012:** The system shall allow parents to enable or disable
  parent alerts for overdue tasks.
- **AC-013:** Nudge configuration shall be accessible from the child's
  settings section in Family Management (P-5).

### Message Criteria

- **AC-020:** Nudge messages for children shall always use positive,
  encouraging language — never guilt, shame, or negative framing.
- **AC-021:** Nudge messages shall be in the family's configured locale
  (DE or EN).
- **AC-022:** Streak-at-risk nudges shall include the streak count
  and a flame icon reference.

### Invariants

- **INV-001:** The system must never send nudges to children whose
  parent has disabled nudges for them.
- **INV-002:** Nudge content must never use negative language about
  broken streaks or missed tasks.
- **INV-003:** Parent alerts must only be sent to adult family members,
  never to children.

## 11. Success Criteria

- Children with nudges enabled complete 20% more tasks than those
  without.
- Streak retention (7+ day streaks) improves by 15% with nudges.

## 12. Constraints (DO NOT List)

- DO NOT implement push notifications or email — in-app only
- DO NOT implement nudge content customization by parents (message
  templates are system-defined)
- DO NOT implement nudges for adult tasks — adults manage themselves
- DO NOT use negative framing in any nudge message
- DO NOT implement sound or vibration for nudges

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-30 | Initial spec — smart nudge notifications | PM + VEGA |
