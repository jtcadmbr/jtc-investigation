
create or replace function public.set_updated_at()
returns trigger language plpgsql
security invoker set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars owner select" on storage.objects for select
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
