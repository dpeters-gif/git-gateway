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

const priorityStyles: Record<string, { bg: string; border: string }> = {
  high: { bg: "rgba(194, 91, 78, 0.08)", border: "#C25B4E" },
  normal: { bg: "rgba(91, 122, 107, 0.08)", border: "#5B7A6B" },
  low: { bg: "#FEFEFB", border: "#9BA89F" },
};

export default function CalendarTaskCard({ task, onClick, onComplete }: CalendarTaskCardProps) {
  const { t } = useTranslation();
  const { members } = useFamily();
  const isCompleted = task.status === "completed";
  const assignee = members.find(m => m.user_id === task.assigned_to_user_id);
  const priorityLabels: Record<string, string> = { high: t("task.priorityHigh"), normal: t("task.priorityNormal"), low: t("task.priorityLow") };

  const ps = priorityStyles[task.priority] ?? priorityStyles.normal;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: "task", item: task },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 3,
    backgroundColor: ps.bg,
    borderLeftColor: ps.border,
  } : {
    zIndex: 3,
    backgroundColor: ps.bg,
    borderLeftColor: ps.border,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      variants={scaleIn}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`border-l-[4px] rounded-md p-2 cursor-pointer hover:shadow-sm transition-shadow ${
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
        <span className={`truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`} style={{ fontSize: 13, fontWeight: 600, color: isCompleted ? undefined : "#2D3A32" }}>
          {task.title}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-0.5 ml-[30px] flex-wrap">
        {assignee && (
          <span className="flex items-center gap-0.5" style={{ fontSize: 12, color: "#6B7B72" }}>
            <User className="w-2.5 h-2.5" /> {assignee.name}
          </span>
        )}
        <span style={{ fontSize: 12, fontWeight: 500, color: task.priority === "high" ? "#C25B4E" : task.priority === "low" ? "#9BA89F" : "#5B7A6B" }}>
          {priorityLabels[task.priority]}
        </span>
        {task.xp_value > 0 && (
          <span className="flex items-center gap-0.5 text-xp font-medium" style={{ fontSize: 12 }}>
            <Sparkles className="w-3 h-3" /> {task.xp_value} XP
          </span>
        )}
      </div>
    </motion.div>
  );
}
