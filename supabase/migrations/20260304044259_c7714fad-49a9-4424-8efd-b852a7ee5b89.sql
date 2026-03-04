-- Blocked users table
CREATE TABLE public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks" ON public.blocked_users
  FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert own blocks" ON public.blocked_users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks" ON public.blocked_users
  FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- User statuses table (WhatsApp-like stories)
CREATE TABLE public.user_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  text_content text,
  image_url text,
  background_color text DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.user_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view statuses" ON public.user_statuses
  FOR SELECT TO authenticated USING (expires_at > now());

CREATE POLICY "Users can insert own statuses" ON public.user_statuses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own statuses" ON public.user_statuses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for status media
INSERT INTO storage.buckets (id, name, public) VALUES ('statuses', 'statuses', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload status media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'statuses');

CREATE POLICY "Anyone can view status media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'statuses');