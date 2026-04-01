---
document: design-constraints
project: "Familienzentrale"
version: 2.0.0
status: Draft
last-updated: "2026-03-31"
depends-on:
  - constitution.md v2.0.0
  - design-tokens.md v2.0.0
supersedes: design-constraints.md v1.0.0
---

# Design Constraints v2

> These rules govern every screen, every component, every interaction.
> The builder must check this document before building any UI element.
> Violations are bugs. No exceptions.

---

## 1. Layout & Responsiveness

### Tablet-First Design

This app lives on the kitchen iPad. Design for iPad FIRST.

| Tier | Width | Priority | Navigation |
|------|-------|----------|------------|
| Tablet portrait | 768px | **PRIMARY** | Bottom nav (64px) |
| Tablet landscape | 1024px | Secondary | Bottom nav (64px) |
| Phone | 375px–428px | Tertiary | Bottom nav (64px) |
| Desktop | 1280px+ | Tertiary | Sidebar nav (240px) replaces bottom nav |

**Every screen must:**
- Design for 768px FIRST. Test at 768px FIRST.
- Week matrix calendar is DEFAULT on tablet. Day-tabs on phone only.
- Two-column card grids default on tablet. Single column on phone.
- Forms: centered dialogs (max 640px) on tablet, bottom sheets on phone.
- Gamification elements (XP bar, streak, level) sized GENEROUSLY — readable at arm's length.
- No horizontal scrollbar at any width between 375px and 1280px.
- All components adapt fluidly — no fixed pixel widths that break at intermediate sizes.

### Content Structure

- App bar: 56px height. Family name (left), notification bell + user avatar (right). Gold counter for children.
- Bottom nav: 64px height. Active = filled icon + label in primary. Inactive = outline icon + secondary text.
- Parent nav: 5 items — Home, Calendar, Tasks, Rewards, Settings
- Child nav: 4 items — My Day, Quests, Progress, Rewards
- Page content: max-width 960px centered on desktop. Full width on tablet/phone with 24px side padding (mobile) or 32px (tablet).
- Desktop sidebar: 240px expanded, 72px collapsed. Only at ≥1280px.
- Navigation consistency: Bottom nav (mobile/tablet) and sidebar nav (desktop ≥1280px) must show IDENTICAL tabs: Home, Calendar, Tasks, Rewards, Settings. Additional pages (Shopping List, Care-Share) are accessed from Settings or dashboard widgets — they do NOT have their own nav tabs.

### FAB (Floating Action Button) — MANDATORY ON EVERY PAGE

- Position: bottom-right, 24px from edge, above bottom nav
- Size: 56px circle, primary color, white icon
- Shadow: shadow-lg
- Action: opens radial or sheet menu with quick-create options:
  - Task (icon: CheckSquare)
  - Event (icon: Calendar)
  - Routine (icon: Repeat) — if on parent UI
  - Board Note (icon: StickyNote)
- Animation: FAB uses scaleIn on page load, menu items stagger slideUp
- Present on: ALL pages except onboarding flow and full-screen celebration overlays
- When FAB opens menu, background dims (overlay at 0.3 opacity)

---

## 2. Cards & Containers

