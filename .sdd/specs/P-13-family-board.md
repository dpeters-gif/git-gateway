---
document: spec
title: "Family Board"
journey-id: "P-13"
version: 1.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - P-1-parent-weekly-overview.md
  - design-constraints.md
  - design-tokens.md
related-entities:
  - BoardNote
  - Family
  - FamilyMember
---

# Family Board

## 1. Context

Every family has a communication layer that lives outside task
management — "Don't forget grandma's birthday Saturday," "The plumber
comes Wednesday between 10-12," "Here's the photo for the school
form," "Dennis has a playdate at Leo's — pickup at 17:00." Today
this information lives in WhatsApp, sticky notes on the fridge, or
verbal reminders that get forgotten. A digital family board inside
Familienzentrale replaces the fridge door — a shared space where any
family member can post notes, reminders, or images that the whole
family sees.

## 2. Goal

All family members (adults and children) can post, view, and manage
notes on a shared family board — displayed as a section on the Home
dashboard, serving as the family's digital fridge door for
announcements, reminders, images, and quick messages.

## 3. Non-Goals

- This journey does not implement real-time chat or messaging
- This journey does not implement threaded replies or comments
- This journey does not implement note categories, tags, or pinning
- This journey does not replace the notification system (P-9)
- This journey does not implement file sharing beyond images
- This journey does not implement @mentions or directed notes
- This journey does not create a separate navigation tab — the board
  lives on the Home dashboard

## 4. User Stories

- As a parent, I want to post a note to the family board so that
  everyone sees important information without me telling each person.
- As a child, I want to post a message or image to the board so that
  I can share things with my family.
- As a family member, I want to see the latest board notes on the
  home screen so that I don't miss anything without navigating away.
- As a parent, I want to set an optional expiry date on a note so
  that outdated information auto-archives after the date passes.
- As a parent, I want to delete any note on the board so that I can
  remove outdated or inappropriate content.

## 5. Happy Path

### 5A. Parent Posts a Text Note

**Starting state:** Parent is on the Home dashboard. The "Familienboard"
section is visible below the weekly calendar overview, showing recent
notes.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps the "+" button in the Board section header | System opens the note creation form as a dialog (tablet) or bottom sheet (phone). Fields: text area* (max 500 chars), optional image upload, optional expiry date. | Form open |
| 2 | Parent | Types: "Klempner kommt Mittwoch 10-12 Uhr — bitte jemand zuhause sein!" | Text area shows live character count (e.g., "68/500"). | Text entered |
| 3 | Parent | Sets optional expiry: Wednesday | Date picker (Mobiscroll) sets expiry. Subtle clock icon appears on the form preview. | Expiry set |
| 4 | Parent | Taps "Posten" / "Post" | System creates the note. Board section refreshes. Note appears at the top (newest first). Author avatar and relative timestamp shown ("gerade eben" / "just now"). Framer Motion slideUp entrance. | Note posted |

### 5B. Child Posts with Image

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Child | Taps "+" on the Board section (from child My Day, which also shows the Board section) | Note creation form opens. Same fields as parent. | Form open |
| 2 | Child | Taps camera icon, takes a photo of their drawing | Camera opens (or gallery picker). Child captures/selects image. Compressed preview shown (max 1200px, JPEG 80%). | Image attached |
| 3 | Child | Types: "Schaut mal was ich gebastelt habe!" and taps "Posten" | Note created with image thumbnail and text. Visible to all family members on the board. | Note posted |

### 5C. Viewing Notes on Home Dashboard

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Any member | Opens app / navigates to Home | Home dashboard shows: (1) Weekly calendar overview (P-1) as the primary section, (2) "Familienboard" section below it showing the 3 most recent non-expired notes as compact cards. Each card: author avatar, text preview (2-line truncation), image thumbnail if present, relative timestamp, expiry indicator if set. | Preview visible |
| 2 | Member | Taps "Alle anzeigen" / "View all" | System expands the board to a full-page view (same route, scrolled section, or a sub-route `/home/board`). All notes displayed in reverse chronological order. Expired notes hidden by default with "Archivierte anzeigen" / "Show archived" toggle. | Full board |
| 3 | Member | Taps an image thumbnail | Image expands to a full-screen lightbox overlay. Tap outside or swipe down to dismiss. | Image viewed |

### 5D. Deleting a Note

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Adult or note author | Taps the "..." menu on a note | Options shown: "Löschen" / "Delete". Adults see delete on all notes. Children see delete only on their own notes. | Menu open |
| 2 | User | Taps "Löschen" | Confirmation dialog: "Diese Notiz löschen?" / "Delete this note?" | Confirmation |
| 3 | User | Confirms | Note removed. Board refreshes. Success toast. | Deleted |

**End state:** The family board shows the latest notes for all
members, accessible directly from the home screen.

## 6. Failure Paths

### 6.1 Empty note text
**Trigger:** User taps "Post" with empty text and no image.
**System response:** Inline error: "Text oder Bild erforderlich" /
"Text or image required." Post button remains disabled until content
is provided.
**State after:** Form open, nothing posted.

### 6.2 Image upload fails
**Trigger:** Network error during image upload.
**System response:** Error message: "Bild konnte nicht hochgeladen
werden — nochmal versuchen" / "Image could not be uploaded — try
again." Retry button. Text content preserved.
**State after:** Form open, image pending retry.

### 6.3 API error on post
**Trigger:** Server returns 500 on note creation.
**System response:** Error toast. Form remains open with all content
preserved.
**State after:** Form open, no note created.

### 6.4 Unauthorized delete attempt
**Trigger:** Child attempts to delete another member's note via API.
**System response:** 403 response. Toast: "Du kannst nur eigene
Notizen löschen" / "You can only delete your own notes."
**State after:** Note remains.

