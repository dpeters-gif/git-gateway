import { useState, useMemo, useCallback } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isToday, format
} from "date-fns";
import { de } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task } from "@/hooks/useTasks";
import type { Event } from "@/hooks/useEvents";
import { CheckSquare, Square, Calendar, Sparkles } from "lucide-react";

interface MonthGridProps {
  month: Date;
  tasks: Task[];
  events: Event[];
  onDayClick: (date: Date) => void;
}

export default function MonthGrid({ month, tasks, events, onDayClick }: MonthGridProps) {
  const { t } = useTranslation();
  const { members } = useFamily();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const activeMembers = useMemo(() => members.filter(m => m.role !== "baby"), [members]);

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const result: Date[][] = [];
    let current = start;
    while (current <= end) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(addDays(current, i));
      }
      result.push(week);
      current = addDays(current, 7);
    }
    return result;
  }, [month]);

  const getItemsForDay = useCallback((dayStr: string, userId: string | null) => {
    const cellTasks = tasks.filter(t => t.due_date === dayStr && t.assigned_to_user_id === userId);
    const cellEvents = events.filter(e => {
      const eDate = format(new Date(e.start_at), "yyyy-MM-dd");
      return eDate === dayStr && (e.assigned_to_user_ids.includes(userId ?? "") || (e.assigned_to_user_ids.length === 0 && !userId));
    });
    return { tasks: cellTasks, events: cellEvents };
  }, [tasks, events]);

  const dayHeaders = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  // Mobile: compact dot view (original style)
  if (isMobile) {
    const hasDots = (day: Date) => {
      const ds = format(day, "yyyy-MM-dd");
      const hasTask = tasks.some(t => t.due_date === ds);
      const hasEvent = events.some(e => format(new Date(e.start_at), "yyyy-MM-dd") === ds);
      return { hasTask, hasEvent };
    };

    return (
      <div className="select-none">
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {dayHeaders.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5">
            {week.map(day => {
              const inMonth = isSameMonth(day, month);
              const today = isToday(day);
              const { hasTask, hasEvent } = hasDots(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onDayClick(day)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-md text-xs transition-colors ${
                    !inMonth ? "text-muted-foreground/40" :
                    today ? "bg-primary text-primary-foreground font-bold" :
                    "text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{format(day, "d")}</span>
                  <div className="flex gap-0.5 mt-0.5 h-1.5">
                    {hasTask && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: Person-lane month grid — days as rows, persons as columns, items shown as pills
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header: day-of-week labels across top for context, then member headers */}
      <div
        className="grid border-b border-border bg-muted/50 sticky top-0 z-20"
        style={{ gridTemplateColumns: `80px repeat(${activeMembers.length || 1}, 1fr)` }}
      >
        <div className="p-2 border-r border-border text-xs font-medium text-muted-foreground">
          {format(month, "MMMM", { locale: de })}
        </div>
        {activeMembers.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">{t("common.noData")}</div>
        ) : (
          activeMembers.map(member => (
            <div key={member.id} className="p-1.5 border-r border-border last:border-r-0 flex items-center gap-1.5 justify-center">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {member.display_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[11px] font-semibold text-foreground truncate">{member.display_name}</span>
            </div>
          ))
        )}
      </div>

      {/* Day rows */}
      <div className="overflow-y-auto max-h-[65vh]">
        {weeks.map((week, wi) =>
          week.map(day => {
            const inMonth = isSameMonth(day, month);
            const today = isToday(day);
            const dayStr = format(day, "yyyy-MM-dd");

            if (!inMonth) return null;

            return (
              <div
                key={day.toISOString()}
                className="grid border-b border-border last:border-b-0"
                style={{ gridTemplateColumns: `80px repeat(${activeMembers.length || 1}, 1fr)` }}
              >
                {/* Day label */}
                <div
                  className={`p-1.5 border-r border-border flex flex-col justify-start cursor-pointer hover:bg-muted/30 ${today ? "border-l-[3px] border-l-primary bg-primary/5" : ""}`}
                  onClick={() => onDayClick(day)}
                >
                  <span className="text-[9px] text-muted-foreground font-medium">{format(day, "EEE", { locale: de })}</span>
                  <span className={`text-xs font-bold ${today ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</span>
                </div>

                {/* Member cells */}
                {activeMembers.length === 0 ? (
                  <div className="min-h-[36px] border-b border-border p-1" />
                ) : (
                  activeMembers.map(member => {
                    const { tasks: dayTasks, events: dayEvents } = getItemsForDay(dayStr, member.user_id);
                    const isEmpty = dayTasks.length === 0 && dayEvents.length === 0;

                    return (
                      <div
                        key={member.id}
                        className={`min-h-[36px] p-0.5 space-y-0.5 border-r border-border last:border-r-0 cursor-pointer hover:bg-muted/20 transition-colors ${today ? "bg-primary/5" : ""}`}
                        onClick={() => onDayClick(day)}
                      >
                        {dayEvents.map(e => (
                          <div key={e.id} className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-info/10 border-l-2 border-l-info truncate">
                            <Calendar className="w-2 h-2 text-info shrink-0" />
                            <span className="text-[9px] font-medium text-foreground truncate">{e.title}</span>
                          </div>
                        ))}
                        {dayTasks.map(tk => {
                          const isCompleted = tk.status === "completed";
                          const borderColor = tk.priority === "high" ? "border-l-red-500" : tk.priority === "low" ? "border-l-blue-500" : "border-l-amber-500";
                          return (
                            <div key={tk.id} className={`flex items-center gap-0.5 px-1 py-0.5 rounded bg-card border-l-2 ${borderColor} truncate ${isCompleted ? "opacity-50" : ""}`}>
                              {isCompleted
                                ? <CheckSquare className="w-2 h-2 text-success shrink-0" />
                                : <Square className="w-2 h-2 text-muted-foreground shrink-0" />
                              }
                              <span className={`text-[9px] font-medium truncate ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>{tk.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
