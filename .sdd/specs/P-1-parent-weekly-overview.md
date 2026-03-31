---
document: spec
title: "Parent Weekly Overview"
journey-id: "P-1"
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
  - Routine
  - RoutineTaskInstance
  - TimeBlock
  - FamilyMember
  - Family
---

# Parent Weekly Overview

## 1. Context

The parent opens Familienzentrale to answer one question: "What happens
this week?" Currently this requires scrolling, tapping, and mental
assembly. The weekly overview must deliver the answer in under 10
seconds — a single screen that shows who is where, what is due, and
who is carrying what, for the entire family, for the entire week.

This is the app's primary screen and the first thing a parent sees
after login. If this screen fails, the product fails.

## 2. Goal

The parent sees the complete family week — time blocks, events, tasks,
and routines — in a single glanceable view, without scrolling or
tapping, within 10 seconds of opening the app.

## 3. Non-Goals

- This journey does not allow creating or editing items (that is P-2)
- This journey does not show gamification details (XP, streaks, levels)
- This journey does not show Care-Share balance (that is P-7)
- This journey does not manage calendar sync settings (that is P-6)
- This journey does not show child-specific UI (that is C-1)

## 4. User Stories

- As a parent, I want to see the entire family's week on one screen,
  so that I know who is where and what needs doing without asking anyone.
- As a parent, I want to distinguish school/work blocks from events
  and tasks at a glance, so that I can spot free time and conflicts.
- As a parent, I want to filter the view by family member, so that
  I can focus on one person's schedule when needed.
- As an adult member, I want to see the same overview with my
  responsibilities highlighted, so that I stay in sync.

## 5. Happy Path

**Starting state:** The parent is authenticated, belongs to a family
with at least 2 members, and the family has at least 1 time block,
2 events, and 3 tasks configured for the current week.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Opens app / navigates to Home | System loads current week data (time blocks, events, tasks, routines) for all family members. Skeleton loader shown during fetch. | Data loading |
| 2 | System | Data loaded | System renders the weekly overview: today highlighted, time block bands visible, events and tasks positioned by date/time, family member avatars shown. Animation: cards slide up (fadeIn). | Week visible |
| 3 | Parent | Scans the week | Parent sees: colored time block bands (school=blue-grey, work=green), event cards with time + title, task indicators with assignee avatar, routine tasks with repeat icon. All visible without scrolling on mobile (day-tab view) or desktop (full week matrix). | Informed |
| 4 | Parent | Taps a day tab (mobile) | System shows that day's detail: time blocks as background bands, events and tasks as full cards sorted by time, all-day items at top. Animation: slide transition. | Day detail visible |
| 5 | Parent | Taps a specific event or task card | System navigates to the detail/edit view for that item (handled by P-2 journey). | Navigation to detail |
| 6 | Parent | Taps family member filter | System filters the view to show only that member's items. Time blocks, events, and tasks for other members are hidden. Filter chip shown at top. | Filtered view |
| 7 | Parent | Taps "All" or clears filter | System restores the full family view. | Full view restored |

**End state:** The parent has absorbed the family's weekly plan and
either continues browsing or navigates to a specific item for action.

## 6. Failure Paths

### 6.1 No family configured

**Trigger:** User is authenticated but has no family (familyId is null).

**System response:** Redirect to onboarding / create-family flow.
Do not show an empty weekly overview.

**State after:** User is on the create-family screen.

### 6.2 API error loading week data

**Trigger:** The `/api/calendar/view/family` endpoint returns a 500 error.

**System response:** Error state shown: error icon + message
"Wochenansicht konnte nicht geladen werden" / "Could not load
weekly view" + retry button. Skeleton loaders replaced by error state.

**State after:** Error state displayed. Retry button re-fetches data.

### 6.3 Network timeout

**Trigger:** Request takes longer than 10 seconds.

**System response:** Same error state as 6.2, with message
"Verbindung fehlgeschlagen — bitte erneut versuchen" /
"Connection failed — please try again".

**State after:** Error state with retry.

### 6.4 Partial data (some endpoints succeed, some fail)

**Trigger:** Time blocks load but events fail, or vice versa.

**System response:** Show available data. Display inline warning
banner at top: "Einige Daten konnten nicht geladen werden" /
"Some data could not be loaded" with retry for failed section.

**State after:** Partial view with warning. Retry reloads failed data only.

## 7. Edge Cases

### 7.1 Week with no items

**Condition:** The family exists but has no time blocks, events, tasks,
or routines for the current week.

**Expected behaviour:** Empty state shown per day or for the whole week:
friendly illustration + "Diese Woche ist noch leer" / "This week is
empty" + CTA button "Termin erstellen" / "Create an event" (links to P-2).

### 7.2 Day with overlapping events

**Condition:** Two events for the same person overlap in time
(e.g., 14:00-15:00 and 14:30-16:00).

**Expected behaviour:** Both events rendered. On mobile day view:
stacked vertically with overlap indicated by a subtle visual cue
(overlapping card edges). On desktop week matrix: side-by-side in
the same cell if space allows, stacked if not. No automatic conflict
resolution — just visual display.

### 7.3 Very long week (many items)

**Condition:** A family member has 15+ items in a single day.

