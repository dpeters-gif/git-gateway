---
document: spec
title: "Calendar Sync"
journey-id: "P-6"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
related-entities:
  - CalendarConnection
  - ExternalCalendarEvent
  - Event
  - User
---

# Calendar Sync

## 1. Context

Parents already use Google or Apple Calendar for work meetings,
appointments, and personal events. Requiring them to re-enter
everything in Familienzentrale guarantees abandonment. Calendar sync
imports external events into the family view, so parents see their
full life — not just the family layer.

## 2. Goal

A parent can connect their Google or Apple Calendar, configure sync
direction, and see external events alongside family events on the
Familienzentrale calendar.

## 3. Non-Goals

- This journey does not handle real-time push sync (polling-based)
- This journey does not sync Familienzentrale → external by default
  (opt-in only)
- This journey does not handle calendar sharing permissions between
  external calendar providers
- This journey does not sync tasks or routines — only events

## 4. User Stories

- As a parent, I want to connect my Google Calendar so my work
  meetings appear in the family weekly view.
- As a parent, I want to choose which external calendars to import
  (e.g., "Work" but not "Personal birthdays").
- As a parent, I want to optionally export family events to my
  Google Calendar so everything is in one place.

## 5. Happy Path

### 5A. Connect Google Calendar

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Settings → Kalender → "Google Kalender verbinden" / "Connect Google Calendar" | System initiates Google OAuth flow (redirect to Google consent screen). | OAuth started |
| 2 | Parent | Authorizes on Google | Google redirects back with auth code. Server exchanges for access + refresh tokens. Tokens stored encrypted. | Authorized |
| 3 | System | Fetches calendar list | System displays the user's Google calendars with checkboxes: "Work", "Personal", "Birthdays", etc. All off by default. | Calendar list shown |
| 4 | Parent | Selects "Work" calendar, sets sync direction: "Import only" | Selection saved. | Configured |
| 5 | Parent | Taps "Sync starten" / "Start sync" | System fetches events from selected calendars for current + next 4 weeks. Events appear on the family calendar as "external" events with Google icon badge. | Synced |

### 5B. View Synced Events

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Opens weekly overview (P-1) | External events render alongside family events. Visually distinct: subtle Google/Apple icon badge, slightly different card style (muted border). | Visible |
| 2 | Parent | Taps external event | System shows read-only detail: title, time, source calendar name, "In Google Kalender öffnen" / "Open in Google Calendar" link. No edit (source of truth is external). | Detail shown |

## 6. Failure Paths

### 6.1 OAuth denied
**Trigger:** User cancels Google authorization.
**System response:** "Verbindung abgebrochen" / "Connection cancelled."
Return to settings. No connection created.
**State after:** No connection.

### 6.2 Token expired
**Trigger:** Refresh token fails (user revoked access in Google).
**System response:** Connection shows "Erneut verbinden" / "Reconnect"
status. Events from this source stop updating.
**State after:** Stale events remain visible with "Sync pausiert" indicator.

### 6.3 Sync fetch fails
**Trigger:** Google API returns error during periodic sync.
**System response:** Silent retry on next sync cycle (every 15 minutes).
After 3 consecutive failures: show warning in settings.
**State after:** Last successful sync data preserved.

## 7. Edge Cases

### 7.1 External event updated
**Condition:** An event in Google Calendar changes time.
**Expected behaviour:** On next sync cycle, the local external event
updates to match. No notification for external event changes.

### 7.2 External event deleted
**Condition:** Event deleted in Google Calendar.
**Expected behaviour:** On next sync cycle, the local external event
is removed from the family calendar.

### 7.3 Multiple adults syncing same Google calendar
**Condition:** Two parents both connect and import the same shared
Google calendar.
**Expected behaviour:** Events appear once per connected user. The
family calendar may show duplicates. No automatic deduplication
(too complex for v2).

## 8. Rollback Path

**Failure point:** OAuth tokens saved but initial sync fails.
**Rollback action:** Connection exists but shows "Sync ausstehend" /
"Sync pending." Retry on next cycle. User can disconnect and reconnect.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| 5A.2 | CalendarConnection | Create | userId, provider, accessToken, refreshToken |
| 5A.5 | ExternalCalendarEvent | Create (batch) | All fields for each imported event |
| Sync cycle | ExternalCalendarEvent | Update/Delete | Updated or removed events |

## 10. Acceptance Criteria

- **AC-001:** The system shall support Google Calendar OAuth connection.
- **AC-002:** The system shall display the user's external calendars
  for selection after authorization.
- **AC-003:** The system shall sync selected external calendars every
  15 minutes.
- **AC-004:** External events shall render on the family calendar with
  a provider icon badge and visually distinct styling.
- **AC-005:** External events shall be read-only in Familienzentrale.
- **AC-006:** The system shall store OAuth tokens encrypted at rest.
- **AC-007:** When a user disconnects a calendar, the system shall
  delete all associated external events and tokens.

### State Criteria

- **AC-010:** While sync is in progress, the system shall show a
  subtle sync indicator.
- **AC-011:** If OAuth is denied, the system shall return to settings
  with an informational message.
- **AC-012:** If the connection token expires, the system shall show
  a "Reconnect" status on the connection.

### Invariants

- **INV-001:** OAuth tokens must never be exposed to the frontend.
- **INV-002:** External events must never be editable in Familienzentrale.
- **INV-003:** Disconnecting a calendar must delete all associated data.

## 11. Success Criteria

- Parents with Google Calendar connected have higher retention rates.
- Sync latency (time from external change to visibility) is under
  15 minutes.

## 12. Constraints (DO NOT List)

- DO NOT implement real-time push sync (WebSocket/webhooks) — polling only
- DO NOT implement write-back to external calendars by default (opt-in)
- DO NOT implement automatic deduplication of shared calendars
- DO NOT sync tasks or routines — events only
- DO NOT store OAuth tokens unencrypted
- DO NOT expose tokens to the frontend

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
