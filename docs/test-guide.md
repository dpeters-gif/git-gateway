# FamilyFlow — Feature & Page Test Guide

> Last updated: 2026-04-05

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Onboarding](#2-onboarding)
3. [Parent Home / Dashboard](#3-parent-home--dashboard)
4. [Calendar — Woche (Week) View](#4-calendar--woche-week-view)
5. [Calendar — Monat (Month) View](#5-calendar--monat-month-view)
6. [Tasks Page](#6-tasks-page)
7. [Rewards & Challenges Page](#7-rewards--challenges-page)
8. [Shopping List](#8-shopping-list)
9. [Care-Share](#9-care-share)
10. [Settings](#10-settings)
11. [Child Views](#11-child-views)
12. [Grandparent / Caregiver View](#12-grandparent--caregiver-view)
13. [Admin Panel](#13-admin-panel)
14. [Gamification System](#14-gamification-system)
15. [Global UI / Layout](#15-global-ui--layout)
16. [Seed Data](#16-seed-data)

---

## 1. Authentication

**Routes:** `/login`, `/signup`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1.1 | Navigate to `/login` | Login form with email + password fields renders |
| 1.2 | Submit valid credentials | Redirect to `/` (Home) |
| 1.3 | Submit invalid credentials | Error toast shown, no redirect |
| 1.4 | Navigate to `/signup` | Signup form renders |
| 1.5 | Create new account | Email verification required (no auto-confirm) |
| 1.6 | Access any protected route while logged out | Redirect to `/login` |
| 1.7 | Logout | Session cleared, redirect to `/login` |

---

## 2. Onboarding

**Route:** `/onboarding`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 2.1 | New user after signup | Redirected to onboarding flow |
| 2.2 | Complete onboarding steps | Family created, profile saved, `onboarding_completed = true` |
| 2.3 | Add family members during onboarding | Members appear in family with correct roles (adult/child/baby) |
| 2.4 | Skip optional steps | Onboarding completes without errors |

---

## 3. Parent Home / Dashboard

**Route:** `/` (for adult users)

**Sections (exactly 4, in order):**

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 3.1 | **Family Status Bar** renders | Horizontal row of avatar chips (40px circles) with first names |
| 3.2 | Each chip shows today's task count | Badge with number of open tasks for that member |
| 3.3 | **Today's Focus** section renders | Shows today's open tasks in TaskCard format |
| 3.4 | Tasks show priority left-border | High=#C25B4E, Normal=#5B7A6B, Low=#9BA89F (4px wide) |
| 3.5 | **Active Challenges** section renders | Shows active family challenges with progress |
| 3.6 | **Workload Chart** section renders | Weekly workload visualization |
| 3.7 | "Willkommen zurück, [Name]" header | Personalized greeting with user's name |
| 3.8 | No Grocery/Pinnwand/CareShare widgets | These are on their own pages, not on Home |
| 3.9 | Empty state for Today's Focus | EmptyState component with CheckCircle icon when no tasks |
| 3.10 | Empty state for Active Challenges | EmptyState with Trophy icon when no challenges |

---

## 4. Calendar — Woche (Week) View

**Route:** `/calendar` (default view)

### Header & Navigation
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 4.1 | Segmented control toggle | "Woche" / "Monat" segmented control (pill shape, #F3F0EB bg) |
| 4.2 | Active segment styling | White bg, weight-600, shadow |
| 4.3 | Prev/Next arrows | Navigate between weeks |
| 4.4 | Week label | Shows date range (e.g. "7.–13. Apr 2026") |

### Day Headers
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 4.5 | Day header format | "MO.", "DI." etc. at 11px/500 #6B7B72 + date at 13px/600 #2D3A32 |
| 4.6 | Today highlight | Today's date in 24px circle, bg #5B7A6B, white text |
| 4.7 | Sticky day header | Day header stays pinned while scrolling time grid |
| 4.8 | Day separators | 1px horizontal line between day sections, rgba(45,58,50,0.10) |

### Person Columns
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 4.9 | Column headers | Avatar (40px) + first name only — no "Du" label |
| 4.10 | Column dividers | 1px vertical lines between columns, rgba(45,58,50,0.12) |
| 4.11 | Weekend columns | Sat/Sun columns have #F3F0EB background |
| 4.12 | Weekday columns | Mon–Fri columns have white background |

### Time Grid
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 4.13 | Hour slot height | 44px per hour slot |
| 4.14 | Time range | 06:00–22:00 (16 hours) |
| 4.15 | Time labels | Left axis shows hours; labels at 11px/500 #6B7B72 |
| 4.16 | Full grid visible at 768px | No vertical scroll needed for the grid itself |

### Z-Index Layering
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 4.17 | Time block bands | z-index: 1 (lowest) |
| 4.18 | Routine bands | z-index: 2 |
| 4.19 | Task cards | z-index: 3 |
| 4.20 | Event cards | z-index: 4 (highest) |
| 4.21 | Overlapping items | Cards always render above bands |

### Card Styling
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 4.22 | Event card background | rgba(91, 138, 155, 0.10) — faint blue tint |
| 4.23 | Event card left-border | 3px solid #5B8A9B |
| 4.24 | Task card background | rgba(91, 122, 107, 0.08) — faint green tint |
| 4.25 | Task card left-border | 3px solid, color by priority |
| 4.26 | Event card member avatars | 20×20px circles in bottom-right, max 2 + "+N" |
| 4.27 | Time format on cards | "09:00–09:30" (no seconds) |

### Time Block Bands
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 4.28 | "work" band | rgba(91, 122, 107, 0.12) bg, 3px #5B7A6B left border |
| 4.29 | "school" band | rgba(91, 138, 155, 0.12) bg, 3px #5B8A9B left border |
| 4.30 | "nap" band | rgba(194, 172, 133, 0.12) bg, 3px #C2AC85 left border |
| 4.31 | "unavailable" band | rgba(155, 168, 159, 0.12) bg, 3px #9BA89F left border |
| 4.32 | Band color consistency | Same type = same color across ALL member columns |

---

## 5. Calendar — Monat (Month) View

**Route:** `/calendar` (toggle to "Monat")

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 5.1 | Grid renders | Full month grid with day cells |
| 5.2 | Completed items hidden | No completed tasks or events shown |
| 5.3 | Date-title bug filtered | Items titled like "02.04.2026" are not rendered |
| 5.4 | Day abbreviations | 11px/500 #6B7B72 (Mo., Di., etc.) |
| 5.5 | Date numbers | 15px/700 #2D3A32 |
| 5.6 | Today circle | 24px circle, bg #5B7A6B, white date number |
| 5.7 | Weekend rows | #F3F0EB background for Sat/Sun rows |
| 5.8 | Weekday rows | #FEFEFB background for Mon–Fri rows |
| 5.9 | Event chips | Blue-tinted with calendar icon |
| 5.10 | Task chips | Green-tinted with priority color |

---

## 6. Tasks Page

**Route:** `/tasks`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 6.1 | Task list renders | All open tasks shown as TaskCards |
| 6.2 | TaskCard background | #FEFEFB (color-surface) |
| 6.3 | TaskCard border-radius | 12px |
| 6.4 | Left-border accent | 4px wide, color by priority |
| 6.5 | XP badge | Pill shape, bg rgba(91,122,107,0.10), text #5B7A6B |
| 6.6 | Checkbox animation | Framer Motion scale spring on complete |
| 6.7 | Overdue task styling | Red tint background, "Überfällig" / "Overdue" badge |
| 6.8 | Hover effect | Framer Motion elevation with shadow |
| 6.9 | Empty state (no tasks) | EmptyState component with icon + CTA |
| 6.10 | Create task via FAB | FAB → "Aufgabe" → TaskCreateForm dialog opens |
| 6.11 | Task detail dialog | Tap card → TaskDetailDialog with full info |

---

## 7. Rewards & Challenges Page

**Route:** `/rewards`

### Belohnungen (Rewards) Tab
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 7.1 | Card grid layout | 2-col on ≥768px, 1-col on <768px |
| 7.2 | Card styling | #FEFEFB bg, 16px radius, 1px border |
| 7.3 | Icon circle | 48px circle, rgba(91,122,107,0.10) bg |
| 7.4 | Gold price pill | Coin emoji + price, pill shape |
| 7.5 | XP threshold progress | Progress bar with percentage |
| 7.6 | Create button | Pill-shaped "+ Belohnung erstellen" |
| 7.7 | Delete reward | Delete action available |
| 7.8 | Empty state | EmptyState with Gift icon |

### Challenges Tab
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 7.9 | Challenge cards render | Cards with progress indicator |
| 7.10 | Boss battle type | Shows creature icon and HP bar |
| 7.11 | Create button | Pill-shaped "+ Challenge erstellen" |
| 7.12 | Empty state | EmptyState with Trophy icon |

---

## 8. Shopping List

**Route:** `/shopping`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 8.1 | List renders | Shopping items grouped by category |
| 8.2 | Add item | New item appears in list |
| 8.3 | Check item | Item marked as checked with timestamp |
| 8.4 | Uncheck item | Item returned to unchecked state |
| 8.5 | Empty state | EmptyState with ShoppingCart icon |

---

## 9. Care-Share

**Route:** `/care-share`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 9.1 | Donut chart renders | Adult task completion distribution |
| 9.2 | Weekly/monthly toggle | Period switch works |
| 9.3 | Adult-only data | Only adult task completions counted |
| 9.4 | Child access blocked | Children redirected away / data not returned |
| 9.5 | Neutral language | No blame/ranking language |
| 9.6 | Single adult | Shows 100% for that adult |
| 9.7 | Empty state | "Noch keine erledigten Aufgaben" message |

---

## 10. Settings

**Route:** `/settings`

### Global Settings UI
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 10.1 | Section headings | All at 17px weight-800 |
| 10.2 | Tab navigation | Tabs switch between settings sections |

### Profil Tab
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 10.3 | Avatar picker | Can select/change avatar |
| 10.4 | Name editing | Can update display name |
| 10.5 | Language switcher | Segmented control (DE/EN), not two buttons |
| 10.6 | Language switch works | i18n.changeLanguage() on click |

### Familie Tab
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 10.7 | Member cards | Cards with avatar, name, role chip (not list rows) |
| 10.8 | Role chips | "Erwachsen" / "Kind" / "Baby" pill badges |
| 10.9 | Admin badge | Crown/shield icon for admin users |
| 10.10 | Invite flow | Can generate invite link |
| 10.11 | Member count | "Mitglieder (N)" in heading |

### Zeiten (Time Blocks) Tab
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 10.12 | Description paragraph | Explanatory text below heading |
| 10.13 | Time blocks list | Existing blocks shown |
| 10.14 | Create time block | Can add new block with type/times |

### Routinen Tab
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 10.15 | Description paragraph | Explanatory text below heading |
| 10.16 | Routines list | Existing routines shown |
| 10.17 | Create routine | Can add new routine |
| 10.18 | Flow mode toggle | Can enable/disable flow mode |

### Erinnerungen (Nudges) Tab
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 10.19 | Description paragraph | Explanatory text below heading |
| 10.20 | Nudge items render | No "?" title bug — shows "Unbenannte Erinnerung" for null titles |
| 10.21 | Enable/disable nudge | Toggle works |

### Teilen (Share) Tab
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 10.22 | Create share link | Generates caregiver link with expiry |
| 10.23 | Active links list | Shows label + expiry date |
| 10.24 | Revoke link | Can deactivate a share link |

---

## 11. Child Views

**Child My Day:** `/` (when role=child)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 11.1 | Child home renders | ChildMyDay page with today's tasks |
| 11.2 | Child-specific background | `bg-child-bg` applied |
| 11.3 | Task completion | Can mark tasks done, XP awarded |

**Child Calendar:** `/child-calendar`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 11.4 | Child calendar renders | Shows child's events and tasks |

**Child Quests:** `/quests`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 11.5 | Active quests shown | Family challenges visible to child |

**Child Progress:** `/progress`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 11.6 | Level & XP display | Current level, XP bar |
| 11.7 | Streak display | Current streak count |
| 11.8 | Badges earned | Badge collection visible |

**Child Rewards:** `/child-rewards`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 11.9 | Available rewards | Rewards the child can redeem |
| 11.10 | Gold balance | Current gold shown |

---

## 12. Grandparent / Caregiver View

**Route:** `/share?token=<TOKEN>`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 12.1 | Valid token | Read-only week view renders, no login required |
| 12.2 | No gamification data | XP, streaks, creatures not shown |
| 12.3 | No edit controls | No FAB, no create buttons, no checkboxes |
| 12.4 | Expired token | "Dieser Link ist abgelaufen" message |
| 12.5 | Invalid token | Clear error message |
| 12.6 | Responsive | Works on phone and desktop |

---

## 13. Admin Panel

**Route:** `/admin/*` (requires admin role)

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 13.1 | Admin guard | Non-admin users blocked |
| 13.2 | Dashboard (`/admin`) | Metric cards + subscription pie chart |
| 13.3 | Families (`/admin/families`) | Family list with search |
| 13.4 | Users (`/admin/users`) | User table with name, email, role, family, level, XP, streak |
| 13.5 | Subscriptions (`/admin/subscriptions`) | Subscription management |
| 13.6 | Flags (`/admin/flags`) | Feature flags |
| 13.7 | Tools (`/admin/tools`) | Admin utilities |
| 13.8 | "Back to App" button | Returns to main app |

---

## 14. Gamification System

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 14.1 | XP awarded on task complete | Points ledger entry created |
| 14.2 | Gold awarded | Gold transaction recorded |
| 14.3 | Level up | Level increments at XP threshold, celebration animation |
| 14.4 | Streak tracking | Consecutive daily activity tracked |
| 14.5 | Streak freeze | Can use freeze to preserve streak |
| 14.6 | Companion creature | Creature progresses: egg → baby → juvenile → adult |
| 14.7 | Drop events | Random drops (bonus gold, XP boost, avatar items, etc.) |
| 14.8 | Leaderboard | Family leaderboard with weekly/monthly periods |
| 14.9 | Badges | Earned based on criteria (task count, streaks, etc.) |
| 14.10 | Avatar editor | Child can equip earned items |
| 14.11 | Gold shop | Can purchase items with gold |
| 14.12 | Boss battles | Family challenge with creature HP |

---

## 15. Global UI / Layout

### App Shell
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 15.1 | AppBar | Top bar with notification bell + user avatar |
| 15.2 | Bottom navigation (mobile) | Nav tabs for Home, Calendar, Tasks, Rewards, Settings |
| 15.3 | Desktop sidebar | Left sidebar on xl breakpoints |
| 15.4 | FAB (Floating Action Button) | "+" button with create options (Task, Event, Routine, Note) |
| 15.5 | Pull to refresh | Pull-to-refresh on mobile |

### Typography (F16)
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 15.6 | Section headings | 17px weight-800 everywhere |
| 15.7 | Body text | 15px weight-400 |
| 15.8 | No text below 13px | Minimum font size enforced |
| 15.9 | Font family | DM Sans throughout |

### Responsiveness
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 15.10 | 375px (mobile) | No horizontal overflow, 44px touch targets |
| 15.11 | 768px (tablet) | 2-col reward grid, calendar fits |
| 15.12 | 1280px (desktop) | Sidebar visible, full layout |

### i18n
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 15.13 | German (default) | All UI text in German |
| 15.14 | English switch | All UI text switches to English |

### Notifications
| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 15.15 | Notification bell | Shows unread count |
| 15.16 | Notification menu | Lists recent notifications |
| 15.17 | Mark as read | Notification marked read on click |

---

## 16. Seed Data

**Route:** `/seed`

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 16.1 | Seed page accessible | Renders seed controls |
| 16.2 | Seed populates data | Family, members, tasks, events, time blocks created |
| 16.3 | Seeded time blocks correct | "Arbeit" ends at 17:00, "Mittagsschlaf" 12:00–13:00 |

---

## Appendix: Design Token Reference

| Token | Value | Usage |
|-------|-------|-------|
| color-surface | #FEFEFB | Card backgrounds |
| color-surface-subtle | #F3F0EB | Weekend tint, day headers |
| color-primary | #5B7A6B | Buttons, today circle |
| color-text-primary | #2D3A32 | Main text |
| color-text-secondary | #6B7B72 | Labels, captions |
| color-priority-high | #C25B4E | High priority border |
| color-priority-normal | #5B7A6B | Normal priority border |
| color-priority-low | #9BA89F | Low priority border |
| color-accent-event | #5B8A9B | Event card tint/border |
