---
document: spec
title: "Add and Adjust Plans"
journey-id: "P-2"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - P-1-parent-weekly-overview.md
related-entities:
  - Task
  - Event
  - Routine
  - TimeBlock
  - FamilyMember
---

# Add and Adjust Plans

## 1. Context

After seeing the week (P-1), the parent needs to act: add an event,
create a task, adjust a routine, or reschedule something. This must
be fast and one-handed on mobile — the parent is often doing this
while cooking, commuting, or between meetings. Every tap matters.

## 2. Goal

The parent can create, edit, and reschedule events, tasks, and
routines from anywhere in the app in under 30 seconds per action,
using mobile-optimized forms.

## 3. Non-Goals

- This journey does not handle reward creation (that is P-4)
- This journey does not handle time block setup (that is P-3)
- This journey does not implement AI-based scheduling suggestions
- This journey does not handle bulk operations (multi-select + batch edit)

## 4. User Stories

- As a parent, I want to quickly add an event with a date, time, and
  assignee, so that the family calendar stays current.
- As a parent, I want to create a task and assign it to a family member
  with an XP value, so that it appears on their schedule and motivates
  completion.
- As a parent, I want to reschedule an item by changing its date/time,
  so that I can react to plan changes.
- As a parent, I want to edit or delete existing items, so that I can
  correct mistakes or remove cancelled plans.

## 5. Happy Path

### 5A. Create Event

**Starting state:** Parent is on any screen with access to the FAB
(floating action button) or "+" action.

**Note:** The FAB (floating action button) is a global element in the
AppShell, visible on all authenticated screens. It is not specific to
any single page. Tapping the FAB from the calendar, tasks, or home
screen opens the same quick-action menu.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps FAB (global, visible on all screens) | System shows a quick-action menu: "Aufgabe" / "Termin" / "Routine". Animation: popIn from FAB. | Menu open |
| 2 | Parent | Selects "Termin" (Event) | System opens event creation form as a bottom sheet (mobile) or dialog (desktop). Fields: title*, icon button (default: calendar icon, tap to change)*, start date/time*, end date/time*, all-day toggle, description, assign to member(s). | Form open |
| 3 | Parent | Fills required fields (title, date/time) | System validates in real-time. Date/time uses Mobiscroll picker. | Form filled |
| 4 | Parent | Taps "Erstellen" / "Create" | System sends POST to API. Button shows loading spinner. All fields disabled. | Submitting |
| 5 | System | API returns 201 | System dismisses form. Success toast: "Termin erstellt" / "Event created". Calendar data refetched. Animation: card slideUp into calendar. | Event created |

### 5B. Create Task

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps FAB → "Aufgabe" (Task) | System opens task creation form. Fields: title*, icon button (default: checkbox icon, tap to change), due date, start/end time (optional), priority (low/normal/high), assign to member, XP value (0-100), description, visibility. | Form open |
| 2 | Parent | Fills fields, sets XP value | Priority selector uses visual chips (green/yellow/red). XP value uses a slider or number input with "+5" increments. | Form filled |
| 3 | Parent | Taps "Erstellen" / "Create" | System sends POST. Loading state. | Submitting |
| 4 | System | API returns 201 | Form dismissed. Success toast. Task list and calendar refetched. If assigned to a child, notification created for that child. | Task created |

### 5C. Edit Existing Item

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps an event or task card (from calendar or task list) | System opens detail view with current values pre-filled. Edit button visible. | Detail view |
| 2 | Parent | Taps "Bearbeiten" / "Edit" | Fields become editable. Save and Cancel buttons appear. | Edit mode |
| 3 | Parent | Modifies fields | Real-time validation on changed fields. | Modified |
| 4 | Parent | Taps "Speichern" / "Save" | System sends PATCH. Loading state. | Submitting |
| 5 | System | API returns 200 | Detail view shows updated values. Success toast. Lists refetched. | Updated |

### 5D. Delete Item

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps delete icon on detail view | System shows confirmation dialog: "Diesen Eintrag löschen?" / "Delete this item?" with Cancel and Delete buttons. Delete button uses error color. | Confirmation shown |
| 2 | Parent | Confirms deletion | System sends DELETE. Loading state. | Deleting |
| 3 | System | API returns 200 | Dialog dismissed. Success toast: "Gelöscht" / "Deleted". Navigation back to list/calendar. Data refetched. | Deleted |

**End state:** The calendar and task list reflect the created/edited/deleted item.

## 6. Failure Paths

### 6.1 Required field missing

**Trigger:** Parent taps "Create" with title field empty.

**System response:** Inline error below title field: "Titel ist
erforderlich" / "Title is required". Form not submitted. Focus
moves to the first invalid field.

**State after:** Form remains open, all data preserved.

### 6.2 API error on create/edit

**Trigger:** Backend returns 500 on POST/PATCH.

**System response:** Error toast: "Speichern fehlgeschlagen —
bitte erneut versuchen" / "Save failed — please try again".
Form remains open with all data preserved. Submit button re-enabled.

**State after:** Form open, data preserved, no record created/changed.

### 6.3 Concurrent edit conflict

**Trigger:** Another adult edits the same item while this parent
has the edit form open.

**System response:** On save, if the server detects a version conflict
(updatedAt mismatch), return 409. Client shows: "Dieser Eintrag wurde
zwischenzeitlich geändert. Bitte neu laden." / "This item was modified.
Please reload." with a Reload button.

