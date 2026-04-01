import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFamily } from "@/hooks/useFamily";
import { useMediaQuery } from "@/hooks/use-mobile";
import IconPicker from "./IconPicker";
import { Calendar as CalendarIcon } from "lucide-react";

interface EventCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EventFormData) => void;
  defaultDate?: string;
  defaultAssignee?: string;
  initialData?: Partial<EventFormData>;
}

export interface EventFormData {
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  is_all_day: boolean;
  icon: string;
  assigned_to_user_ids: string[];
}

export default function EventCreateForm({ open, onOpenChange, onSubmit, defaultDate, defaultAssignee, initialData }: EventCreateFormProps) {
  const { t } = useTranslation();
  const { members } = useFamily();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [date, setDate] = useState(defaultDate ?? initialData?.start_at?.split("T")[0] ?? new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(initialData?.start_at?.split("T")[1]?.slice(0, 5) ?? "09:00");
  const [endTime, setEndTime] = useState(initialData?.end_at?.split("T")[1]?.slice(0, 5) ?? "10:00");
  const [isAllDay, setIsAllDay] = useState(initialData?.is_all_day ?? false);
  const [icon, setIcon] = useState(initialData?.icon ?? "Calendar");
  const [assignees, setAssignees] = useState<string[]>(
    initialData?.assigned_to_user_ids ?? (defaultAssignee ? [defaultAssignee] : [])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description,
      start_at: isAllDay ? `${date}T00:00:00` : `${date}T${startTime}:00`,
      end_at: isAllDay ? `${date}T23:59:59` : `${date}T${endTime}:00`,
      is_all_day: isAllDay,
      icon,
      assigned_to_user_ids: assignees,
    });
    onOpenChange(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <IconPicker value={icon} onChange={setIcon} />
        <Input autoFocus placeholder={t("event.title") + " *"} value={title} onChange={e => setTitle(e.target.value)} className="flex-1" />
      </div>

      <div>
        <Label>{t("event.date")}</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="allDay">{t("event.allDay")}</Label>
        <Switch id="allDay" checked={isAllDay} onCheckedChange={setIsAllDay} />
      </div>

      {!isAllDay && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("event.startTime")}</Label>
            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div>
            <Label>{t("event.endTime")}</Label>
            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <Label>{t("event.description")}</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      </div>

      <div>
        <Label>{t("task.assignee")}</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {members.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() =>
                setAssignees(prev =>
                  prev.includes(m.user_id ?? "")
                    ? prev.filter(id => id !== m.user_id)
                    : [...prev, m.user_id ?? ""]
                )
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                assignees.includes(m.user_id ?? "")
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary-light"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!title.trim()}>
        {t("common.create")}
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl max-h-[85vh] overflow-y-auto">
          <SheetHeader><SheetTitle>{t("event.create")}</SheetTitle></SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t("event.create")}</DialogTitle></DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
