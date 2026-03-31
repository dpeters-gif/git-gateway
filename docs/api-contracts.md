---
document: api-contracts
project: "Familienzentrale"
version: 2.0.0
status: Draft
last-updated: "2026-03-31"
depends-on:
  - constitution.md v2.0.0
supersedes: api-contracts.md v1.0.0, api-contracts-addendum.md v1.1.0
---

# API Contracts v2 — Supabase Architecture

> This document defines ALL data access patterns for Familienzentrale
> on the Lovable + Supabase stack. It replaces the Express-based API
> contracts entirely.
>
> **Two access patterns:**
> 1. **Direct queries** — Frontend uses Supabase JS Client. RLS enforces access.
> 2. **Edge Functions** — Complex logic requiring atomicity, server secrets, or server-side randomness.
>
> **Error shape for Edge Functions:**
> `{ error: { code: string, message: string } }`
>
> **RLS baseline:** Every table has policies. No table is accessible without a matching policy.

---

## 1. Direct Client Queries (Frontend → Supabase via RLS)

These operations use `supabase.from('table')` directly. RLS policies
handle auth and family scoping. No Edge Function needed.

### Auth (Adults — Supabase Auth)

| Operation | Method | Notes |
|-----------|--------|-------|
| Sign up | `supabase.auth.signUp({ email, password, options: { data: { name } } })` | Creates auth user + profile |
| Login | `supabase.auth.signInWithPassword({ email, password })` | Returns session |
| Logout | `supabase.auth.signOut()` | Clears session |
| Get session | `supabase.auth.getSession()` | Check auth state |
| Get user | `supabase.auth.getUser()` | Get current user |

### Family Management

| Operation | Query | Auth |
|-----------|-------|------|
| Create family | `supabase.from('families').insert({ name })` then `supabase.from('family_members').insert({ family_id, user_id, role: 'adult', is_admin: true })` | Authenticated adult |
| Get my family | `supabase.from('family_members').select('*, families(*), users(*)').eq('user_id', userId)` | RLS: own records |
| Get family members | `supabase.from('family_members').select('*, users(name, avatar_url)').eq('family_id', familyId)` | RLS: same family |
| Add baby | `supabase.from('family_members').insert({ family_id, name, role: 'baby', managed_by_user_id, color })` | Admin adult |
| Invite adult | `supabase.from('family_invites').insert({ family_id, token, created_by })` | Admin adult |
| Accept invite | `supabase.from('family_invites').select().eq('token', token)` → `supabase.from('family_members').insert(...)` | Authenticated |
| Get child permissions | `supabase.from('child_permissions').select().eq('user_id', childId)` | Adult in family |
| Update child permissions | `supabase.from('child_permissions').update({ can_create_tasks, can_create_events }).eq('user_id', childId)` | Admin adult |

### Tasks

| Operation | Query | Auth |
|-----------|-------|------|
| List tasks | `supabase.from('tasks').select('*').eq('family_id', familyId).gte('due_date', start).lte('due_date', end)` | RLS: family member |
| Create task | `supabase.from('tasks').insert({ title, family_id, assigned_to_user_id, xp_value, priority, due_date, start_time, end_time, icon, photo_required, description, visibility }).select().single()` | Adult, or child with permission |
| Update task | `supabase.from('tasks').update({ ...fields }).eq('id', taskId).select().single()` | Creator or admin |
| Delete task | `supabase.from('tasks').delete().eq('id', taskId)` | Creator or admin |
| Complete task | **Edge Function** `complete-task` (see §2) | Assignee |

### Events

| Operation | Query | Auth |
|-----------|-------|------|
| List events | `supabase.from('events').select('*').eq('family_id', familyId).gte('start_at', start).lte('start_at', end)` | RLS: family member |
| Create event | `supabase.from('events').insert({ title, family_id, start_at, end_at, is_all_day, assigned_to_user_ids, icon, description, status }).select().single()` | Adult (status=active), child with permission (status=pending) |
| Update event | `supabase.from('events').update({ ...fields }).eq('id', eventId).select().single()` | Creator or admin |
| Delete event | `supabase.from('events').delete().eq('id', eventId)` | Creator or admin |
| Approve child event | `supabase.from('events').update({ status: 'active' }).eq('id', eventId)` | Admin adult |
| Reject child event | `supabase.from('events').delete().eq('id', eventId)` | Admin adult |
| List pending events | `supabase.from('events').select('*').eq('family_id', familyId).eq('status', 'pending')` | Adult |

### Time Blocks

| Operation | Query | Auth |
|-----------|-------|------|
| List time blocks | `supabase.from('time_blocks').select('*').eq('family_id', familyId)` | Family member |
| Create time block | `supabase.from('time_blocks').insert({ family_id, user_id, type, weekdays, start_time, end_time, label })` | Admin adult |
| Update | `supabase.from('time_blocks').update({ ...fields }).eq('id', blockId)` | Admin adult |
| Delete | `supabase.from('time_blocks').delete().eq('id', blockId)` | Admin adult |

