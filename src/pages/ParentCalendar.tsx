import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { startOfWeek, addWeeks, subWeeks, format } from "date-fns";
import { de } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { useTimeBlocks } from "@/hooks/useTimeBlocks";
import WeekMatrix from "@/components/calendar/WeekMatrix";
import TaskCreateForm, { type TaskFormData } from "@/components/calendar/TaskCreateForm";
import EventCreateForm, { type EventFormData } from "@/components/calendar/EventCreateForm";
import QuickCreatePopover from "@/components/calendar/QuickCreatePopover";
import ItemDetailPopover from "@/components/calendar/ItemDetailPopover";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import type { Event } from "@/hooks/useEvents";
import { toast } from "sonner";

export default function ParentCalendar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { familyId } = useFamily();
  const { tasks, isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks, createTask, completeTask } = useTasks();
  const { events, isLoading: eventsLoading, isError: eventsError, refetch: refetchEvents, createEvent } = useEvents();
  const { timeBlocks, isLoading: blocksLoading } = useTimeBlocks();

  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return weekOffset === 0 ? base : weekOffset > 0 ? addWeeks(base, weekOffset) : subWeeks(base, -weekOffset);
  }, [weekOffset]);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>();
  const [selectedItem, setSelectedItem] = useState<Task | Event | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Conflict detection
  const conflicts = useMemo(() => {
    const map = new Map<string, { items: (Task | Event)[] }>();
    // Simple overlap detection per user per day
    const allItems = [
      ...tasks.filter(t => t.start_time && t.end_time).map(t => ({
        id: t.id, userId: t.assigned_to_user_id, date: t.due_date, start: t.start_time!, end: t.end_time!, item: t as Task | Event,
      })),
      ...events.filter(e => !e.is_all_day && e.end_at).map(e => ({
        id: e.id, userId: e.assigned_to_user_ids[0], date: format(new Date(e.start_at), "yyyy-MM-dd"),
        start: format(new Date(e.start_at), "HH:mm"), end: format(new Date(e.end_at!), "HH:mm"), item: e as Task | Event,
      })),
    ];

    for (let i = 0; i < allItems.length; i++) {
      for (let j = i + 1; j < allItems.length; j++) {
        const a = allItems[i], b = allItems[j];
        if (a.userId === b.userId && a.date === b.date && a.start < b.end && b.start < a.end) {
          const key = `${a.userId}-${a.date}`;
          if (!map.has(key)) map.set(key, { items: [] });
          const entry = map.get(key)!;
          if (!entry.items.find(x => x.id === a.item.id)) entry.items.push(a.item);
          if (!entry.items.find(x => x.id === b.item.id)) entry.items.push(b.item);
        }
      }
    }
    return map;
  }, [tasks, events]);

  const handleCellClick = useCallback((date: Date, memberId: string | null) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setSelectedAssignee(memberId ?? undefined);
  }, []);

  const handleTaskSubmit = useCallback((data: TaskFormData) => {
    createTask.mutate({
      ...data,
      created_by_user_id: user?.id ?? null,
    });
  }, [createTask, user]);

  const handleEventSubmit = useCallback((data: EventFormData) => {
    createEvent.mutate({
      ...data,
      created_by_user_id: user?.id ?? null,
    });
  }, [createEvent, user]);

  const handleQuickTask = useCallback((title: string) => {
    createTask.mutate({
      title,
      due_date: selectedDate ?? null,
      assigned_to_user_id: selectedAssignee ?? null,
      created_by_user_id: user?.id ?? null,
    });
  }, [createTask, selectedDate, selectedAssignee, user]);

  const handleQuickEvent = useCallback((title: string) => {
    createEvent.mutate({
      title,
      start_at: selectedDate ? `${selectedDate}T09:00:00` : new Date().toISOString(),
      assigned_to_user_ids: selectedAssignee ? [selectedAssignee] : [],
      created_by_user_id: user?.id ?? null,
    });
  }, [createEvent, selectedDate, selectedAssignee, user]);

  const isLoading = tasksLoading || eventsLoading || blocksLoading;
  const isError = tasksError || eventsError;

  if (isError) {
    return <ErrorState message={t("common.error")} onRetry={() => { refetchTasks(); refetchEvents(); }} />;
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
      <motion.div variants={slideUp} className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-foreground">{t("nav.calendar")}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setWeekOffset(0)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {format(weekStart, "'KW' w · MMM yyyy", { locale: de })}
          </button>
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(o => o + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <motion.div variants={slideUp}>
        {isLoading ? (
          <SkeletonLoader variant="card" count={3} />
        ) : (
          <WeekMatrix
            tasks={tasks}
            events={events}
            timeBlocks={timeBlocks}
            weekStart={weekStart}
            onTaskClick={task => { setSelectedItem(task); setShowDetail(true); }}
            onEventClick={event => { setSelectedItem(event); setShowDetail(true); }}
            onCellClick={handleCellClick}
            onTaskComplete={id => {
              completeTask.mutate(id);
              toast.success(t("task.completed"), { action: { label: t("common.undo"), onClick: () => {} } });
            }}
            conflicts={conflicts}
          />
        )}
      </motion.div>

      <TaskCreateForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onSubmit={handleTaskSubmit}
        defaultDate={selectedDate}
        defaultAssignee={selectedAssignee}
      />

      <EventCreateForm
        open={showEventForm}
        onOpenChange={setShowEventForm}
        onSubmit={handleEventSubmit}
        defaultDate={selectedDate}
        defaultAssignee={selectedAssignee}
      />
    </motion.div>
  );
}
