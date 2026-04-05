import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, CheckCircle2, RefreshCw, GripVertical } from "lucide-react";
import { UserAvatar } from "@/components/settings/AvatarPicker";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import type { Task } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  member?: { display_name?: string; name: string; avatar_url?: string | null; color?: string } | null;
  /** Whether this task was sourced from a routine */
  isRoutine?: boolean;
  /** Show drag handle */
  dragHandle?: React.ReactNode;
  /** Extra wrapper style (for sortable transform) */
  style?: React.CSSProperties;
  /** Ref for sortable */
  innerRef?: React.Ref<HTMLDivElement>;
}

const borderColors: Record<string, string> = {
  high: "#C25B4E",
  normal: "#5B7A6B",
  low: "#9BA89F",
};

const ROUTINE_BORDER = "#C67B5C";

export default function TaskCard({
  task,
  onComplete,
  member,
  isRoutine = false,
  dragHandle,
  style,
  innerRef,
}: TaskCardProps) {
  const [completing, setCompleting] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = task.due_date ? task.due_date < today : false;
  const isCompleted = task.status === "completed";

  const leftBorder = isRoutine
    ? ROUTINE_BORDER
    : borderColors[task.priority] ?? borderColors.normal;

  const handleComplete = () => {
    if (isCompleted) return;
    setCompleting(true);
    onComplete();
    setTimeout(() => setCompleting(false), 300);
  };

  const formattedDate = task.due_date
    ? format(parseISO(task.due_date), "EEE, dd.MM.", { locale: de })
    : null;

  return (
    <motion.div
      ref={innerRef}
      style={{
        borderLeft: `4px solid ${leftBorder}`,
        background: "#FEFEFB",
        minHeight: "72px",
        ...style,
      }}
      whileHover={{
        boxShadow: "0 4px 12px rgba(45, 58, 50, 0.08)",
        transition: { duration: 0.2 },
      }}
      className="rounded-xl border border-border flex items-stretch"
    >
      {/* Drag handle (optional) */}
      {dragHandle}

      {/* Completion zone — full height tap target */}
      <button
        onClick={handleComplete}
        className="flex items-center justify-center shrink-0 touch-manipulation"
        style={{ width: "48px" }}
        disabled={isCompleted}
      >
        <AnimatePresence mode="wait">
          {isCompleted || completing ? (
            <motion.div
              key="checked"
              initial={{ scale: 0.8 }}
              animate={{ scale: [1.2, 1] }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: "#5D8A5B" }} />
            </motion.div>
          ) : (
            <motion.div key="unchecked">
              <Circle className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Task info — center */}
      <div className="flex-1 min-w-0 py-3 pr-1 flex flex-col justify-center">
        <div className="flex items-center gap-1">
          <span
            className={`text-base truncate ${
              isCompleted
                ? "line-through font-normal"
                : isOverdue
                ? "font-semibold text-foreground"
                : "font-normal text-foreground"
            }`}
            style={isCompleted ? { color: "#9BA89F" } : undefined}
          >
            {task.title}
          </span>
          {isRoutine && (
            <RefreshCw className="w-3.5 h-3.5 shrink-0" style={{ color: ROUTINE_BORDER }} />
          )}
        </div>

        {formattedDate && (
          <span
            className="text-xs font-medium mt-0.5"
            style={{ color: isOverdue ? "#C25B4E" : "#6B7B72" }}
          >
            {formattedDate}
          </span>
        )}
      </div>

      {/* XP badge */}
      {task.xp_value > 0 && !isCompleted && (
        <div className="flex items-center pr-2 shrink-0">
          <span
            className="text-xs font-bold rounded-full flex items-center"
            style={{
              height: "32px",
              padding: "0 12px",
              background: "rgba(255, 176, 32, 0.15)",
              border: "1px solid rgba(255, 176, 32, 0.4)",
              color: "#B8860B",
            }}
          >
            +{task.xp_value} XP
          </span>
        </div>
      )}

      {/* Assignee avatar */}
      {member && (
        <div className="flex items-center pr-3 shrink-0">
          <UserAvatar
            avatarUrl={member.avatar_url}
            name={member.display_name || member.name}
            className="h-7 w-7"
          />
        </div>
      )}
    </motion.div>
  );
}
