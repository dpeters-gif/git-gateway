import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { format, addDays, isToday, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import type { Task } from "@/hooks/useTasks";
import type { Event } from "@/hooks/useEvents";
import type { TimeBlock } from "@/hooks/useTimeBlocks";
import DayTabSelector from "./DayTabSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckSquare, Square, Calendar, Sparkles } from "lucide-react";

interface WeekMatrixProps {
  tasks: Task[];
  events: Event[];
  timeBlocks: TimeBlock[];
  weekStart: Date;
  onTaskClick: (task: Task) => void;
  onEventClick: (event: Event) => void;
  onCellClick: (date: Date, memberId: string | null) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskReschedule: (taskId: string, newDate: string, newAssignee: string | null) => void;
  onEventReschedule: (eventId: string, newDate: string, newAssignee: string | null) => void;
  conflicts: Map<string, { items: (Task | Event)[] }>;
}

export default function WeekMatrix({
  tasks, events, timeBlocks, weekStart, onTaskClick, onEventClick, onCellClick, onTaskComplete,
}: WeekMatrixProps) {
  const { members } = useFamily();
  const { user } = useAuth();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [mobileDay, setMobileDay] = useState(new Date());

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const activeMembers = useMemo(() => members.filter(m => m.role !== "baby"), [members]);

  const getItemsForCell = useCallback((dayStr: string, userId: string | null) => {
    const cellTasks = tasks.filter(t => t.due_date === dayStr && t.assigned_to_user_id === userId);
    const cellEvents = events.filter(e => {
      const eDate = format(new Date(e.start_at), "yyyy-MM-dd");
      return eDate === dayStr && (e.assigned_to_user_ids.includes(userId ?? "") || (e.assigned_to_user_ids.length === 0 && !userId));
    });

    // Sort: timed items first (by start time), then untimed
    const sortByTime = (a: { time: string | null }, b: { time: string | null }) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    };

    const items: Array<{ type: "task" | "event"; task?: Task; event?: Event; time: string | null; isAllDay: boolean }> = [];

    cellEvents.forEach(e => {
      items.push({
        type: "event",
        event: e,
        time: e.is_all_day ? null : format(new Date(e.start_at), "HH:mm"),
        isAllDay: e.is_all_day,
      });
    });

    cellTasks.forEach(tk => {
      items.push({
        type: "task",
        task: tk,
        time: tk.start_time ?? null,
        isAllDay: false,
      });
    });

    const allDay = items.filter(i => i.isAllDay);
    const timed = items.filter(i => !i.isAllDay).sort(sortByTime);

    return { allDay, timed };
  }, [tasks, events]);

  const priorityBorderColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500";
      case "low": return "border-l-blue-500";
      default: return "border-l-amber-500";
    }
  };

  const renderTaskPill = (task: Task) => {
    const isCompleted = task.status === "completed";
    return (
      <div
        key={`task-${task.id}`}
        onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border-l-[3px] ${priorityBorderColor(task.priority)} bg-card cursor-pointer hover:shadow-sm transition-shadow group ${isCompleted ? "opacity-50" : ""}`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onTaskComplete(task.id); }}
          className="shrink-0"
        >
          {isCompleted
            ? <CheckSquare className="w-3.5 h-3.5 text-success" />
            : <Square className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-semibold block truncate ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {task.start_time && (
              <span className="text-[10px] text-muted-foreground">
                {task.start_time}{task.end_time ? `–${task.end_time}` : ""}
              </span>
            )}
            {task.xp_value > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-xp font-medium">
                <Sparkles className="w-2.5 h-2.5" />{task.xp_value}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEventPill = (event: Event) => {
    const startTime = event.is_all_day ? null : format(new Date(event.start_at), "HH:mm");
    const endTime = event.end_at && !event.is_all_day ? format(new Date(event.end_at), "HH:mm") : null;
    return (
      <div
        key={`event-${event.id}`}
        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border-l-[3px] border-l-info bg-info/10 cursor-pointer hover:shadow-sm transition-shadow"
      >
        <Calendar className="w-3 h-3 text-info shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-foreground block truncate">{event.title}</span>
          {startTime && (
            <span className="text-[10px] text-muted-foreground">
              {startTime}{endTime ? `–${endTime}` : ""}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderCell = (day: Date, userId: string | null) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const { allDay, timed } = getItemsForCell(dayStr, userId);

    return (
      <div
        className={`min-h-[60px] p-1 space-y-1 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors ${isToday(day) ? "bg-primary/5" : ""}`}
        onClick={() => onCellClick(day, userId)}
      >
        {allDay.map(item => item.event && (
          <div
            key={`allday-${item.event.id}`}
            onClick={(e) => { e.stopPropagation(); onEventClick(item.event!); }}
            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-info/20 text-info cursor-pointer truncate"
          >
            📅 {item.event.title}
          </div>
        ))}
        {timed.map(item => {
          if (item.type === "task" && item.task) return renderTaskPill(item.task);
          if (item.type === "event" && item.event) return renderEventPill(item.event);
          return null;
        })}
      </div>
    );
  };

  // DESKTOP: Days as rows, persons as columns
  const renderDesktop = () => (
    <div className="hidden md:block border border-border rounded-lg overflow-hidden">
      {/* Header row: empty corner + member columns */}
      <div
        className="grid border-b border-border bg-muted/50"
        style={{ gridTemplateColumns: `100px repeat(${activeMembers.length || 1}, 1fr)` }}
      >
        <div className="p-2 border-r border-border" />
        {activeMembers.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">{t("common.noData")}</div>
        ) : (
          activeMembers.map(member => (
            <div key={member.id} className="p-2 border-r border-border last:border-r-0 flex items-center gap-2 justify-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-foreground block truncate">{member.name}</span>
                {member.user_id === user?.id && (
                  <span className="text-[10px] text-primary font-medium">Du</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Day rows */}
      {days.map(day => (
        <div
          key={day.toISOString()}
          className="grid"
          style={{ gridTemplateColumns: `100px repeat(${activeMembers.length || 1}, 1fr)` }}
        >
          {/* Day label */}
          <div className={`p-2 border-r border-border flex flex-col justify-start sticky left-0 bg-background z-10 ${isToday(day) ? "border-l-[3px] border-l-primary bg-primary/5" : "border-b border-border"}`}>
            <span className="text-[10px] text-muted-foreground font-medium">{format(day, "EEE", { locale: de })}</span>
            <span className={`text-sm font-bold ${isToday(day) ? "text-primary" : "text-foreground"}`}>{format(day, "d. MMM", { locale: de })}</span>
          </div>

          {/* Member cells */}
          {activeMembers.length === 0 ? (
            <div className="min-h-[60px] border-b border-border p-2 text-sm text-muted-foreground" />
          ) : (
            activeMembers.map(member => (
              <div key={member.id} className="border-r border-border last:border-r-0">
                {renderCell(day, member.user_id)}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );

  // MOBILE: Single day, members stacked vertically
  const renderMobile = () => {
    const dayStr = format(mobileDay, "yyyy-MM-dd");

    return (
      <div className="md:hidden space-y-3">
        <DayTabSelector days={days} selected={mobileDay} onSelect={setMobileDay} />

        {activeMembers.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">{t("common.noData")}</div>
        ) : (
          activeMembers.map(member => {
            const { allDay, timed } = getItemsForCell(dayStr, member.user_id);
            const isEmpty = allDay.length === 0 && timed.length === 0;

            return (
              <div key={member.id} className="border border-border rounded-lg overflow-hidden">
                {/* Member header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{member.name}</span>
                  {member.user_id === user?.id && (
                    <span className="text-[10px] text-primary font-medium">Du</span>
                  )}
                </div>

                {/* Items */}
                <div
                  className={`p-2 space-y-1 min-h-[48px] ${isToday(mobileDay) ? "bg-primary/5" : ""}`}
                  onClick={() => onCellClick(mobileDay, member.user_id)}
                >
                  {isEmpty && (
                    <p className="text-xs text-muted-foreground text-center py-2">{t("common.empty", "Keine Einträge")}</p>
                  )}
                  {allDay.map(item => item.event && (
                    <div
                      key={`allday-${item.event.id}`}
                      onClick={(e) => { e.stopPropagation(); onEventClick(item.event!); }}
                      className="text-xs font-medium px-2 py-1 rounded bg-info/20 text-info cursor-pointer"
                    >
                      📅 {item.event.title}
                    </div>
                  ))}
                  {timed.map(item => {
                    if (item.type === "task" && item.task) return renderTaskPill(item.task);
                    if (item.type === "event" && item.event) return renderEventPill(item.event);
                    return null;
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <>
      {renderDesktop()}
      {renderMobile()}
    </>
  );
}
