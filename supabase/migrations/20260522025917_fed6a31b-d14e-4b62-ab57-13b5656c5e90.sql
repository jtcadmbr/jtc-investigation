
-- Status enum
create type public.investigated_status as enum ('suspeito','investigado','testemunha','familiar','contato','desconhecido');

-- Investigateds
create table public.investigateds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  foto_url text,
  cpf text, rg text, idade int, data_nascimento date,
  telefone text, email text,
  endereco text, cidade text, estado text, pais text,
  descricao text, observacoes text,
  nome_mae text, nome_pai text,
  avo_materna text, avo_materno text, avo_paterna text, avo_paterno text,
  irmaos text, irmas text, tios text, tias text,
  instagram text, facebook text, tiktok text, twitter text, youtube text, linkedin text, outras_redes text,
  status public.investigated_status not null default 'desconhecido',
  pos_x double precision default 0,
  pos_y double precision default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.investigateds(user_id);
create index on public.investigateds(nome);

alter table public.investigateds enable row level security;

create policy "owner select" on public.investigateds for select using (auth.uid() = user_id);
create policy "owner insert" on public.investigateds for insert with check (auth.uid() = user_id);
create policy "owner update" on public.investigateds for update using (auth.uid() = user_id);
create policy "owner delete" on public.investigateds for delete using (auth.uid() = user_id);

-- Uploads
create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  tipo text not null,
  mime text,
  tamanho bigint,
  storage_path text not null,
  url text,
  pasta text default 'geral',
  created_at timestamptz not null default now()
);

create index on public.uploads(user_id);
alter table public.uploads enable row level security;

create policy "owner select" on public.uploads for select using (auth.uid() = user_id);
create policy "owner insert" on public.uploads for insert with check (auth.uid() = user_id);
create policy "owner update" on public.uploads for update using (auth.uid() = user_id);
create policy "owner delete" on public.uploads for delete using (auth.uid() = user_id);

-- Connections
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_id uuid not null references public.investigateds(id) on delete cascade,
  to_id uuid not null references public.investigateds(id) on delete cascade,
  rotulo text,
  created_at timestamptz not null default now()
);

create index on public.connections(user_id);
alter table public.connections enable row level security;

create policy "owner select" on public.connections for select using (auth.uid() = user_id);
create policy "owner insert" on public.connections for insert with check (auth.uid() = user_id);
create policy "owner update" on public.connections for update using (auth.uid() = user_id);
create policy "owner delete" on public.connections for delete using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_invest_updated before update on public.investigateds
for each row execute function public.set_updated_at();

-- Storage buckets
insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('uploads','uploads', false) on conflict do nothing;

-- Storage policies: avatars (public read, owner write)
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars owner insert" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars owner update" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars owner delete" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: uploads (private to owner)
create policy "uploads owner read" on storage.objects for select using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "uploads owner insert" on storage.objects for insert with check (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "uploads owner update" on storage.objects for update using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "uploads owner delete" on storage.objects for delete using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);
