---
document: spec
title: "Set Predictable Structure"
journey-id: "P-3"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - P-1-parent-weekly-overview.md
related-entities:
  - TimeBlock
  - Routine
  - RoutineTaskInstance
  - FamilyMember
---

# Set Predictable Structure

## 1. Context

Before the weekly overview becomes useful, the parent needs to define
the family's recurring structure: when are the kids at school, when do
the adults work, what chores happen every week. This is "set once,
runs forever" configuration — the backbone that makes the calendar
legible and routines automatic.

## 2. Goal

The parent can define school blocks, work blocks, and recurring
routines that automatically populate the calendar every week without
manual re-entry.

## 3. Non-Goals

- This journey does not handle one-off events (that is P-2)
- This journey does not handle reward or challenge creation (that is P-4)
- This journey does not handle calendar sync setup (that is P-6)
- This journey does not allow children to create or modify structures

## 4. User Stories

- As a parent, I want to define my children's school hours per weekday,
  so that the calendar shows when they are at school.
- As a parent, I want to define my work hours per weekday, so that
  other adults can see when I am unavailable.
- As a parent, I want to define recurring chores with a weekday
  schedule and an assignee, so that tasks are created automatically.
- As a parent, I want to pause a routine without deleting it, so that
  I can temporarily stop it (e.g., school holidays).

## 5. Happy Path

### 5A. Create Time Block

**Starting state:** Parent is on the Settings page, "Struktur" /
"Structure" section, or accesses via a "Zeiten einrichten" / "Set up
times" shortcut.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps "Zeitblock erstellen" / "Create time block" | System opens form: type (school/work/unavailable)*, title*, assigned member*, weekdays (multi-select)*, start time*, end time*. | Form open |
| 2 | Parent | Selects type "Schule" and member "Dennis" | Type sets the default color (school=blue-grey). Title auto-suggests "Schule" but is editable. | Type selected |
| 3 | Parent | Selects weekdays Mon-Fri, sets 08:00-13:30 | Weekday selector shows 7 day chips. Time pickers use Mobiscroll. | Times set |
| 4 | Parent | Taps "Speichern" / "Save" | System creates the time block. Calendar immediately shows school bands for Dennis on Mon-Fri 08:00-13:30. Success toast. | Block created |

### 5B. Create Routine

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps global FAB → "Routine", or navigates to Tasks page → Routines tab → "+" | System opens routine form: title*, icon button (default: repeat icon, tap to change), recurrence type (daily/weekly/every N weeks)*, weekdays (if weekly/N-weeks)*, assignee, priority, XP value, description. | Form open |
| 2 | Parent | Sets title "Müll rausbringen", weekly on Tue+Fri, assigns to Dennis, XP=10 | Weekday selector active. XP slider shown. | Form filled |
| 3 | Parent | Taps "Erstellen" / "Create" | System creates routine. System generates task instances for the next 28 days matching the schedule. Success toast. | Routine active |

### 5C. Edit Time Block / Routine

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps existing time block or routine in the list | System opens detail view with current values. Edit button visible. | Detail view |
| 2 | Parent | Taps edit, modifies fields, saves | System updates the record. For routines: future task instances regenerated according to new schedule. Past completed instances unchanged. | Updated |

### 5D. Pause / Unpause Routine

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps pause icon on a routine | System sets isPaused=true. Future task instances are not generated. Existing uncompleted instances remain. Visual: routine row shows paused state (gray, pause icon). | Paused |
| 2 | Parent | Taps unpause icon | System sets isPaused=false. Task generation resumes from today forward. | Active |

**End state:** The family's structural schedule is defined. Time blocks
appear as background bands on the calendar. Routine tasks are
automatically generated.

## 6. Failure Paths

### 6.1 Overlapping time blocks for same member

**Trigger:** Parent creates a school block Mon 08:00-13:30 for Dennis
when a work block Mon 09:00-17:00 already exists for Dennis.

**System response:** Warning (not error): "Überschneidung mit
bestehendem Zeitblock" / "Overlaps with existing time block". Allow
creation — overlaps are valid (e.g., a child might have different
schedules for different schools).

**State after:** Both blocks exist and render on the calendar.

### 6.2 Required field missing

**Trigger:** Parent submits time block form without selecting weekdays.

**System response:** Inline error: "Mindestens ein Wochentag
erforderlich" / "At least one weekday required".

