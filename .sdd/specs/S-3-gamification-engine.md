---
document: spec
title: "Gamification Engine"
journey-id: "S-3"
version: 1.0.0
status: Draft
last-updated: "2026-03-29"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - C-2-task-completion-xp.md
related-entities:
  - Streak
  - Level
  - Badge
  - UserBadge
  - Challenge
  - ChallengeProgress
  - LeaderboardSnapshot
  - PointsLedger
---

# Gamification Engine

## 1. Context

The gamification engine is the backend system that calculates streaks,
manages levels, awards badges, tracks challenges, and snapshots
leaderboards. It runs as logic triggered by task completion events
and periodic calculations — not as a separate service.

## 2. Goal

The engine correctly calculates all gamification state (streaks,
levels, badges, challenges, leaderboard) from the append-only XP
ledger as the single source of truth.

## 3. Non-Goals

- This engine does not define UI rendering (that is C-1, C-2, C-3)
- This engine does not handle reward fulfillment (that is P-4)
- This engine does not implement sound effects or haptics

## 4. Core Mechanics

### XP and Levels

- XP is earned by completing tasks (0-100 XP per task, set by parent)
- XP is recorded in the append-only points_ledger (never updated/deleted)
- Total XP = SUM of all points_ledger entries for a user
- Level thresholds: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP,
  Level 4 = 500 XP, Level 5 = 800 XP, then +400 per level thereafter
- Current level XP = total XP minus the threshold for current level
- The Level entity is a cache — always derivable from total XP

### Streaks

- A streak day is any calendar day where the user has at least one
  points_ledger entry
- Streak count = number of consecutive days ending today (or yesterday
  if before 18:00 cutoff) with at least one completion
- Streak is broken if a full calendar day passes with no completion
- Longest streak is the maximum streak ever achieved (stored)
- Streak is calculated from the ledger, not stored as a running counter
  (prevents corruption)

### Badges

System-defined badges awarded automatically when criteria are met:

| Badge | Criteria | Category |
|-------|----------|----------|
| First Quest | Complete 1 task | Milestone |
| Week Warrior | 7-day streak | Streak |
| Month Master | 30-day streak | Streak |
| Level 5 | Reach level 5 | Level |
| Level 10 | Reach level 10 | Level |
| Century | Earn 100 total XP | XP |
| Thousand | Earn 1000 total XP | XP |
| Team Player | Contribute to 5 challenges | Social |
| Quest Creator | Create 10 tasks (if permitted) | Participation |

Badge checks run on every task completion. Once earned, badges are
permanent (never revoked).

### Challenges

- Created by parents (P-4) with target count, date range, type
- Individual challenges: per-child progress
- Family challenges: sum of all family members' qualifying completions
- A task "qualifies" if completed within the challenge date range
- Challenge completes when progress reaches target count
- Expired challenges remain visible in history

### Leaderboard

- Snapshots taken daily at midnight (family timezone)
- Weekly leaderboard: XP earned Mon-Sun of current week
- Monthly leaderboard: XP earned in current calendar month
- Rankings include only child family members
- Ties share position, next position skips (1, 1, 3)

## 5. Acceptance Criteria

- **AC-001:** The system shall record XP in an append-only ledger
  with unique constraint on (userId, taskId, reason).
- **AC-002:** The system shall calculate level from total XP using
  the defined threshold table.
- **AC-003:** The system shall calculate streak from consecutive
  daily ledger entries — not from a stored counter.
- **AC-004:** The system shall check badge criteria on every task
  completion and award new badges immediately.
- **AC-005:** The system shall update challenge progress when a
  qualifying task is completed within the challenge date range.
- **AC-006:** The system shall snapshot leaderboard rankings daily.
- **AC-007:** The system shall never UPDATE or DELETE points_ledger rows.

### Invariants

- **INV-001:** Total XP must always equal SUM(points) from points_ledger.
- **INV-002:** Level must always be derivable from total XP.
- **INV-003:** Streak must always be derivable from points_ledger dates.
- **INV-004:** Badges once earned are never revoked.
- **INV-005:** Challenge progress must equal count of qualifying
  task completions within date range.

## 6. Constraints (DO NOT List)

- DO NOT implement mutable XP (no spending XP, no XP decay)
- DO NOT implement badge revocation
- DO NOT implement real-time leaderboard (daily snapshot is sufficient)
- DO NOT implement custom badge creation by parents (system-defined only)
- DO NOT store streak as a mutable counter — always derive from ledger

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial spec | PM + VEGA |
