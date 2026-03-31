---
document: spec
title: "Weekly Family Recap Digest"
journey-id: "P-10"
version: 1.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - S-3-gamification-engine.md
  - P-7-care-share.md
related-entities:
  - WeeklyRecap
  - Task
  - PointsLedger
  - Challenge
  - Streak
  - Badge
  - UserBadge
  - FamilyMember
---

# Weekly Family Recap Digest

## 1. Context

Families live week-to-week. At the end of each week, there is no
reflection point — no summary of what happened, who contributed, what
was achieved. A weekly recap card creates a moment of family pride:
"Look what we did this week." It also gives parents an at-a-glance
history without digging through task logs.

## 2. Goal

Every Monday morning, the system generates a visual weekly recap card
showing the family's accomplishments from the previous week — tasks
completed, XP earned, streaks maintained, badges earned, challenge
progress — displayed as a celebratory in-app card and optionally
accessible as a shareable summary.

## 3. Non-Goals

- This journey does not implement email delivery of the recap
- This journey does not implement social media sharing
- This journey does not implement historical recap browsing (only
  current + previous week)
- This journey does not generate per-child report cards

## 4. User Stories

- As a parent, I want to see a weekly summary of family activity on
  Monday morning, so that I appreciate what was accomplished.
- As a child, I want to see my weekly achievements highlighted, so
  that I feel recognized for my effort.
- As a parent, I want to compare this week to the previous week, so
  that I see trends (improving or declining engagement).

## 5. Happy Path

**Starting state:** It is Monday 07:00. The system has generated the
weekly recap for the previous week (Mon-Sun). Parent opens the app.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Opens app on Monday | Home screen (P-1) shows a prominent weekly recap card at the top: "Eure Woche" / "Your week" with a sparkle/celebration icon. Card uses a subtle gradient background (primary-light). | Recap card visible |
| 2 | Parent | Taps recap card | System opens the full recap view as a bottom sheet (phone) or dialog (tablet). Sections appear with staggered slideUp animation. | Recap open |
| 3 | Parent | Reads recap | Recap shows: (a) Family headline stat ("23 Aufgaben erledigt" / "23 tasks completed"), (b) Per-member breakdown (avatar + name + tasks completed + XP earned), (c) Streaks section (who maintained/started/broke streaks), (d) Badges earned this week (avatar + badge icon), (e) Challenge progress (if active), (f) Week-over-week comparison arrow (↑12% more tasks). | Data visible |
| 4 | Parent | Scrolls to bottom | "Letzte Woche" / "Previous week" link shows the prior week's recap for comparison. | History link |
| 5 | Parent | Closes recap | Returns to Home. Recap card remains visible until Tuesday (then collapses to a compact "Wochenrückblick ansehen" / "View recap" link). | Card dismissed |

**Child path:**

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Child | Opens app on Monday | My Day (C-1) shows a personal recap mini-card: "Deine Woche: 8 Quests, 65 XP, 7-Tage-Serie! 🎉" | Mini-card visible |
| 2 | Child | Taps mini-card | Shows child-focused recap: quests completed, XP earned, streak status, badges earned. No other family member details. No Care-Share. | Child recap |

## 6. Failure Paths

### 6.1 No activity in previous week
**Trigger:** Family had zero task completions in the previous week.
**System response:** Recap still generates with encouraging message:
"Ruhige Woche — diese Woche wird's aktiv!" / "Quiet week — let's
make this one count!" Shows 0 tasks, no streaks, no badges.
**State after:** Recap card visible with empty-state content.

### 6.2 Recap generation fails
**Trigger:** Server error during recap calculation.
**System response:** Recap card not shown. No error displayed to user.
Retry on next app open (server recalculates on-demand if missing).
**State after:** No recap card. Normal home screen.

## 7. Edge Cases

### 7.1 Family created mid-week
**Condition:** Family was created on Thursday. First Monday arrives.
**Expected behaviour:** Recap covers Thu-Sun only. "Eure ersten
Tage" / "Your first days" as headline instead of "Eure Woche."

### 7.2 Single-person family
**Condition:** Only one adult, no children.
**Expected behaviour:** Recap shows personal summary only. No per-member
comparison. No leaderboard mention.

### 7.3 Child visits on Tuesday
**Condition:** Child opens app on Tuesday.
**Expected behaviour:** Mini-card still visible but compact. Disappears
on Wednesday.

## 8. Rollback Path

Read-only feature. Recap is calculated from existing data. No rollback.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Monday 00:00 | WeeklyRecap | Create | familyId, weekStart, weekEnd, data (JSON) |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall generate a weekly recap every Monday
  at 00:00 (family timezone) covering the previous Mon-Sun.
- **AC-002:** The system shall display the recap as a prominent card
  on the parent home screen on Monday and Tuesday.
- **AC-003:** The recap shall include: total tasks completed, per-member
  breakdown (tasks + XP), streak statuses, badges earned, and active
  challenge progress.
- **AC-004:** The recap shall include a week-over-week comparison
  showing percentage change in total tasks completed.
- **AC-005:** The system shall display a personal recap mini-card on
  the child My Day screen on Monday and Tuesday.
- **AC-006:** The child recap shall only include the child's own data
  — not other family members' details.

### State Criteria

- **AC-010:** Where the family had zero activity, the system shall
  display an encouraging empty-state recap.
- **AC-011:** If recap generation fails, the system shall not display
  a recap card (fail silently, retry on next access).

### Layout Criteria

- **AC-020:** The parent recap card on the home screen shall use a
  subtle gradient background distinguishing it from regular content.
- **AC-021:** The full recap view shall use staggered slideUp animation
  for section entrance.
- **AC-022:** Per-member rows shall display: avatar, name, task count,
  XP earned. Sorted by XP descending.

### Invariants

- **INV-001:** Recap data must be derived from the points_ledger and
  task completion records — never from stored counters.
- **INV-002:** Child recap must never include Care-Share data or other
  children's individual performance.
- **INV-003:** Recap generation must not modify any source data.

## 11. Success Criteria

- 60% of parents view the weekly recap on Monday or Tuesday.
- Families with regular recap engagement show 15% higher weekly task
  completion rates.

## 12. Constraints (DO NOT List)

- DO NOT implement email delivery — in-app only
- DO NOT implement social sharing
- DO NOT implement historical recap browsing beyond previous week
- DO NOT implement per-child "report card" exports
- DO NOT show negative framing ("Dennis only completed 2 tasks") —
  always positive or neutral
- DO NOT include Care-Share data in the recap — that is a separate
  feature (P-7)

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-30 | Initial spec — weekly family recap digest | PM + VEGA |
