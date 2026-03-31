---
document: spec
title: "Adult Member Participation"
journey-id: "A-1/A-2"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - P-1-parent-weekly-overview.md
  - P-2-add-adjust-plans.md
related-entities:
  - Task
  - Event
  - FamilyMember
  - CareShareSnapshot
---

# Adult Member Participation

## 1. Context

Adult members (partners, co-parents, caregivers) who are not the admin
need to see the family week, add their own events, and complete their
assigned tasks. They share the parent UI but with restricted editing
scope — they cannot manage family settings, rewards, or other members'
structures.

## 2. Goal

Adult members can view the full family calendar, add events for
themselves, complete assigned tasks, and contribute to Care-Share —
using the same screens as the admin parent but with appropriate
restrictions.

## 3. Scope

This spec does not define new screens. Adult members use:
- **P-1** (Weekly Overview) — full view, no restrictions
- **P-2** (Add/Adjust) — can create events and tasks for themselves.
  Cannot edit admin-created structures (time blocks, routines).
- **P-7** (Care-Share) — can view, same as admin

### Permission Differences from Admin

| Action | Admin | Adult Member |
|--------|-------|-------------|
| View full calendar | ✓ | ✓ |
| Create events | ✓ | ✓ |
| Create tasks | ✓ | ✓ (for self) |
| Edit any event | ✓ | Own events only |
| Delete any event | ✓ | Own events only |
| Create/edit time blocks | ✓ | ✗ |
| Create/edit routines | ✓ | ✗ |
| Manage rewards/challenges | ✓ | ✗ |
| Manage family members | ✓ | ✗ |
| View Care-Share | ✓ | ✓ |
| Complete assigned tasks | ✓ | ✓ |

## 4. Acceptance Criteria

- **AC-001:** Adult members shall see the same weekly overview as admins.
- **AC-002:** Adult members shall be able to create events and tasks
  assigned to themselves.
- **AC-003:** Adult members shall only be able to edit and delete
  events and tasks they created.
- **AC-004:** If an adult member attempts to edit an item created by
  another user, the system shall show "Nur der Ersteller kann dies
  bearbeiten" / "Only the creator can edit this."
- **AC-005:** Adult members shall not see family management, reward
  management, or structure management options in the UI.
- **AC-006:** Adult member task completions shall count toward
  Care-Share calculations.
- **AC-007:** The system shall enforce these restrictions at the API
  layer — not just UI hiding.

### Invariants

- **INV-001:** Adult members must never be able to modify time blocks
  or routines created by admins.
- **INV-002:** Adult member task completions must be recorded in the
  same points_ledger and contribute to family progress.

## 5. Constraints (DO NOT List)

- DO NOT create separate screens for adult members — reuse parent
  screens with permission-based visibility
- DO NOT allow adult members to manage rewards or challenges
- DO NOT allow adult members to invite or remove family members
- DO NOT hide data from adult members — only restrict edit capability

## 6. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
