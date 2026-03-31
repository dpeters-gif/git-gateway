
-- Points Ledger (APPEND-ONLY)
CREATE TABLE public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id),
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  gold_awarded INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT 'task_complete',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id, reason)
);
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ledger_user ON public.points_ledger(user_id, created_at);
CREATE POLICY "ledger_select" ON public.points_ledger FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members fm1 JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm2.user_id = points_ledger.user_id
  )
);

-- Rewards
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT,
  child_user_id UUID REFERENCES auth.users(id),
  xp_threshold INTEGER, gold_price INTEGER,
  icon TEXT NOT NULL DEFAULT 'gift', is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_rewards_updated BEFORE UPDATE ON public.rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "rewards_select" ON public.rewards FOR SELECT USING (public.is_family_member(family_id));
CREATE POLICY "rewards_admin_i" ON public.rewards FOR INSERT WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "rewards_admin_u" ON public.rewards FOR UPDATE USING (public.is_family_admin(family_id));
CREATE POLICY "rewards_admin_d" ON public.rewards FOR DELETE USING (public.is_family_admin(family_id));

-- Reward Fulfillments
CREATE TABLE public.reward_fulfillments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  child_user_id UUID NOT NULL REFERENCES auth.users(id),
  fulfilled_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_fulfillments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rf_select" ON public.reward_fulfillments FOR SELECT USING (child_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.rewards r WHERE r.id = reward_fulfillments.reward_id AND public.is_family_member(r.family_id)));
CREATE POLICY "rf_insert" ON public.reward_fulfillments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.rewards r WHERE r.id = reward_id AND public.is_family_admin(r.family_id)));

-- Streaks
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0, longest_count INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks_select" ON public.streaks FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.family_members fm1 JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id WHERE fm1.user_id = auth.uid() AND fm2.user_id = streaks.user_id));

-- Levels
CREATE TABLE public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1, total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "levels_select" ON public.levels FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.family_members fm1 JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id WHERE fm1.user_id = auth.uid() AND fm2.user_id = levels.user_id));

-- Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'award', category TEXT NOT NULL DEFAULT 'milestone',
  criteria_type TEXT NOT NULL, criteria_value INTEGER NOT NULL DEFAULT 1,
  is_seasonal BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_public" ON public.badges FOR SELECT USING (true);

-- User Badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ub_select" ON public.user_badges FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.family_members fm1 JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id WHERE fm1.user_id = auth.uid() AND fm2.user_id = user_badges.user_id));

-- Challenges
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT,
  type public.challenge_type NOT NULL DEFAULT 'family',
  target_count INTEGER NOT NULL DEFAULT 10,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE, end_date DATE,
  reward_xp INTEGER NOT NULL DEFAULT 50,
  boss_creature_type TEXT, boss_hp INTEGER, boss_current_hp INTEGER,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_challenges_updated BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "ch_select" ON public.challenges FOR SELECT USING (public.is_family_member(family_id));
CREATE POLICY "ch_admin_i" ON public.challenges FOR INSERT WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "ch_admin_u" ON public.challenges FOR UPDATE USING (public.is_family_admin(family_id));
ALTER TABLE public.tasks ADD CONSTRAINT fk_tasks_challenge FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE SET NULL;

-- Challenge Progress
CREATE TABLE public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp2_select" ON public.challenge_progress FOR SELECT USING (EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_progress.challenge_id AND public.is_family_member(c.family_id)));

-- Leaderboard Snapshots
CREATE TABLE public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL, period_start DATE NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0, rank INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lb_select" ON public.leaderboard_snapshots FOR SELECT USING (public.is_family_member(family_id));

