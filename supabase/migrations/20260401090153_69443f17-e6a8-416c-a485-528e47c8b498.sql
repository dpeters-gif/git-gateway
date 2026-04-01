-- Fix: Add missing INSERT/UPDATE/UPSERT policies for all gamification and feature tables

-- Points ledger: insert by family member or own user
CREATE POLICY "ledger_insert_member" ON public.points_ledger 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.family_members fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.family_id = (SELECT t.family_id FROM public.tasks t WHERE t.id = points_ledger.task_id))
    OR points_ledger.user_id = auth.uid()
  );

-- Levels: insert + update
CREATE POLICY "levels_upsert" ON public.levels 
  FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm2.user_id = levels.user_id
  ));
CREATE POLICY "levels_update" ON public.levels 
  FOR UPDATE USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm1.is_admin = true AND fm2.user_id = levels.user_id
  ));

-- Streaks: insert + update
CREATE POLICY "streaks_upsert" ON public.streaks 
  FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm2.user_id = streaks.user_id
  ));
CREATE POLICY "streaks_update" ON public.streaks 
  FOR UPDATE USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm1.is_admin = true AND fm2.user_id = streaks.user_id
  ));

-- Companion creatures: insert + update
CREATE POLICY "creatures_insert" ON public.companion_creatures 
  FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm1.is_admin = true AND fm2.user_id = companion_creatures.user_id
  ));
CREATE POLICY "creatures_update" ON public.companion_creatures 
  FOR UPDATE USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm2.user_id = companion_creatures.user_id
  ));

-- Gold transactions: insert
CREATE POLICY "gt_insert" ON public.gold_transactions 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Drop events: insert
CREATE POLICY "drops_insert" ON public.drop_events 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Streak freezes: insert
CREATE POLICY "sf_insert" ON public.streak_freezes 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Child avatars: insert
CREATE POLICY "avatar_insert" ON public.child_avatars 
  FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm1.is_admin = true AND fm2.user_id = child_avatars.user_id
  ));

-- Leaderboard snapshots: insert
CREATE POLICY "lb_insert" ON public.leaderboard_snapshots 
  FOR INSERT WITH CHECK (public.is_family_admin(family_id));

-- Subscriptions: insert + update
CREATE POLICY "subs_insert" ON public.subscriptions 
  FOR INSERT WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "subs_update" ON public.subscriptions 
  FOR UPDATE USING (public.is_family_admin(family_id));

-- Weekly recaps: insert
CREATE POLICY "recaps_insert" ON public.weekly_recaps 
  FOR INSERT WITH CHECK (public.is_family_member(family_id));

-- Notifications: insert
CREATE POLICY "notif_insert" ON public.notifications 
  FOR INSERT WITH CHECK (true);

-- Challenge progress: insert + update
CREATE POLICY "cp2_insert" ON public.challenge_progress 
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.challenges c WHERE c.id = challenge_progress.challenge_id AND public.is_family_member(c.family_id)
  ));
CREATE POLICY "cp2_update" ON public.challenge_progress 
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.challenges c WHERE c.id = challenge_progress.challenge_id AND public.is_family_member(c.family_id)
  ));

-- User badges: insert
CREATE POLICY "ub_insert" ON public.user_badges 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.family_members fm1 
      JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm1.user_id = auth.uid() AND fm1.is_admin = true AND fm2.user_id = user_badges.user_id
    )
  );

-- Profiles: allow family members to SELECT each other
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_family" ON public.profiles 
  FOR SELECT USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.family_members fm1 
      JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id 
      WHERE fm1.user_id = auth.uid() AND fm2.user_id = profiles.id
    )
  );

-- Email inbox: explicit insert
CREATE POLICY "email_insert" ON public.email_inbox_items 
  FOR INSERT WITH CHECK (public.is_family_member(family_id));