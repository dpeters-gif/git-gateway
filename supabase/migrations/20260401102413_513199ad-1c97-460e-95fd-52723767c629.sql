-- Allow note author or family admin to update board notes
CREATE POLICY "notes_update" ON public.board_notes FOR UPDATE USING (
  (author_user_id = auth.uid()) OR is_family_admin(family_id)
);