**Expected behaviour:** On mobile: day view scrolls vertically.
First 5 items visible without scroll, rest accessible by scrolling.
On desktop week matrix: collapsed chip view shows first 3 items +
"+N more" indicator. Clicking expands to show all.

### 7.4 Timezone change mid-week

**Condition:** The user changes their device timezone during the week.

**Expected behaviour:** All times re-render in the new timezone.
Events stored with timezone (timestamptz) display correctly.
Time blocks (stored as time + weekday) use the family's configured
timezone, not the device timezone.

## 8. Rollback Path

**Failure point:** This is a read-only journey — no state changes occur.
No rollback needed.

**Data integrity check:** Not applicable for read-only views.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| — | — | — | No data is created, updated, or deleted by this journey |

This journey is entirely read-only.

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall display the current week's time blocks,
  events, tasks, and routine tasks for all family members on the
  home screen.
- **AC-002:** The system shall render time blocks (school/work) as
  colored background bands behind event and task cards, using the
  colors defined in design-tokens.md (color-block-school,
  color-block-work, color-block-unavailable).
- **AC-003:** The system shall visually distinguish routine-sourced
  tasks with a terracotta left-border accent and a repeat icon (↻).
- **AC-004:** When the parent taps a family member filter, the system
  shall show only that member's time blocks, events, and tasks.
- **AC-005:** When the parent clears the family member filter, the
  system shall restore the full family view.
- **AC-006:** The system shall highlight today's date with a distinct
  visual indicator (primary color background or border).
- **AC-007:** The system shall display event cards showing: title,
  time range, and assigned member avatar(s).
- **AC-008:** The system shall display task cards showing: title,
  priority left-border accent, assignee avatar, and due time (if set).

### State Criteria

- **AC-010:** While week data is loading, the system shall display
  skeleton loaders matching the weekly overview layout shape.
- **AC-011:** While no items exist for the current week, the system
  shall display an empty state with illustration, descriptive text,
  and a CTA to create the first event.
- **AC-012:** If the API returns an error, then the system shall
  display an error state with a user-friendly message and a retry
  button.
- **AC-013:** When data loads successfully, the system shall animate
  content entrance using Framer Motion fadeIn/slideUp presets.

### Layout Criteria (Tablet-First)

- **AC-020:** On tablet (≥ 768px), the system shall display the full
  week matrix with family members as columns and days as rows — this
  is the DEFAULT view.
- **AC-021:** On phone (< 768px), the system shall display one day
  at a time with horizontal day-selector tabs and support swipe
  gestures to navigate between days.
- **AC-022:** On desktop (≥ 1280px), the system shall display the
  week matrix with additional whitespace and optional sidebar navigation.
- **AC-023:** The system shall not produce horizontal scrollbars at
  any viewport width between 375px and 1280px.

### Validation Criteria

- **AC-030:** If the user is not a member of any family, then the
  system shall redirect to the create-family flow.

### Test Requirements

| Criterion | Test Type | Test Description | Fails Before Impl? |
|-----------|-----------|------------------|---------------------|
| AC-001 | integration | Week endpoint returns all item types for family | [ ] yes |
| AC-002 | e2e | Time blocks render as background bands, not cards | [ ] yes |
| AC-004 | e2e | Member filter shows only selected member's items | [ ] yes |
| AC-010 | e2e | Skeleton loaders appear during data fetch | [ ] yes |
| AC-012 | e2e | Error state shown when API returns 500 | [ ] yes |
| AC-020 | e2e | Mobile viewport shows day tabs, not full matrix | [ ] yes |
| AC-022 | e2e | Desktop viewport shows full week matrix | [ ] yes |

### Invariants

- **INV-001:** Time blocks must always render behind (below z-index)
  event and task cards — never on top.
- **INV-002:** The member filter must never show items assigned to a
  different member than the selected filter.
- **INV-003:** Today's date indicator must always correspond to the
  actual current date in the family's configured timezone.

## 11. Success Criteria

- A parent can identify all family commitments for the week within
  10 seconds of opening the app.
- The weekly overview loads and renders within 2.5 seconds on a 4G
  connection (LCP target).
- Zero layout shift after data loads — skeleton dimensions match
  final content dimensions.

## 12. Constraints (DO NOT List)

- DO NOT implement create/edit functionality on this screen — that
  is journey P-2
- DO NOT show gamification data (XP, streaks, levels) on the parent
  overview — that is the child UI
- DO NOT implement drag-and-drop rescheduling on this journey — that
  is a P-2 enhancement
- DO NOT build a custom calendar rendering engine — use the existing
  Mobiscroll integration for month/day views and the custom week
  matrix component for the person-lane view
- DO NOT implement real-time updates (WebSocket) — polling on a
  30-second interval is sufficient
- DO NOT add Care-Share indicators to this view — that is journey P-7

## 13. UI Reference

**Visual tier:** B (Structure) — follow layout hierarchy and zones,
not pixel-perfect reproduction.

- Mobile: day-tab navigation at top, single-column day view below,
  time blocks as background bands, event/task cards stacked vertically
- Desktop: full week matrix, members as columns, days as rows,
  time blocks as row-spanning background bands

## 14. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
