import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useFamily } from "@/hooks/useFamily";
import TaskCreateForm, { type TaskFormData } from "@/components/calendar/TaskCreateForm";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Square, Sparkles, Filter } from "lucide-react";
import { toast } from "sonner";

export default function ParentTasks() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { members } = useFamily();
  const [statusFilter, setStatusFilter] = useState("open");
  const [memberFilter, setMemberFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { tasks, isLoading, isError, refetch, createTask, completeTask, deleteTask } = useTasks({
    status: statusFilter,
    assignee: memberFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const handleCreate = useCallback((data: TaskFormData) => {
    createTask.mutate({ ...data, created_by_user_id: user?.id ?? null });
  }, [createTask, user]);

  if (isError) return <ErrorState message={t("common.error")} onRetry={refetch} />;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
      <motion.div variants={slideUp} className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-foreground">{t("nav.tasks")}</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>{t("task.create")}</Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={slideUp} className="flex gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="open">{t("task.open")}</SelectItem>
            <SelectItem value="completed">{t("task.completed")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={memberFilter} onValueChange={setMemberFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Alle Mitglieder" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Alle</SelectItem>
            {members.map(m => (
              <SelectItem key={m.id} value={m.user_id ?? m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Priorität" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Alle</SelectItem>
            <SelectItem value="high">{t("task.priorityHigh")}</SelectItem>
            <SelectItem value="normal">{t("task.priorityNormal")}</SelectItem>
            <SelectItem value="low">{t("task.priorityLow")}</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Task list */}
      {isLoading ? (
        <SkeletonLoader type="list" count={5} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={t("home.empty.title")}
          body={t("home.empty.body")}
          ctaLabel={t("task.create")}
          onCta={() => setShowCreate(true)}
        />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
          {tasks.map(task => (
            <motion.div
              key={task.id}
              variants={slideUp}
              className={`bg-card rounded-lg p-4 border-l-[3px] ${
                task.priority === "high" ? "border-priority-high" : task.priority === "low" ? "border-priority-low" : "border-priority-normal"
              } border border-border hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    if (task.status === "completed") return;
                    completeTask.mutate(task.id);
                    toast.success(t("task.completed"), {
                      action: { label: t("common.undo"), onClick: () => {} },
                    });
                  }}
                  className="mt-0.5 shrink-0 touch-manipulation"
                >
                  {task.status === "completed" ? (
                    <CheckSquare className="w-5 h-5 text-success" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {task.xp_value > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-xp bg-xp-light px-1.5 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> {task.xp_value} XP
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-[10px] text-muted-foreground">{task.due_date}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <TaskCreateForm
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreate}
      />
    </motion.div>
  );
}
