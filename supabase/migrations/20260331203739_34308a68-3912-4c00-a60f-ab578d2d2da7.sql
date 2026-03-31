
-- Fix profiles insert policy
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  assigned_to_user_id UUID REFERENCES auth.users(id),
  visibility TEXT NOT NULL DEFAULT 'family',
  priority public.task_priority NOT NULL DEFAULT 'normal',
  due_date DATE,
  start_time TIME,
  end_time TIME,
  xp_value INTEGER NOT NULL DEFAULT 10,
  icon TEXT NOT NULL DEFAULT 'check-square',
  photo_required BOOLEAN NOT NULL DEFAULT false,
  status public.task_status NOT NULL DEFAULT 'open',
  completed_at TIMESTAMPTZ,
  challenge_id UUID,
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tasks_family_date ON public.tasks(family_id, due_date);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to_user_id);
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (public.is_family_member(family_id));
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (public.is_family_member(family_id));
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (public.is_family_member(family_id));
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (public.is_family_admin(family_id) OR created_by_user_id = auth.uid());

-- Family Tags
CREATE TABLE public.family_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#4E6E5D',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, name)
);
ALTER TABLE public.family_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_family" ON public.family_tags FOR ALL USING (public.is_family_member(family_id));

-- Task Tags
CREATE TABLE public.task_tags (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.family_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_tags_family" ON public.task_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_tags.task_id AND public.is_family_member(t.family_id))
);

-- Task Comments
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_family" ON public.task_comments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_comments.task_id AND public.is_family_member(t.family_id))
);

-- Routines
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assigned_to_user_id UUID REFERENCES auth.users(id),
  weekdays INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
  flow_mode BOOLEAN NOT NULL DEFAULT false,
  flow_target_minutes INTEGER,
  flow_step_order TEXT[] NOT NULL DEFAULT '{}',
  photo_required BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_routines_updated BEFORE UPDATE ON public.routines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "routines_family" ON public.routines FOR ALL USING (public.is_family_member(family_id));

-- Routine Task Instances
CREATE TABLE public.routine_task_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(routine_id, date, position)
);
ALTER TABLE public.routine_task_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rti_family" ON public.routine_task_instances FOR ALL USING (
  EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_task_instances.routine_id AND public.is_family_member(r.family_id))
);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  assigned_to_user_ids UUID[] NOT NULL DEFAULT '{}',
  icon TEXT NOT NULL DEFAULT 'calendar',
  status public.event_status NOT NULL DEFAULT 'active',
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_events_family_date ON public.events(family_id, start_at);
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "events_select" ON public.events FOR SELECT USING (public.is_family_member(family_id));
CREATE POLICY "events_insert" ON public.events FOR INSERT WITH CHECK (public.is_family_member(family_id));
CREATE POLICY "events_update" ON public.events FOR UPDATE USING (public.is_family_member(family_id));
CREATE POLICY "events_delete" ON public.events FOR DELETE USING (public.is_family_admin(family_id) OR created_by_user_id = auth.uid());

-- Time Blocks
CREATE TABLE public.time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  type public.time_block_type NOT NULL,
  weekdays INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tb_updated BEFORE UPDATE ON public.time_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "tb_select" ON public.time_blocks FOR SELECT USING (public.is_family_member(family_id));
CREATE POLICY "tb_admin" ON public.time_blocks FOR INSERT WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "tb_update" ON public.time_blocks FOR UPDATE USING (public.is_family_admin(family_id));
CREATE POLICY "tb_delete" ON public.time_blocks FOR DELETE USING (public.is_family_admin(family_id));
