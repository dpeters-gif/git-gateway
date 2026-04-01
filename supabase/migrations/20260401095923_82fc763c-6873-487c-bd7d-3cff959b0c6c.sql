ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS recurrence_type TEXT NOT NULL DEFAULT 'weekly';
ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS scheduled_time TIME;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.rewards ADD COLUMN IF NOT EXISTS image_url TEXT;