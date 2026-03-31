---
document: spec
title: "Family Shopping List"
journey-id: "P-11"
version: 1.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - P-5-family-management.md
related-entities:
  - ShoppingList
  - ShoppingItem
  - FamilyMember
---

# Family Shopping List

## 1. Context

Every family organizer competitor (Cozi, OurHome, FamilyWall) includes
a shared shopping list. Families expect it. Without it, they need a
second app for groceries, breaking the "one hub" promise. The shopping
list must be dead simple: add items, check them off, see who added
what. No meal planning, no recipe integration — just a fast, shared list.

## 2. Goal

All family members can add items to a shared family shopping list,
check items off at the store, and see the list update in real-time
across devices — accessible in 2 taps from anywhere in the app.

## 3. Non-Goals

- This journey does not implement meal planning or recipe integration
- This journey does not implement multiple lists (one list per family)
- This journey does not implement price tracking or budgets
- This journey does not implement store-specific organization (aisles)
- This journey does not implement barcode scanning

## 4. User Stories

- As a parent, I want to quickly add items to the family shopping list,
  so that I don't forget what we need.
- As a family member, I want to check off items at the store, so that
  others see what's been bought.
- As a child (with permission), I want to add items to the list, so
  that I can request things I need.

## 5. Happy Path

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Parent | Navigates to Shopping List (bottom nav → dedicated section, or Settings shortcut) | System loads the family shopping list. Items displayed as a checklist sorted: unchecked first (by add date), checked items below (faded). | List visible |
| 2 | Parent | Types item in the add field at top and taps "+" or presses Enter | Item added instantly (optimistic update). Item shows: name, added-by avatar, timestamp. | Item added |
| 3 | Parent | Adds 3 more items | Each appears at top of unchecked section. | Items added |
| 4 | (At store) Parent | Taps checkbox on "Milch" | Item moves to checked section with strikethrough and fade. Checked-by avatar shown. | Item checked |
| 5 | Parent | Taps "Erledigte löschen" / "Clear checked" | Confirmation: "Alle erledigten Einträge löschen?" / "Remove all checked items?" On confirm: checked items removed. | List cleaned |

**Child path:**

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Child | Opens shopping list | Same list view. If child has canCreateTasks permission (reused), they can add items. Otherwise, read-only view with checked items. | View or edit |

## 6. Failure Paths

### 6.1 Empty item name
**Trigger:** User taps "+" with empty text field.
**System response:** Nothing happens. Add button stays disabled until
text is entered.
**State after:** No item created.

### 6.2 Network error on add
**Trigger:** API unreachable when adding item.
**System response:** Item shown locally (optimistic) with a warning
icon. Retries automatically. If retry fails after 3 attempts: item
marked with error state and manual retry option.
**State after:** Item pending sync.

## 7. Edge Cases

### 7.1 Duplicate items
**Condition:** Two family members add "Milch" simultaneously.
**Expected behaviour:** Both items appear. No deduplication —
duplicates are the family's problem, not the system's.

### 7.2 Very long list (50+ items)
**Condition:** Family accumulates many items without clearing.
**Expected behaviour:** List scrolls. Sticky add-field at top. No
performance degradation (items are lightweight text records).

## 8. Rollback Path

Item additions are idempotent. Deletions (clear checked) are permanent
but require confirmation. No undo for clear-all.

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Add item | ShoppingItem | Create | listId, name, addedByUserId, createdAt |
| Check item | ShoppingItem | Update | checked=true, checkedByUserId, checkedAt |
| Uncheck item | ShoppingItem | Update | checked=false, checkedByUserId=null |
| Clear checked | ShoppingItem | Delete (batch) | All checked items removed |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall maintain one shopping list per family.
- **AC-002:** When a user adds an item, the system shall display it
  immediately (optimistic update) and persist it to the server.
- **AC-003:** When a user checks an item, the system shall move it to
  the checked section with strikethrough styling.
- **AC-004:** The system shall display the added-by and checked-by
  user avatar on each item.
- **AC-005:** The system shall allow clearing all checked items with
  a single action after confirmation.
- **AC-006:** The shopping list shall be accessible from the bottom
  navigation (replacing or augmenting an existing tab — see open
  questions) or from a shortcut in Settings.

### Permission Criteria

- **AC-010:** Adult family members shall always have add, check, and
  clear permissions.
- **AC-011:** Children shall have add permission if their canCreateTasks
  permission is enabled. Otherwise, read-only.
- **AC-012:** Children shall always have check permission (they can
  help at the store).

### State Criteria

- **AC-020:** While the list is empty, the system shall display an
  encouraging empty state: "Alles eingekauft! 🛒" / "All shopped!"
- **AC-021:** While the list is loading, the system shall show
  skeleton loaders matching the list layout.
- **AC-022:** If network sync fails on add, the system shall show a
  warning icon on the item and retry automatically.

### Layout Criteria

- **AC-030:** The add-item field shall be sticky at the top of the
  list, always visible.
- **AC-031:** Items shall be displayed as a single-column list with
  44px minimum row height.
- **AC-032:** The list shall be usable one-handed on a phone
  (add + check with thumb reach).

### Invariants

- **INV-001:** Shopping list data must be scoped to the family — no
  cross-family access.
- **INV-002:** Clear-checked must only delete checked items, never
  unchecked ones.

## 11. Success Criteria

- 50% of active families use the shopping list at least once per week.
- List reduces the need for a separate shopping app (measured by
  user feedback).

## 12. Constraints (DO NOT List)

- DO NOT implement multiple lists per family
- DO NOT implement categories, aisles, or store organization
- DO NOT implement price tracking
- DO NOT implement meal planning or recipe linking
- DO NOT implement barcode scanning
- DO NOT implement quantity fields (users type "2x Milch" in the name)

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-30 | Initial spec — family shopping list | PM + VEGA |
