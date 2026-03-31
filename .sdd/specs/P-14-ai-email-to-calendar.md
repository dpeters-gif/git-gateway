---
document: spec
title: "AI Email-to-Calendar"
journey-id: "P-14"
version: 1.0.0
status: Draft
last-updated: "2026-03-31"
author: "PM + Atlas"
depends-on:
  - constitution.md v2.0.0
  - M-1-monetization.md
related-entities:
  - EmailInboxItem
  - Event
  - Task
  - Family
subscription-tier: familyplus
---

# AI Email-to-Calendar

## 1. Context

Parents receive 5-10 school/activity emails per week, each buried in
paragraphs of text with dates, deadlines, and action items hidden in
the middle. Manually copying these to a calendar costs 4+ hours/month
(source: Sense marketing claims, validated by user research). An AI
pipeline that extracts events from forwarded emails solves this with
one action: forward the email.

## 2. Goal

A parent forwards a school or activity email to the family's unique
inbox address. The system's AI extracts event titles, dates/times,
deadlines, and action items. Extracted items appear in a "Posteingang"
/ "Inbox" section on the parent Home screen as pending cards. The
parent reviews and adds to calendar with one tap.

## 3. Non-Goals

- This journey does not auto-add events without parent confirmation
- This journey does not implement email account connection (IMAP/OAuth) — forward-only
- This journey does not implement email replies or two-way communication
- This journey does not store original email bodies beyond 24 hours
- This journey does not parse attachments (PDFs, images)

## 4. User Stories

- As a parent, I want to forward a school email and have dates
  automatically extracted, so that I don't have to read every paragraph.
- As a parent, I want to review extracted events before they go on
  the calendar, so that I stay in control.
- As a parent, I want to dismiss irrelevant extractions with one tap,
  so that my inbox stays clean.

## 5. Happy Path

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Forwards school email to `mustermann@inbox.familienzentrale.app` | Email received by inbound email service. Stored temporarily. | Email received |
| 2 | System | Edge Function `email-to-calendar` triggers | AI (Claude API) parses email body. Extracts: event titles, dates, times, deadlines, action items. Returns structured JSON. | Parsed |
| 3 | System | Creates EmailInboxItem records | One record per extracted item. Status: `pending`. Original email body scheduled for deletion in 24h. | Items created |
| 4 | Parent | Opens app, sees Home screen | "Posteingang" section shows pending items as cards. Each card: title, date, extracted source snippet (1 line), "Hinzufügen" / "Add" and "Verwerfen" / "Dismiss" buttons. | Inbox visible |
| 5 | Parent | Taps "Hinzufügen" on field trip card | Event creation form opens, pre-filled with: title ("Ausflug — Museum"), date, time, description. Parent can modify. | Form pre-filled |
| 6 | Parent | Confirms event creation | Event created on calendar. EmailInboxItem status → `added`. Card removed from inbox with fadeOut. | Event on calendar |
| 7 | Parent | Taps "Verwerfen" on irrelevant item | EmailInboxItem status → `dismissed`. Card removed from inbox. | Item dismissed |

## 6. Email Processing

### Inbound Address

Each family gets a unique forwarding address:
`{family_slug}@inbox.familienzentrale.app`

The family slug is generated from the family name (slugified, unique).
Displayed in Settings → Email-to-Calendar.

### Processing Pipeline

1. Inbound email webhook receives the email (via email service provider like Postmark, SendGrid, or Resend)
2. Edge Function validates sender (must be from a registered adult email in the family)
3. Email body (plain text extracted from HTML) sent to Claude API with extraction prompt
4. Claude returns structured JSON: `{ items: [{ title, date, time?, endTime?, type: 'event' | 'deadline' | 'action', description?, urgency: 'high' | 'normal' }] }`
5. EmailInboxItem records created for each extracted item
6. Original email body deleted from storage after 24 hours
7. Notification sent to parent: "3 neue Termine aus E-Mail erkannt" / "3 new events extracted from email"

### AI Prompt Template

```
You are a family calendar assistant. Extract all calendar-relevant
items from this school/activity email. For each item, provide:
- title: short, clear event name
- date: YYYY-MM-DD format
- time: HH:mm format (if mentioned, null if all-day)
- endTime: HH:mm (if mentioned)
- type: "event" (has date/time), "deadline" (has due date), "action" (requires parent action)
- description: 1-2 sentences of relevant context
- urgency: "high" (within 3 days) or "normal"

Return ONLY valid JSON. No markdown, no explanation.
Email body:
---
{emailBody}
---
```

### Privacy

- Email bodies are processed server-side in Edge Functions only
- Original email text deleted within 24 hours
- Only extracted structured data (title, date, time, description) is stored permanently
- AI prompt contains no personal identifiers — only the email body text
- Family email address is not publicly discoverable

## 7. Entity

```sql
CREATE TABLE email_inbox_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, added, dismissed
  extracted_title TEXT NOT NULL,
  extracted_date DATE,
  extracted_time TIME,
  extracted_end_time TIME,
  extracted_type TEXT NOT NULL, -- event, deadline, action
  extracted_description TEXT,
  extracted_urgency TEXT DEFAULT 'normal',
  source_email_subject TEXT, -- for reference, not the body
  source_email_from TEXT,
  created_event_id uuid REFERENCES events(id), -- if added to calendar
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);
```

## 8. Acceptance Criteria

- **AC-001:** Forwarded emails are processed within 60 seconds of receipt.
- **AC-002:** Extracted items appear in the Posteingang section on parent Home.
- **AC-003:** "Hinzufügen" pre-fills the event creation form with extracted data.
- **AC-004:** "Verwerfen" removes the item without creating a calendar entry.
- **AC-005:** Original email body is deleted within 24 hours of processing.
- **AC-006:** Only emails from registered adult family member addresses are processed. Others are silently ignored.
- **AC-007:** If AI extraction fails or returns empty, the system creates one inbox item with the email subject as title and a note "Keine Termine erkannt" / "No events detected."

## 9. Invariants

- **INV-001:** Events are NEVER auto-created. Parent confirmation is always required.
- **INV-002:** Email bodies are NEVER stored beyond 24 hours.
- **INV-003:** This feature requires Family+ subscription tier.

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-31 | Initial spec — Sense-inspired email-to-calendar | PM + Atlas |
