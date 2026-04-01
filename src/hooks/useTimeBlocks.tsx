import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type TimeBlock = Tables<"time_blocks">;

export function useTimeBlocks() {
  const { familyId } = useFamily();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["time-blocks", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_blocks")
        .select("*")
        .eq("family_id", familyId!)
        .order("start_time");
      if (error) throw error;
      return data as TimeBlock[];
    },
    enabled: !!familyId,
  });

  const createTimeBlock = useMutation({
    mutationFn: async (block: Omit<TablesInsert<"time_blocks">, "family_id">) => {
      const { data, error } = await supabase.from("time_blocks").insert({ ...block, family_id: familyId! }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-blocks"] });
      toast.success("Zeitblock erstellt");
    },
  });

  const deleteTimeBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("time_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-blocks"] });
      toast.success("Zeitblock gelöscht");
    },
  });

  return { ...query, timeBlocks: query.data ?? [], createTimeBlock, deleteTimeBlock };
}
