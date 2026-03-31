
-- Enums
CREATE TYPE public.member_role AS ENUM ('adult', 'child', 'baby');
CREATE TYPE public.task_status AS ENUM ('open', 'completed');
CREATE TYPE public.task_priority AS ENUM ('high', 'normal', 'low');
CREATE TYPE public.event_status AS ENUM ('active', 'pending');
CREATE TYPE public.time_block_type AS ENUM ('school', 'work', 'nap', 'unavailable');
CREATE TYPE public.challenge_type AS ENUM ('individual', 'family', 'boss_battle');
CREATE TYPE public.creature_stage AS ENUM ('egg', 'baby', 'juvenile', 'adult');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'family', 'familyplus');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired');
CREATE TYPE public.drop_type AS ENUM ('bonus_gold', 'xp_boost', 'avatar_item', 'streak_freeze', 'mystery_egg');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  username TEXT UNIQUE,
  pin_hash TEXT,
  role public.member_role NOT NULL DEFAULT 'adult',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_volume NUMERIC NOT NULL DEFAULT 0.7,
  locale TEXT NOT NULL DEFAULT 'de',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), 'adult');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Families
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_families_updated BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Family Members
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role public.member_role NOT NULL DEFAULT 'adult',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  color TEXT NOT NULL DEFAULT '#4E6E5D',
  managed_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_fm_updated BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper functions (after tables exist)
CREATE OR REPLACE FUNCTION public.is_family_member(p_family_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.family_members WHERE family_id = p_family_id AND user_id = auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.is_family_admin(p_family_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.family_members WHERE family_id = p_family_id AND user_id = auth.uid() AND is_admin = true); $$;

CREATE OR REPLACE FUNCTION public.get_user_family_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT family_id FROM public.family_members WHERE user_id = auth.uid() LIMIT 1; $$;

-- RLS for families
CREATE POLICY "families_select" ON public.families FOR SELECT USING (public.is_family_member(id));
CREATE POLICY "families_insert" ON public.families FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "families_update" ON public.families FOR UPDATE USING (public.is_family_admin(id));

-- RLS for family_members
CREATE POLICY "fm_select" ON public.family_members FOR SELECT USING (public.is_family_member(family_id));
CREATE POLICY "fm_insert" ON public.family_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "fm_update" ON public.family_members FOR UPDATE USING (public.is_family_admin(family_id));
CREATE POLICY "fm_delete" ON public.family_members FOR DELETE USING (public.is_family_admin(family_id));

-- Family Invites
CREATE TABLE public.family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invites_admin" ON public.family_invites FOR ALL USING (public.is_family_admin(family_id));
CREATE POLICY "invites_read_token" ON public.family_invites FOR SELECT USING (true);

-- Child Permissions
CREATE TABLE public.child_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  can_create_tasks BOOLEAN NOT NULL DEFAULT false,
  can_create_events BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.child_permissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_cp_updated BEFORE UPDATE ON public.child_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "cp_select_own" ON public.child_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cp_admin" ON public.child_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.family_members fm1 JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm1.is_admin = true AND fm2.user_id = child_permissions.user_id)
);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  tier public.subscription_tier NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  app_store_product_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "subs_select" ON public.subscriptions FOR SELECT USING (public.is_family_member(family_id));
