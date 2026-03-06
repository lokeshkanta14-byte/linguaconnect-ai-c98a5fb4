CREATE TABLE public.ai_chat_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  last_topic text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ai_chat_memory_user_id_idx ON public.ai_chat_memory (user_id);

ALTER TABLE public.ai_chat_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memory" ON public.ai_chat_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memory" ON public.ai_chat_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory" ON public.ai_chat_memory FOR UPDATE USING (auth.uid() = user_id);