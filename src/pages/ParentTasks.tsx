import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useFamily } from "@/hooks/useFamily";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCreateForm, { type TaskFormData } from "@/components/calendar/TaskCreateForm";
import PullToRefresh from "@/components/shared/PullToRefresh";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Square, Sparkles, GripVertical } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/hooks/useTasks";

function SortableTaskCard({ task, onComplete }: { task: Task; onComplete: () => void }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      variants={slideUp}
      className={`bg-card rounded-lg p-4 border-l-[3px] ${
        task.priority === "high" ? "border-priority-high" : task.priority === "low" ? "border-priority-low" : "border-priority-normal"
      } border border-border hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 shrink-0 cursor-grab active:cursor-grabbing touch-manipulation"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => {
            if (task.status === "completed") return;
            onComplete();
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
  );
}

export default function ParentTasks() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { members } = useFamily();
  const [statusFilter, setStatusFilter] = useState("open");
  const [memberFilter, setMemberFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);

  const { tasks, isLoading, isError, refetch, createTask, updateTask, completeTask } = useTasks({
    status: statusFilter,
    assignee: memberFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const orderedTasks = localOrder
    ? localOrder.map(id => tasks.find(t => t.id === id)).filter(Boolean) as Task[]
    : tasks;

  const handleCreate = useCallback((data: TaskFormData) => {
    createTask.mutate({ ...data, created_by_user_id: user?.id ?? null });
  }, [createTask, user]);

  const handleComplete = useCallback((taskId: string) => {
    completeTask.mutate(taskId);
    toast.success(t("task.completed"), {
      action: {
        label: t("common.undo"),
        onClick: () => {
          updateTask.mutate({ id: taskId, status: "open" as const, completed_at: null });
        },
      },
      duration: 5000,
    });
  }, [completeTask, updateTask, t]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const currentIds = (localOrder ?? tasks.map(t => t.id));
    const oldIndex = currentIds.indexOf(active.id as string);
    const newIndex = currentIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    setLocalOrder(arrayMove(currentIds, oldIndex, newIndex));
  }, [localOrder, tasks]);

  if (isError) return <ErrorState message={t("common.error")} onRetry={refetch} />;

  return (
    <PullToRefresh onRefresh={async () => { setLocalOrder(null); await refetch(); }}>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
        <motion.div variants={slideUp} className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-foreground">{t("nav.tasks")}</h1>
          <Button size="sm" onClick={() => setShowCreate(true)}>{t("task.create")}</Button>
        </motion.div>

        <motion.div variants={slideUp} className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setLocalOrder(null); }}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="open">{t("task.open")}</SelectItem>
              <SelectItem value="completed">{t("task.completed")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={memberFilter} onValueChange={v => { setMemberFilter(v); setLocalOrder(null); }}>
            <SelectTrigger className="w-32"><SelectValue placeholder={t("common.all")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {members.filter(m => m.user_id || m.id).map(m => (
                <SelectItem key={m.id} value={m.user_id || m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={v => { setPriorityFilter(v); setLocalOrder(null); }}>
            <SelectTrigger className="w-32"><SelectValue placeholder={t("task.priorityLabel", "Priorität")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="high">{t("task.priorityHigh")}</SelectItem>
              <SelectItem value="normal">{t("task.priorityNormal")}</SelectItem>
              <SelectItem value="low">{t("task.priorityLow")}</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {isLoading ? (
          <SkeletonLoader type="list" count={5} />
        ) : orderedTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={t("home.empty.title")}
            body={t("home.empty.body")}
            ctaLabel={t("task.create")}
            onCta={() => setShowCreate(true)}
          />
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                {orderedTasks.map(task => (
                  <SortableTaskCard key={task.id} task={task} onComplete={() => handleComplete(task.id)} />
                ))}
              </motion.div>
            </SortableContext>
          </DndContext>
        )}

        <TaskCreateForm
          open={showCreate}
          onOpenChange={setShowCreate}
          onSubmit={handleCreate}
        />
      </motion.div>
    </PullToRefresh>
  );
}
