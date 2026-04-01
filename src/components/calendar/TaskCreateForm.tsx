import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useFamily } from "@/hooks/useFamily";
import { useMediaQuery } from "@/hooks/use-mobile";
import IconPicker from "./IconPicker";
import AISuggestions from "@/components/tasks/AISuggestions";

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

const taskFormSchema = z.object({
  title: z.string().min(1, "Titel erforderlich").max(200),
  description: z.string().max(1000).default(""),
  due_date: z.date().nullable().default(null),
  start_time: z.string().default(""),
  end_time: z.string().default(""),
  priority: z.enum(["high", "normal", "low"]).default("normal"),
  xp_value: z.number().min(0).max(100).default(10),
  assigned_to_user_id: z.string().default(""),
  icon: z.string().default("CheckSquare"),
  photo_required: z.boolean().default(false),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TaskCreateForm({ open, onOpenChange, onSubmit, defaultDate, defaultAssignee, initialData }: TaskCreateFormProps) {
  const { t } = useTranslation();
  const { members } = useFamily();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      due_date: defaultDate ? new Date(defaultDate) : initialData?.due_date ? new Date(initialData.due_date) : null,
      start_time: initialData?.start_time ?? "",
      end_time: initialData?.end_time ?? "",
      priority: initialData?.priority ?? "normal",
      xp_value: initialData?.xp_value ?? 10,
      assigned_to_user_id: defaultAssignee ?? initialData?.assigned_to_user_id ?? "",
      icon: initialData?.icon ?? "CheckSquare",
      photo_required: initialData?.photo_required ?? false,
    },
  });

  const handleFormSubmit = (values: TaskFormValues) => {
    onSubmit({
      title: values.title.trim(),
      description: values.description,
      due_date: values.due_date ? format(values.due_date, "yyyy-MM-dd") : null,
      start_time: values.start_time || null,
      end_time: values.end_time || null,
      priority: values.priority,
      xp_value: values.xp_value,
      assigned_to_user_id: values.assigned_to_user_id || null,
      icon: values.icon,
      photo_required: values.photo_required,
    });
    form.reset();
    onOpenChange(false);
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <AISuggestions onSelect={(s) => {
          form.setValue("title", s.title);
          form.setValue("xp_value", s.xp);
        }} />

        <div className="flex items-center gap-2">
          <FormField control={form.control} name="icon" render={({ field }) => (
            <IconPicker value={field.value} onChange={field.onChange} />
          )} />
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input autoFocus placeholder={t("task.title") + " *"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="due_date" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("task.dueDate")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, "PPP") : <span>{t("task.dueDate")}</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="start_time" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("event.startTime")}</FormLabel>
              <FormControl><Input type="time" {...field} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="end_time" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("event.endTime")}</FormLabel>
              <FormControl><Input type="time" {...field} /></FormControl>
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="priority" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("task.priority")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="high">{t("task.priorityHigh")}</SelectItem>
                <SelectItem value="normal">{t("task.priorityNormal")}</SelectItem>
                <SelectItem value="low">{t("task.priorityLow")}</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )} />

        <FormField control={form.control} name="xp_value" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("task.xpValue")}</FormLabel>
            <FormControl>
              <Input type="number" min={0} max={100} value={field.value} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="assigned_to_user_id" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("task.assignee")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue placeholder="Niemand" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="">Niemand</SelectItem>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.user_id ?? m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("task.description")}</FormLabel>
            <FormControl><Textarea {...field} rows={2} /></FormControl>
          </FormItem>
        )} />

        <FormField control={form.control} name="photo_required" render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormLabel>{t("task.photoRequired")}</FormLabel>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />

        <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
          {t("common.create")}
        </Button>
      </form>
    </Form>
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