-- Drop Events
CREATE TABLE public.drop_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.drop_type NOT NULL, value TEXT NOT NULL DEFAULT '',
  task_id UUID REFERENCES public.tasks(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.drop_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drops_select" ON public.drop_events FOR SELECT USING (user_id = auth.uid());

-- Streak Freezes
CREATE TABLE public.streak_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_used BOOLEAN NOT NULL DEFAULT false, used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sf_select" ON public.streak_freezes FOR SELECT USING (user_id = auth.uid());

-- Companion Creatures
CREATE TABLE public.companion_creatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creature_type TEXT NOT NULL, name TEXT,
  stage public.creature_stage NOT NULL DEFAULT 'egg',
  feed_count INTEGER NOT NULL DEFAULT 0, hatch_progress INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companion_creatures ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_creatures_updated BEFORE UPDATE ON public.companion_creatures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "creatures_select" ON public.companion_creatures FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.family_members fm1 JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id WHERE fm1.user_id = auth.uid() AND fm2.user_id = companion_creatures.user_id));

-- Gold Transactions
CREATE TABLE public.gold_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, item_type TEXT NOT NULL, item_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gold_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gt_select" ON public.gold_transactions FOR SELECT USING (user_id = auth.uid());

-- Nudge Rules
CREATE TABLE public.nudge_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_user_id UUID NOT NULL REFERENCES auth.users(id),
  times TIME[] NOT NULL DEFAULT '{}', is_enabled BOOLEAN NOT NULL DEFAULT true,
  parent_alert BOOLEAN NOT NULL DEFAULT false, quiet_start TIME, quiet_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.nudge_rules ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_nudge_updated BEFORE UPDATE ON public.nudge_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "nudge_admin" ON public.nudge_rules FOR ALL USING (public.is_family_admin(family_id));

-- Task Completion Photos
CREATE TABLE public.task_completion_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  photo_url TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_completion_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_family" ON public.task_completion_photos FOR ALL USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_completion_photos.task_id AND public.is_family_member(t.family_id)));

-- Weekly Recaps
CREATE TABLE public.weekly_recaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(family_id, week_start)
);
ALTER TABLE public.weekly_recaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recaps_family" ON public.weekly_recaps FOR SELECT USING (public.is_family_member(family_id));

-- Shopping Lists
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Einkaufsliste',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_sl_updated BEFORE UPDATE ON public.shopping_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "sl_family" ON public.shopping_lists FOR ALL USING (public.is_family_member(family_id));

-- Shopping Items
CREATE TABLE public.shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'other',
  checked BOOLEAN NOT NULL DEFAULT false, checked_by_user_id UUID REFERENCES auth.users(id), checked_at TIMESTAMPTZ,
  added_by_user_id UUID REFERENCES auth.users(id), sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "si_family" ON public.shopping_items FOR ALL USING (EXISTS (SELECT 1 FROM public.shopping_lists sl WHERE sl.id = shopping_items.list_id AND public.is_family_member(sl.family_id)));

-- Child Avatars
CREATE TABLE public.child_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  equipped_items UUID[] NOT NULL DEFAULT '{}', background TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.child_avatars ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_avatar_updated BEFORE UPDATE ON public.child_avatars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "avatar_select" ON public.child_avatars FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.family_members fm1 JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id WHERE fm1.user_id = auth.uid() AND fm2.user_id = child_avatars.user_id));
CREATE POLICY "avatar_update" ON public.child_avatars FOR UPDATE USING (user_id = auth.uid());

-- Avatar Items
CREATE TABLE public.avatar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT,
  category TEXT NOT NULL DEFAULT 'accessory', icon TEXT NOT NULL DEFAULT 'shirt',
  required_level INTEGER NOT NULL DEFAULT 1, gold_price INTEGER,
  is_seasonal BOOLEAN NOT NULL DEFAULT false, available_from TIMESTAMPTZ, available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.avatar_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_public" ON public.avatar_items FOR SELECT USING (true);

-- Board Notes
CREATE TABLE public.board_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES auth.users(id), text TEXT NOT NULL DEFAULT '',
  image_url TEXT, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.board_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_select" ON public.board_notes FOR SELECT USING (public.is_family_member(family_id));
