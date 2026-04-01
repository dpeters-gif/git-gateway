import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Routine = Tables<"routines">;

export function useRoutines() {
  const { familyId } = useFamily();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["routines", familyId],
    queryFn: async () => {
      const { data, error } = await supabase.from("routines").select("*").eq("family_id", familyId!).order("title");
      if (error) throw error;
      return data as Routine[];
    },
    enabled: !!familyId,
  });

  const createRoutine = useMutation({
    mutationFn: async (routine: Omit<TablesInsert<"routines">, "family_id">) => {
      const { data, error } = await supabase.from("routines").insert({ ...routine, family_id: familyId! }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      toast.success("Routine erstellt");
    },
  });

  const deleteRoutine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("routines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      toast.success("Routine gelöscht");
    },
  });

  return { ...query, routines: query.data ?? [], createRoutine, deleteRoutine };
}
