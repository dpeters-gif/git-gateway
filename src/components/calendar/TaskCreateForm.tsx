import { useState } from "react";
import { useTranslation } from "react-i18next";
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

interface TaskCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  defaultDate?: string;
  defaultAssignee?: string;
  initialData?: Partial<TaskFormData>;
}

export interface TaskFormData {
  title: string;
  description: string;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
  priority: "high" | "normal" | "low";
  xp_value: number;
  assigned_to_user_id: string | null;
  icon: string;
  photo_required: boolean;
}

export default function TaskCreateForm({ open, onOpenChange, onSubmit, defaultDate, defaultAssignee, initialData }: TaskCreateFormProps) {
  const { t } = useTranslation();
  const { members } = useFamily();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [dueDate, setDueDate] = useState(defaultDate ?? initialData?.due_date ?? "");
  const [startTime, setStartTime] = useState(initialData?.start_time ?? "");
  const [endTime, setEndTime] = useState(initialData?.end_time ?? "");
  const [priority, setPriority] = useState<"high" | "normal" | "low">(initialData?.priority ?? "normal");
  const [xpValue, setXpValue] = useState(initialData?.xp_value ?? 10);
  const [assignee, setAssignee] = useState(defaultAssignee ?? initialData?.assigned_to_user_id ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? "CheckSquare");
  const [photoRequired, setPhotoRequired] = useState(initialData?.photo_required ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description,
      due_date: dueDate || null,
      start_time: startTime || null,
      end_time: endTime || null,
      priority,
      xp_value: xpValue,
      assigned_to_user_id: assignee || null,
      icon,
      photo_required: photoRequired,
    });
    onOpenChange(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <IconPicker value={icon} onChange={setIcon} />
        <Input autoFocus placeholder={t("task.title") + " *"} value={title} onChange={e => setTitle(e.target.value)} className="flex-1" />
      </div>

      <div>
        <Label>{t("task.dueDate")}</Label>
        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>

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

      <div>
        <Label>{t("task.priority")}</Label>
        <Select value={priority} onValueChange={v => setPriority(v as "high" | "normal" | "low")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="high">{t("task.priorityHigh")}</SelectItem>
            <SelectItem value="normal">{t("task.priorityNormal")}</SelectItem>
            <SelectItem value="low">{t("task.priorityLow")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("task.xpValue")}</Label>
        <Input type="number" min={0} max={100} value={xpValue} onChange={e => setXpValue(Number(e.target.value))} />
      </div>

      <div>
        <Label>{t("task.assignee")}</Label>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger><SelectValue placeholder="Niemand" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Niemand</SelectItem>
            {members.map(m => (
              <SelectItem key={m.id} value={m.user_id ?? m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t("task.description")}</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="photoReq">Foto erforderlich</Label>
        <Switch id="photoReq" checked={photoRequired} onCheckedChange={setPhotoRequired} />
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
          <SheetHeader><SheetTitle>{t("task.create")}</SheetTitle></SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t("task.create")}</DialogTitle></DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
