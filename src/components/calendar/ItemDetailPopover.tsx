import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle2 } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import type { Event } from "@/hooks/useEvents";

interface ItemDetailPopoverProps {
  item: Task | Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onComplete?: () => void;
  children: React.ReactNode;
}

function isTask(item: Task | Event): item is Task {
  return "xp_value" in item;
}

export default function ItemDetailPopover({ item, open, onOpenChange, onEdit, onDelete, onComplete, children }: ItemDetailPopoverProps) {
  const { t } = useTranslation();
  if (!item) return <>{children}</>;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">{item.title}</h3>
          {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
        </div>

        {isTask(item) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="bg-xp-light text-xp px-2 py-0.5 rounded-full font-medium">{item.xp_value} XP</span>
            <span>{t(`task.priority${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}`)}</span>
          </div>
        )}

        {!isTask(item) && (
          <div className="text-xs text-muted-foreground">
            {item.is_all_day
              ? "Ganztägig"
              : `${format(new Date(item.start_at), "HH:mm", { locale: de })}${item.end_at ? ` – ${format(new Date(item.end_at), "HH:mm", { locale: de })}` : ""}`}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1 gap-1">
            <Pencil className="w-3 h-3" /> {t("common.edit")}
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete} className="text-destructive gap-1">
            <Trash2 className="w-3 h-3" />
          </Button>
          {isTask(item) && item.status !== "completed" && onComplete && (
            <Button size="sm" onClick={onComplete} className="gap-1">
              <CheckCircle2 className="w-3 h-3" /> {t("task.completed")}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