### Routines

| Operation | Query | Auth |
|-----------|-------|------|
| List routines | `supabase.from('routines').select('*, routine_task_instances(*)').eq('family_id', familyId)` | Family member |
| Create routine | `supabase.from('routines').insert({ family_id, title, assigned_to_user_id, weekdays, tasks, flow_mode, flow_target_minutes, flow_step_order, photo_required })` | Admin adult |
| Update | `supabase.from('routines').update({ ...fields }).eq('id', routineId)` | Admin adult |
| Get flow tasks | `supabase.from('routine_task_instances').select('*, tasks(*)').eq('routine_id', routineId).eq('date', today).order('position')` | Family member |

### Calendar View (Combined Query)

```typescript
// Fetch all calendar data for a date range
const [tasks, events, timeBlocks, externalEvents] = await Promise.all([
  supabase.from('tasks').select('*').eq('family_id', fid)
    .gte('due_date', start).lte('due_date', end),
  supabase.from('events').select('*').eq('family_id', fid)
    .gte('start_at', start).lte('end_at', end).eq('status', 'active'),
  supabase.from('time_blocks').select('*').eq('family_id', fid),
  supabase.from('external_calendar_events').select('*').eq('family_id', fid)
    .gte('start_at', start).lte('end_at', end),
]);
```

### Rewards & Challenges

| Operation | Query | Auth |
|-----------|-------|------|
| List rewards | `supabase.from('rewards').select('*').eq('family_id', familyId)` | Family member |
| Create reward | `supabase.from('rewards').insert({ title, description, family_id, child_user_id, xp_threshold, gold_price, icon })` | Admin adult |
| Fulfill reward | `supabase.from('reward_fulfillments').insert({ reward_id, child_user_id, fulfilled_by_user_id })` | Admin adult |
| List challenges | `supabase.from('challenges').select('*, challenge_progress(*)').eq('family_id', familyId)` | Family member |
| Create challenge | `supabase.from('challenges').insert({ family_id, title, type, target_count, start_date, end_date, reward_xp, boss_creature_type, boss_hp })` | Admin adult |

### Gamification (Read-Only from Client)

| Operation | Query | Auth |
|-----------|-------|------|
| Get gamification profile | `supabase.from('levels').select('*').eq('user_id', userId).single()` + `supabase.from('streaks').select('*').eq('user_id', userId).single()` + gold balance from ledger | Family member |
| Get leaderboard | `supabase.rpc('get_leaderboard', { family_id, period })` | Family member |
| Get streak history | `supabase.from('points_ledger').select('created_at, xp_awarded').eq('user_id', userId).gte('created_at', thirtyDaysAgo)` | Own data or parent |
| Get badges | `supabase.from('user_badges').select('*, badges(*)').eq('user_id', userId)` | Own data or parent |
| Get creatures | `supabase.from('companion_creatures').select('*').eq('user_id', userId)` | Own data or parent |
| Get avatar + items | `supabase.from('child_avatars').select('*').eq('user_id', userId)` + `supabase.from('avatar_items').select('*')` | Family member |

### Shopping List (with Realtime)

| Operation | Query | Auth |
|-----------|-------|------|
| Get items | `supabase.from('shopping_items').select('*').eq('list_id', listId).order('category').order('created_at')` | Family member |
| Add item | `supabase.from('shopping_items').insert({ list_id, name, category, added_by_user_id })` | Family member |
| Check/uncheck | `supabase.from('shopping_items').update({ checked, checked_by_user_id, checked_at }).eq('id', itemId)` | Family member |
| Clear checked | `supabase.from('shopping_items').delete().eq('list_id', listId).eq('checked', true)` | Adult |
| **Realtime** | `supabase.channel('shopping').on('postgres_changes', { event: '*', table: 'shopping_items', filter: 'list_id=eq.{id}' }, handler).subscribe()` | — |

### Board Notes

| Operation | Query | Auth |
|-----------|-------|------|
| List notes | `supabase.from('board_notes').select('*').eq('family_id', familyId).order('created_at', { ascending: false })` | Family member |
| Create note | `supabase.from('board_notes').insert({ family_id, author_user_id, text, image_url, expires_at })` | Family member |
| Delete note | `supabase.from('board_notes').delete().eq('id', noteId)` | Author or admin |
| Upload image | `supabase.storage.from('board-images').upload(path, file)` | Family member |

### Notifications (with Realtime)

