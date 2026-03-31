---
document: spec
title: "Manage Rewards and Challenges"
journey-id: "P-4"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
related-entities:
  - Reward
  - RewardFulfillment
  - Challenge
  - ChallengeProgress
  - FamilyQuest
  - Badge
  - Level
---

# Manage Rewards and Challenges

## 1. Context

Parents control the motivation engine: they define what rewards are
available, how much XP they cost, what challenges the family is
working on, and when a reward is fulfilled. This screen is the
"game designer" control panel — where parents configure the
gamification that children experience.

## 2. Goal

Parents can create/manage rewards (XP-based), launch family
challenges, and fulfill earned rewards — all from a single
management screen.

## 3. Non-Goals

- This journey does not handle badge definition (badges are system-defined)
- This journey does not handle XP value per task (that is P-2)
- This journey does not handle level thresholds (system-defined)

## 4. User Stories

- As a parent, I want to create rewards with XP thresholds per child,
  so that children have tangible goals to work toward.
- As a parent, I want to launch a family challenge with a task target
  and deadline, so that the family works toward a shared goal.
- As a parent, I want to fulfill a reward when a child has earned it,
  so that the reward cycle completes and resets.

## 5. Happy Path

### 5A. Create Reward

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Navigates to Rewards page, taps "+" | System opens reward creation form: title*, description, child (select which child)*, XP threshold*, icon. | Form open |
| 2 | Parent | Sets "1 Stunde Bildschirmzeit" / "1 hour screen time", threshold 100 XP, for Dennis | Fields validated. | Form filled |
| 3 | Parent | Taps "Erstellen" / "Create" | Reward created. Appears in Dennis's reward list. Dennis sees it in his reward preview (C-1). | Reward active |

### 5B. Launch Challenge

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps "Challenge erstellen" / "Create challenge" | Form: title*, description, type (individual/family)*, target count*, target metric (tasks completed)*, start date*, end date*, bonus XP reward. | Form open |
| 2 | Parent | Sets "Familien-Putzwoche" / "Family cleaning week", family type, target 20 tasks, this week | Fields validated. | Form filled |
| 3 | Parent | Taps "Starten" / "Launch" | Challenge created and immediately active. All family members see it. | Challenge active |

### 5C. Fulfill Reward

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Sees "Belohnung verfügbar" / "Reward available" indicator on a child's reward | Reward card shows: green check, "Bereit!" / "Ready!", fulfill button. | Available |
| 2 | Parent | Taps "Einlösen" / "Fulfill" | Confirmation: "Dennis hat 100 XP erreicht. Belohnung einlösen?" / "Dennis reached 100 XP. Fulfill reward?" | Confirming |
| 3 | Parent | Confirms | System creates fulfillment record. Child's XP counter for this reward resets to 0. Reward cycle restarts. Notification sent to child. | Fulfilled |

## 6. Failure Paths

### 6.1 Required field missing
**Trigger:** Parent submits reward without title or threshold.
**System response:** Inline validation error. Form not submitted.
**State after:** Form open, data preserved.

### 6.2 Challenge end date in the past
**Trigger:** Parent sets end date before start date or before today.
**System response:** Inline error: "Enddatum muss in der Zukunft liegen" /
"End date must be in the future."
**State after:** Form open.

### 6.3 Fulfilling reward that is no longer available
**Trigger:** Between loading and tapping fulfill, the child's XP dropped
(theoretically impossible since XP is append-only, but for safety).
**System response:** Server re-checks XP threshold. If not met: 409 error.
Client: "XP nicht mehr ausreichend" / "XP no longer sufficient."
**State after:** No fulfillment created.

## 7. Edge Cases

### 7.1 Multiple rewards for same child
**Condition:** Parent creates 3 rewards for Dennis with different thresholds.
**Expected behaviour:** All rewards displayed. Each tracks independently
against Dennis's total XP since last fulfillment of that reward.

### 7.2 Challenge with zero completions at deadline
**Condition:** Challenge expires with 0/20 progress.
**Expected behaviour:** Challenge moves to "Abgelaufen" / "Expired" state.
No negative messaging. Parent can create a new challenge.

## 8. Rollback Path

**Failure point:** Reward fulfillment creates record but notification fails.
**Rollback action:** Fulfillment stands (it's the important part).
Notification failure is logged but does not block fulfillment.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| 5A.3 | Reward | Create | All fields |
| 5B.3 | Challenge | Create | All fields |
| 5C.3 | RewardFulfillment | Create | rewardId, childUserId, fulfilledByUserId |
| 5C.3 | Notification | Create | type=reward_fulfilled for child |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall allow parents to create rewards with
  title, description, child assignment, XP threshold, and icon.
- **AC-002:** The system shall allow parents to create challenges with
  title, type (individual/family), target count, date range, and bonus XP.
- **AC-003:** When a child's XP reaches a reward's threshold, the
  system shall display the reward as "available" with a fulfill button.
- **AC-004:** When a parent fulfills a reward, the system shall create
  a fulfillment record and notify the child.
- **AC-005:** The system shall only allow adult family members to
  create rewards, challenges, and fulfill rewards.

### State Criteria

- **AC-010:** While no rewards exist, the system shall show an empty
  state with CTA to create the first reward.
- **AC-011:** If the API returns an error, the system shall show an
  error toast and preserve form data.

### Validation Criteria

- **AC-020:** If XP threshold is less than 1, the system shall show
  an inline error.
- **AC-021:** If challenge end date is before start date, the system
  shall prevent submission.
- **AC-022:** If a child account attempts to access reward management
  endpoints, the system shall return 403.

### Invariants

- **INV-001:** Only adult family members can create, edit, or fulfill rewards.
- **INV-002:** XP threshold must always be a positive integer.
- **INV-003:** Reward fulfillment must verify current XP meets
  threshold at time of fulfillment — no stale checks.

## 11. Success Criteria

- Parents create at least 2 rewards per child within the first week.
- Reward fulfillment cycle completes (create → earn → fulfill → reset)
  successfully.

## 12. Constraints (DO NOT List)

- DO NOT allow children to create or modify rewards
- DO NOT implement automatic reward fulfillment — parents must approve
- DO NOT implement reward purchasing with XP (it's not a currency
  store — it's a threshold system)
- DO NOT implement challenge templates or AI-suggested challenges
- DO NOT allow negative XP thresholds

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
