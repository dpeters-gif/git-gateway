

# Plan: Google Calendar-Style Week View Overhaul

## What Changes
Replace the current WeekMatrix (members-as-rows, days-as-columns table) with a vertical time-axis week view: hours 06:00–22:00 on the left, Mon–Sun as columns, items positioned by start/end time.

## Layout Structure
```text
┌─────────────────────────────────────────────────┐
│ ALL DAY  │ [Birthday] │         │ [Holiday]  │  │
├──────────────────────────────────────────────────┤
│ 06:00    │            │         │            │  │
│ 07:00    │ ░░School░░ │         │            │  │
│ 08:00    │            │         │            │  │
│ 09:00    │            │ [Arzt]  │            │  │
│ ...      │            │         │            │  │
│ 15:00    │            │ [Fußball│            │  │
│ 22:00    │            │         │            │  │
└─────────────────────────────────────────────────┘
```

## Files to Change

### 1. Rewrite `src/components/calendar/WeekMatrix.tsx`
- Replace `<table>` with CSS grid: `grid-template-columns: 60px repeat(7, 1fr)`
- **All-day section** at top: items with `is_all_day` or no `start_time` render as horizontal pills
- **Time grid**: 32 rows (06:00–22:00, 30-min slots), each slot 40px tall. Hour labels in left gutter
- **Timed items**: absolutely positioned within day columns. `top = (hour - 6) * 80 + (minute / 30) * 40`px, `height = durationMinutes / 30 * 40`px (min 40px)
- **Time blocks**: same positioning but lower z-index, semi-transparent background bands
- **Current time indicator**: red 2px horizontal line at current time, spanning all columns, updated every minute
- **Today's column**: subtle `bg-primary/5` highlight
- **Conflict dots**: 8px red dot where items overlap for same person
- **Empty slot click**: clicking an empty area triggers `onCellClick` with date + time pre-filled
- **Drag & drop**: keep DndContext + droppable cells, but droppable zones are now day columns (each column is a single droppable). On drop, calculate new time from Y offset
- **Mobile (<768px)**: single day view with same time axis, day tabs for navigation (reuse DayTabSelector)

### 2. Update `src/components/calendar/TimeBlockBand.tsx`
- Change from inline card to absolutely-positioned semi-transparent band
- Accept `slotHeight` prop, calculate `top` and `height` from `start_time`/`end_time`

### 3. Update `src/components/calendar/CalendarTaskCard.tsx` and `CalendarEventCard.tsx`
- Add optional `style` prop for absolute positioning (top/height)
- Keep existing drag handle and click behavior

### 4. Update `src/pages/ParentCalendar.tsx`
- Pass `selectedTime` to QuickCreatePopover when clicking empty time slot
- Update `handleQuickTask`/`handleQuickEvent` to include `start_time`/`end_time`

### 5. Update `src/components/calendar/QuickCreatePopover.tsx`
- Accept optional `defaultTime` prop
- Pre-fill time field when provided

## No database changes needed.

## Technical Details
- Slot height constant: `SLOT_HEIGHT = 40` (px per 30 min)
- Start hour: 6, end hour: 22 → 32 slots
- Position formula: `top = ((hour - 6) * 2 + Math.floor(minute / 30)) * SLOT_HEIGHT`
- Height formula: `height = Math.max(SLOT_HEIGHT, (durationMinutes / 30) * SLOT_HEIGHT)`
- Current time line: `useEffect` with `setInterval(60000)` updating a state variable
- Grid is scrollable vertically with the container auto-scrolling to ~08:00 on mount

