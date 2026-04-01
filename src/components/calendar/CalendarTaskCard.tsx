import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { CheckSquare, Square, Sparkles, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/hooks/useTasks";

interface CalendarTaskCardProps {
  task: Task;
  onClick: () => void;
  onComplete: () => void;
  compact?: boolean;
  height?: number;
}

const priorityColors: Record<string, string> = {
  high: "border-priority-high",
  normal: "border-priority-normal",
  low: "border-priority-low",
};

export default function CalendarTaskCard({ task, onClick, onComplete, compact, height }: CalendarTaskCardProps) {
  const isCompleted = task.status === "completed";

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: "task", item: task },
  });

  const dragStyle = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  } : undefined;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...dragStyle, height: height ? `${height}px` : undefined }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`bg-card border-l-[3px] ${priorityColors[task.priority] ?? "border-primary"} rounded-md px-1.5 py-0.5 cursor-pointer hover:shadow-sm transition-shadow overflow-hidden ${isCompleted ? "opacity-60" : ""} group flex items-start gap-1`}
      >
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 mt-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="shrink-0 mt-0.5"
        >
          {isCompleted ? (
            <CheckSquare className="w-3.5 h-3.5 text-success" />
          ) : (
            <Square className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
          )}
        </button>
        <span className={`text-[11px] font-medium truncate ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {task.title}
        </span>
        {task.xp_value > 0 && (
          <span className="ml-auto text-[10px] text-xp flex items-center gap-0.5 shrink-0">
            <Sparkles className="w-2.5 h-2.5" /> {task.xp_value}
          </span>
        )}
      </div>
    );
  }

  // Full card (used in mobile list view)
  return (
    <motion.div
      ref={setNodeRef}
      style={dragStyle}
      variants={scaleIn}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`bg-card border-l-[3px] ${priorityColors[task.priority] ?? "border-primary"} rounded-md p-2 cursor-pointer hover:shadow-sm transition-shadow ${isCompleted ? "opacity-60" : ""} group`}
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
      {task.xp_value > 0 && (
        <span className="flex items-center gap-0.5 text-[10px] font-medium text-xp ml-[30px]">
          <Sparkles className="w-3 h-3" /> {task.xp_value} XP
        </span>
      )}
    </motion.div>
  );
}
