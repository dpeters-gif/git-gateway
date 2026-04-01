import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Tables } from "@/integrations/supabase/types";

export type BoardNote = Tables<"board_notes">;

export function useBoardNotes(limit?: number) {
  const { familyId } = useFamily();
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["board-notes", familyId, limit],
    queryFn: async () => {
      let q = supabase
        .from("board_notes")
        .select("*")
        .eq("family_id", familyId!)
        .order("created_at", { ascending: false });

      // Filter expired by default
      q = q.or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`);

      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data as BoardNote[];
    },
    enabled: !!familyId,
  });

  const createNote = useMutation({
    mutationFn: async ({ text, imageUrl, expiresAt }: { text: string; imageUrl?: string; expiresAt?: string }) => {
      const { data, error } = await supabase
        .from("board_notes")
        .insert({
          family_id: familyId!,
          author_user_id: user?.id ?? null,
          text,
          image_url: imageUrl ?? null,
          expires_at: expiresAt ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board-notes"] });
      toast.success(t("board.notePosted", "Notiz gepostet"));
    },
    onError: () => toast.error(t("common.error")),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("board_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board-notes"] });
      toast.success(t("board.noteDeleted", "Notiz gelöscht"));
    },
    onError: () => toast.error(t("common.error")),
  });

  return { ...query, notes: query.data ?? [], createNote, deleteNote };
}
