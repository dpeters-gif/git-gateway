---
document: spec
title: "Family Quest and Challenge Participation"
journey-id: "C-4"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - C-1-child-daily-experience.md
  - C-2-task-completion-xp.md
related-entities:
  - Challenge
  - ChallengeProgress
  - FamilyQuest
  - Task
---

# Family Quest and Challenge Participation

## 1. Context

Beyond individual tasks, families need shared goals: "Let's all do
10 chores this week" or "Complete 5 outdoor activities this month."
Challenges and quests create a sense of teamwork — the family working
toward something together. Children see their individual contribution
to the group goal.

## 2. Goal

Children can view active challenges and family quests, see their
contribution, and feel motivated by shared family progress.

## 3. Non-Goals

- This journey does not handle challenge/quest creation (that is P-4)
- This journey does not handle reward fulfillment
- This journey does not allow children to modify challenge rules

## 4. User Stories

- As a child, I want to see active family challenges with progress,
  so that I know what the family is working toward together.
- As a child, I want to see how many tasks I contributed to a
  challenge, so that I feel my effort matters to the team.

## 5. Happy Path

**Starting state:** Child navigates to challenge detail (tapped from
C-1 preview card or from the Quests tab).

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Child | Taps active challenge card | System shows challenge detail: title, description, progress bar (current/target), deadline, reward description, contributor list (who did what). | Detail visible |
| 2 | Child | Sees contributor breakdown | List of family members with their individual contribution count. Child's own row highlighted. Avatar + name + count. | Contributions visible |
| 3 | Child | Completes a qualifying task (via C-2) | Challenge progress increments. Progress bar animates. "+1" indicator appears on challenge card. If challenge completes: celebration animation (confetti, challenge color). | Progress updated |

**End state:** Child understands the family goal, their contribution,
and how close the family is to completing it.

## 6. Failure Paths

### 6.1 No active challenges
**Trigger:** Family has no active challenges.
**System response:** Empty state: "Noch keine Challenges aktiv" /
"No active challenges yet" with illustration. If child: no CTA
(only parents create challenges).
**State after:** Empty view displayed.

### 6.2 Challenge expired without completion
**Trigger:** Challenge end date passed without reaching target.
**System response:** Challenge card shows "Abgelaufen" / "Expired"
in muted style. Progress shown as final state. No negative framing.
**State after:** Expired challenge visible in history.

## 7. Edge Cases

### 7.1 Child not contributing to challenge
**Condition:** Challenge is active but this child has 0 contributions.
**Expected behaviour:** Child's row shows 0 contributions without
shame. Encouraging text: "Jede erledigte Quest zählt!" / "Every
completed quest counts!"

### 7.2 Challenge completes while child is viewing
**Condition:** Another family member's completion triggers the target.
**Expected behaviour:** On next data refresh (30-second polling),
the celebration animation triggers. Progress bar fills to 100%.

## 8. Rollback Path

Read-only journey. No rollback needed.

## 9. Data Side Effects

No data created by this journey. Challenge progress is updated as a
side effect of C-2 (task completion).

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall display active challenges with title,
  progress bar, fraction text, deadline, and reward description.
- **AC-002:** The system shall display per-member contribution counts
  for each challenge.
- **AC-003:** When a challenge reaches its target, the system shall
  display a celebration animation with challenge color and confetti.
- **AC-004:** The system shall display expired challenges in a
  history section with muted styling.

### State Criteria

- **AC-010:** While no challenges exist, the system shall show an
  encouraging empty state.
- **AC-011:** If the API returns an error, the system shall show a
  child-friendly error with retry.

### Invariants

- **INV-001:** Challenge progress must equal the sum of qualifying
  task completions — never manually inflated.
- **INV-002:** Only tasks completed within the challenge date range
  count toward progress.

## 11. Success Criteria

- Families with active challenges see higher overall task completion
  rates than families without.

## 12. Constraints (DO NOT List)

- DO NOT allow children to create or modify challenges
- DO NOT show challenges from other families
- DO NOT implement real-time WebSocket updates — polling is sufficient
- DO NOT show negative framing for low contribution

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
