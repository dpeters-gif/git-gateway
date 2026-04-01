import { useMemo } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, isToday, format
} from "date-fns";
import { de } from "date-fns/locale";
import type { Task } from "@/hooks/useTasks";
import type { Event } from "@/hooks/useEvents";

interface MonthGridProps {
  month: Date;
  tasks: Task[];
  events: Event[];
  onDayClick: (date: Date) => void;
}

export default function MonthGrid({ month, tasks, events, onDayClick }: MonthGridProps) {
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

  const dayHeaders = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

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
