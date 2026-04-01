

# Plan: Fix All 12 Tech Debt Items

## Overview
Fix all identified spec violations and missing features, organized by severity. This is a large batch covering drag-and-drop, form migrations, pull-to-refresh, undo logic, month view, date pickers, realtime sync, i18n, desktop sidebar, swipe gestures, image lightbox, and the generate-routines edge function.

---

## Changes by Priority

### HIGH SEVERITY

#### 1. Drag-and-Drop with @dnd-kit (3 locations)
Packages already installed (`@dnd-kit/core`, `@dnd-kit/sortable`).

**a) Shopping List** — `src/pages/ShoppingList.tsx`
- Wrap unchecked item groups in `DndContext` + `SortableContext`
- Make `ShoppingItemRow` a sortable item with drag handle
- Add `sort_order` column via migration, update `useShoppingList` to persist order on drag end

**b) Calendar** — `src/components/calendar/WeekMatrix.tsx`
- Wrap the matrix in `DndContext` 
- Make `CalendarTaskCard` and `CalendarEventCard` draggable
- On drop to a different cell, call `updateTask`/`updateEvent` with new date/assignee

**c) Routine Steps in Flow Mode** — `src/components/routines/FlowMode.tsx`
- Allow reordering of pending steps via `SortableContext`
- On reorder, update local state (order within the flow session)

**Database migration:** Add `sort_order INTEGER DEFAULT 0` to `shopping_items` table.

#### 2. Migrate Forms to React Hook Form + Zod

**a) `TaskCreateForm.tsx`**
- Replace 10+ `useState` calls with `useForm` + `zodResolver`
- Define `taskFormSchema` with Zod validation (title required, xp 0-100, etc.)
- Use `FormField`, `FormItem`, `FormControl`, `FormMessage` from `@/components/ui/form`

**b) `EventCreateForm.tsx`**
- Same pattern: `useForm` + `zodResolver` with `eventFormSchema`
- Validate end_time > start_time when not all-day

#### 3. Pull-to-Refresh
- Create a `PullToRefresh` wrapper component using touch events
- Apply to `ParentCalendar`, `ParentTasks`, `ShoppingList`, `ParentHome`
- On pull threshold (60px), call the page's `refetch` function
- Show a spinner indicator during refresh

### MEDIUM SEVERITY

#### 4. Fix Undo on Task Completion
- In `ParentCalendar.tsx` (line 187) and `ParentTasks.tsx` (line 102): replace `onClick: () => {}` with actual undo logic
- Store the previous status before completion, call `updateTask.mutate({ id, status: 'open', completed_at: null })` on undo
- Use a 5-second toast window

#### 5. Month View for Calendar
- Create `src/components/calendar/MonthGrid.tsx`
- Mini calendar grid showing dots for days with events/tasks
- Clicking a day switches to week view focused on that week
- Wire into `ParentCalendar.tsx` viewMode toggle (already has week/month buttons)

#### 6. Replace Native Date/Time Inputs with shadcn DatePicker
- In `TaskCreateForm` and `EventCreateForm`: replace `<Input type="date">` with shadcn `Calendar` in a `Popover` (per useful context)
- Replace `<Input type="time">` with a time select or keep native time (acceptable per spec)
- Add `pointer-events-auto` to Calendar wrapper

#### 7. Supabase Realtime on Calendar
- In `useEvents.tsx`: add `useEffect` with Supabase channel subscription on `events` table, invalidate queries on change
- Same pattern already used in `useShoppingList`

### LOW SEVERITY

#### 8. Shopping Category Labels to i18n
- Add keys `shopping.category.dairy`, `shopping.category.produce`, etc. to `de.json` and `en.json`
- Replace `CATEGORY_LABELS` object in `ShoppingList.tsx` with `t()` calls

#### 9. Desktop Sidebar at ≥1280px
- Create `src/components/layout/DesktopSidebar.tsx` using shadcn `Sidebar` component
- Mirror nav items from `BottomNav.tsx`
- Update `AppShell.tsx`: show sidebar at `xl:` breakpoint, hide bottom nav (already has `xl:hidden`)
- Wrap in `SidebarProvider` at the `AppShell` level

#### 10. Swipe Gestures on Mobile Day View
- In `DayTabSelector.tsx` or `WeekMatrix` mobile section: add touch event handlers (`onTouchStart`, `onTouchEnd`)
- Detect horizontal swipe > 50px threshold
- Swipe left = next day, swipe right = previous day

#### 11. Image Lightbox for Board Notes
- In `FamilyBoard.tsx`: already has `lightboxUrl` state (line 36)
- Add a fullscreen `Dialog` that shows the image when `lightboxUrl` is set
- Wire board note images to `setLightboxUrl` on click

#### 12. Generate-Routines Edge Function
- Create `supabase/functions/generate-routines/index.ts`
- Accept family_id + child age, call Lovable AI to suggest age-appropriate routines
- Return structured routine suggestions (title, steps, target minutes)

---

## Files to Create
- `src/components/shared/PullToRefresh.tsx`
- `src/components/calendar/MonthGrid.tsx`
- `src/components/layout/DesktopSidebar.tsx`
- `supabase/functions/generate-routines/index.ts`

## Files to Modify
- `src/pages/ShoppingList.tsx` — dnd-kit, i18n categories
- `src/components/calendar/WeekMatrix.tsx` — dnd-kit, swipe
- `src/components/calendar/TaskCreateForm.tsx` — RHF+Zod, date picker
- `src/components/calendar/EventCreateForm.tsx` — RHF+Zod, date picker
- `src/components/calendar/DayTabSelector.tsx` — swipe gestures
- `src/components/routines/FlowMode.tsx` — sortable steps
- `src/pages/ParentCalendar.tsx` — month view, pull-to-refresh, undo fix
- `src/pages/ParentTasks.tsx` — pull-to-refresh, undo fix
- `src/components/board/FamilyBoard.tsx` — lightbox dialog
- `src/components/layout/AppShell.tsx` — desktop sidebar
- `src/hooks/useEvents.tsx` — realtime subscription
- `src/hooks/useShoppingList.tsx` — sort_order support
- `src/i18n/de.json` — shopping category keys
- `src/i18n/en.json` — shopping category keys

## Database Migration
- `ALTER TABLE shopping_items ADD COLUMN sort_order INTEGER DEFAULT 0;`

## Estimated Scope
12 items across ~18 files, 1 migration, 1 new edge function.

