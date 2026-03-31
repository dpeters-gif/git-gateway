---
document: spec
title: "Morning & Evening Routine Flow Mode"
journey-id: "P-8"
version: 1.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - P-3-set-predictable-structure.md
  - C-1-child-daily-experience.md
  - C-2-task-completion-xp.md
related-entities:
  - Routine
  - RoutineTaskInstance
  - Task
  - PointsLedger
  - FamilyMember
---

# Morning & Evening Routine Flow Mode

## 1. Context

The #1 friction point for families is mornings: brush teeth, get
dressed, pack bag, eat breakfast — all in a rush. Parents repeat the
same instructions daily. The existing routine system (P-3) generates
tasks automatically but presents them as a flat list. Children need
a focused, sequential flow — one step at a time, with a timer and
visible progress — like a Duolingo lesson for real-life routines.

## 2. Goal

A child can enter a focused "flow mode" for any tagged routine
(morning, evening, or custom), seeing one task at a time in sequence
with a countdown timer and progress bar, completing each step before
the next appears.

## 3. Non-Goals

- This journey does not handle routine creation (that is P-3)
- This journey does not change how routines generate task instances
- This journey does not enforce time limits — the timer is advisory
- This journey does not implement voice prompts or audio cues
- This journey does not block the child from exiting flow mode

## 4. User Stories

- As a parent, I want to tag a routine as a "flow routine" (morning,
  evening, or custom) and set a target duration, so that my child can
  run through it in flow mode.
- As a child, I want to tap "Morgenroutine starten" / "Start morning
  routine" and see one task at a time with a timer, so that I can
  focus on one step without distraction.
- As a child, I want to see a progress bar showing how many steps I
  have completed, so that I know how far along I am.
- As a parent, I want to see the routine completion time in the task
  history, so that I know how long the routine took.

## 5. Happy Path

**Starting state:** Child is on the "My Day" screen (C-1). A morning
routine with 4 tasks is active for today. The routine has been tagged
as a flow routine by the parent.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Child | Sees "Morgenroutine" card on My Day | System displays a distinct flow routine card: title, step count ("4 Schritte"), target duration ("~15 Min"), "Starten" / "Start" CTA in child accent color. | Card visible |
| 2 | Child | Taps "Starten" | System enters flow mode: full-screen overlay with `color-child-bg` background. First task shown: icon, title, optional description. Countdown timer starts (target duration). Progress bar at top (0/4). Step indicator: "Schritt 1 von 4" / "Step 1 of 4". | Flow mode active |
| 3 | Child | Completes first task, taps "Fertig" / "Done" (48px button) | System marks task complete. XP pop-in animation (+N XP). Progress bar fills to 1/4. Slide transition to next task. Timer continues. | Step 2 shown |
| 4 | Child | Completes remaining tasks sequentially | Each step: completion animation → XP → slide to next. Progress bar fills incrementally. | Steps 2-4 done |
| 5 | System | All steps completed | Flow mode shows completion screen: celebratory animation (confetti), total XP earned, total time taken, "Geschafft!" / "All done!" message. If completed under target duration: bonus message "Unter der Zeit! Mega!" / "Under time! Awesome!" | Complete |
| 6 | Child | Taps "Zurück" / "Back" | Returns to My Day. Flow routine card shows completed state (checkmark, faded). | My Day updated |

## 6. Failure Paths

### 6.1 Child exits mid-flow
**Trigger:** Child taps back button or navigates away during flow.
**System response:** Confirmation dialog: "Routine abbrechen? Dein
Fortschritt wird gespeichert." / "Cancel routine? Your progress will
be saved." Already-completed steps remain completed with XP.
**State after:** Partial completion. Child can re-enter flow mode
to continue from the next uncompleted step.

### 6.2 API error on task completion
**Trigger:** Network error when marking a step complete.
**System response:** Retry button appears on the current step. Timer
pauses. Error text: "Verbindungsproblem — nochmal versuchen" /
"Connection issue — try again."
**State after:** Step remains incomplete. Child retries.

