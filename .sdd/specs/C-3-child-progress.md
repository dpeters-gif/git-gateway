---
document: spec
title: "Child Progress View"
journey-id: "C-3"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - C-1-child-daily-experience.md
related-entities:
  - Streak
  - Level
  - Badge
  - UserBadge
  - LeaderboardSnapshot
  - PointsLedger
---

# Child Progress View

## 1. Context

Beyond the daily screen, the child wants to see the bigger picture:
How am I doing overall? What have I earned? Where do I rank? This is
the "profile" screen — the place where accumulated effort becomes
visible identity. It must feel like a game stats screen, not a report.

## 2. Goal

The child sees their full progress — level, total XP, streak history,
earned badges, and leaderboard position — in a visually rich,
motivating screen.

## 3. Non-Goals

- This journey does not handle task completion (that is C-2)
- This journey does not handle reward redemption
- This journey does not show Care-Share data
- This journey does not allow editing any progress data

## 4. User Stories

- As a child, I want to see all my earned badges displayed like
  trophies, so that I feel proud of my achievements.
- As a child, I want to see where I rank on the family leaderboard,
  so that I have friendly motivation to contribute more.
- As a child, I want to see my streak history and longest streak,
  so that I'm motivated to beat my record.

## 5. Happy Path

**Starting state:** Child is authenticated and navigates to the
"Progress" tab in the bottom navigation.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Child | Taps "Fortschritt" / "Progress" tab | System loads progress data. Skeleton loader shown. | Loading |
| 2 | System | Data loaded | Screen renders with staggered animations: level hero section → streak stats → badge collection → leaderboard. | Progress visible |
| 3 | Child | Sees level hero section | Large level badge (circular, 80px, level number in display size), total XP counter, XP bar to next level. Animated entrance: bounceIn for level badge. | Level shown |
| 4 | Child | Sees streak stats | Current streak (flame + count), longest streak ("Dein Rekord: 14 Tage" / "Your record: 14 days"), calendar heat map showing last 30 days (dots: green=completed, gray=missed, gold=today). | Streaks shown |
| 5 | Child | Sees badge collection | Grid of earned badges (filled, with glow) and locked badges (grayed silhouettes with "?" or lock icon). Tapping an earned badge shows name + description + earned date. | Badges shown |
| 6 | Child | Sees leaderboard | Ranked list of family children. Each row: position number, avatar, name, weekly XP. Top 3 highlighted (gold/silver/bronze). Current child's row highlighted with primary color. Position change arrows (↑2, ↓1, —). | Leaderboard shown |
| 7 | Child | Toggles leaderboard period | Tabs: "Diese Woche" / "This week" and "Diesen Monat" / "This month". Data updates on tab switch. | Period toggled |

**End state:** Child has a comprehensive view of their achievements
and standing.

## 6. Failure Paths

### 6.1 API error
**Trigger:** Progress endpoint returns 500.
**System response:** Child-friendly error state with retry button.
**State after:** Error displayed. Retry re-fetches.

### 6.2 No badges earned yet
**Trigger:** New child with zero badges.
**System response:** Badge section shows all badges as locked silhouettes
with encouraging text: "Erledige Quests, um Abzeichen zu verdienen!" /
"Complete quests to earn badges!"
**State after:** Empty badge collection with locked previews.

## 7. Edge Cases

### 7.1 Only one child in family
**Condition:** Family has a single child.
**Expected behaviour:** Leaderboard shows single entry at position 1.
No "you are last" concern. Text: "Du bist der Star!" / "You're the
star!" instead of competitive framing.

### 7.2 Tied leaderboard positions
**Condition:** Two children have the same weekly XP.
**Expected behaviour:** Both share the same position number. Next
position skips (1, 1, 3 — not 1, 1, 2).

## 8. Rollback Path

This journey is entirely read-only. No rollback needed.

## 9. Data Side Effects

No data is created, updated, or deleted by this journey.

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall display the child's current level as a
  large circular badge (80px) with bounceIn entrance animation.
- **AC-002:** The system shall display current streak count, longest
  streak record, and a 30-day calendar heat map.
- **AC-003:** The system shall display earned badges as filled icons
  with glow and unearned badges as grayed silhouettes.
- **AC-004:** When the child taps an earned badge, the system shall
  show the badge name, description, and earned date.
- **AC-005:** The system shall display a family leaderboard ranked by
  XP with weekly and monthly period tabs.
- **AC-006:** The leaderboard shall highlight the current child's row
  and show position change indicators (↑↓—).
- **AC-007:** The leaderboard shall never display negative framing
  ("last place", "worst") — only position numbers and encouragement.

### State Criteria

- **AC-010:** While data is loading, the system shall show skeleton
  loaders matching the progress view layout.
- **AC-011:** While no badges are earned, the system shall show locked
  badge silhouettes with encouraging text.
- **AC-012:** If the API returns an error, the system shall show a
  child-friendly error message with retry.

### Invariants

- **INV-001:** Leaderboard data must only include children in the
  same family — never cross-family data.
- **INV-002:** Streak calculations must match the points ledger — the
  progress view must never show a different streak than the daily view.

## 11. Success Criteria

- Children check the progress screen at least once per week.
- The leaderboard motivates task completion without causing distress.

## 12. Constraints (DO NOT List)

- DO NOT show adult members on the children's leaderboard
- DO NOT show exact XP totals of other children — only the current
  child's own total and relative positions
- DO NOT implement badge editing or manual badge assignment — badges
  are earned automatically by the gamification engine
- DO NOT show Care-Share or family management data

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