| Operation | Query | Auth |
|-----------|-------|------|
| List | `supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)` | Own data |
| Mark read | `supabase.from('notifications').update({ read: true }).eq('id', notifId)` | Own data |
| **Realtime** | `supabase.channel('notifications').on('postgres_changes', { event: 'INSERT', table: 'notifications', filter: 'user_id=eq.{id}' }, handler).subscribe()` | — |

### Care-Share

| Operation | Query | Auth |
|-----------|-------|------|
| Get distribution | `supabase.rpc('get_care_share', { family_id, period })` | Adult only |

### Subscriptions

| Operation | Query | Auth |
|-----------|-------|------|
| Get current | `supabase.from('subscriptions').select('*').eq('family_id', familyId).eq('status', 'active').single()` | Family member |

---

## 2. Edge Functions (Complex Server Logic)

### `complete-task`

The most critical Edge Function. Handles the full gamification transaction atomically.

**Invoke:** `supabase.functions.invoke('complete-task', { body: { taskId, userId, photoUrl? } })`

**Logic (in order):**
1. Validate: task exists, belongs to user's family, assigned to user (or unassigned for adults), status=open
2. If photoRequired and no photoUrl → error `PHOTO_REQUIRED`
3. Mark task status=completed, completed_at=now()
4. Calculate XP (from task.xp_value, apply multipliers if any)
5. Calculate Gold (1 Gold per 5 XP, minimum 1)
6. INSERT into points_ledger (append-only): user_id, task_id, xp_awarded, gold_awarded, reason='task_complete'
7. Update level: recalculate from total XP in ledger
8. Check streak: first completion today? Update streak count. Was streak about to break? Check streak freeze.
9. Evaluate drop: 20% base probability, server-side Math.random(). If drop: INSERT into drop_events, add to response.
10. Feed creature: increment feed_count, check growth stage transition
11. Check challenge progress: if task qualifies for active challenge, increment progress
12. Check badge thresholds: compare totals against badge criteria, award new badges
13. Compose response with all gamification state for animation rendering

**Response:**
```typescript
{
  success: true,
  task: Task,
  gamification: {
    xpAwarded: number,
    goldAwarded: number,
    totalXP: number,
    currentLevel: number,
    currentLevelXP: number,
    nextLevelXP: number,
    leveledUp: boolean,
    newLevel?: number,
    streakCount: number,
    streakStartedToday: boolean,
    dropEvent?: { type: string, value: string | number },
    creatureUpdate?: { stage: string, feedCount: number, evolved: boolean },
    challengeProgress?: { challengeId: string, currentCount: number, targetCount: number, completed: boolean },
    badgesEarned?: { id: string, name: string, description: string, icon: string }[],
  }
}
```

### `child-auth`

Custom authentication for children (not Supabase Auth).

**Invoke:** `supabase.functions.invoke('child-auth', { body: { username, pin } })`

**Logic:**
1. Find user by username where role=child
2. Verify PIN hash (bcrypt)
3. Generate short-lived JWT with custom claims: { userId, familyId, role: 'child' }
4. Return JWT (client stores in memory, passes as Bearer token)

**Response:** `{ success: true, token: string, user: { id, name, familyId, role } }`

### `spend-gold`

Atomic gold balance check + deduction.

**Invoke:** `supabase.functions.invoke('spend-gold', { body: { userId, amount, itemType, itemId } })`

**Logic:**
1. Calculate gold balance from points_ledger (SUM of goldAwarded) - SUM of gold_spent
2. If balance < amount → error `INSUFFICIENT_GOLD`
3. INSERT into gold_transactions: user_id, amount, item_type, item_id
4. If itemType='streak_freeze': INSERT into streak_freezes
5. If itemType='avatar_item': INSERT into user_avatar_items

**Response:** `{ success: true, newBalance: number, item: { type, id, name } }`

### `ai-suggestions`

Claude API call for task suggestions.

**Invoke:** `supabase.functions.invoke('ai-suggestions', { body: { familyId } })`

**Logic:**
1. Fetch family task history (titles, frequencies, last dates) — anonymized, no names
2. Build Claude prompt with history context + seasonal awareness
3. Call Anthropic API
4. Parse JSON response, validate with Zod
5. Return 3 suggestions

**Response:** `{ success: true, suggestions: { title: string, reason: string, suggestedXP: number, suggestedAssignee?: string }[] }`

### `email-to-calendar`

Inbound email processing for P-14.

**Invoke:** Called by inbound email webhook (not frontend).

**Logic:**
1. Receive email via webhook (Resend/Postmark/SendGrid inbound)
2. Validate sender is registered adult in a family
3. Extract plain text from HTML email body
4. Send to Claude API with extraction prompt
5. Parse structured JSON response
6. INSERT into email_inbox_items for each extracted item
7. Create notification for parent
8. Schedule email body deletion (24h)

### `evaluate-nudges`

Scheduled job (pg_cron, runs at configured times).

