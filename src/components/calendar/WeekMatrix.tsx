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
import TimeBlockBand from "./TimeBlockBand";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckSquare, Square, Calendar, Sparkles } from "lucide-react";

// Time grid constants
const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR; // 16 hours
const PX_PER_HOUR = 44;
const GRID_HEIGHT = TOTAL_HOURS * PX_PER_HOUR;

const PRIORITY_STYLES: Record<string, { bg: string; border: string }> = {
  high: { bg: "rgba(194, 91, 78, 0.08)", border: "#C25B4E" },
  normal: { bg: "rgba(91, 122, 107, 0.08)", border: "#5B7A6B" },
  low: { bg: "#FEFEFB", border: "#9BA89F" },
};

const EVENT_STYLE = { bg: "rgba(91, 138, 155, 0.10)", border: "#5B8A9B" };

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

/** Strip seconds: "09:00:00" → "09:00", "09:00" unchanged */
function stripSeconds(time: string): string {
  const parts = time.split(":");
  return `${parts[0]}:${parts[1]}`;
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
      const ids = e.assigned_to_user_ids ?? [];
      return eDate === dayStr && (ids.includes(userId ?? "") || (ids.length === 0 && !userId));
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

  const renderTaskPill = (task: Task, positioned: boolean = false) => {
    const isCompleted = task.status === "completed";
    const ps = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.normal;
    return (
      <div
        key={`task-${task.id}`}
        onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
        className={`flex items-center gap-1 px-1.5 py-1 rounded border-l-[4px] cursor-pointer hover:shadow-sm transition-shadow group ${isCompleted ? "opacity-50" : ""} ${positioned ? "absolute left-0 right-0 mx-0.5 overflow-hidden" : ""}`}
        style={{
          backgroundColor: ps.bg,
          borderLeftColor: ps.border,
          zIndex: 3,
          ...(positioned && task.start_time ? {
            top: minutesToTop(timeToMinutes(task.start_time)),
            height: durationPx(timeToMinutes(task.start_time), task.end_time ? timeToMinutes(task.end_time) : timeToMinutes(task.start_time) + 30),
          } : {}),
        }}
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
          <span className={`block truncate leading-tight ${isCompleted ? "line-through text-muted-foreground" : ""}`} style={{ fontSize: 13, fontWeight: 600, color: isCompleted ? undefined : "#2D3A32" }}>
            {task.title}
          </span>
          {task.start_time && (
            <span style={{ fontSize: 12, color: "#6B7B72" }} className="leading-none">
              {stripSeconds(task.start_time)}{task.end_time ? `–${stripSeconds(task.end_time)}` : ""}
            </span>
          )}
        </div>
        {task.xp_value > 0 && (
          <span className="flex items-center gap-0.5 text-xp font-medium shrink-0" style={{ fontSize: 12 }}>
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
        className={`flex items-center gap-1 px-1.5 py-1 rounded border-l-[4px] cursor-pointer hover:shadow-sm transition-shadow ${positioned ? "absolute left-0 right-0 mx-0.5 overflow-hidden" : ""}`}
        style={{
          backgroundColor: EVENT_STYLE.bg,
          borderLeftColor: EVENT_STYLE.border,
          zIndex: 4,
          ...(positioned && startTime ? {
            top: minutesToTop(startMin),
            height: durationPx(startMin, endMin),
          } : {}),
        }}
      >
        <Calendar className="w-2.5 h-2.5 shrink-0" style={{ color: "#5B8A9B" }} />
        <div className="flex-1 min-w-0">
          <span className="block truncate leading-tight" style={{ fontSize: 13, fontWeight: 600, color: "#2D3A32" }}>{event.title}</span>
          {startTime && (
            <span style={{ fontSize: 12, color: "#6B7B72" }} className="leading-none">
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
      return (
        <TimeBlockBand
          key={block.id}
          block={block}
          top={minutesToTop(startMin)}
          height={durationPx(startMin, endMin)}
        />
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
          {isToday(day) ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="rounded-full flex items-center justify-center text-white" style={{ width: 24, height: 24, backgroundColor: "#5B7A6B", fontSize: 15, fontWeight: 700 }}>
                {format(day, "d")}
              </span>
              <span className="text-sm font-semibold" style={{ color: "#2D3A32" }}>{format(day, "MMM", { locale: de })}</span>
            </span>
          ) : (
            <span className="text-sm font-semibold" style={{ color: "#2D3A32" }}>{format(day, "d. MMM", { locale: de })}</span>
          )}
        </div>

        {/* Untimed items section */}
        {allUntimed.length > 0 && (
          <div className="border-b border-border bg-muted/10 px-1 py-1">
            <div className="grid" style={{ gridTemplateColumns: `52px repeat(${activeMembers.length}, 1fr)` }}>
              <div className="text-[8px] text-muted-foreground px-1 py-0.5 flex items-start">Ganztag</div>
              {activeMembers.map(member => {
                const { untimed } = getItemsForCell(dayStr, member.user_id);
                return (
                  <div key={member.id} className="px-0.5 space-y-0.5" style={{ borderLeft: "1px solid rgba(45, 58, 50, 0.12)" }}>
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
        <div className="grid" style={{ gridTemplateColumns: `52px repeat(${activeMembers.length}, 1fr)` }}>
          {/* Time axis */}
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {hourLabels.map(h => (
              <div
                key={h}
                className="absolute left-0 right-0 px-1"
                style={{ top: (h - START_HOUR) * PX_PER_HOUR, fontSize: 13, fontWeight: 500, color: "#6B7B72", borderTop: "1px solid rgba(45, 58, 50, 0.08)" }}
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
                className="relative cursor-pointer transition-colors"
                style={{
                  height: GRID_HEIGHT,
                  borderLeft: "1px solid rgba(45, 58, 50, 0.12)",
                  backgroundColor: isToday(day) ? "rgba(91, 122, 107, 0.03)" : undefined,
                }}
                onClick={() => onCellClick(day, member.user_id)}
              >
                {/* Hour grid lines + half-hour sub-lines */}
                {hourLabels.map(h => (
                  <div key={h}>
                    <div
                      className="absolute left-0 right-0"
                      style={{ top: (h - START_HOUR) * PX_PER_HOUR, borderTop: "1px solid rgba(45, 58, 50, 0.08)" }}
                    />
                    <div
                      className="absolute left-0 right-0"
                      style={{ top: (h - START_HOUR) * PX_PER_HOUR + PX_PER_HOUR / 2, borderTop: "1px dashed rgba(45, 58, 50, 0.04)" }}
                    />
                  </div>
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
    <div className="hidden md:block overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(45, 58, 50, 0.08)", borderRadius: 12 }}>
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
            <div key={member.id} className="p-2 flex items-center gap-2 justify-center" style={{ borderRight: "1px solid rgba(45, 58, 50, 0.12)" }}>
              <div
                className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ width: 40, height: 40, fontSize: 16, backgroundColor: member.color }}
              >
                {member.display_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-foreground truncate">{member.display_name.split(" ")[0]}</span>
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
              <div key={member.id} className="overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(45, 58, 50, 0.08)", borderRadius: 12 }}>
                {/* Member header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{member.display_name}</span>
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
                                className="absolute left-8 right-1"
                                style={{ top, height: Math.max(height, 18), zIndex: 3 }}
                              >
                                {renderTaskPill(item.task)}
                              </div>
                            );
                          }
                          if (item.type === "event" && item.event) {
                            return (
                              <div
                                key={`event-${item.event.id}`}
                                className="absolute left-8 right-1"
                                style={{ top, height: Math.max(height, 18), zIndex: 4 }}
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
