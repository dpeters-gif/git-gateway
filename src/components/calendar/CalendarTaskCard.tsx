import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { CheckSquare, Square, Sparkles, GripVertical, User, Flag } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useFamily } from "@/hooks/useFamily";
import { useTranslation } from "react-i18next";
import type { Task } from "@/hooks/useTasks";

interface CalendarTaskCardProps {
  task: Task;
  onClick: () => void;
  onComplete: () => void;
}

const priorityColors: Record<string, string> = {
  high: "border-priority-high",
  normal: "border-priority-normal",
  low: "border-priority-low",
};

export default function CalendarTaskCard({ task, onClick, onComplete }: CalendarTaskCardProps) {
  const { t } = useTranslation();
  const { members } = useFamily();
  const isCompleted = task.status === "completed";
  const assignee = members.find(m => m.user_id === task.assigned_to_user_id);
  const priorityLabels: Record<string, string> = { high: t("task.priorityHigh"), normal: t("task.priorityNormal"), low: t("task.priorityLow") };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: "task", item: task },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      variants={scaleIn}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`bg-card border-l-[3px] ${priorityColors[task.priority] ?? "border-primary"} rounded-md p-2 cursor-pointer hover:shadow-sm transition-shadow ${
        isCompleted ? "opacity-60" : ""
      } group relative`}
    >
      <div className="flex items-center gap-1.5">
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 touch-manipulation cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="shrink-0 touch-manipulation"
        >
          {isCompleted ? (
            <CheckSquare className="w-4 h-4 text-success" />
          ) : (
            <Square className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>
        <span className={`text-xs font-semibold truncate ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {task.title}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-0.5 ml-[30px] flex-wrap">
        {assignee && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <User className="w-2.5 h-2.5" /> {assignee.name}
          </span>
        )}
        <span className={`text-[10px] font-medium ${task.priority === "high" ? "text-red-500" : task.priority === "low" ? "text-blue-500" : "text-yellow-600"}`}>
          {priorityLabels[task.priority]}
        </span>
        {task.xp_value > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-xp">
            <Sparkles className="w-3 h-3" /> {task.xp_value} XP
          </span>
        )}
      </div>
    </motion.div>
  );
}
