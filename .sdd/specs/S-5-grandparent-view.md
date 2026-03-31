---
document: spec
title: "Grandparent & Caregiver Read-Only View"
journey-id: "S-5"
version: 1.0.0
status: Draft
last-updated: "2026-03-31"
author: "PM + Atlas"
depends-on:
  - constitution.md v2.0.0
  - P-5-family-management.md
related-entities:
  - CaregiverLink
  - Family
  - FamilyMember
subscription-tier: family
---

# Grandparent & Caregiver Read-Only View

## 1. Context

Grandparents, babysitters, and au pairs need to see the family
calendar without creating an account or learning a new app. A simple
shared link that shows "what's happening this week" eliminates the
"let me text you the schedule" pattern. This also serves as a viral
loop: grandparents share the concept with other families.

## 2. Goal

A parent generates a time-limited shareable link that gives read-only
access to the family calendar. The viewer sees the week matrix with
events, time blocks, and tasks — but cannot edit, see gamification
data, or access admin features. No account required.

## 3. Non-Goals

- Viewers cannot create, edit, or delete any data
- Viewers cannot see gamification data (XP, streaks, creatures)
- Viewers cannot see admin settings or family management controls
- This is not a collaborative editing feature
- No push notifications for viewers

## 4. Happy Path

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Settings → Family → "Freigabelink erstellen" / "Create share link" | System generates a unique link with 7-day expiry. Options: select which family members to include, set expiry (1/7/30 days). | Link created |
| 2 | Parent | Copies link, sends via WhatsApp to grandmother | — | Link shared |
| 3 | Grandmother | Opens link in browser | System renders a simplified web view: family name, current week matrix, events and time blocks for selected members. No login required. No app bar, no nav, no gamification. Clean, read-only. | View visible |
| 4 | Grandmother | Taps a day | Day detail expands showing events with times. | Detail shown |
| 5 | System | Link expires after 7 days | View shows: "Dieser Link ist abgelaufen" / "This link has expired" with text "Bitte die Familie um einen neuen Link" / "Ask the family for a new link." | Expired |

## 5. Entity

```sql
CREATE TABLE caregiver_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) NOT NULL,
  created_by_user_id uuid REFERENCES users(id) NOT NULL,
  token TEXT UNIQUE NOT NULL, -- URL-safe random token
  label TEXT, -- "Oma Helga", "Babysitter Marie"
  visible_member_ids uuid[], -- which family members are shown
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 6. Acceptance Criteria

- **AC-001:** Share links render a read-only week view without requiring login.
- **AC-002:** Only events, time blocks, and task titles for selected members are visible.
- **AC-003:** Gamification data (XP, streaks, gold, creatures) is never shown.
- **AC-004:** Links expire at the configured time and show an expiry message.
- **AC-005:** Parents can revoke a link at any time from Settings.
- **AC-006:** Parents can see a list of active share links with labels and expiry dates.
- **AC-007:** The shared view is responsive (works on grandmother's phone and desktop).
- **AC-008:** This feature requires Family subscription tier.

## 7. Invariants

- **INV-001:** Share links NEVER grant write access to any data.
- **INV-002:** Share links NEVER expose gamification, admin, or child-personal data.
- **INV-003:** Expired or revoked links return a clear expiry message, never an error.

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-31 | Initial spec — grandparent/caregiver read-only view | PM + Atlas |