**State after:** Edit form shows stale data. Reload fetches fresh data.

### 6.4 Permission denied (child attempting edit)

**Trigger:** A child account attempts to access an edit endpoint.

**System response:** API returns 403. Client shows: "Du hast keine
Berechtigung für diese Aktion" / "You don't have permission for this
action."

**State after:** No changes made. Child remains on their view.

## 7. Edge Cases

### 7.1 Event spanning midnight

**Condition:** Parent creates an event from 22:00 to 02:00 the next day.

**Expected behaviour:** System accepts the event. Calendar renders it
on the start date with a visual indicator that it extends past midnight.
The next day also shows the event.

### 7.2 Task with no due date

**Condition:** Parent creates a task without setting a due date.

**Expected behaviour:** Task appears in the task list under "Ohne
Datum" / "No date" section. It does not appear on the calendar
(calendar requires a date to position items).

### 7.3 Assigning task to member who left the family

**Condition:** Parent opens edit form for a task assigned to a member
whose status is now "inactive".

**Expected behaviour:** The assignee field shows the member name with
"(inaktiv)" / "(inactive)" suffix. Parent can reassign to an active
member. System does not automatically unassign.

## 8. Rollback Path

**Failure point:** After the POST/PATCH succeeds on the server but
before the client receives the response (network drop).

**Rollback action:** The item is created/updated on the server. On
next page load or data refetch, the client will show the correct state.
No rollback needed — the server state is authoritative.

**Data integrity check:** Client-side query invalidation ensures the
next fetch shows the latest server state.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| 5A.5 | Event | Create | All event fields |
| 5B.4 | Task | Create | All task fields |
| 5B.4 | Notification | Create | type=task_assigned, payload with task details |
| 5C.5 | Event/Task | Update | Modified fields + updatedAt |
| 5D.3 | Event/Task | Delete | Entire record |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** When the parent taps the FAB, the system shall display
  a quick-action menu with options: Task, Event, Routine.
- **AC-002:** The system shall open creation forms as centered dialogs
  on tablet (≥ 768px) and desktop, and as bottom sheets on phone (< 768px).
- **AC-003:** When the parent submits a valid event form, the system
  shall create the event and display a success toast.
- **AC-004:** When the parent submits a valid task form with an XP
  value > 0 and an assignee, the system shall create the task and
  generate a notification for the assignee.
- **AC-005:** When the parent edits an existing item, the system shall
  pre-fill all fields with current values.
- **AC-006:** When the parent confirms deletion, the system shall
  delete the item and navigate back to the list/calendar view.
- **AC-007:** The system shall use Mobiscroll for all date and time
  picker inputs.
- **AC-008:** The system shall display an icon button next to the title
  field in event and task creation forms. Default icon: calendar icon
  for events, checkbox icon for tasks. Tapping the icon button opens
  an icon picker grid (bottom sheet on mobile). Icon selection is
  optional — the default icon is used if unchanged.
- **AC-009:** The FAB shall be a global element in the AppShell,
  visible on all authenticated screens (mobile and desktop).

### State Criteria

- **AC-010:** While the form is submitting, the system shall show a
  loading spinner on the submit button and disable all form fields.
- **AC-011:** If the API returns an error on submission, then the
  system shall display an error toast and preserve all form data.
- **AC-012:** When creation succeeds, the system shall dismiss the
  form, show a success toast, and refetch the relevant data queries.

### Validation Criteria

- **AC-020:** If the title field is empty on submit, then the system
  shall display "Title is required" inline and prevent submission.
- **AC-021:** If the event end time is before the start time (same day),
  then the system shall display "End time must be after start time"
  and prevent submission.
- **AC-022:** If the XP value is outside 0-100, then the system shall
  display "XP must be between 0 and 100" and prevent submission.
- **AC-023:** If a child account attempts to access a create/edit/delete
  endpoint, then the system shall return 403 and display a permission
  error message.

### Test Requirements

| Criterion | Test Type | Test Description |
|-----------|-----------|------------------|
| AC-001 | e2e | FAB opens quick-action menu with 3 options |
| AC-003 | integration | POST /api/events creates event with correct fields |
| AC-004 | integration | POST /api/tasks with assignee creates notification |
| AC-006 | integration | DELETE /api/events/:id removes event |
| AC-020 | e2e | Empty title shows inline validation error |
| AC-023 | integration | Child session returns 403 on create endpoints |

### Invariants

- **INV-001:** Created items must always have a familyId matching the
  creator's family — never null, never a different family.
- **INV-002:** Delete operations must verify the item belongs to the
  user's family before deleting.
- **INV-003:** XP value on tasks must always be an integer between
  0 and 100 inclusive.

## 11. Success Criteria

- A parent can create a new event in under 30 seconds on mobile.
- A parent can create a task with XP value and assignee in under
  45 seconds on mobile.
- Zero data loss: form data preserved on API errors.

## 12. Constraints (DO NOT List)

- DO NOT implement drag-and-drop rescheduling in this spec — that is
  a separate enhancement
- DO NOT implement bulk create or bulk edit
- DO NOT add recurring event creation here — that is handled via
  routines (P-3)
- DO NOT implement undo for deletion — confirmation dialog is sufficient
- DO NOT create custom date/time picker components — use Mobiscroll
- DO NOT allow child accounts to create/edit/delete items through
  this journey (children have a separate, restricted flow)

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
