import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import { CheckSquare, Square, Sparkles, Star, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

export default function ChildQuests() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");
  const { tasks, isLoading, completeTask } = useTasks({ status: filter === "all" ? undefined : filter });

  const myTasks = tasks
    .filter(task => task.assigned_to_user_id === user?.id)
    .sort((a, b) => {
      const today = format(new Date(), "yyyy-MM-dd");
      const aToday = a.due_date === today ? 0 : 1;
      const bToday = b.due_date === today ? 0 : 1;
      if (aToday !== bToday) return aToday - bToday;
      return (a.due_date ?? "").localeCompare(b.due_date ?? "");
    });

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-bold text-foreground">{t("nav.quests")}</h1>
      </motion.div>

      <motion.div variants={slideUp} className="flex gap-2">
        {(["all", "open", "completed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? "bg-child-accent text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f === "all" ? "Alle" : f === "open" ? t("task.open") : t("task.completed")}
          </button>
        ))}
      </motion.div>

      {isLoading ? (
        <SkeletonLoader type="list" count={5} />
      ) : myTasks.length === 0 ? (
        <EmptyState
          icon={Star}
          title={t("child.empty.title")}
          body={t("child.empty.body")}
        />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
          {myTasks.map(task => {
            const isCompleted = task.status === "completed";
            const isToday = task.due_date === format(new Date(), "yyyy-MM-dd");

            return (
              <motion.div
                key={task.id}
                variants={slideUp}
                className={`bg-card rounded-xl p-4 border border-border flex items-center gap-3 ${
                  isToday && !isCompleted ? "ring-1 ring-child-accent/30" : ""
                }`}
              >
                <button
                  onClick={() => !isCompleted && completeTask.mutate({ taskId: task.id })}
                  disabled={isCompleted}
                  className="shrink-0 touch-manipulation"
                >
                  {isCompleted ? (
                    <CheckSquare className="w-10 h-10 text-success" />
                  ) : (
                    <Square className="w-10 h-10 text-muted-foreground hover:text-child-accent transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </h3>
                  {task.due_date && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isToday ? "Heute" : task.due_date}
                    </p>
                  )}
                </div>
                <span className="flex items-center gap-0.5 text-xs font-bold text-xp bg-xp-light px-2 py-1 rounded-full shrink-0">
                  <Sparkles className="w-3 h-3" /> {task.xp_value}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
