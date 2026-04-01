import { motion } from "framer-motion";
import { scaleIn, strikethrough } from "@/lib/animations";
import { CheckSquare, Square, Sparkles } from "lucide-react";
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
  const isCompleted = task.status === "completed";

  return (
    <motion.div
      variants={scaleIn}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`bg-card border-l-[3px] ${priorityColors[task.priority] ?? "border-primary"} rounded-md p-2 cursor-pointer hover:shadow-sm transition-shadow ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-1.5">
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
        <div className="flex items-center gap-0.5 mt-0.5">
          <Sparkles className="w-3 h-3 text-xp" />
          <span className="text-[10px] font-medium text-xp">{task.xp_value} XP</span>
        </div>
      )}
    </motion.div>
  );
}
