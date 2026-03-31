---
document: spec-amendments
project: "Familienzentrale"
version: 1.0.0
status: Draft
last-updated: "2026-03-31"
author: "PM + Atlas"
applies-to:
  - P-1 v1.0.0
  - P-5 v1.0.0
  - P-9 v1.0.0
  - P-11 v1.0.0
  - S-1 v1.0.0
  - S-3-ENHANCED v2.0.0
---

# Spec Amendments — Consolidated

> Apply these amendments to the referenced specs before build.
> Each section specifies which spec it modifies.

---

## 1. P-1 — Parent Weekly Overview: Baby Column + Conflict Detection

### ADD to Related Entities:
- `CaregiverLink` (for share link generation from Home)

### ADD to User Stories:
- As a parent, I want to see my baby's schedule (nap, daycare, doctor)
  alongside older children's activities on the same week matrix.
- As a parent, I want to see a visual indicator when two events
  overlap for the same person, so I can resolve conflicts.

### ADD Acceptance Criteria:

- **AC-024:** Baby family members shall appear as a row in the week
  matrix with a distinct avatar (pacifier icon) and their assigned
  color.
- **AC-025:** Baby time blocks (nap, daycare) and events (doctor,
  milestones) shall render identically to child/adult items. Tasks
  related to the baby are assigned to parents and appear in the
  parent's row.
- **AC-026:** Where two or more events for the same family member
  overlap in time, the system shall display a conflict indicator
  (red dot, 8px) at the overlap point. Tapping the indicator shows
  a popover listing both conflicting events with times and titles.
- **AC-027:** Calendar items shall be clickable — tapping opens a
  detail popover showing: title, full time range, description,
  assignee, and action buttons (Edit, Delete, Complete for tasks).
- **AC-028:** Calendar items shall be draggable — drag to a different
  day to reschedule, drag to a different person row to reassign.
  On drop: optimistic update + undo toast (5 seconds).
- **AC-029:** Empty calendar cells shall be tappable — tapping opens
  a quick-create popover with date and person pre-filled.

### ADD to Constraints:
- DO NOT render baby members with gamification data — babies have
  no XP, no level, no streak. Their row shows only time blocks,
  events, and parent-assigned tasks.

---

## 2. P-5 — Family Management: Baby CRUD + Role Promotion

### ADD to Related Entities:
- `Subscription` (for member limit checks)

### ADD User Stories:

- As a parent, I want to add a baby to the family without creating
  login credentials, so that their schedule is visible.
- As a parent, I want to promote a baby to a child when they're old
  enough, so that they can start logging in and earning XP.

### ADD Happy Path — Baby Creation:

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Taps "Mitglied hinzufügen" / "Add member" | System shows role selection: "Erwachsener", "Kind (6-12)", "Baby / Kleinkind (0-5)" | Role selection |
| 2 | Parent | Selects "Baby / Kleinkind" | Form shows: name only. No username, no PIN. Color picker. | Baby form |
| 3 | Parent | Enters name "Leo", picks color | FamilyMember created with role=baby, managed_by_user_id=current parent. | Baby added |
| 4 | System | Baby appears in family list | Baby shown with pacifier avatar, assigned color. No login indicator. | Visible |

### ADD Happy Path — Baby → Child Promotion:

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Opens baby's profile in Settings | Profile shows: name, color, schedule summary. "Zum Kind hochstufen" / "Promote to child" button. | Profile open |
| 2 | Parent | Taps "Promote to child" | Form appears: username (required, unique), PIN (4 digits, required). | Credentials form |
| 3 | Parent | Enters username + PIN, confirms | System creates User record for the child. Links to existing FamilyMember. Role changes baby→child. ChildPermission record created with defaults (canCreateTasks=false, canCreateEvents=false). Companion creature egg awarded. | Promoted |
| 4 | System | Confirmation | Toast: "[Name] kann sich jetzt anmelden!" / "[Name] can now log in!" Creature egg animation. | Child active |

### ADD Acceptance Criteria:

- **AC-020:** The system shall support adding family members with
  role "baby" — name and color only, no credentials.
- **AC-021:** Baby members shall appear in the family member list with
  a pacifier avatar indicator and no login status.
- **AC-022:** The "Promote to child" action shall create a User
  record, change the role from baby to child, create default
  ChildPermission, and award a companion creature egg.
- **AC-023:** Promotion preserves all existing calendar data (time
  blocks, events) associated with the baby.
- **AC-024:** Family member count is checked against the subscription
  tier limit (3 free, 8 family, 12 family+) before adding any member.

### ADD to Data Side Effects:

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Baby create | FamilyMember | Create | role=baby, managed_by_user_id, name, color |
| Promotion | User | Create | name, username, password_hash (from PIN) |
| Promotion | FamilyMember | Update | role: baby→child, managed_by_user_id: set null |
| Promotion | ChildPermission | Create | defaults |
| Promotion | CompanionCreature | Create | creature egg for the new child |

---

## 3. P-9 — Smart Nudge Notifications: Push Notification Upgrade

### REMOVE Constraint:
```
- DO NOT implement push notifications or email — in-app only
```

### REPLACE with:
```
- Push notifications available for Family and Family+ subscribers
  via Capacitor push notification plugin (native) or Web Push API (PWA)
- In-app bell notifications available for ALL tiers (including free)
- Email notifications: NOT implemented in v1
- Sound notifications: NOT implemented (use in-app animation + sound)
```

### ADD Acceptance Criteria:

- **AC-030:** For Family/Family+ subscribers with push enabled, the
  system shall deliver nudge notifications via push in addition to
  the in-app bell.
- **AC-031:** Push notification content shall match the in-app nudge
  message (same context-aware text).
