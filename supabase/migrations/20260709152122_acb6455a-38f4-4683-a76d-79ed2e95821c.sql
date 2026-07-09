
-- Storage policies for the 'uploads' bucket
CREATE POLICY "uploads_public_read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'uploads');
CREATE POLICY "uploads_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "uploads_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "uploads_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fix SECURITY DEFINER function warnings — revoke EXECUTE from public roles
REVOKE EXECUTE ON FUNCTION public.set_face_embedding_user_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
