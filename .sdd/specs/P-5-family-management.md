---
document: spec
title: "Invite and Manage Family"
journey-id: "P-5"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
related-entities:
  - Family
  - FamilyMember
  - FamilyInvite
  - User
  - ChildPermission
---

# Invite and Manage Family

## 1. Context

After initial setup, the parent needs to invite a partner/co-parent,
manage child permissions (can create tasks? can create events?),
and configure household settings. This is the "admin panel" of the
family — accessed infrequently but critical for setup.

## 2. Goal

Parents can invite adults, add children, manage permissions, and
configure household settings from the Settings screen.

## 3. Non-Goals

- This journey does not handle multi-household (deferred)
- This journey does not handle removing the last admin
- This journey does not handle account deletion (separate flow)

## 4. User Stories

- As a parent, I want to invite my partner via a shareable token,
  so they can join the family and see the shared calendar.
- As a parent, I want to manage per-child permissions (create tasks,
  suggest events), so I can give age-appropriate agency.
- As a parent, I want to add a new child account with a username
  and PIN, so the child can log in independently.

## 5. Happy Path

### 5A. Invite Adult

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Settings → Familie → "Erwachsenen einladen" / "Invite adult" | Form: email address of invitee. | Form open |
| 2 | Parent | Enters email, taps "Einladen" / "Invite" | System creates invite record with token. Displays token for copy/paste. "Link kopiert" / "Link copied" button. | Token shown |
| 3 | Invitee | Opens invite link or pastes token | Accept-invite page: name, password fields. | Accept form |
| 4 | Invitee | Fills fields, submits | Account created, added to family as adult. Auto-logged in. | Joined |

### 5B. Add Child

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Settings → Familie → "Kind hinzufügen" / "Add child" | Form: name*, username*, PIN*. Permission toggles: canCreateTasks (default: off), canCreateEvents (default: off). | Form open |
| 2 | Parent | Fills fields, sets permissions | Validation: username uniqueness checked. | Filled |
| 3 | Parent | Taps "Hinzufügen" / "Add" | Child account created, linked to family. Permissions saved. | Child added |

### 5C. Manage Child Permissions

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Settings → Familie → taps child member row | Child detail: name, username, permissions toggles. | Detail open |
| 2 | Parent | Toggles "Kann Aufgaben erstellen" / "Can create tasks" to ON | Permission updated immediately (optimistic). | Permission changed |

## 6. Failure Paths

### 6.1 Duplicate username
**Trigger:** Username already taken.
**System response:** Inline error: "Benutzername bereits vergeben."
**State after:** Form open, other fields preserved.

### 6.2 Invite token already used
**Trigger:** Invitee tries to accept a used token.
**System response:** Error: "Einladung bereits verwendet." / "Invite already used."
**State after:** Accept page with error.

### 6.3 Non-adult attempting family management
**Trigger:** Child account tries to access family management endpoints.
**System response:** 403. UI does not show these options for child role.
**State after:** No changes.

## 7. Edge Cases

### 7.1 Inviting someone who already has a family
**Condition:** Invitee email belongs to a user already in another family.
**Expected behaviour:** Accept-invite returns error: "Du bist bereits
Mitglied einer Familie." / "You are already a member of a family."
(Multi-household is deferred.)

## 8. Rollback Path

Not applicable — each operation is atomic.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| 5A.2 | FamilyInvite | Create | familyId, invitedEmail, token, status=pending |
| 5A.4 | User | Create | email, name, passwordHash |
| 5A.4 | FamilyMember | Create | role=adult, isAdmin=true |
| 5A.4 | FamilyInvite | Update | status=accepted |
| 5B.3 | User | Create | name, username, passwordHash |
| 5B.3 | FamilyMember | Create | role=child |
| 5B.3 | ChildPermission | Create | canCreateTasks, canCreateEvents |
| 5C.2 | ChildPermission | Update | changed fields |

## 10. Acceptance Criteria

- **AC-001:** The system shall allow admin parents to create invite tokens for adult members.
- **AC-002:** The system shall allow admin parents to add child accounts with username, PIN, and permission toggles.
- **AC-003:** The system shall allow admin parents to modify child permissions (canCreateTasks, canCreateEvents) at any time.
- **AC-004:** The system shall enforce username uniqueness across the entire system.
- **AC-005:** The system shall only allow adult family members to access family management endpoints.

### Invariants

- **INV-001:** A user can belong to at most one family.
- **INV-002:** Every family must have at least one admin.
- **INV-003:** Child permissions must exist for every child family member.

## 11. Success Criteria

- Invite flow completes (create token → accept → join) without support.
- Child account creation takes under 1 minute.

## 12. Constraints (DO NOT List)

- DO NOT implement email sending — use copy/paste token (beta)
- DO NOT implement multi-household membership
- DO NOT allow removing the last admin from a family
- DO NOT implement account deletion in this journey

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
