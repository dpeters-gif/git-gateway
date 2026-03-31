---
document: spec
title: "Child Avatar & Character Progression"
journey-id: "C-6"
version: 1.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - C-1-child-daily-experience.md
  - S-3-gamification-engine.md
related-entities:
  - ChildAvatar
  - AvatarItem
  - UserBadge
  - Level
---

# Child Avatar & Character Progression

## 1. Context

Children return to apps where they have a "self" to grow. Habitica
has avatars. PointUp has characters with 15 levels. Duolingo has
streak-powered owls. Familienzentrale currently shows a simple avatar
(initials or photo). A character system where the avatar evolves with
level-ups — new outfits, accessories, backgrounds unlocked by
achievements — gives children a persistent, visual reason to return.

## 2. Goal

Each child has a customizable avatar character that evolves as they
level up and earn badges — unlocking new items (hats, shirts,
backgrounds, accessories) at each level, creating a visual
representation of their progress.

## 3. Non-Goals

- This journey does not implement avatar-to-avatar interaction
- This journey does not implement avatar animation beyond idle state
- This journey does not implement a marketplace or currency for items
  (items are level/badge-locked, not purchased)
- This journey does not implement custom item creation
- This journey does not replace the parent-facing user avatar (adults
  keep initials/photo)

## 4. User Stories

- As a child, I want to customize my avatar with different features,
  so that it represents me.
- As a child, I want to unlock new avatar items when I level up, so
  that leveling up feels rewarding beyond a number.
- As a child, I want to see my avatar on my home screen, so that my
  space feels personal.
- As a child, I want to see locked items with their unlock requirement
  ("Level 5"), so that I know what I'm working toward.

## 5. Happy Path

**Starting state:** Child opens the app for the first time after
the avatar feature launches. Child is Level 3 with 2 badges.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | System | Detects no avatar configured | Prompt on My Day: "Erstelle deinen Charakter!" / "Create your character!" with a colorful CTA. | Prompt shown |
| 2 | Child | Taps CTA | Avatar editor opens: base character (gender-neutral outline), customization tabs: Skin, Hair, Top, Bottom, Accessory, Background. Each tab shows available (unlocked) and locked items. | Editor open |
| 3 | Child | Selects skin tone, hair style, shirt | Character preview updates in real-time. Items available at Level 1 are pre-unlocked. | Customized |
| 4 | Child | Sees locked items | Locked items show a lock icon + "Level 5" or "7-Tage-Serie" requirement label. Tapping shows a tooltip: "Erreiche Level 5 um dieses Item freizuschalten" / "Reach Level 5 to unlock this item." | Lock visible |
| 5 | Child | Taps "Fertig" / "Done" | Avatar saved. Character appears on: My Day greeting section, child nav header, leaderboard row, weekly recap. | Avatar saved |

**Level-up unlock path:**

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Child | Levels up (via C-2) | Standard level-up celebration plays. After celebration, a new card appears: "Neues Item freigeschaltet!" / "New item unlocked!" showing the unlocked item with a glow effect. | Item unlocked |
| 2 | Child | Taps "Anprobieren" / "Try it on" | Avatar editor opens with the new item highlighted and auto-equipped. Child can keep or swap. | Editor open |

## 6. Failure Paths

### 6.1 Avatar save fails
**Trigger:** Network error when saving avatar configuration.
**System response:** Error message with retry. Avatar editor stays
open with selections preserved.
**State after:** Avatar not saved. Retry available.

### 6.2 Child skips avatar creation
**Trigger:** Child dismisses the creation prompt.
**System response:** Default avatar shown (generic character with
the child's initial). Prompt does not reappear. Avatar editor
accessible from profile/settings anytime.
**State after:** Default avatar, editable later.

## 7. Edge Cases

### 7.1 Level downgrade (should not happen but defensive)
**Condition:** XP recalculation results in lower level (data fix).
**Expected behaviour:** Items remain unlocked. Items are never
re-locked once unlocked (permanent unlock).

### 7.2 Badge-locked items
**Condition:** Item requires "Week Warrior" badge (7-day streak).
**Expected behaviour:** Item shows badge icon + name as requirement.
Once badge is earned (permanent), item unlocks permanently.

### 7.3 Many items unlocked at once (bulk level-up)
**Condition:** Child goes from Level 1 to Level 5 in one session.
**Expected behaviour:** Show all newly unlocked items on a single
"New items!" card after the level-up celebration. Items listed with
mini-previews.

## 8. Rollback Path

Avatar configuration is a user preference — overwrite on save.
No complex rollback needed.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Initial creation | ChildAvatar | Create | userId, skinTone, hairStyle, top, bottom, accessory, background |
| Edit avatar | ChildAvatar | Update | Changed fields |
| Level-up unlock | AvatarItem | (read) | Items filtered by level/badge requirements |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall allow each child to create and customize
  an avatar character with: skin tone, hair style, top, bottom,
  accessory, and background.
- **AC-002:** The system shall display available items based on the
  child's current level and earned badges.
- **AC-003:** The system shall display locked items with their unlock
  requirement (level number or badge name).
- **AC-004:** When the child levels up, the system shall display newly
  unlocked items with a glow highlight and "try it on" option.
- **AC-005:** The system shall display the child's avatar on: My Day
  greeting, child nav header, leaderboard rows, and weekly recap.
- **AC-006:** The system shall provide a default avatar (generic
  character with child's initial) if the child skips creation.

### Item Distribution

- **AC-010:** Level 1: 3 skin tones, 4 hair styles, 3 tops, 3 bottoms,
  1 background (total: 14 items).
- **AC-011:** Each level 2-10 shall unlock 2-4 new items across
  categories.
- **AC-012:** Each streak badge (Week Warrior, Month Master) shall
  unlock 1 exclusive accessory.
- **AC-013:** Items once unlocked shall never be re-locked, regardless
  of level or streak changes.

### Layout Criteria

- **AC-020:** The avatar editor shall display as a full-screen view
  on phone and a centered dialog on tablet.
- **AC-021:** The avatar preview shall be at least 120×120px on tablet,
  centered above the item grid.
- **AC-022:** Category tabs shall use horizontal scrolling with icons.
- **AC-023:** Locked items shall use reduced opacity (0.4) with a
  lock icon overlay.

### Invariants

- **INV-001:** Avatar items must never be purchasable or tradeable —
  only level/badge-gated.
- **INV-002:** Once unlocked, an item must never be re-locked.
- **INV-003:** Avatar configuration must be stored per-child, never
  shared between children.

## 11. Success Criteria

- 80% of children create an avatar within the first week.
- 60% of children edit their avatar after a level-up within 24 hours.
- Children with customized avatars show 25% higher weekly return rate.

## 12. Constraints (DO NOT List)

- DO NOT implement animated avatars — static image only (for now)
- DO NOT implement avatar-to-avatar social features
- DO NOT implement item marketplace or trading
- DO NOT implement adult avatars — adults keep photo/initials
- DO NOT implement custom item uploads
- DO NOT implement more than 6 customization categories

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-30 | Initial spec — child avatar character system | PM + VEGA |
