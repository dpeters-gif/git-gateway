import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Event = Tables<"events">;
export type EventInsert = TablesInsert<"events">;

export function useEvents() {
  const { familyId } = useFamily();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["events", familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("family_id", familyId!)
        .order("start_at", { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!familyId,
  });

  const createEvent = useMutation({
    mutationFn: async (event: Omit<EventInsert, "family_id">) => {
      const { data, error } = await supabase.from("events").insert({ ...event, family_id: familyId! }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event erstellt");
    },
    onError: () => toast.error("Fehler beim Erstellen"),
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"events"> & { id: string }) => {
      const { data, error } = await supabase.from("events").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event gelöscht");
    },
  });

  return { ...query, events: query.data ?? [], createEvent, updateEvent, deleteEvent };
}
