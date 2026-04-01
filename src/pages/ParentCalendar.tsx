import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { startOfWeek, startOfMonth, addWeeks, subWeeks, addMonths, subMonths, format, getWeek } from "date-fns";
import { de } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { useTimeBlocks } from "@/hooks/useTimeBlocks";
import WeekMatrix from "@/components/calendar/WeekMatrix";
import MonthGrid from "@/components/calendar/MonthGrid";
import TaskCreateForm, { type TaskFormData } from "@/components/calendar/TaskCreateForm";
import EventCreateForm, { type EventFormData } from "@/components/calendar/EventCreateForm";
import QuickCreatePopover from "@/components/calendar/QuickCreatePopover";
import PullToRefresh from "@/components/shared/PullToRefresh";
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
  const { tasks, isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks, createTask, updateTask, completeTask } = useTasks();
  const { events, isLoading: eventsLoading, isError: eventsError, refetch: refetchEvents, createEvent, updateEvent } = useEvents();
  const { timeBlocks, isLoading: blocksLoading } = useTimeBlocks();

  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return weekOffset === 0 ? base : weekOffset > 0 ? addWeeks(base, weekOffset) : subWeeks(base, -weekOffset);
  }, [weekOffset]);

  const currentMonth = useMemo(() => {
    const base = startOfMonth(new Date());
    return monthOffset === 0 ? base : monthOffset > 0 ? addMonths(base, monthOffset) : subMonths(base, -monthOffset);
  }, [monthOffset]);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>();
  const [selectedItem, setSelectedItem] = useState<Task | Event | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  // Conflict detection
  const conflicts = useMemo(() => {
    const map = new Map<string, { items: (Task | Event)[] }>();
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

  const handleCellClick = useCallback((date: Date, memberId: string | null, time?: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    setSelectedAssignee(memberId ?? undefined);
    setSelectedTime(time);
    setShowQuickCreate(true);
  }, []);

  const handleTaskSubmit = useCallback((data: TaskFormData) => {
    createTask.mutate({ ...data, created_by_user_id: user?.id ?? null });
  }, [createTask, user]);

  const handleEventSubmit = useCallback((data: EventFormData) => {
    createEvent.mutate({ ...data, created_by_user_id: user?.id ?? null });
  }, [createEvent, user]);

  const handleQuickTask = useCallback((title: string) => {
    createTask.mutate({
      title, due_date: selectedDate ?? null, assigned_to_user_id: selectedAssignee ?? null, created_by_user_id: user?.id ?? null,
      start_time: selectedTime ?? null,
    });
    setShowQuickCreate(false);
  }, [createTask, selectedDate, selectedAssignee, selectedTime, user]);

  const handleQuickEvent = useCallback((title: string) => {
    const timeStr = selectedTime ?? "09:00";
    createEvent.mutate({
      title, start_at: selectedDate ? `${selectedDate}T${timeStr}:00` : new Date().toISOString(),
      assigned_to_user_ids: selectedAssignee ? [selectedAssignee] : [], created_by_user_id: user?.id ?? null,
    });
    setShowQuickCreate(false);
  }, [createEvent, selectedDate, selectedAssignee, selectedTime, user]);

  const handleTaskComplete = useCallback((taskId: string) => {
    completeTask.mutate(taskId);
    toast.success(t("task.completed"), {
      action: {
        label: t("common.undo"),
        onClick: () => {
          updateTask.mutate({ id: taskId, status: "open" as const, completed_at: null });
        },
      },
      duration: 5000,
    });
  }, [completeTask, updateTask, t]);

  const handleTaskReschedule = useCallback((taskId: string, newDate: string, newAssignee: string | null) => {
    updateTask.mutate({ id: taskId, due_date: newDate, assigned_to_user_id: newAssignee });
    toast.success(t("task.rescheduled", "Verschoben"));
  }, [updateTask, t]);

  const handleEventReschedule = useCallback((eventId: string, newDate: string, newAssignee: string | null) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    const oldDate = format(new Date(ev.start_at), "yyyy-MM-dd");
    const oldTime = format(new Date(ev.start_at), "HH:mm:ss");
    const newStartAt = `${newDate}T${oldTime}`;
    const newAssignees = newAssignee ? [newAssignee] : ev.assigned_to_user_ids;
    updateEvent.mutate({ id: eventId, start_at: newStartAt, assigned_to_user_ids: newAssignees });
    toast.success(t("task.rescheduled", "Verschoben"));
  }, [updateEvent, events, t]);

  const handleMonthDayClick = useCallback((date: Date) => {
    const weekStartForDay = startOfWeek(date, { weekStartsOn: 1 });
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    const diffWeeks = Math.round((weekStartForDay.getTime() - base.getTime()) / (7 * 24 * 60 * 60 * 1000));
    setWeekOffset(diffWeeks);
    setViewMode("week");
  }, []);

  const isLoading = tasksLoading || eventsLoading || blocksLoading;
  const isError = tasksError || eventsError;

  if (isError) {
    return <ErrorState message={t("common.error")} onRetry={() => { refetchTasks(); refetchEvents(); }} />;
  }

  const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });

  return (
    <PullToRefresh onRefresh={async () => { await refetchTasks(); await refetchEvents(); }}>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
        <motion.div variants={slideUp} className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-foreground">{t("nav.calendar")}</h1>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("week")}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {t("calendar.weekView")}
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {t("calendar.monthView")}
              </button>
            </div>

            {viewMode === "week" ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => setWeekOffset(o => o - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <button onClick={() => setWeekOffset(0)} className="text-sm font-medium text-primary hover:underline">
                  {t("calendar.calendarWeek", { week: weekNumber })} · {format(weekStart, "MMM yyyy", { locale: de })}
                </button>
                <Button variant="ghost" size="icon" onClick={() => setWeekOffset(o => o + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" onClick={() => setMonthOffset(o => o - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <button onClick={() => setMonthOffset(0)} className="text-sm font-medium text-primary hover:underline">
                  {format(currentMonth, "MMMM yyyy", { locale: de })}
                </button>
                <Button variant="ghost" size="icon" onClick={() => setMonthOffset(o => o + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </motion.div>

        <motion.div variants={slideUp}>
          {isLoading ? (
            <SkeletonLoader type="card" count={3} />
          ) : viewMode === "week" ? (
            <WeekMatrix
              tasks={tasks}
              events={events}
              timeBlocks={timeBlocks}
              weekStart={weekStart}
              onTaskClick={task => { setSelectedItem(task); setShowDetail(true); }}
              onEventClick={event => { setSelectedItem(event); setShowDetail(true); }}
              onCellClick={handleCellClick}
              onTaskComplete={handleTaskComplete}
              onTaskReschedule={handleTaskReschedule}
              onEventReschedule={handleEventReschedule}
              conflicts={conflicts}
            />
          ) : (
            <MonthGrid
              month={currentMonth}
              tasks={tasks}
              events={events}
              onDayClick={handleMonthDayClick}
            />
          )}
        </motion.div>

        <QuickCreatePopover
          open={showQuickCreate}
          onOpenChange={setShowQuickCreate}
          onCreateTask={handleQuickTask}
          onCreateEvent={handleQuickEvent}
        >
          <span />
        </QuickCreatePopover>

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
    </PullToRefresh>
  );
}
