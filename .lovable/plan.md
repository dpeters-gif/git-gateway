

# Calendar Rebuild: Days as Rows, Persons as Columns

## Recommendation

**Image 1 layout** (days as rows, persons as columns) is the better choice because:
- More readable — each person gets a wide column instead of being crammed into day subdivisions
- Works well on the current viewport (1164px) — 2-4 person columns have plenty of space
- Simpler to maintain and extend
- Items within each cell are sorted by time and show their time label, satisfying "correct position timewise"
- Matches the app's data model naturally (tasks have `due_date` + `assigned_to_user_id`)

## Layout

```text
┌──────┬──────────────────────────┬──────────────────────────┐
│      │    D  david@gmail.com   │    I  IdaMaus             │
│      │         Du              │                           │
├──────┼──────────────────────────┼──────────────────────────┤
│ Mo   │                         │                           │
│30.Mär│                         │                           │
├──────┼──────────────────────────┼──────────────────────────┤
│ Di   │ ● 📅 Test  09:00-10:00 │ ● 📅 Test  09:00-10:00  │
│31.Mär│                         │                           │
├──────┼──────────────────────────┼──────────────────────────┤
│ Mi   │ ○ Auto verkaufen        │                           │
│1. Apr│                         │                           │
├──────┼──────────────────────────┼──────────────────────────┤
│ Do ◀ │                         │  (today highlight)        │
│2. Apr│                         │                           │
└──────┴──────────────────────────┴──────────────────────────┘
```

## What Changes

### File: `src/components/calendar/WeekMatrix.tsx` — Full rewrite
- **Remove** the vertical time axis, `PX_PER_HOUR`, `timeToTop`, `durationHeight`, hour grid lines, current time indicator
- **New layout**: CSS grid table — first column is day label (sticky), remaining columns are one per family member
- **Header row**: Member avatar (colored circle + initial) + name, "Du" label for current user
- **Day rows**: 7 rows for Mon–Sun. Today row gets a left accent border + light bg highlight
- Items within each cell: sorted by `start_time` (timed first, untimed at bottom)
- Each item rendered as a compact pill: priority color left-border, title, time range if available, XP badge
- Items are clickable → calls `onTaskClick` / `onEventClick`
- All-day events span across the top of the cell or show as a distinct colored banner
- **Mobile (<768px)**: Switch to single-day view with `DayTabSelector`. Show all person columns stacked vertically (one section per member with header)

### File: `src/pages/ParentCalendar.tsx` — Wire detail dialogs
- Import and render `TaskDetailDialog` when `selectedItem` is a task and `showDetail` is true
- Render event detail view (reuse `ItemDetailPopover` or inline dialog)
- Currently `setSelectedItem`/`setShowDetail` are set but nothing reads them — fix this

### File: `src/components/calendar/CalendarTaskCard.tsx` — Minor
- Ensure it works in the new compact pill layout (may simplify or keep as-is)

## No database changes needed.

