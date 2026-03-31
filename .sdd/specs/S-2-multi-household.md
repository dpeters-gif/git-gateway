---
document: spec
title: "Multi-Household Support"
journey-id: "S-2"
version: 1.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - P-5-family-management.md
  - C-1-child-daily-experience.md
related-entities:
  - User
  - Family
  - FamilyMember
  - Task
  - Event
  - Routine
  - PointsLedger
---

# Multi-Household Support

## 1. Context

In Germany, approximately 20% of families with children involve
separated or divorced parents. Children move between two households
— often week-on/week-off or specific weekdays. Currently,
Familienzentrale supports one family per child. For separated families,
this means either: (a) both parents share one account (privacy
conflict), or (b) the child has two separate accounts (gamification
split, no unified view). Multi-household support lets a child belong
to two families, with unified XP/streaks and household-specific tasks.

## 2. Goal

A child can belong to two families simultaneously, seeing tasks and
schedules from the active household while maintaining unified
gamification progress (XP, streaks, level, badges) across both.

## 3. Non-Goals

- This journey does not support more than 2 families per child
- This journey does not implement automatic household switching
  based on location
- This journey does not implement cross-household messaging between
  adults (parents communicate externally)
- This journey does not share adult-to-adult data between households
  (Care-Share, family settings)
- This journey does not implement custody schedule management

## 4. User Stories

- As a separated parent, I want to add my child to my household
  without removing them from my co-parent's household, so that our
  child has a complete experience in both homes.
- As a child in two households, I want my XP, streak, and level to
  carry across both homes, so that my progress isn't split.
- As a child, I want to see which household I'm currently viewing,
  so that I see the right tasks and schedule.
- As a parent, I want to only see tasks and events from my own
  household, so that there is no privacy leak between homes.

## 5. Happy Path

**Starting state:** Dennis is in "Anna's Familie" (primary household).
His father Thomas has a separate account with "Thomas' Familie."
Thomas wants to add Dennis.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Thomas | Goes to Family Management → Add child | System shows option: "Bestehendes Kind verknüpfen" / "Link existing child" (in addition to "Neues Kind erstellen" / "Create new child"). | Option visible |
| 2 | Thomas | Selects "Link existing child" | System prompts: "Benutzername des Kindes eingeben" / "Enter child's username." | Input shown |
| 3 | Thomas | Enters "dennis123" | System finds the child account. Shows: "Dennis (bereits in einer anderen Familie)" / "Dennis (already in another family)." Requires verification: child must confirm with their PIN on the next login. | Pending link |
| 4 | Dennis | Logs in next time | System shows: "Thomas' Familie möchte dich hinzufügen. Bestätigen?" / "Thomas' Familie wants to add you. Confirm?" with Confirm/Decline. | Confirmation |
| 5 | Dennis | Confirms | Dennis is now a member of both families. A household switcher appears in the child app bar. | Dual membership |
| 6 | Dennis | Uses the household switcher | Taps the household icon in the app bar. Picker shows both families with icons. Dennis selects "Thomas' Familie." | Household switched |
| 7 | System | Context switches | My Day shows tasks, events, and routines from Thomas' household only. Gamification (XP, streak, level, badges) remains unified — shows totals from both households. | Thomas view |

## 6. Failure Paths

### 6.1 Child username not found
**Trigger:** Parent enters a username that doesn't exist.
**System response:** Error: "Benutzername nicht gefunden" / "Username
not found." No information leaked about whether the username exists
(generic error).
**State after:** Input cleared, retry available.

### 6.2 Child already in 2 families
**Trigger:** Child is already linked to 2 families, and a third
tries to link.
**System response:** Error: "Dieses Kind ist bereits in der maximalen
Anzahl von Familien" / "This child is already in the maximum number
of families."
**State after:** Link not created.

### 6.3 Child declines link
**Trigger:** Child taps "Decline" on the link confirmation.
**System response:** Link request deleted. Thomas notified: "Dennis
hat die Verknüpfung abgelehnt" / "Dennis declined the link."
**State after:** No link created. Child remains in primary family only.

## 7. Edge Cases

### 7.1 Same task title in both households
**Condition:** Both households have a routine "Zähne putzen."
**Expected behaviour:** Child sees tasks from the active household
only. Both contribute to unified XP and streaks independently.

### 7.2 Streak continuity across households
**Condition:** Dennis completes a task in Anna's household on Monday,
switches to Thomas' household Tuesday, completes a task there.
**Expected behaviour:** Streak continues unbroken. Streak is
calculated from the unified points_ledger (all entries regardless
of familyId).

### 7.3 Unlinking a child
**Condition:** Thomas removes Dennis from Thomas' Familie.
**Expected behaviour:** Dennis loses access to Thomas' household
tasks and events. All XP earned in Thomas' household remains in the
unified ledger (XP is never deleted). Dennis continues in Anna's
household only.

## 8. Rollback Path

**Failure point:** Link confirmation succeeds but family member
creation fails.
**Rollback action:** Link request remains pending. Child can retry
confirmation. No partial state.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Link request | FamilyLinkRequest | Create | childUserId, targetFamilyId, status=pending |
| Child confirms | FamilyMember | Create | userId, familyId (second family), role=child |
| Child confirms | ChildPermission | Create | Default permissions for second family |
| Unlink | FamilyMember | Delete | Second family membership |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall allow a child to be a member of up to
  2 families simultaneously.
- **AC-002:** The system shall provide a household switcher in the
  child app bar when the child belongs to 2 families.
- **AC-003:** When the child switches households, the system shall
  display tasks, events, and routines from the selected household only.
- **AC-004:** The system shall maintain unified gamification (XP,
  streak, level, badges) across both households.
- **AC-005:** The system shall require child PIN confirmation before
  completing a link to a second family.
- **AC-006:** The system shall allow adults to unlink a child from
  their household. XP earned remains in the unified ledger.

### Privacy Criteria

- **AC-010:** Adults in one household shall not see tasks, events,
  or family data from the child's other household.
- **AC-011:** The household switcher shall only be visible to children
  with dual membership — not to adults.
- **AC-012:** The link request flow shall not reveal whether a
  username exists (generic error on not-found).

### Gamification Criteria

- **AC-020:** Streak calculation shall use the unified points_ledger
  (all families combined).
- **AC-021:** XP totals shall be calculated from all points_ledger
  entries regardless of source family.
- **AC-022:** Leaderboard rankings shall be per-family (not cross-
  family). A child appears on each family's leaderboard independently.

### Invariants

- **INV-001:** A child must never belong to more than 2 families.
- **INV-002:** XP ledger entries from a removed family link must
  never be deleted.
- **INV-003:** Gamification state must always be unified — never
  split per-household.
- **INV-004:** Adult data must never leak between households.

## 11. Success Criteria

- Separated families can onboard both households within 10 minutes.
- Children in dual households maintain longer streaks than they would
  with a single-household gap during transitions.

## 12. Constraints (DO NOT List)

- DO NOT support more than 2 families per child
- DO NOT implement automatic household switching (location-based or
  schedule-based)
- DO NOT implement cross-household adult communication
- DO NOT share adult-specific data (Care-Share, settings) across
  households
- DO NOT implement custody calendar or co-parenting coordination
- DO NOT split gamification per-household — always unified

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-30 | Initial spec — multi-household support | PM + VEGA |
