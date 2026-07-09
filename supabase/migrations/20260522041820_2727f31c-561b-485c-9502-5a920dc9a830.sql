
CREATE TABLE public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner select" ON public.boards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner insert" ON public.boards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update" ON public.boards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner delete" ON public.boards FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER boards_updated_at BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.panel_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  investigated_id uuid NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  pos_x double precision NOT NULL DEFAULT 200,
  pos_y double precision NOT NULL DEFAULT 200,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (board_id, investigated_id)
);
CREATE INDEX panel_nodes_board_idx ON public.panel_nodes(board_id);
ALTER TABLE public.panel_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner select" ON public.panel_nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner insert" ON public.panel_nodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update" ON public.panel_nodes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner delete" ON public.panel_nodes FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.connections ADD COLUMN board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE;
CREATE INDEX connections_board_idx ON public.connections(board_id);
