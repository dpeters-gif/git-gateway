---
document: spec
title: "Care-Share Visibility"
journey-id: "P-7"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
related-entities:
  - CareShareSnapshot
  - Task
  - FamilyMember
---

# Care-Share Visibility

## 1. Context

The Care-Share mindset means household effort should be visible, not
invisibly carried by one person. Adults need to see how tasks are
distributed — not as a guilt tool, but as a transparency feature.
"Who did what this week" helps families have productive conversations
about balance.

## 2. Goal

Adult family members can see a visual breakdown of task completion
distribution among adults for the current week and month — visible
only to adults.

## 3. Non-Goals

- This journey does not show Care-Share data to children
- This journey does not assign blame or rank adults
- This journey does not suggest task redistribution
- This journey does not track time spent — only task count

## 4. User Stories

- As a parent, I want to see how tasks are distributed between adults
  this week, so that imbalances become visible before they cause frustration.

## 5. Happy Path

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Navigates to Care-Share section (accessible from Home or Settings) | System loads task completion data for adults, current week and month. | Loading |
| 2 | System | Data loaded | Displays: donut chart showing adult contribution percentages. Below: list with avatar, name, completed task count. Period toggle: "Diese Woche" / "Diesen Monat." | Visible |
| 3 | Parent | Toggles to monthly view | Chart updates with monthly data. | Period changed |

## 6. Failure Paths

### 6.1 No completed tasks this period
**Trigger:** No adult has completed any tasks this week/month.
**System response:** Empty state: "Noch keine erledigten Aufgaben diese Woche" / "No completed tasks this week."
**State after:** Empty chart.

## 7. Edge Cases

### 7.1 Single adult in family
**Condition:** Family has only one adult.
**Expected behaviour:** Chart shows 100% for that adult. No comparison possible. Text: "Alle Aufgaben erledigt von [Name]" / "All tasks completed by [Name]."

### 7.2 Child accessing Care-Share URL directly
**Condition:** Child navigates to the Care-Share route.
**Expected behaviour:** Redirect to child home (C-1). Care-Share data never returned for child sessions.

## 8. Rollback Path

Read-only journey. No rollback needed.

## 9. Data Side Effects

No data created. CareShareSnapshot is calculated on-read from the task completion data.

## 10. Acceptance Criteria

- **AC-001:** The system shall display a donut chart showing adult
  task completion distribution for the selected period.
- **AC-002:** The system shall support weekly and monthly period toggling.
- **AC-003:** The system shall only display Care-Share data to adult
  family members. Child sessions must receive 403 or be redirected.
- **AC-004:** The system shall use neutral, non-judgmental language —
  no "behind" or "less than" phrasing.

### Invariants

- **INV-001:** Care-Share data must never be visible to child accounts.
- **INV-002:** Care-Share counts must only include adult task completions,
  not children's.

## 11. Success Criteria

- Adults check Care-Share at least once per week.
- Care-Share visibility correlates with more balanced task distribution
  over time.

## 12. Constraints (DO NOT List)

- DO NOT show Care-Share data to children
- DO NOT rank adults or assign blame language
- DO NOT include children's task completions in Care-Share calculations
- DO NOT implement automated notifications about imbalance
- DO NOT implement suggestions for redistribution

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
