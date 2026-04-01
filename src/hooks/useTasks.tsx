import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Task = Tables<"tasks">;
export type TaskInsert = TablesInsert<"tasks">;
export type TaskUpdate = TablesUpdate<"tasks">;

export function useTasks(filters?: { status?: string; assignee?: string; priority?: string }) {
  const { familyId } = useFamily();
  const { user } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["tasks", familyId, filters],
    queryFn: async () => {
      let q = supabase.from("tasks").select("*").eq("family_id", familyId!);
      if (filters?.status && filters.status !== "all") q = q.eq("status", filters.status as "open" | "completed");
      if (filters?.assignee && filters.assignee !== "all") q = q.eq("assigned_to_user_id", filters.assignee);
      if (filters?.priority && filters.priority !== "all") q = q.eq("priority", filters.priority as "high" | "normal" | "low");
      const { data, error } = await q.order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!familyId,
  });

  const createTask = useMutation({
    mutationFn: async (task: Omit<TaskInsert, "family_id">) => {
      const { data, error } = await supabase.from("tasks").insert({ ...task, family_id: familyId! }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(t("task.created", "Aufgabe erstellt"));
    },
    onError: () => toast.error(t("common.error")),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: () => toast.error(t("common.error")),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Aufgabe gelöscht");
    },
    onError: () => toast.error(t("common.error")),
  });

  const completeTask = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ status: "completed" as const, completed_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return { ...query, tasks: query.data ?? [], createTask, updateTask, deleteTask, completeTask };
}