### 6.3 No flow routines configured
**Trigger:** No routines have been tagged as flow routines.
**System response:** No flow card shown on My Day. Standard quest
cards shown for all routine tasks.
**State after:** Normal quest display.

## 7. Edge Cases

### 7.1 Some steps already completed outside flow mode
**Condition:** Child completed 2 of 4 routine tasks via the quest
list before entering flow mode.
**Expected behaviour:** Flow mode starts at the first uncompleted
step. Progress bar reflects already-completed steps (2/4). Steps
completed outside flow are marked done.

### 7.2 Timer runs out
**Condition:** Target duration elapses before all steps are completed.
**Expected behaviour:** Timer shows red "0:00" but does not stop or
end the flow. Child continues at their own pace. No penalty. Gentle
text: "Kein Stress — mach einfach weiter" / "No stress — just keep
going."

### 7.3 Single-step routine
**Condition:** A flow routine has only 1 task.
**Expected behaviour:** Flow mode shows the single task. On completion,
immediately shows completion screen. Progress bar shows 1/1.

## 8. Rollback Path

Task completions during flow mode use the same API as normal task
completion (C-2). Each step is persisted individually. If flow mode
crashes mid-way, completed steps remain completed. No rollback needed.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Parent tags routine | Routine | Update | flowMode=true, flowTargetMinutes |
| Child completes step | Task | Update | status=completed, completedAt |
| Child completes step | PointsLedger | Create | XP entry per task |
| Flow complete | (none extra) | — | Completion time derivable from task timestamps |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** Where a routine is tagged as a flow routine, the system
  shall display a flow routine card on the child's My Day screen with
  title, step count, target duration, and start button.
- **AC-002:** When the child taps "Start," the system shall enter
  full-screen flow mode showing one task at a time.
- **AC-003:** The system shall display a countdown timer starting at
  the routine's target duration.
- **AC-004:** The system shall display a progress bar reflecting
  completed steps out of total steps.
- **AC-005:** When the child completes a step, the system shall play
  the XP award animation and transition to the next step.
- **AC-006:** When all steps are completed, the system shall display
  a completion screen with total XP earned and total time taken.
- **AC-007:** Where all steps are completed under the target duration,
  the system shall display a bonus message.

### Parent Configuration Criteria

- **AC-010:** The system shall allow parents to tag a routine as a
  flow routine via the routine edit form (P-3).
- **AC-011:** The system shall allow parents to set a target duration
  in minutes for flow routines.
- **AC-012:** The system shall allow parents to reorder the steps
  within a flow routine using drag-and-drop (@dnd-kit).

### State Criteria

- **AC-020:** While entering flow mode, the system shall display a
  brief loading animation before the first step appears.
- **AC-021:** If the child exits mid-flow, the system shall show a
  confirmation dialog and preserve completed step progress.
- **AC-022:** If a network error occurs on step completion, the system
  shall show a retry button and pause the timer.

### Layout Criteria

- **AC-030:** Flow mode shall use full-screen layout on all viewports.
- **AC-031:** The completion button shall be at least 56×56px with
  child accent color.
- **AC-032:** Flow mode typography shall use the child UI base size
  (17px) with step title in extrabold at size-xl.

### Invariants

- **INV-001:** Flow mode must use the same task completion API as
  normal completion — no separate completion path.
- **INV-002:** XP awarded in flow mode must equal the sum of individual
  task XP values — no flow mode bonus XP (bonus is emotional, not XP).
- **INV-003:** Exiting flow mode must never delete or undo already-
  completed step data.

## 11. Success Criteria

- Children complete morning routines 30% faster with flow mode than
  with the standard quest list.
- Children voluntarily enter flow mode (not forced by parents) at
  least 4 days per week.

## 12. Constraints (DO NOT List)

- DO NOT implement audio/voice prompts in this spec
- DO NOT implement punishment or penalty for exceeding target time
- DO NOT implement flow mode for non-routine tasks
- DO NOT lock the child in flow mode — they must always be able to exit
- DO NOT implement a separate XP calculation for flow mode — use standard task XP
- DO NOT implement step skipping — all steps must be completed or
  the flow is exited

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-30 | Initial spec — morning/evening flow mode | PM + VEGA |