**State after:** Form open, data preserved.

### 6.3 API error on save

**Trigger:** Backend returns 500.

**System response:** Error toast with retry suggestion. Form data preserved.

**State after:** Form open, no record created.

## 7. Edge Cases

### 7.1 Routine with no weekdays selected (daily)

**Condition:** Parent selects recurrence type "daily".

**Expected behaviour:** Weekday selector is hidden (daily means every
day). Task instances generated for all 7 days of each week.

### 7.2 Time block spanning lunch (no gap)

**Condition:** School block set to 08:00-15:30 with no break.

**Expected behaviour:** Single continuous band on calendar. The system
does not enforce breaks — that is the parent's choice.

### 7.3 Deleting a routine with existing completed tasks

**Condition:** Parent deletes a routine that has task instances already
marked as completed (with XP awarded).

**Expected behaviour:** Routine is deleted. Future uncompleted task
instances are deleted. Completed task instances remain in the database
(preserving XP ledger integrity). Completed tasks no longer show the
routine repeat icon.

## 8. Rollback Path

**Failure point:** Routine creation succeeds but task instance
generation fails partway through.

**Rollback action:** Routine record exists but may have incomplete
task instances. On next access, the system detects missing instances
and regenerates them (self-healing on read).

**Data integrity check:** The routine generation endpoint is idempotent —
calling it again fills gaps without creating duplicates (keyed on
routineId + occurrenceDate).

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| 5A.4 | TimeBlock | Create | All fields |
| 5B.3 | Routine | Create | All fields |
| 5B.3 | RoutineTaskInstance | Create (batch) | routineId, familyId, occurrenceDate, taskId |
| 5B.3 | Task | Create (batch) | Generated tasks linked to routine instances |
| 5C.2 | TimeBlock/Routine | Update | Modified fields + updatedAt |
| 5C.2 | RoutineTaskInstance | Delete+Recreate | Future instances regenerated |
| 5D.1 | Routine | Update | isPaused=true |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall allow creating time blocks with type
  (school/work/unavailable), title, assigned member, weekdays, and
  start/end times.
- **AC-002:** When a time block is created, the system shall display
  it as a colored background band on the calendar for the specified
  weekdays and times.
- **AC-003:** The system shall allow creating routines with title,
  recurrence type, weekdays, assignee, priority, and XP value.
- **AC-004:** When a routine is created, the system shall generate
  task instances for the next 28 days matching the recurrence schedule.
- **AC-005:** When a routine is paused, the system shall stop
  generating new task instances. Existing uncompleted instances remain.
- **AC-006:** When a routine is unpaused, the system shall resume task
  instance generation from the current date forward.
- **AC-007:** When a routine is edited, the system shall regenerate
  future task instances according to the updated schedule. Completed
  instances are preserved.
- **AC-008:** The system shall display all time blocks to all family
  members regardless of role.

### State Criteria

- **AC-010:** While saving a time block or routine, the system shall
  show a loading state on the submit button.
- **AC-011:** While no time blocks exist, the structure section shall
  show an empty state with CTA to create the first block.
- **AC-012:** If the API returns an error, then the system shall show
  an error toast and preserve form data.

### Validation Criteria

- **AC-020:** If no weekdays are selected for a weekly/n-weeks routine,
  then the system shall show an inline error and prevent submission.
- **AC-021:** If the end time is before the start time for a time block,
  then the system shall show an inline error and prevent submission.

### Invariants

- **INV-001:** Routine task instance generation must be idempotent —
  calling generate twice for the same date range must not create
  duplicate tasks.
- **INV-002:** Deleting a routine must never delete completed task
  instances or their associated XP ledger entries.
- **INV-003:** Time blocks must always have at least one weekday selected.

## 11. Success Criteria

- A parent can set up a child's school schedule in under 2 minutes.
- A parent can create a recurring chore in under 1 minute.
- Routine tasks appear automatically on the calendar without manual
  re-entry.

## 12. Constraints (DO NOT List)

- DO NOT implement complex recurrence rules (monthly, yearly, "first
  Monday of month") — only daily, weekly, and every-N-weeks
- DO NOT implement automatic conflict detection between time blocks —
  show a warning but allow creation
- DO NOT implement time block templates or presets
- DO NOT implement bulk creation of multiple time blocks at once
- DO NOT allow children to create or modify time blocks or routines

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
