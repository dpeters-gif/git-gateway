---
document: spec
title: "AI Task Suggestions"
journey-id: "P-12"
version: 1.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - P-2-add-adjust-plans.md
  - S-3-gamification-engine.md
related-entities:
  - Task
  - Routine
  - FamilyMember
---

# AI Task Suggestions

## 1. Context

Parents often run out of ideas for age-appropriate tasks, or forget
recurring household needs. An AI assistant that observes the family's
patterns and suggests tasks ("It's been 2 weeks since the last
'Fenster putzen' — time again?") reduces the mental load of planning.
This uses the Anthropic API (available in-app via the Claude API
integration) to generate context-aware suggestions.

## 2. Goal

The system offers AI-generated task suggestions based on the family's
history, current gaps, and seasonal context — presented as one-tap
accept suggestions that pre-fill the task creation form.

## 3. Non-Goals

- This journey does not implement automatic task creation — all
  suggestions require parent confirmation
- This journey does not implement natural language task input ("remind
  me to buy milk") — suggestions are system-initiated
- This journey does not implement meal planning suggestions
- This journey does not use child data for AI analysis beyond task
  patterns (no behavioral profiling)

## 4. User Stories

- As a parent, I want to see task suggestions when I open the task
  creation form, so that I don't have to think of everything myself.
- As a parent, I want suggestions based on what our family typically
  does, so that they are relevant and not generic.
- As a parent, I want to accept a suggestion with one tap to pre-fill
  the creation form, so that adding tasks stays fast.

## 5. Happy Path

**Starting state:** Parent opens the task creation form (from FAB →
Task). Family has 30+ historical tasks.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Opens task creation form | System shows standard form with a "Vorschläge" / "Suggestions" section at the top. System requests suggestions from the AI engine (background fetch). | Form + loading |
| 2 | System | AI responds | System displays 3 suggestion chips: e.g., "Fenster putzen (14 Tage her)", "Kühlschrank aufräumen", "Fahrrad Reifen prüfen (Frühling)". Each chip shows: title + context reason. | Suggestions shown |
| 3 | Parent | Taps a suggestion chip | System pre-fills the task form: title, suggested assignee (based on who usually does this task), suggested XP value (based on similar past tasks), icon. Parent can modify any field. | Form pre-filled |
| 4 | Parent | Adjusts fields if needed, taps "Create" | Standard task creation flow (P-2). | Task created |

**Contextual suggestion triggers:**

| Trigger | Example Suggestion |
|---------|-------------------|
| Time-based gap | "Müll rausbringen — letzte Woche übersprungen" |
| Seasonal | "Garten winterfest machen (Oktober)" |
| Pattern-based | "Badezimmer putzen — ihr macht das normalerweise freitags" |
| New week | "Wochenaufgaben: Staubsaugen, Wäsche, Einkaufen" |

## 6. Failure Paths

### 6.1 AI API unavailable
**Trigger:** Anthropic API returns error or timeout.
**System response:** Suggestion section shows: "Vorschläge gerade
nicht verfügbar" / "Suggestions unavailable right now." Task form
remains fully functional without suggestions.
**State after:** Form usable, suggestions hidden.

### 6.2 Not enough history for suggestions
**Trigger:** Family has fewer than 5 completed tasks.
**System response:** Show generic starter suggestions instead:
"Zimmer aufräumen", "Müll rausbringen", "Tisch abräumen." Label:
"Beliebte Aufgaben" / "Popular tasks."
**State after:** Generic suggestions shown.

### 6.3 AI returns inappropriate content
**Trigger:** AI response contains unexpected or inappropriate content.
**System response:** Suggestion silently filtered out. Only display
suggestions matching expected schema (title string, optional context
string). Malformed responses discarded.
**State after:** Fewer or no suggestions shown.

## 7. Edge Cases

### 7.1 Parent dismisses all suggestions
**Condition:** Parent closes the suggestion chips or scrolls past.
**Expected behaviour:** Suggestions collapse to a compact "Vorschläge
anzeigen" / "Show suggestions" link. No forced interaction.

### 7.2 Suggestion matches an existing active task
**Condition:** AI suggests "Müll rausbringen" but it already exists
as an open task.
**Expected behaviour:** Suggestion shows "(bereits vorhanden)" /
"(already exists)" in muted text. Tapping still pre-fills form
(parent may want a second instance).

## 8. Rollback Path

Read-only suggestions. No data created until parent confirms task
creation. No rollback needed.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Suggestion generated | (none) | — | Ephemeral, not stored |
| Parent accepts | Task | Create | Standard task fields (via P-2) |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall display up to 3 AI-generated task
  suggestions in the task creation form.
- **AC-002:** The system shall send family task history (titles,
  frequencies, last completion dates, assignees) to the AI engine
  as context for suggestion generation.
- **AC-003:** When the parent taps a suggestion, the system shall
  pre-fill the task creation form with the suggested title, assignee,
  and XP value.
- **AC-004:** The system shall include a contextual reason with each
  suggestion (time gap, seasonal, pattern-based).
- **AC-005:** Where the family has fewer than 5 completed tasks, the
  system shall display generic popular task suggestions.

### Privacy Criteria

- **AC-010:** The system shall only send task metadata (titles,
  dates, frequencies) to the AI API — never personal identifiers,
  names, or photos.
- **AC-011:** The system shall not store AI-generated suggestions —
  they are ephemeral per form open.
- **AC-012:** The AI prompt shall explicitly instruct the model to
  return only JSON-structured task suggestions.

### State Criteria

- **AC-020:** While suggestions are loading, the system shall show
  a shimmer placeholder in the suggestion area.
- **AC-021:** If the AI API fails, the system shall hide the
  suggestion section without affecting form functionality.
- **AC-022:** If the AI returns fewer than 3 suggestions, the system
  shall display however many are returned (1 or 2).

### Invariants

- **INV-001:** AI suggestions must never auto-create tasks — parent
  confirmation is always required.
- **INV-002:** Personal identifiers (names, emails, user IDs) must
  never be sent to the AI API.
- **INV-003:** AI suggestion failures must never block task creation.

## 11. Success Criteria

- 30% of new tasks created in families with 30+ task history originate
  from AI suggestions.
- Average time to create a task decreases by 10 seconds when using
  suggestions.

## 12. Constraints (DO NOT List)

- DO NOT implement automatic task creation from AI — always require
  parent confirmation
- DO NOT send personal data to the AI API
- DO NOT store suggestions persistently
- DO NOT implement natural language task input
- DO NOT implement meal planning AI
- DO NOT block form interaction while suggestions load

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-30 | Initial spec — AI task suggestions | PM + VEGA |
