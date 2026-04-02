import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { format, addDays, isToday, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { useFamily } from "@/hooks/useFamily";
import type { Task } from "@/hooks/useTasks";
import type { Event } from "@/hooks/useEvents";
import type { TimeBlock } from "@/hooks/useTimeBlocks";
import CalendarTaskCard from "./CalendarTaskCard";
import CalendarEventCard from "./CalendarEventCard";
import DayTabSelector from "./DayTabSelector";
import { useIsMobile } from "@/hooks/use-mobile";

const PX_PER_HOUR = 40;
const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const GRID_HEIGHT = TOTAL_HOURS * PX_PER_HOUR;
const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

function timeToTop(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return Math.max(0, (h - START_HOUR) * PX_PER_HOUR + (m / 60) * PX_PER_HOUR);
}

function durationHeight(startStr: string, endStr: string): number {
  const [sh, sm] = startStr.split(":").map(Number);
  const [eh, em] = endStr.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(20, (mins / 60) * PX_PER_HOUR);
}

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
  onTaskReschedule, onEventReschedule, conflicts
}: WeekMatrixProps) {
  const { members } = useFamily();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [mobileDay, setMobileDay] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowTop, setNowTop] = useState<number | null>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Current time indicator
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h >= START_HOUR && h < END_HOUR) {
        setNowTop((h - START_HOUR) * PX_PER_HOUR + (m / 60) * PX_PER_HOUR);
      } else {
        setNowTop(null);
      }
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to ~8am on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - START_HOUR) * PX_PER_HOUR - 20;
    }
  }, []);

  const getItemsForDayMember = useCallback((dayStr: string, userId: string | null) => {
    const dayTasks = tasks.filter(t => t.due_date === dayStr && t.assigned_to_user_id === userId);
    const dayEvents = events.filter(e => {
      const eDate = format(new Date(e.start_at), "yyyy-MM-dd");
      return eDate === dayStr && (e.assigned_to_user_ids.includes(userId ?? "") || e.assigned_to_user_ids.length === 0);
    });
    return { dayTasks, dayEvents };
  }, [tasks, events]);

  const getBlocksForDayMember = useCallback((day: Date, userId: string | null) => {
    const wd = day.getDay() === 0 ? 7 : day.getDay();
    return timeBlocks.filter(tb => tb.user_id === userId && tb.weekdays.includes(wd));
  }, [timeBlocks]);

  const getAllDayEvents = useCallback((dayStr: string) => {
    return events.filter(e => {
      const eDate = format(new Date(e.start_at), "yyyy-MM-dd");
      return eDate === dayStr && e.is_all_day;
    });
  }, [events]);

  const renderPersonLane = (day: Date, userId: string | null, memberColor: string) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const { dayTasks, dayEvents } = getItemsForDayMember(dayStr, userId);
    const blocks = getBlocksForDayMember(day, userId);
    const timedTasks = dayTasks.filter(t => t.start_time);
    const untimedTasks = dayTasks.filter(t => !t.start_time);
    const timedEvents = dayEvents.filter(e => !e.is_all_day && e.end_at);

    return (
      <div
        className="relative border-r border-border last:border-r-0"
        style={{ height: GRID_HEIGHT }}
        onClick={() => onCellClick(day, userId)}
      >
        {/* Time block bands */}
        {blocks.map(block => {
          const top = timeToTop(block.start_time);
          const height = durationHeight(block.start_time, block.end_time);
          const typeColors: Record<string, string> = {
            school: "bg-blue-100/60",
            work: "bg-amber-100/60",
            nap: "bg-purple-100/60",
            unavailable: "bg-gray-200/60",
          };
          return (
            <div
              key={block.id}
              className={`absolute inset-x-0 ${typeColors[block.type] || "bg-gray-100/60"} z-0`}
              style={{ top, height }}
            >
              <span className="text-[9px] text-muted-foreground px-1 truncate block">{block.label}</span>
            </div>
          );
        })}

        {/* Timed events */}
        {timedEvents.map(event => {
          const startTime = format(new Date(event.start_at), "HH:mm");
          const endTime = event.end_at ? format(new Date(event.end_at), "HH:mm") : startTime;
          const top = timeToTop(startTime);
          const height = durationHeight(startTime, endTime);
          return (
            <div
              key={event.id}
              className="absolute inset-x-0.5 z-10"
              style={{ top, height: Math.max(height, 20) }}
              onClick={e => { e.stopPropagation(); onEventClick(event); }}
            >
              <div className="bg-info-light border-l-2 border-info rounded-sm px-1 py-0.5 h-full overflow-hidden cursor-pointer hover:shadow-sm transition-shadow">
                <span className="text-[10px] font-semibold text-foreground block truncate">{event.title}</span>
                <span className="text-[9px] text-muted-foreground">{startTime}–{endTime}</span>
              </div>
            </div>
          );
        })}

        {/* Timed tasks */}
        {timedTasks.map(task => {
          const startTime = task.start_time!;
          const endTime = task.end_time || (() => {
            const [h, m] = startTime.split(":").map(Number);
            return `${String(h).padStart(2, "0")}:${String(m + 30).padStart(2, "0")}`;
          })();
          const top = timeToTop(startTime);
          const height = durationHeight(startTime, endTime);
          const priorityBorder = task.priority === "high" ? "border-red-400" : task.priority === "low" ? "border-blue-400" : "border-amber-400";
          return (
            <div
              key={task.id}
              className="absolute inset-x-0.5 z-10"
              style={{ top, height: Math.max(height, 20) }}
              onClick={e => { e.stopPropagation(); onTaskClick(task); }}
            >
              <div className={`bg-card border-l-2 ${priorityBorder} rounded-sm px-1 py-0.5 h-full overflow-hidden cursor-pointer hover:shadow-sm transition-shadow ${task.status === "completed" ? "opacity-50" : ""}`}>
                <span className="text-[10px] font-semibold text-foreground block truncate">{task.title}</span>
                <span className="text-[9px] text-muted-foreground">{startTime}</span>
              </div>
            </div>
          );
        })}

        {/* Untimed tasks at bottom */}
        {untimedTasks.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 z-10 p-0.5 space-y-0.5">
            {untimedTasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className={`bg-card border-l-2 ${task.priority === "high" ? "border-red-400" : "border-amber-400"} rounded-sm px-1 py-0.5 cursor-pointer hover:shadow-sm text-[10px] font-medium truncate ${task.status === "completed" ? "opacity-50 line-through" : ""}`}
                onClick={e => { e.stopPropagation(); onTaskClick(task); }}
              >
                {task.title}
              </div>
            ))}
            {untimedTasks.length > 3 && (
              <span className="text-[9px] text-muted-foreground px-1">+{untimedTasks.length - 3}</span>
            )}
          </div>
        )}

        {/* Current time line */}
        {isToday(day) && nowTop !== null && (
          <div className="absolute inset-x-0 z-20 pointer-events-none" style={{ top: nowTop }}>
            <div className="h-[2px] bg-red-500 w-full" />
            <div className="w-2 h-2 bg-red-500 rounded-full absolute -left-1 -top-[3px]" />
          </div>
        )}
      </div>
    );
  };

  // Desktop: full week with all person lanes per day
  const renderDesktop = () => {
    const activeMembersWithLanes = members.filter(m => m.role !== "baby");

    return (
      <div className="hidden md:block overflow-hidden">
        {/* All-day row */}
        <div className="flex border-b border-border">
          <div className="w-12 shrink-0" />
          {days.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const allDay = getAllDayEvents(dayStr);
            return (
              <div key={dayStr} className={`flex-1 min-w-0 border-r border-border last:border-r-0 p-1 min-h-[28px] ${isToday(day) ? "bg-primary/5" : ""}`}>
                {allDay.map(e => (
                  <div
                    key={e.id}
                    className="bg-info-light text-[10px] font-medium px-1 py-0.5 rounded-sm mb-0.5 truncate cursor-pointer hover:bg-info-light/80"
                    onClick={() => onEventClick(e)}
                  >
                    {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Day headers */}
        <div className="flex border-b border-border">
          <div className="w-12 shrink-0" />
          {days.map(day => (
            <div
              key={day.toISOString()}
              className={`flex-1 min-w-0 text-center py-1.5 border-r border-border last:border-r-0 ${isToday(day) ? "bg-primary/5" : ""}`}
            >
              <div className="text-[10px] text-muted-foreground">{format(day, "EEE", { locale: de })}</div>
              <div className={`text-xs font-bold ${isToday(day) ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</div>
              {/* Person lane labels */}
              {activeMembersWithLanes.length > 1 && (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {activeMembersWithLanes.map(m => (
                    <div
                      key={m.id}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: m.color }}
                      title={m.name}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
          <div className="flex" style={{ height: GRID_HEIGHT }}>
            {/* Hour labels */}
            <div className="w-12 shrink-0 relative">
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute w-full text-right pr-1 text-[10px] text-muted-foreground"
                  style={{ top: (h - START_HOUR) * PX_PER_HOUR - 6 }}
                >
                  {`${String(h).padStart(2, "0")}:00`}
                </div>
              ))}
            </div>

            {/* Day columns, each containing person lanes */}
            {days.map(day => (
              <div
                key={day.toISOString()}
                className={`flex-1 min-w-0 relative border-r border-border last:border-r-0 ${isToday(day) ? "bg-primary/5" : ""}`}
              >
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-border/40"
                    style={{ top: (h - START_HOUR) * PX_PER_HOUR }}
                  />
                ))}

                {/* Person lanes side by side */}
                <div className="flex h-full relative">
                  {activeMembersWithLanes.length <= 1 ? (
                    renderPersonLane(day, activeMembersWithLanes[0]?.user_id ?? null, activeMembersWithLanes[0]?.color ?? "#888")
                  ) : (
                    activeMembersWithLanes.map(member => (
                      <div key={member.id} className="flex-1 min-w-0">
                        {renderPersonLane(day, member.user_id, member.color)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Mobile: single day view with time axis
  const renderMobile = () => {
    const activeMembersWithLanes = members.filter(m => m.role !== "baby");
    const dayStr = format(mobileDay, "yyyy-MM-dd");
    const allDay = getAllDayEvents(dayStr);

    return (
      <div className="md:hidden space-y-2">
        <DayTabSelector days={days} selected={mobileDay} onSelect={setMobileDay} />

        {/* All-day events */}
        {allDay.length > 0 && (
          <div className="space-y-1 px-1">
            {allDay.map(e => (
              <div
                key={e.id}
                className="bg-info-light text-xs font-medium px-2 py-1.5 rounded-md cursor-pointer"
                onClick={() => onEventClick(e)}
              >
                {e.title}
              </div>
            ))}
          </div>
        )}

        {/* Time grid */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
          <div className="flex" style={{ height: GRID_HEIGHT }}>
            {/* Hour labels */}
            <div className="w-10 shrink-0 relative">
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute w-full text-right pr-1 text-[10px] text-muted-foreground"
                  style={{ top: (h - START_HOUR) * PX_PER_HOUR - 6 }}
                >
                  {`${h}:00`}
                </div>
              ))}
            </div>

            {/* Single day with person lanes stacked or side-by-side */}
            <div className="flex-1 relative">
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-border/40"
                  style={{ top: (h - START_HOUR) * PX_PER_HOUR }}
                />
              ))}

              <div className="flex h-full relative">
                {activeMembersWithLanes.length <= 1 ? (
                  renderPersonLane(mobileDay, activeMembersWithLanes[0]?.user_id ?? null, activeMembersWithLanes[0]?.color ?? "#888")
                ) : (
                  activeMembersWithLanes.map(member => (
                    <div key={member.id} className="flex-1 min-w-0">
                      {renderPersonLane(mobileDay, member.user_id, member.color)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
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
