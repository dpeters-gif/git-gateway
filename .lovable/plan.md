

# Plan: Add Drag & Drop to Calendar and Tasks

## What
Add `@dnd-kit` drag-and-drop to two locations:
1. **WeekMatrix calendar** — drag tasks/events between cells to reschedule (change date and/or assignee)
2. **ParentTasks list** — drag tasks to reorder by priority grouping

## Technical Approach

### 1. Calendar WeekMatrix — Drag to Reschedule

**`src/components/calendar/WeekMatrix.tsx`**
- Wrap the `<table>` in a `DndContext` with `closestCenter` collision strategy
- Each cell (`<td>`) becomes a **droppable** using `useDroppable` with an ID encoding `date|userId` (e.g. `"2026-04-03|abc-123"`)
- Each `CalendarTaskCard` and `CalendarEventCard` becomes **draggable** using `useDraggable`
- On `onDragEnd`: parse the droppable ID to extract new date + userId, then call `updateTask` or `updateEvent` mutation
- Add a `DragOverlay` to show the card being dragged
- Add new props: `onTaskReschedule(taskId, newDate, newAssignee)` and `onEventReschedule(eventId, newDate, newAssignee)`

**`src/components/calendar/CalendarTaskCard.tsx`**
- Wrap in `useDraggable` from `@dnd-kit/core`
- Add a subtle drag handle icon (GripVertical) visible on hover
- Apply transform styles from `useDraggable`

**`src/components/calendar/CalendarEventCard.tsx`**
- Same draggable treatment as CalendarTaskCard

**`src/pages/ParentCalendar.tsx`**
- Add `handleTaskReschedule` and `handleEventReschedule` callbacks that call `updateTask.mutate` / `updateEvent.mutate` with new `due_date`/`assigned_to_user_id` or `start_at`/`assigned_to_user_ids`
- Pass these as new props to `WeekMatrix`

### 2. Tasks List — Drag to Reorder

**`src/pages/ParentTasks.tsx`**
- Wrap the task list in `DndContext` + `SortableContext` (vertical list strategy)
- Each task card becomes a sortable item via `useSortable`
- On drag end, reorder the local tasks array (visual reorder only — no DB `sort_order` needed since tasks are sorted by due_date)
- Add a drag handle (GripVertical icon) to each task card

## Files to Modify
- `src/components/calendar/WeekMatrix.tsx` — DndContext + droppable cells
- `src/components/calendar/CalendarTaskCard.tsx` — useDraggable
- `src/components/calendar/CalendarEventCard.tsx` — useDraggable  
- `src/pages/ParentCalendar.tsx` — reschedule handlers
- `src/pages/ParentTasks.tsx` — SortableContext + sortable items

No database changes needed. The `@dnd-kit` packages are already installed.

