---
document: spec
title: "Onboarding Flow"
journey-id: "S-1"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
related-entities:
  - User
  - Family
  - FamilyMember
  - ChildPermission
  - TimeBlock
  - Routine
  - Task
  - Reward
---

# Onboarding Flow

## 1. Context

Currently, a new user signs up and lands on a blank screen with no
guidance. Onboarding is the moment where the app proves its value —
in under 5 minutes, the parent should go from "empty app" to "my
family's week is visible." If onboarding is confusing or slow, the
user will never return.

## 2. Goal

A new parent creates an account, sets up their family, adds at least
one child, defines basic structure (school time), creates the first
task, and sees the calendar "come alive" — all in a guided,
step-by-step flow under 5 minutes.

## 3. Non-Goals

- This journey does not handle inviting a co-parent (that is P-5)
- This journey does not handle calendar sync setup (that is P-6)
- This journey does not enforce completing all steps — the user can
  skip optional steps and finish setup later

## 4. User Stories

- As a new parent, I want a guided setup that shows me the value of
  the app quickly, so that I understand what it does before I invest
  time.
- As a new parent, I want to see the calendar populate with my first
  entries, so that the app feels alive after setup.

## 5. Happy Path

**Starting state:** User has just signed up (account created, no
family).

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | System | Detects new user with no family | Redirects to onboarding flow. Welcome screen: "Willkommen bei Familienzentrale!" / "Welcome to Familienzentrale!", brief value proposition (3 bullet points with icons), "Los geht's" / "Let's go" CTA. | Welcome shown |
| 2 | Parent | Taps "Los geht's" | Step 1: "Deine Familie" / "Your family" — family name input (pre-filled with "[Name]'s Familie"). | Family step |
| 3 | Parent | Confirms family name | Family created. Step 2: "Familienmitglieder" / "Family members" — add children form: name*, username*, PIN*. "Kind hinzufügen" / "Add child" button. "Überspringen" / "Skip" option. | Members step |
| 4 | Parent | Adds child "Dennis" with username and PIN | Child account created, linked to family. Option to add more. | Child added |
| 5 | Parent | Taps "Weiter" / "Next" | Step 3: "Schulzeiten" / "School times" — quick time block setup: select child, weekdays, start/end time. Pre-filled: Mon-Fri, 08:00-13:00. "Überspringen" / "Skip" option. | Structure step |
| 6 | Parent | Adjusts school times, confirms | Time block created. Calendar preview shows school bands. | Block created |
| 7 | Parent | Taps "Weiter" / "Next" | Step 4: "Erste Aufgabe" / "First task" — quick task creation: title, assign to child, XP value. Suggestions: "Zimmer aufräumen", "Müll rausbringen", "Zähne putzen". "Überspringen" / "Skip" option. | Task step |
| 8 | Parent | Creates a task or selects a suggestion | Task created. | Task created |
| 9 | Parent | Taps "Fertig" / "Done" | Step 5: "Geschafft!" / "All set!" — mini celebration animation. Calendar preview showing the populated week. "Zur Übersicht" / "Go to overview" CTA. | Complete |
| 10 | Parent | Taps CTA | Navigates to Home (P-1). Onboarding flag set — flow won't repeat. | Onboarded |

## 6. Failure Paths

### 6.1 Family creation fails
**Trigger:** API error on family creation.
**System response:** Error message with retry. Cannot proceed without family.
**State after:** Step 2 with error.

### 6.2 Duplicate child username
**Trigger:** Username already exists.
**System response:** Inline error: "Benutzername bereits vergeben" /
"Username already taken."
**State after:** Form open, other fields preserved.

### 6.3 User abandons mid-flow
**Trigger:** User navigates away or closes the app during onboarding.
**System response:** On next login, detect incomplete onboarding state.
If family exists: skip to the step after family creation. If no family:
restart from step 1.
**State after:** Partial setup preserved.

## 7. Edge Cases

### 7.1 User skips all optional steps
**Condition:** Parent creates family but skips children, school times,
and first task.
**Expected behaviour:** Onboarding completes. Home screen shows empty
state with contextual CTAs: "Kind hinzufügen" / "Add a child",
"Ersten Termin erstellen" / "Create first event."

### 7.2 User already has a family (re-login)
**Condition:** User logs in and already has a family.
**Expected behaviour:** Skip onboarding entirely. Navigate to Home.

## 8. Rollback Path

**Failure point:** Child creation succeeds but school time block fails.
**Rollback action:** Child exists in family. School time block step
shows error with retry. User can skip and add time blocks later.
No rollback of child creation.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| 3 | Family | Create | name |
| 3 | FamilyMember | Create | userId (parent), role=adult, isAdmin=true |
| 4 | User | Create | name, username, passwordHash (child account) |
| 4 | FamilyMember | Create | userId (child), role=child |
| 4 | ChildPermission | Create | defaults (canCreateTasks=false, canCreateEvents=false) |
| 6 | TimeBlock | Create | type=school, all fields |
| 8 | Task | Create | title, assignee, xpValue |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** When a new user with no family opens the app, the system
  shall redirect to the onboarding flow.
- **AC-002:** The onboarding flow shall consist of 5 steps: welcome,
  family name, add children, school times, first task.
- **AC-003:** Steps 3-4 (children, school times, first task) shall be
  skippable.
- **AC-004:** When the onboarding completes, the system shall navigate
  to the Home screen and not show onboarding again.
- **AC-005:** The onboarding shall show a live calendar preview after
  school time and task creation to demonstrate value.
- **AC-006:** Task creation step shall offer pre-filled suggestions
  in the user's locale.

### State Criteria

- **AC-010:** If a step's API call fails, the system shall show an
  error with retry without losing previously entered data.
- **AC-011:** If the user abandons mid-flow, the system shall resume
  from the last incomplete step on next login.

### Layout Criteria

- **AC-020:** The onboarding flow shall be optimized for tablet
  (768px) with large touch targets, generous spacing, and centered
  content (max-width 640px). Phone (375px) adaptation shrinks
  padding and stacks elements.
- **AC-021:** Each step shall fit on one screen without scrolling
  (on tablet viewport).
- **AC-022:** Step transitions shall use Framer Motion slideInRight.

### Invariants

- **INV-001:** Onboarding must never create a second family for a user
  who already belongs to one.
- **INV-002:** Child usernames must be unique across the entire system.

## 11. Success Criteria

- New users complete onboarding in under 5 minutes.
- At least 80% of users who start onboarding complete it (don't
  abandon at step 1).
- Users who complete onboarding return within 48 hours.

## 12. Constraints (DO NOT List)

- DO NOT implement email verification during onboarding — it adds
  friction and can happen later
- DO NOT require all steps to be completed — allow skipping
- DO NOT show advanced features (challenges, rewards, calendar sync)
  during onboarding — keep it simple
- DO NOT implement onboarding for children — children are added by
  parents
- DO NOT implement co-parent invite during onboarding — that is P-5

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
