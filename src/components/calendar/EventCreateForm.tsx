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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useFamily } from "@/hooks/useFamily";
import { useMediaQuery } from "@/hooks/use-mobile";
import IconPicker from "./IconPicker";

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

const eventFormSchema = z.object({
  title: z.string().min(1, "Titel erforderlich").max(200),
  description: z.string().max(1000).default(""),
  date: z.date(),
  start_time: z.string().default("09:00"),
  end_time: z.string().default("10:00"),
  is_all_day: z.boolean().default(false),
  icon: z.string().default("Calendar"),
  assignees: z.array(z.string()).default([]),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EventCreateForm({ open, onOpenChange, onSubmit, defaultDate, defaultAssignee, initialData }: EventCreateFormProps) {
  const { t } = useTranslation();
  const { members } = useFamily();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      date: defaultDate ? new Date(defaultDate) : initialData?.start_at ? new Date(initialData.start_at) : new Date(),
      start_time: initialData?.start_at?.split("T")[1]?.slice(0, 5) ?? "09:00",
      end_time: initialData?.end_at?.split("T")[1]?.slice(0, 5) ?? "10:00",
      is_all_day: initialData?.is_all_day ?? false,
      icon: initialData?.icon ?? "Calendar",
      assignees: initialData?.assigned_to_user_ids ?? (defaultAssignee ? [defaultAssignee] : []),
    },
  });

  const isAllDay = form.watch("is_all_day");

  const handleFormSubmit = (values: EventFormValues) => {
    const dateStr = format(values.date, "yyyy-MM-dd");
    onSubmit({
      title: values.title.trim(),
      description: values.description,
      start_at: values.is_all_day ? `${dateStr}T00:00:00` : `${dateStr}T${values.start_time}:00`,
      end_at: values.is_all_day ? `${dateStr}T23:59:59` : `${dateStr}T${values.end_time}:00`,
      is_all_day: values.is_all_day,
      icon: values.icon,
      assigned_to_user_ids: values.assignees,
    });
    form.reset();
    onOpenChange(false);
  };

  const toggleAssignee = (userId: string) => {
    const current = form.getValues("assignees");
    if (current.includes(userId)) {
      form.setValue("assignees", current.filter(id => id !== userId));
    } else {
      form.setValue("assignees", [...current, userId]);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="flex items-center gap-2">
          <FormField control={form.control} name="icon" render={({ field }) => (
            <IconPicker value={field.value} onChange={field.onChange} />
          )} />
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input autoFocus placeholder={t("event.title") + " *"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("event.date")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, "PPP") : <span>{t("event.date")}</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="is_all_day" render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormLabel>{t("event.allDay")}</FormLabel>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />

        {!isAllDay && (
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
        )}

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>{t("event.description")}</FormLabel>
            <FormControl><Textarea {...field} rows={2} /></FormControl>
          </FormItem>
        )} />

        <div>
          <FormLabel>{t("task.assignee")}</FormLabel>
          <div className="flex flex-wrap gap-2 mt-1">
            {members.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleAssignee(m.user_id ?? "")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  form.watch("assignees").includes(m.user_id ?? "")
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary-light"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

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
