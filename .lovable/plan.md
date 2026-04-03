

# Fix: Name/Avatar Changes Must Reflect Everywhere

## Problem

The app has **two separate name sources**:
1. `profiles.name` — updated in Settings
2. `family_members.name` — set once during member creation, never updated

The calendar, task cards, workload chart, and other components read from `family_members.name`, so when a user changes their name in Settings (which updates `profiles.name`), the old name ("Sarah") persists in all family-facing views.

Similarly, `profiles.avatar_url` is only used in the AppBar and Settings. Calendar lane headers and other member displays use `family_members` data which has no `avatar_url`.

## Solution

**Enhance `useFamily` to join profiles data**, so every component that reads `members` automatically gets the latest name and avatar.

### File: `src/hooks/useFamily.tsx`
- Change the members query from `.select("*")` to `.select("*, profiles!family_members_user_id_fkey(*)")` — but since there's no FK, use a different approach:
- After fetching `family_members`, fetch `profiles` for all member `user_id`s and merge the data
- Each member object gets `profileName` and `avatarUrl` from profiles
- Export a helper: for display, prefer `profiles.name` over `family_members.name` (fallback to FM name for babies with no user_id)

### File: `src/pages/ParentSettings.tsx`
- When saving name to `profiles`, **also update `family_members.name`** for the current user's FM record
- This keeps both tables in sync going forward
- Invalidate both `["family-members"]` and `["family-member"]` query keys after save

### Files using member names (calendar, workload, tasks, etc.)
- Update `WeekMatrix.tsx`, `MonthGrid.tsx`, `WorkloadChartWidget.tsx`, `TodaysTasksWidget.tsx`, `TodayTimelineWidget.tsx` to use the merged profile name from `useFamily` members
- Update calendar lane headers to show `UserAvatar` component instead of plain colored circles

## Technical Details

The cleanest approach: in `useFamily`, after fetching members, do a second query for profiles of those user_ids, then merge:

```typescript
const { data: members = [] } = useQuery({
  queryKey: ["family-members", familyId],
  queryFn: async () => {
    const { data: fms } = await supabase
      .from("family_members")
      .select("*")
      .eq("family_id", familyId!);
    if (!fms?.length) return [];
    
    const userIds = fms.map(m => m.user_id).filter(Boolean);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", userIds);
    
    const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);
    return fms.map(m => ({
      ...m,
      display_name: profileMap.get(m.user_id)?.name || m.name,
      avatar_url: profileMap.get(m.user_id)?.avatar_url ?? null,
    }));
  },
  enabled: !!familyId,
});
```

Then replace all `member.name` references with `member.display_name` in:
- `WeekMatrix.tsx` (lane headers)
- `MonthGrid.tsx` (column headers)
- `WorkloadChartWidget.tsx` (chart labels)
- `TodaysTasksWidget.tsx` (assignee names)
- `TodayTimelineWidget.tsx` (member names)
- `ParentSettings.tsx` (member list)

And use `member.avatar_url` with `UserAvatar` in calendar lane headers.

## No database changes needed.

