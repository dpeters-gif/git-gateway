import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useFamily } from "@/hooks/useFamily";
import { useTasks } from "@/hooks/useTasks";
import TaskCreateForm, { type TaskFormData } from "@/components/calendar/TaskCreateForm";
import { Sparkles, Calendar, User, Flag, Camera, Trash2, Edit, CheckSquare, Square } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import { toast } from "sonner";

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { members } = useFamily();
  const { updateTask, deleteTask, completeTask } = useTasks();
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) return null;

  const assignee = members.find(m => m.user_id === task.assigned_to_user_id);
  const isCompleted = task.status === "completed";
  const priorityLabels: Record<string, string> = { high: t("task.priorityHigh"), normal: t("task.priorityNormal"), low: t("task.priorityLow") };
  const priorityColors: Record<string, string> = { high: "text-red-500", normal: "text-yellow-600", low: "text-blue-500" };

  const handleComplete = (photoUrl?: string) => {
    completeTask.mutate({ taskId: task.id, photoUrl });
    toast.success(t("task.completed"), {
      action: { label: t("common.undo"), onClick: () => updateTask.mutate({ id: task.id, status: "open" as const, completed_at: null }) },
      duration: 5000,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id);
    onOpenChange(false);
  };

  const handleEditSubmit = (data: TaskFormData) => {
    updateTask.mutate({ id: task.id, ...data });
    setShowEdit(false);
    onOpenChange(false);
  };

  const content = (
    <div className="space-y-4">
      {/* Title + status */}
      <div className="flex items-start gap-3">
        <button onClick={handleComplete} className="mt-1 shrink-0">
          {isCompleted ? <CheckSquare className="w-6 h-6 text-success" /> : <Square className="w-6 h-6 text-muted-foreground hover:text-primary" />}
        </button>
        <div>
          <h3 className={`text-lg font-bold ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</h3>
          {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        {assignee && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{assignee.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Flag className={`w-4 h-4 ${priorityColors[task.priority]}`} />
          <span className="text-sm">{priorityLabels[task.priority]}</span>
        </div>
        {task.due_date && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{task.due_date}</span>
          </div>
        )}
        {task.xp_value > 0 && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-xp" />
            <span className="text-sm font-medium text-xp">{task.xp_value} XP</span>
          </div>
        )}
        {task.start_time && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            🕐 {task.start_time}{task.end_time ? ` – ${task.end_time}` : ""}
          </div>
        )}
        {task.photo_required && (
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-accent" />
            <span className="text-sm">{t("task.photoRequired")}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="gap-1 flex-1">
          <Edit className="w-3.5 h-3.5" /> {t("common.edit")}
        </Button>
        {!isCompleted && (
          <Button size="sm" onClick={handleComplete} className="gap-1 flex-1">
            <CheckSquare className="w-3.5 h-3.5" /> {t("task.completed")}
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} className="gap-1">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="bg-destructive/10 rounded-md p-3 space-y-2">
          <p className="text-sm text-foreground">{t("board.deleteConfirm")}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleDelete}>{t("common.delete")}</Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>{t("common.cancel")}</Button>
          </div>
        </div>
      )}

      {/* Edit form */}
      <TaskCreateForm
        open={showEdit}
        onOpenChange={setShowEdit}
        onSubmit={handleEditSubmit}
        initialData={{
          title: task.title,
          description: task.description ?? "",
          due_date: task.due_date,
          start_time: task.start_time,
          end_time: task.end_time,
          priority: task.priority,
          xp_value: task.xp_value,
          assigned_to_user_id: task.assigned_to_user_id,
          icon: task.icon,
          photo_required: task.photo_required,
        }}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl max-h-[85vh] overflow-y-auto">
          <SheetHeader><SheetTitle>{task.title}</SheetTitle></SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{task.title}</DialogTitle></DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