**Logic:**
1. Fetch all active nudge rules where current time matches a configured time
2. For each rule: fetch child's task completion status, streak status
3. Compose context-aware message
4. INSERT into notifications
5. If push enabled (Family+ tier): send push via Capacitor/Web Push

### `generate-routines`

Scheduled job (pg_cron, runs daily at 00:00).

**Logic:**
1. Fetch all active routines
2. For each routine: generate routine_task_instances for the next 28 days (idempotent — skip if already exists)
3. Each instance creates a task record with routine metadata

### `weekly-recap`

Scheduled job (pg_cron, runs Monday 00:00).

**Logic:**
1. For each family: aggregate points_ledger for past week
2. Calculate per-member stats, streaks, badges earned, challenge progress
3. INSERT into weekly_recaps
4. Create notifications for family adults

### `promote-baby`

Promotes a baby to a child.

**Invoke:** `supabase.functions.invoke('promote-baby', { body: { familyMemberId, username, pin } })`

**Logic:**
1. Validate baby exists with role=baby
2. Check username uniqueness
3. Create user record with hashed PIN
4. Update family_member: role=baby→child, managed_by_user_id=null
5. Create child_permissions with defaults
6. Create companion_creature (egg stage)
7. Return success with creature data

### `get-calendar-auth-url` / `calendar-sync`

Google Calendar OAuth + sync.

**Logic:** OAuth flow via Edge Function (holds client secret). Token encryption. Sync fetches Google Calendar API and upserts external_calendar_events.

---

## 3. RLS Policy Templates

```sql
-- Family members can only see their own family's data
CREATE POLICY "family_isolation" ON tasks
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- Children can only modify their own items
CREATE POLICY "child_own_items" ON tasks
  FOR UPDATE USING (
    assigned_to_user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM family_members WHERE user_id = auth.uid() AND role = 'adult')
  );

-- Points ledger: insert only (append-only)
CREATE POLICY "ledger_insert_only" ON points_ledger
  FOR INSERT WITH CHECK (true); -- Edge Function uses service role
-- No UPDATE or DELETE policy = immutable

-- Subscription tier gate example
CREATE POLICY "family_tier_creatures" ON companion_creatures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN family_members fm ON fm.family_id = s.family_id
      WHERE fm.user_id = auth.uid()
      AND s.tier IN ('family', 'familyplus')
      AND s.status = 'active'
    )
  );
```

---

## 4. Database Functions (RPC)

```sql
-- Leaderboard (called via supabase.rpc)
CREATE OR REPLACE FUNCTION get_leaderboard(p_family_id uuid, p_period text)
RETURNS TABLE(position int, user_id uuid, name text, xp bigint, position_change int)
AS $$
  -- Aggregate points_ledger for the period
  -- Rank by XP descending
  -- Compare with previous period snapshot for position_change
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Care-Share distribution
CREATE OR REPLACE FUNCTION get_care_share(p_family_id uuid, p_period text)
RETURNS TABLE(user_id uuid, name text, completed_count int, percentage numeric)
AS $$
  -- Aggregate task completions by adult family members
  -- Calculate percentage distribution
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gold balance (used internally)
CREATE OR REPLACE FUNCTION get_gold_balance(p_user_id uuid)
RETURNS int AS $$
  SELECT COALESCE(SUM(gold_awarded), 0) - COALESCE(
    (SELECT SUM(amount) FROM gold_transactions WHERE user_id = p_user_id), 0
  )
  FROM points_ledger WHERE user_id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## 5. Error Codes

| Code | Context | Description |
|------|---------|-------------|
| `PHOTO_REQUIRED` | complete-task | Task requires photo proof but none provided |
| `INSUFFICIENT_GOLD` | spend-gold | Gold balance too low for purchase |
| `CHILD_NOT_PERMITTED` | task/event creation | Child lacks required permission |
| `USERNAME_TAKEN` | child-auth, promote-baby | Username already exists |
| `INVALID_PIN` | child-auth | PIN does not match |
| `TASK_ALREADY_COMPLETED` | complete-task | Task status is already completed |
| `CHALLENGE_EXPIRED` | challenge progress | Challenge end date has passed |
| `MEMBER_LIMIT_REACHED` | add member | Subscription tier member limit exceeded |
| `TIER_REQUIRED` | any gated feature | Feature requires higher subscription tier |
| `EMAIL_SENDER_UNKNOWN` | email-to-calendar | Sender email not registered in family |

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-29 | Initial Express-based API contracts | PM + VEGA |
| 1.1.0 | 2026-03-30 | Addendum for new features | PM + VEGA |
| 2.0.0 | 2026-03-31 | Complete rewrite for Supabase. Direct queries + Edge Functions + RLS. Baby, subscription, email pipeline. | PM + Atlas |
