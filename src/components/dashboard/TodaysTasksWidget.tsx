import { useTranslation } from "react-i18next";
import { useTasks } from "@/hooks/useTasks";
import { useFamily } from "@/hooks/useFamily";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";

export default function TodaysTasksWidget() {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const { members } = useFamily();
  const qc = useQueryClient();

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(
    (tk) => tk.due_date === today && tk.status === "open"
  );

  const getMemberName = (userId: string | null) => {
    if (!userId) return "";
    return members.find((m) => m.user_id === userId)?.display_name ?? "";
  };

  const priorityColor: Record<string, string> = {
    high: "bg-destructive",
    normal: "bg-primary",
    low: "bg-muted-foreground",
  };

  const handleComplete = async (taskId: string) => {
    await supabase
      .from("tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", taskId);
    qc.invalidateQueries({ queryKey: ["tasks"] });
    toast.success(t("task.completed"));
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h2 className="text-md font-extrabold text-foreground">
            {t("home.todaysTasks")}
          </h2>
        </div>
        <Link
          to="/tasks"
          className="text-xs text-primary hover:underline"
        >
          {t("home.allTasks")}
        </Link>
      </div>

      {todayTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("home.noTasksToday")}
        </p>
      ) : (
        <div className="space-y-2">
          {todayTasks.slice(0, 8).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2.5"
            >
              <Checkbox
                checked={false}
                onCheckedChange={() => handleComplete(task.id)}
                className="shrink-0"
              />
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${priorityColor[task.priority] ?? "bg-muted-foreground"}`}
              />
              <span className="text-xs text-foreground flex-1 truncate">
                {task.title}
              </span>
              {getMemberName(task.assigned_to_user_id) && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {getMemberName(task.assigned_to_user_id)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
