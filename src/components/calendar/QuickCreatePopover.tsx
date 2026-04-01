import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CheckSquare, Calendar } from "lucide-react";

interface QuickCreatePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (title: string) => void;
  onCreateEvent: (title: string) => void;
  children: React.ReactNode;
}

export default function QuickCreatePopover({ open, onOpenChange, onCreateTask, onCreateEvent, children }: QuickCreatePopoverProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"task" | "event">("task");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (type === "task") onCreateTask(title.trim());
    else onCreateEvent(title.trim());
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <motion.form variants={scaleIn} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-3">
          <ToggleGroup
            type="single"
            value={type}
            onValueChange={v => v && setType(v as "task" | "event")}
            className="w-full"
          >
            <ToggleGroupItem value="task" className="flex-1 gap-1">
              <CheckSquare className="w-4 h-4" /> {t("fab.task")}
            </ToggleGroupItem>
            <ToggleGroupItem value="event" className="flex-1 gap-1">
              <Calendar className="w-4 h-4" /> {t("fab.event")}
            </ToggleGroupItem>
          </ToggleGroup>
          <Input
            autoFocus
            placeholder={type === "task" ? t("task.title") : t("event.title")}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Button type="submit" size="sm" className="w-full" disabled={!title.trim()}>
            {t("common.create")}
          </Button>
        </motion.form>
      </PopoverContent>
    </Popover>
  );
}