- **AC-032:** Parents can enable/disable push per child in Settings.
- **AC-033:** Parents can set quiet hours (no push between configured
  start and end times, e.g., 21:00-07:00).
- **AC-034:** Free tier users see push notifications as an upgrade
  prompt in the nudge settings UI.

### ADD to Non-Goals:
- This journey does not implement email notifications
- Push notification infrastructure (Capacitor plugin setup, push
  certificate management) is handled in the platform setup phase

---

## 4. P-11 — Shopping List: Visual Item Icons + Auto-Categorization

### ADD Acceptance Criteria:

- **AC-010:** The system shall display a category icon next to each
  shopping item, auto-matched from the item name. Categories: dairy,
  produce, meat, bakery, drinks, frozen, household, other. Icons from
  Lucide library.
- **AC-011:** Items shall auto-group by category in the list view
  with category section headers. Unchecked items sort by category,
  then by add date. Checked items sort to bottom.
- **AC-012:** The add field shall show auto-complete suggestions from
  previously added items in this family.
- **AC-013:** Items shall support drag-to-reorder within their
  category group.
- **AC-014:** The shopping list shall use Supabase Realtime for
  instant cross-device sync — when one person checks off "Milch,"
  the other person's phone updates within 1 second.

### MODIFY existing happy path:

Step 2 (adding item): When parent types item name, system shows
auto-complete dropdown from family's history. On confirm, item
appears with auto-assigned category icon and groups into the
matching category section.

---

## 5. S-1 — Onboarding: Baby Option + Emotional Script + Creature Egg

### MODIFY Step 3 (Family Members):

BEFORE: Add children form with name, username, PIN.

AFTER: Two card options presented:
- "Kind (6-12)" card — name, username, PIN (existing flow)
- "Baby / Kleinkind (0-5)" card — name only, no credentials

When baby is added, system suggests time blocks: "Kita / Daycare"
or "Mittagsschlaf / Nap" pre-filled with Mon-Fri schedule.

### ADD to Step 5 (Completion):

After "Geschafft!" celebration:
- Each child (NOT baby) receives a companion creature egg
- Egg appears with gentle wobble animation
- Text: "[Name] bekommt ein Begleiter-Ei! Es schlüpft bei der
  ersten angemeldeten Quest." / "[Name] gets a companion egg!
  It hatches on their first completed quest."

### ADD Emotional Tone Notes (for builder):

Each onboarding step has a copy tone:
- Step 1 (Welcome): Warm, hopeful. "Willkommen! Lass uns deine
  Familie organisieren." One button. No feature list.
- Step 2 (Family name): Personal. "Wie heißt deine Familie?"
  Pre-filled with "[UserName]s Familie."
- Step 3 (Members): Inclusive. "Wer gehört dazu?" Baby option visible.
  Adding a member feels celebratory (avatar color appears instantly).
- Step 4 (Structure): Competent. "Struktur für die Woche" — implies
  immediate value. Calendar preview animates as time blocks are set.
- Step 5 (First task): Encouraging. Suggestions visible. One-tap add.
  Calendar preview shows the task appearing.
- Step 6 (Complete): Celebratory. Creature egg. Populated calendar.
  "Du hast es geschafft!" / "You did it!" — NOT "Now explore features."

### MODIFY AC-002:

BEFORE: 5 steps (welcome, family, children, school, task)
AFTER: 6 steps (welcome, family, members [children+babies], school/daycare, first task, complete with creature egg)

### ADD AC-025:

- **AC-025:** The onboarding shall offer a "Baby / Kleinkind" option
  alongside "Kind" in the family member step. Baby creation requires
  name only. System suggests nap/daycare time blocks for babies.

---

## 6. S-3-ENHANCED — Gamification: Content Pipeline + Extensibility

### ADD Section §5: Content Pipeline

```
## 5. Content Pipeline (Post-Launch Extensibility)

The gamification system requires ongoing content to prevent novelty
wear-off at month 3-4. All content types below must be extensible
via database seed updates WITHOUT code changes:

### Content Types and Targets

| Content | Launch Count | Target Cadence | Mechanism |
|---------|-------------|----------------|-----------|
| Creature types | 6 | 2 new every 6 weeks | New rows in creatures table |
| Boss battles | 6 | 1 per month | New rows in boss_creatures table |
| Avatar items | 14 (Level-1 defaults) | 5 per month | New rows in avatar_items table |
| Badges | 12 (9 + 3 streak) | 2 per quarter | New rows in badges table |
| Seasonal events | 0 at launch | 4 per year | New rows in challenges table with seasonal flag |

### Seasonal Event Structure

Each seasonal event (Spring, Summer, Halloween, Winter) introduces:
- 1 limited-time boss battle (challenge with boss type + end date)
- 2 limited-time avatar items (available_from/available_until dates)
- 1 unique badge (seasonal flag, one-time earn)
- Optional: themed background for child UI (unlockable via Gold)

### Extensibility Requirements

- Adding new creatures, bosses, items, badges, and challenges must
  require ONLY new database rows (INSERT statements)
- No schema changes, no code changes, no redeployment needed
- The UI dynamically renders from database content — no hardcoded
  creature lists, badge lists, or item lists in frontend code
- Each content entity has: name, description, icon/image_url,
  required_level (for unlock), is_seasonal, available_from,
  available_until fields
```

### ADD to Constraints:

- DO NOT hardcode creature types, badge definitions, boss data, or
  avatar items in frontend code — all must be fetched from database
- DO NOT require code changes to add new gamification content

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-31 | Consolidated amendments for P-1, P-5, P-9, P-11, S-1, S-3-ENHANCED | PM + Atlas |