- Card background: `color-surface` (#FFFCF7)
- Card border: `color-border` (0.08 alpha)
- Card radius: `border-radius-md` (12px)
- Card padding: 16px (mobile), 20px (tablet/desktop)
- Card shadow: `shadow-sm` at rest, `shadow-md` on hover/focus
- Cards ALWAYS have: (a) tappable area, (b) visible primary action, (c) entrance animation

### Card Interaction Patterns

- **Task card**: completion checkbox visible inline (left side). Tap checkbox = complete. Tap card body = open detail. Priority left-border accent (3px). Strikethrough + fade on completion.
- **Event card**: time range prominently displayed. Tap = open detail. Info-blue left-border accent.
- **Quest card (child)**: XP badge visible (gold coin style). Large checkbox (48px). Completion triggers full dopamine loop.
- **Board note card**: text preview (2-line truncate). Author avatar + timestamp. Tap = expand or lightbox (for images).
- **Shopping item**: checkbox left, text center, added-by avatar right. Tap checkbox = check off (optimistic, instant).
- **Challenge card**: progress bar visible inline. Fraction text ("3/10"). Tap = detail view.

---

## 3. Calendar Interaction Patterns — CRITICAL

The calendar is the core of the parent experience. It must feel alive, responsive, and interactive. These rules are non-negotiable.

### Week Matrix (tablet default, ≥768px)

- Layout: vertical time axis (left, 06:00–22:00), days (Mon-Sun) as columns. Family member filtering via avatar chips above the grid.
- Grid: `grid-template-columns: auto repeat(7, 1fr)` — time gutter (60px) + 7 fluid day columns
- Calendar must fill available screen width responsively. On tablet (768px+), all 7 day columns visible without horizontal scroll. Column widths adapt proportionally.
- Time gutter: 60px fixed width, hours 06:00–22:00, labels at each hour, subtle grid lines every 30 min
- Today's column: highlighted with primary-light background
- Time block bands: rendered BEHIND event/task cards (lower z-index)
- Each cell is a droppable zone (drag-and-drop target)
- Empty cells: tappable → opens quick-create popover with date pre-filled

### Calendar Item Interactions

- **Every item is clickable** → opens detail popover/dialog with: title, time, description, assignee, edit/delete actions
- **Every item is draggable** → drag to new day = reschedule. Drag to new person lane = reassign. On drop: optimistic update + undo toast (5s window).
- **Calendar items visual style**: rounded pill shape with left-border accent color. Minimum height 32px. Title visible. Time shown if not all-day. Assignee avatar shown in collapsed view.
- **Time-based items**: positioned by start/end time in the day column. Height proportional to duration. Minimum 30-minute display height.
- **All-day items**: displayed in a header strip above time-based items.
- **Conflict indicator**: when items overlap in time for the same person, show red dot (8px) at overlap point. Tap = popover showing both conflicting items.

### Quick-Create Popover

- Triggered by: tapping empty calendar cell
- Contains: title input (auto-focused), type toggle (Task/Event), submit button
- Pre-fills: date from clicked cell, time from clicked slot (if time grid)
- Submit creates item and closes popover. Full details edited via detail view.

### Day View (phone <768px)

- Horizontal day-selector tabs at top (Mon-Sun, swipeable)
- Single-column day view below
- Time blocks as background bands
- Tasks/events stacked vertically
- Swipe left/right to navigate days (with Framer Motion slideInRight/Left)

### Month View

- Mini calendar grid showing dots for days with events
- Tap a day → navigates to that day's detail view
- Current day highlighted with primary circle

### Calendar CUD Operations

- **Create**: via FAB (from any page) or quick-create popover (from calendar cell)
- **Update**: via detail popover → edit button → opens form dialog. Also via drag-and-drop (date/assignee change).
- **Delete**: via detail popover → delete button → confirmation dialog → undo toast

---

## 4. Status & Indicators

- Priority indicators: left-border accent (3px) on cards — not text labels
- Task status: open = unchecked circle (outline), completed = filled check circle with success color + strikethrough title
- Streak: active = flame icon with streak color and glow animation, broken = gray flame, no streak = no icon
- XP progress: horizontal bar (12px height) with XP color fill and rounded ends
- Level display: circular badge with level number in extrabold weight
- Challenge progress: horizontal bar with challenge color fill, fraction text below
- Notification badge: red dot on bell icon, count shown
- Conflict indicator: red dot (8px) on overlapping calendar items. Tap to reveal.
- Baby member indicator: pacifier icon on avatar, terracotta color in calendar

---

## 5. Forms

- Labels above inputs — not inline or floating
- Required fields marked with asterisk (*)
- Validation errors shown inline below the field in error color
- Form max-width: 480px on tablet/desktop (centered dialog)
- Form on phone: bottom sheet (full width, slides up from bottom)
- All inputs height: 48px (mobile touch-friendly)
- All date/time inputs use shadcn/ui date picker (react-day-picker) — no native HTML date inputs
- Form sections separated by 24px vertical spacing
- Select dropdowns use shadcn/ui Select
- Task creation form default icon: checkmark (not heart)
- Task edit form must show ALL fields that creation form shows (plus completion status)
- Event creation from calendar pre-fills: date, time, assignee (from clicked cell/person lane)

---

## 6. Navigation & Routing

- Bottom nav (mobile/tablet): 5 items max. Scale animation on tap (Framer Motion).
- Active item: filled icon + label in primary color. Inactive: outline icon + secondary text.
- Child UI uses different nav: My Day, Quests, Progress, Rewards (4 items)
- Page transitions: Framer Motion slideInRight (entering), fadeOut (exiting)
- Browser back button must work on all routes
- Direct URL access redirects to login if unauthenticated
- No breadcrumbs on mobile — back arrows and navigation

---

## 7. States — EVERY SCREEN MUST HANDLE ALL FOUR

| State | Implementation |
|-------|---------------|
| **Loading** | Skeleton loaders matching content layout shape. Child UI: playful rounded shapes. NEVER a lone spinner. |
| **Empty** | Centered illustration (Lucide icon composition) + descriptive heading + body text + primary CTA. Never blank. Child: friendly language, warm illustration. |
| **Error** | Error icon + user-friendly message + retry button. No stack traces. Child: "Ups! Etwas ist schiefgelaufen" / "Oops! Something went wrong" with sad creature face. |
| **Success** | Toast notification (sonner, 4 seconds auto-dismiss). Major actions (task complete, level up): Framer Motion celebration. Level-up: full-screen overlay. |

---

## 8. Typography & Content

- No placeholder text in final build — all labels, headings, buttons are final copy
- No Lorem ipsum, no TODO labels, no "Coming Soon"
- All user-facing strings wrapped in `t()` for i18n (DE + EN)
- Truncate long text with ellipsis after 2 lines — no overflow breaking layouts
- Section headers use weight 700-800 and "speak" to the user: "Deine Aufgaben heute" not "Aufgaben"
- Numbers representing achievement (XP, level, streak count): weight 800, size-xxl or display
- Font: DM Sans throughout. No secondary font unless for decorative child headers (considered post-launch).

---

## 9. Two Distinct UIs

### Parent/Adult UI

- Background: `color-background` (#FBF7F0 — warm linen)
- Primary CTA: `color-primary` (#4E6E5D — forest sage)
- Bottom nav: 5 items (Home, Calendar, Tasks, Rewards, Settings)
- Week matrix calendar as default view
- Professional-warm tone. Clean, organized, calm.
- Family Board section on Home page
- Care-share analytics (Family+ tier)
- Baby members visible in calendar with pacifier avatar

### Child UI

- Background: `color-child-bg` (#FFF8EB — honey tint)
- Primary CTA: `color-child-accent` (#FF6B35 — orange, NOT green)
- Bottom nav: 4 items (My Day, Quests, Progress, Rewards)
- Quest cards with XP badges, large checkboxes
- Companion creature visible on My Day
- Streak flame, gold counter, level badge prominently displayed
- Evolving avatar system
- Friendly, game-like language throughout
- No admin controls, no family management, no adult-only data

---

## 10. Animation Standards — ANIMATIONS ARE NOT OPTIONAL

Every visible state change MUST have an animation. Silent state changes are bugs.

| Trigger | Animation | Sound |
|---------|-----------|-------|
| Page enters | Content sections stagger slideUp (100ms delay between) | None |
| Card appears in list | slideUp with stagger | None |
| Card removed from list | fadeOut + slideDown, then layout shift | None |
| Task completed | Full dopamine loop (see design-tokens §8) | playComplete() |
| Quest completed (child) | Enhanced dopamine loop with XP + streak + drop check | playComplete() + playXPAward() |
| Level up | Full-screen overlay + bounceIn number + confetti | playLevelUp() |
| Badge earned | Badge slides in from right, glow effect | playBadgeEarn() |
| Streak fire | Flame icon pulse animation (repeat while active) | playStreakFire() (first of day only) |
| Error occurs | shake animation on affected element | playError() |
| Form submitted | Button shows loading spinner, then success check | None |
| Pull to refresh | Content fades out, skeleton appears, content fades in | None |
| Drag start | Item lifts (shadow-lg), source position shows ghost | None |
| Drag drop | Item slides to new position, undo toast appears | None |
| Navigation tab tap | Destination icon scales briefly (1.1x, spring) | None |
| FAB opens | Menu items stagger slideUp from FAB position | None |
| Dialog opens | scaleIn from center, backdrop fade | None |
| Dialog closes | scaleOut to center, backdrop fade | None |
| Toast appears | slideDown from top (sonner default) | None |
| Creature egg wobble | wobble preset, periodic while on screen | None |
| Creature feeding | Creature bounces, heart floats up | None |

---

## 11. Accessibility & Touch

- All touch targets: minimum 44×44px
- Focus indicators: visible ring on keyboard navigation (shadcn default)
- Color contrast: body text ≥ 4.5:1 ratio, UI elements ≥ 3:1
- All images have alt text
- All interactive elements reachable via keyboard
- Child UI touch targets: 48×48px minimum (larger for game elements)
- Drag-and-drop: always has a non-drag alternative (edit button → form with date/assignee pickers)
- Animations respect `prefers-reduced-motion` — use Framer Motion's `useReducedMotion` hook

---

## 12. Data Display

- Charts use recharts with the design token color palette
- Chart backgrounds: transparent (inherit card background)
- Chart axis labels: font-size-sm, color-text-secondary
- Donut charts: centered label showing total/percentage
- Progress bars: 12px height, rounded ends, color fill on transparent track
- Leaderboard: numbered list, top 3 with gold/silver/bronze accent, current user highlighted
- Tables: no visible cell borders — use alternating row background (subtle) and generous padding
- Empty charts: show placeholder with dashed outline where chart would be + text "Noch keine Daten" / "No data yet"

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial design constraints | PM + VEGA |
| 2.0.0 | 2026-03-31 | Complete rewrite: mandatory interaction defaults, calendar interaction patterns (drag-drop, click, quick-create), FAB requirements, animation standards table, baby/conflict indicators, shadcn/Tailwind targeting, warmer palette references | PM + Atlas |
