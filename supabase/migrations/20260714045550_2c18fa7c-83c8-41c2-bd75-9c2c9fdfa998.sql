CREATE TABLE public.face_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigated_id uuid NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  query_embedding double precision[] NOT NULL,
  decision text NOT NULL CHECK (decision IN ('confirm','reject')),
  distance double precision NOT NULL,
  confidence double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.face_feedback TO authenticated;
GRANT ALL ON public.face_feedback TO service_role;
ALTER TABLE public.face_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own face_feedback" ON public.face_feedback
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX face_feedback_user_person_idx ON public.face_feedback (user_id, investigated_id);