## 7. Edge Cases

### 7.1 Note with only an image (no text)
**Condition:** User posts an image without any text.
**Expected behaviour:** Valid post. Board shows the image with author
avatar and timestamp. No text preview — just the image thumbnail.

### 7.2 Note expiry
**Condition:** A note's expiry date has passed.
**Expected behaviour:** Note is hidden from the default board view.
Visible in "Archivierte" / "Archived" section. Expired notes are
never deleted automatically — only hidden. Adults can delete them
manually.

### 7.3 Many notes (50+)
**Condition:** Family accumulates many notes over time.
**Expected behaviour:** Home dashboard always shows only the 3 most
recent non-expired notes. Full board view paginates or uses infinite
scroll (load 20 at a time). Performance remains acceptable.

### 7.4 Board section on child "My Day" screen
**Condition:** Child opens the app (sees C-1 My Day).
**Expected behaviour:** The "Familienboard" section appears below
the quest list on My Day, showing the same 3 most recent notes.
Same interaction: tap to expand, tap "+" to post. Uses child UI
styling (warmer background, larger touch targets).

### 7.5 Note with very long text
**Condition:** User posts a 500-character note.
**Expected behaviour:** On the home preview, text truncates at 2 lines
with ellipsis. On the full board view, full text is visible (wrapping,
no truncation). Scrollable if needed.

## 8. Rollback Path

**Failure point:** Note creation succeeds but image upload fails.
**Rollback action:** Note is created without the image. User can
delete and re-post. Image upload and note creation are handled in a
single request (multipart) to prevent partial state.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Post note | BoardNote | Create | familyId, authorUserId, text, imageUrl, expiresAt, createdAt |
| Delete note | BoardNote | Delete | Entire record + associated image file |
| Expiry | BoardNote | (read filter) | Notes past expiresAt hidden from default view |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall display a "Familienboard" section on
  the parent Home dashboard (P-1) showing the 3 most recent non-expired
  notes.
- **AC-002:** The system shall display a "Familienboard" section on
  the child My Day screen (C-1) showing the 3 most recent non-expired
  notes.
- **AC-003:** When a user taps "+", the system shall open a note
  creation form with: text area (max 500 chars), optional image
  upload, and optional expiry date picker.
- **AC-004:** When a user submits a valid note (text and/or image),
  the system shall create the note and display it on the board.
- **AC-005:** The system shall display notes in reverse chronological
  order (newest first).
- **AC-006:** The system shall display each note with: author avatar,
  author name, relative timestamp, text (truncated to 2 lines in
  preview), and image thumbnail (if present).
- **AC-007:** When a user taps "View all," the system shall display
  all non-expired notes in a scrollable list.
- **AC-008:** Adults shall be able to delete any note. Children shall
  only be able to delete their own notes.
- **AC-009:** When a user taps an image thumbnail, the system shall
  display the image in a full-screen lightbox.
- **AC-010:** Where a note has an expiry date that has passed, the
  system shall hide it from the default board view.

### State Criteria

- **AC-020:** While the board is loading, the system shall display
  skeleton loaders matching the note card layout.
- **AC-021:** While no notes exist, the system shall display an
  encouraging empty state: illustration + "Noch keine Nachrichten —
  schreib die erste!" / "No messages yet — write the first one!" +
  "+" CTA.
- **AC-022:** If the board API returns an error, the system shall
  display the board section with an error message and retry button.
  The rest of the Home dashboard remains functional.
- **AC-023:** While posting a note, the system shall show a loading
  spinner on the Post button and disable the form.

### Validation Criteria

- **AC-030:** If neither text nor image is provided, the system shall
  disable the Post button.
- **AC-031:** If text exceeds 500 characters, the system shall prevent
  further input and show a character count in error color.
- **AC-032:** Images shall be compressed to max 1200px on longest edge,
  JPEG quality 80%, max 5MB upload size.

### Layout Criteria

- **AC-040:** On tablet (≥ 768px), the board section on Home shall
  display notes as a horizontal row of 3 compact cards below the
  weekly overview.
- **AC-041:** On phone (< 768px), the board section shall display
  notes as a vertical stack of compact cards.
- **AC-042:** The note creation form shall open as a dialog (≥ 768px)
  or bottom sheet (< 768px).
- **AC-043:** The full board view shall use a single-column card list,
  max-width 640px, centered.

### Invariants

- **INV-001:** Board notes must be scoped to the family — no
  cross-family access.
- **INV-002:** Children must never be able to delete notes authored
  by other family members.
- **INV-003:** Expired notes must never be permanently deleted by the
  system — only hidden from the default view. Manual deletion by adults
  is the only way to permanently remove a note.
- **INV-004:** The board section must never block or slow the Home
  dashboard loading — it loads independently and fails silently.

## 11. Success Criteria

- 40% of active families post at least one board note per week.
- Board notes reduce "I forgot to tell you" moments (measured by
  user feedback).
- The Home dashboard remains under 2.5s LCP despite the additional
  board section.

## 12. Constraints (DO NOT List)

- DO NOT implement real-time messaging or chat
- DO NOT implement threaded replies or comments on notes
- DO NOT implement pinning or note reordering — strictly chronological
- DO NOT implement note categories, tags, or colors
- DO NOT create a separate navigation tab — board is a Home section
- DO NOT implement @mentions or notification triggers from board posts
- DO NOT implement rich text editing — plain text only
- DO NOT implement file sharing beyond images (no PDFs, no documents)
- DO NOT auto-delete expired notes — only hide them

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-30 | Initial spec — Family Board | PM + VEGA |
