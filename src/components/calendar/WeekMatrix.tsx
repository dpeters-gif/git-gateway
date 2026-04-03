import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { format, addDays, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import type { Task } from "@/hooks/useTasks";
import type { Event } from "@/hooks/useEvents";
import type { TimeBlock } from "@/hooks/useTimeBlocks";
import DayTabSelector from "./DayTabSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckSquare, Square, Calendar, Sparkles } from "lucide-react";

// Time grid constants
const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR; // 16 hours
const PX_PER_HOUR = 60;
const GRID_HEIGHT = TOTAL_HOURS * PX_PER_HOUR;

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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToTop(minutes: number): number {
  const offset = minutes - START_HOUR * 60;
  return Math.max(0, Math.min((offset / 60) * PX_PER_HOUR, GRID_HEIGHT));
}

function durationPx(startMin: number, endMin: number): number {
  const dur = endMin - startMin;
  return Math.max(20, (dur / 60) * PX_PER_HOUR);
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

    const untimed: Array<{ type: "task" | "event"; task?: Task; event?: Event }> = [];
    const timed: Array<{ type: "task" | "event"; task?: Task; event?: Event; startMin: number; endMin: number }> = [];

    cellEvents.forEach(e => {
      if (e.is_all_day) {
        untimed.push({ type: "event", event: e });
      } else {
        const startMin = timeToMinutes(format(new Date(e.start_at), "HH:mm"));
        const endMin = e.end_at ? timeToMinutes(format(new Date(e.end_at), "HH:mm")) : startMin + 60;
        timed.push({ type: "event", event: e, startMin, endMin });
      }
    });

    cellTasks.forEach(tk => {
      if (tk.start_time) {
        const startMin = timeToMinutes(tk.start_time);
        const endMin = tk.end_time ? timeToMinutes(tk.end_time) : startMin + 30;
        timed.push({ type: "task", task: tk, startMin, endMin });
      } else {
        untimed.push({ type: "task", task: tk });
      }
    });

    timed.sort((a, b) => a.startMin - b.startMin);
    return { untimed, timed };
  }, [tasks, events]);

  const priorityBorderColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500";
      case "low": return "border-l-blue-500";
      default: return "border-l-amber-500";
    }
  };

  const renderTaskPill = (task: Task, positioned: boolean = false) => {
    const isCompleted = task.status === "completed";
    return (
      <div
        key={`task-${task.id}`}
        onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
        className={`flex items-center gap-1 px-1.5 py-1 rounded border-l-[3px] ${priorityBorderColor(task.priority)} bg-card cursor-pointer hover:shadow-sm transition-shadow group ${isCompleted ? "opacity-50" : ""} ${positioned ? "absolute left-0 right-0 mx-0.5 overflow-hidden z-10" : ""}`}
        style={positioned && task.start_time ? {
          top: minutesToTop(timeToMinutes(task.start_time)),
          height: durationPx(timeToMinutes(task.start_time), task.end_time ? timeToMinutes(task.end_time) : timeToMinutes(task.start_time) + 30),
        } : undefined}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onTaskComplete(task.id); }}
          className="shrink-0"
        >
          {isCompleted
            ? <CheckSquare className="w-3 h-3 text-success" />
            : <Square className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-semibold block truncate leading-tight ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </span>
          {task.start_time && (
            <span className="text-[9px] text-muted-foreground leading-none">
              {task.start_time}{task.end_time ? `–${task.end_time}` : ""}
            </span>
          )}
        </div>
        {task.xp_value > 0 && (
          <span className="flex items-center gap-0.5 text-[9px] text-xp font-medium shrink-0">
            <Sparkles className="w-2.5 h-2.5" />{task.xp_value}
          </span>
        )}
      </div>
    );
  };

  const renderEventPill = (event: Event, positioned: boolean = false) => {
    const startTime = event.is_all_day ? null : format(new Date(event.start_at), "HH:mm");
    const endTime = event.end_at && !event.is_all_day ? format(new Date(event.end_at), "HH:mm") : null;
    const startMin = startTime ? timeToMinutes(startTime) : 0;
    const endMin = endTime ? timeToMinutes(endTime) : startMin + 60;

    return (
      <div
        key={`event-${event.id}`}
        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
        className={`flex items-center gap-1 px-1.5 py-1 rounded border-l-[3px] border-l-info bg-info/10 cursor-pointer hover:shadow-sm transition-shadow ${positioned ? "absolute left-0 right-0 mx-0.5 overflow-hidden z-10" : ""}`}
        style={positioned && startTime ? {
          top: minutesToTop(startMin),
          height: durationPx(startMin, endMin),
        } : undefined}
      >
        <Calendar className="w-2.5 h-2.5 text-info shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold text-foreground block truncate leading-tight">{event.title}</span>
          {startTime && (
            <span className="text-[9px] text-muted-foreground leading-none">
              {startTime}{endTime ? `–${endTime}` : ""}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderTimeBlockBg = (day: Date, userId: string | null) => {
    const dayOfWeek = day.getDay() === 0 ? 7 : day.getDay();
    const blocks = timeBlocks.filter(b =>
      b.weekdays.includes(dayOfWeek) && (b.user_id === userId || b.user_id === null)
    );
    return blocks.map(block => {
      const startMin = timeToMinutes(block.start_time);
      const endMin = timeToMinutes(block.end_time);
      const bgColors: Record<string, string> = {
        school: "bg-blue-500/8",
        work: "bg-orange-500/8",
        nap: "bg-purple-500/8",
        unavailable: "bg-muted/40",
      };
      return (
        <div
          key={block.id}
          className={`absolute left-0 right-0 ${bgColors[block.type] || "bg-muted/20"} border-y border-dashed border-muted-foreground/10 pointer-events-none`}
          style={{
            top: minutesToTop(startMin),
            height: durationPx(startMin, endMin),
          }}
        >
          <span className="text-[8px] text-muted-foreground/50 px-1 font-medium">{block.label}</span>
        </div>
      );
    });
  };

  // Hour labels for the time axis
  const hourLabels = useMemo(() => {
    const labels: number[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) labels.push(h);
    return labels;
  }, []);

  // DESKTOP: Days as rows, each day has a time grid with person columns
  const renderDesktopDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");

    // Collect untimed items across all members for this day
    const allUntimed: Array<{ member: typeof activeMembers[0]; items: ReturnType<typeof getItemsForCell>["untimed"] }> = [];
    activeMembers.forEach(member => {
      const { untimed } = getItemsForCell(dayStr, member.user_id);
      if (untimed.length > 0) allUntimed.push({ member, items: untimed });
    });

    return (
      <div key={day.toISOString()} className="border-b border-border last:border-b-0">
        {/* Day header */}
        <div className={`flex items-center gap-2 px-3 py-2 border-b border-border ${isToday(day) ? "bg-primary/5 border-l-[3px] border-l-primary" : "bg-muted/30"}`}>
          <span className="text-[10px] text-muted-foreground font-medium uppercase">{format(day, "EEE", { locale: de })}</span>
          <span className={`text-sm font-bold ${isToday(day) ? "text-primary" : "text-foreground"}`}>{format(day, "d. MMM", { locale: de })}</span>
        </div>

        {/* Untimed items section */}
        {allUntimed.length > 0 && (
          <div className="border-b border-border bg-muted/10 px-1 py-1">
            <div className="grid" style={{ gridTemplateColumns: `48px repeat(${activeMembers.length}, 1fr)` }}>
              <div className="text-[8px] text-muted-foreground px-1 py-0.5 flex items-start">Ganztag</div>
              {activeMembers.map(member => {
                const { untimed } = getItemsForCell(dayStr, member.user_id);
                return (
                  <div key={member.id} className="px-0.5 space-y-0.5 border-l border-border">
                    {untimed.map(item => {
                      if (item.type === "task" && item.task) return renderTaskPill(item.task);
                      if (item.type === "event" && item.event) return renderEventPill(item.event);
                      return null;
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Time grid */}
        <div className="grid" style={{ gridTemplateColumns: `48px repeat(${activeMembers.length}, 1fr)` }}>
          {/* Time axis */}
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {hourLabels.map(h => (
              <div
                key={h}
                className="absolute left-0 right-0 text-[9px] text-muted-foreground px-1 border-t border-border/30"
                style={{ top: (h - START_HOUR) * PX_PER_HOUR }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Person columns */}
          {activeMembers.map(member => {
            const { timed } = getItemsForCell(dayStr, member.user_id);
            return (
              <div
                key={member.id}
                className="relative border-l border-border cursor-pointer hover:bg-muted/10 transition-colors"
                style={{ height: GRID_HEIGHT }}
                onClick={() => onCellClick(day, member.user_id)}
              >
                {/* Hour grid lines */}
                {hourLabels.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-border/20"
                    style={{ top: (h - START_HOUR) * PX_PER_HOUR }}
                  />
                ))}

                {/* Time block backgrounds */}
                {renderTimeBlockBg(day, member.user_id)}

                {/* Timed items */}
                {timed.map(item => {
                  if (item.type === "task" && item.task) return renderTaskPill(item.task, true);
                  if (item.type === "event" && item.event) return renderEventPill(item.event, true);
                  return null;
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDesktop = () => (
    <div className="hidden md:block border border-border rounded-lg overflow-hidden">
      {/* Member header row */}
      <div
        className="grid border-b border-border bg-muted/50 sticky top-0 z-20"
        style={{ gridTemplateColumns: `48px repeat(${activeMembers.length || 1}, 1fr)` }}
      >
        <div className="p-2 border-r border-border" />
        {activeMembers.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">{t("common.noData")}</div>
        ) : (
          activeMembers.map(member => (
            <div key={member.id} className="p-2 border-r border-border last:border-r-0 flex items-center gap-2 justify-center">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {member.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-foreground block truncate">{member.display_name}</span>
                {member.user_id === user?.id && (
                  <span className="text-[9px] text-primary font-medium">Du</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Day sections with time grids */}
      <div className="overflow-y-auto max-h-[70vh]">
        {days.map(day => renderDesktopDay(day))}
      </div>
    </div>
  );

  // MOBILE: Single day, members stacked vertically with time grid
  const renderMobile = () => {
    const dayStr = format(mobileDay, "yyyy-MM-dd");

    return (
      <div className="md:hidden space-y-3">
        <DayTabSelector days={days} selected={mobileDay} onSelect={setMobileDay} />

        {activeMembers.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">{t("common.noData")}</div>
        ) : (
          activeMembers.map(member => {
            const { untimed, timed } = getItemsForCell(dayStr, member.user_id);
            const isEmpty = untimed.length === 0 && timed.length === 0;

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

                {isEmpty ? (
                  <p className="text-xs text-muted-foreground text-center py-4">{t("common.empty", "Keine Einträge")}</p>
                ) : (
                  <>
                    {/* Untimed items */}
                    {untimed.length > 0 && (
                      <div className="px-2 py-1 space-y-0.5 border-b border-border bg-muted/10">
                        <span className="text-[8px] text-muted-foreground font-medium uppercase">Ganztag</span>
                        {untimed.map(item => {
                          if (item.type === "task" && item.task) return renderTaskPill(item.task);
                          if (item.type === "event" && item.event) return renderEventPill(item.event);
                          return null;
                        })}
                      </div>
                    )}

                    {/* Time grid for timed items */}
                    {timed.length > 0 && (
                      <div className="relative" style={{ height: Math.min(GRID_HEIGHT, 480) }}>
                        {/* Compressed: show only relevant hours */}
                        {hourLabels.map(h => (
                          <div
                            key={h}
                            className="absolute left-0 right-0 border-t border-border/20"
                            style={{ top: (h - START_HOUR) * PX_PER_HOUR * (480 / GRID_HEIGHT) }}
                          >
                            <span className="text-[8px] text-muted-foreground px-1">{String(h).padStart(2, "0")}:00</span>
                          </div>
                        ))}
                        {timed.map(item => {
                          const scale = 480 / GRID_HEIGHT;
                          const top = minutesToTop(item.startMin) * scale;
                          const height = durationPx(item.startMin, item.endMin) * scale;
                          if (item.type === "task" && item.task) {
                            return (
                              <div
                                key={`task-${item.task.id}`}
                                className="absolute left-8 right-1 z-10"
                                style={{ top, height: Math.max(height, 18) }}
                              >
                                {renderTaskPill(item.task)}
                              </div>
                            );
                          }
                          if (item.type === "event" && item.event) {
                            return (
                              <div
                                key={`event-${item.event.id}`}
                                className="absolute left-8 right-1 z-10"
                                style={{ top, height: Math.max(height, 18) }}
                              >
                                {renderEventPill(item.event)}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </>
                )}
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