CREATE POLICY "notes_insert" ON public.board_notes FOR INSERT WITH CHECK (public.is_family_member(family_id));
CREATE POLICY "notes_delete" ON public.board_notes FOR DELETE USING (author_user_id = auth.uid() OR public.is_family_admin(family_id));

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, body TEXT, type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false, data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notif_user ON public.notifications(user_id, created_at DESC);
CREATE POLICY "notif_own" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Caregiver Links
CREATE TABLE public.caregiver_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  name TEXT NOT NULL DEFAULT '', visible_member_ids UUID[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.caregiver_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cg_admin" ON public.caregiver_links FOR ALL USING (public.is_family_admin(family_id));
CREATE POLICY "cg_read" ON public.caregiver_links FOR SELECT USING (true);

-- Calendar Connections
CREATE TABLE public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google', access_token_encrypted TEXT, refresh_token_encrypted TEXT,
  calendar_id TEXT, last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_cc_updated BEFORE UPDATE ON public.calendar_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "cc_own" ON public.calendar_connections FOR ALL USING (user_id = auth.uid());

-- External Calendar Events
CREATE TABLE public.external_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL, title TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL, end_at TIMESTAMPTZ, is_all_day BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'google',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, external_id, source)
);
ALTER TABLE public.external_calendar_events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_ece_updated BEFORE UPDATE ON public.external_calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "ece_family" ON public.external_calendar_events FOR SELECT USING (public.is_family_member(family_id));

-- Email Inbox Items
CREATE TABLE public.email_inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  extracted_title TEXT NOT NULL, extracted_date TIMESTAMPTZ,
  extracted_type TEXT NOT NULL DEFAULT 'event', original_subject TEXT,
  is_processed BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_inbox_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_family" ON public.email_inbox_items FOR ALL USING (public.is_family_member(family_id));

-- DB Functions
CREATE OR REPLACE FUNCTION public.get_gold_balance(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE((SELECT SUM(gold_awarded) FROM public.points_ledger WHERE user_id = p_user_id), 0)::INTEGER
    - COALESCE((SELECT SUM(amount) FROM public.gold_transactions WHERE user_id = p_user_id), 0)::INTEGER;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_leaderboard(p_family_id UUID, p_period TEXT)
RETURNS TABLE(pos INT, uid UUID, uname TEXT, xp BIGINT, pos_change INT) AS $$
  WITH period_xp AS (
    SELECT pl.user_id, SUM(pl.xp_awarded) AS total_xp
    FROM public.points_ledger pl
    JOIN public.family_members fm ON fm.user_id = pl.user_id AND fm.family_id = p_family_id
    WHERE fm.role = 'child'
    AND pl.created_at >= CASE WHEN p_period = 'weekly' THEN date_trunc('week', CURRENT_DATE) WHEN p_period = 'monthly' THEN date_trunc('month', CURRENT_DATE) ELSE date_trunc('week', CURRENT_DATE) END
    GROUP BY pl.user_id
  )
  SELECT ROW_NUMBER() OVER (ORDER BY px.total_xp DESC)::INT, px.user_id, p.name, px.total_xp, 0
  FROM period_xp px JOIN public.profiles p ON p.id = px.user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_care_share(p_family_id UUID, p_period TEXT)
RETURNS TABLE(uid UUID, uname TEXT, completed_count INT, pct NUMERIC) AS $$
  WITH completions AS (
    SELECT t.assigned_to_user_id AS user_id, COUNT(*)::INT AS cnt
    FROM public.tasks t WHERE t.family_id = p_family_id AND t.status = 'completed'
    AND t.completed_at >= CASE WHEN p_period = 'weekly' THEN date_trunc('week', CURRENT_DATE) WHEN p_period = 'monthly' THEN date_trunc('month', CURRENT_DATE) ELSE date_trunc('week', CURRENT_DATE) END
    GROUP BY t.assigned_to_user_id
  ), total AS (SELECT GREATEST(SUM(cnt), 1) AS total FROM completions)
  SELECT c.user_id, p.name, c.cnt, ROUND((c.cnt::NUMERIC / t.total) * 100, 1)
  FROM completions c JOIN public.profiles p ON p.id = c.user_id CROSS JOIN total t;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('task-photos', 'task-photos', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('board-images', 'board-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

CREATE POLICY "tp_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'task-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "tp_select" ON storage.objects FOR SELECT USING (bucket_id = 'task-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "bi_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'board-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "bi_select" ON storage.objects FOR SELECT USING (bucket_id = 'board-images');
CREATE POLICY "av_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "av_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
