import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { format, addDays, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { DndContext, DragOverlay, closestCenter, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import type { Task } from "@/hooks/useTasks";
import type { Event } from "@/hooks/useEvents";
import type { TimeBlock } from "@/hooks/useTimeBlocks";
import CalendarTaskCard from "./CalendarTaskCard";
import CalendarEventCard from "./CalendarEventCard";
import TimeBlockBand from "./TimeBlockBand";
import DayTabSelector from "./DayTabSelector";
import { useIsMobile } from "@/hooks/use-mobile";

const SLOT_HEIGHT = 40; // px per 30-min slot
const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2; // 32
const GRID_HEIGHT = TOTAL_SLOTS * SLOT_HEIGHT; // 1280px
const SCROLL_TO_HOUR = 8;

function timeToTop(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return ((h - START_HOUR) * 2 + Math.floor(m / 30)) * SLOT_HEIGHT;
}

function durationHeight(startStr: string, endStr: string): number {
  const [sh, sm] = startStr.split(":").map(Number);
  const [eh, em] = endStr.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(SLOT_HEIGHT, (mins / 30) * SLOT_HEIGHT);
}

function topToTime(y: number): string {
  const totalMinutes = START_HOUR * 60 + (y / SLOT_HEIGHT) * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface WeekMatrixProps {
  tasks: Task[];
  events: Event[];
  timeBlocks: TimeBlock[];
  weekStart: Date;
  onTaskClick: (task: Task) => void;
  onEventClick: (event: Event) => void;
  onCellClick: (date: Date, memberId: string | null, time?: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskReschedule: (taskId: string, newDate: string, newAssignee: string | null) => void;
  onEventReschedule: (eventId: string, newDate: string, newAssignee: string | null) => void;
  conflicts: Map<string, { items: (Task | Event)[] }>;
}

function DroppableColumn({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`relative ${className ?? ""} ${isOver ? "bg-primary/10" : ""}`}>
      {children}
    </div>
  );
}

function HourLabels() {
  const hours = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    hours.push(
      <div
        key={h}
        className="absolute right-2 text-[11px] text-muted-foreground leading-none"
        style={{ top: (h - START_HOUR) * 2 * SLOT_HEIGHT - 6 }}
      >
        {String(h).padStart(2, "0")}:00
      </div>
    );
  }
  return <>{hours}</>;
}

function GridLines() {
  const lines = [];
  for (let i = 0; i <= TOTAL_SLOTS; i++) {
    const isHour = i % 2 === 0;
    lines.push(
      <div
        key={i}
        className={`absolute left-0 right-0 ${isHour ? "border-t border-border" : "border-t border-border/30"}`}
        style={{ top: i * SLOT_HEIGHT }}
      />
    );
  }
  return <>{lines}</>;
}

function CurrentTimeLine() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  if (h < START_HOUR || h >= END_HOUR) return null;
  const top = ((h - START_HOUR) * 2 + m / 30) * SLOT_HEIGHT;

  return (
    <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-destructive -ml-1" />
        <div className="flex-1 h-[2px] bg-destructive" />
      </div>
    </div>
  );
}

export default function WeekMatrix({
  tasks, events, timeBlocks, weekStart, onTaskClick, onEventClick, onCellClick, onTaskComplete,
  onTaskReschedule, onEventReschedule, conflicts,
}: WeekMatrixProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [mobileDay, setMobileDay] = useState(new Date());
  const [activeItem, setActiveItem] = useState<{ type: "task" | "event"; item: Task | Event } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Auto-scroll to 8:00 on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (SCROLL_TO_HOUR - START_HOUR) * 2 * SLOT_HEIGHT;
    }
  }, [weekStart]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as { type: "task" | "event"; item: Task | Event } | undefined;
    if (data) setActiveItem(data);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;
    const dropId = over.id as string;
    const data = active.data.current as { type: string; item: Task | Event };
    if (data.type === "task") {
      const task = data.item as Task;
      if (task.due_date !== dropId) {
        onTaskReschedule(task.id, dropId, task.assigned_to_user_id);
      }
    } else {
      onEventReschedule((data.item as Event).id, dropId, null);
    }
  }, [onTaskReschedule, onEventReschedule]);

  const handleSlotClick = useCallback((day: Date, slotIndex: number) => {
    const time = topToTime(slotIndex * SLOT_HEIGHT);
    onCellClick(day, null, time);
  }, [onCellClick]);

  // Categorize items
  const getItemsForDay = useCallback((dayStr: string) => {
    const dayTasks = tasks.filter(t => t.due_date === dayStr);
    const dayEvents = events.filter(e => format(new Date(e.start_at), "yyyy-MM-dd") === dayStr);
    const allDayEvents = dayEvents.filter(e => e.is_all_day);
    const timedEvents = dayEvents.filter(e => !e.is_all_day);
    const timedTasks = dayTasks.filter(t => t.start_time);
    const untimedTasks = dayTasks.filter(t => !t.start_time);
    return { allDayEvents, timedEvents, timedTasks, untimedTasks };
  }, [tasks, events]);

  const renderDayColumn = (day: Date, dayStr: string) => {
    const { allDayEvents, timedEvents, timedTasks, untimedTasks } = getItemsForDay(dayStr);
    const dayBlocks = timeBlocks.filter(tb => tb.weekdays.includes(day.getDay() === 0 ? 7 : day.getDay()));

    return (
      <>
        {/* Time blocks (background) */}
        {dayBlocks.map(block => (
          <TimeBlockBand key={block.id} block={block} slotHeight={SLOT_HEIGHT} startHour={START_HOUR} />
        ))}

        {/* Slot click targets */}
        {Array.from({ length: TOTAL_SLOTS }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 cursor-pointer hover:bg-primary/5 transition-colors"
            style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
            onClick={() => handleSlotClick(day, i)}
          />
        ))}

        {/* Timed events */}
        {timedEvents.map(event => {
          const startTime = format(new Date(event.start_at), "HH:mm");
          const endTime = event.end_at ? format(new Date(event.end_at), "HH:mm") : null;
          const top = timeToTop(startTime);
          const height = endTime ? durationHeight(startTime, endTime) : SLOT_HEIGHT;
          return (
            <div key={event.id} className="absolute left-1 right-1 z-10" style={{ top, height }}>
              <CalendarEventCard event={event} onClick={() => onEventClick(event)} compact height={height} />
            </div>
          );
        })}

        {/* Timed tasks */}
        {timedTasks.map(task => {
          const top = timeToTop(task.start_time!);
          const height = task.end_time ? durationHeight(task.start_time!, task.end_time) : SLOT_HEIGHT;
          return (
            <div key={task.id} className="absolute left-1 right-1 z-10" style={{ top, height }}>
              <CalendarTaskCard task={task} onClick={() => onTaskClick(task)} onComplete={() => onTaskComplete(task.id)} compact height={height} />
            </div>
          );
        })}

        {/* Untimed tasks (stacked at top of the grid area as small pills) */}
        {untimedTasks.map((task, idx) => (
          <div key={task.id} className="absolute left-1 right-1 z-10" style={{ top: idx * (SLOT_HEIGHT + 2), height: SLOT_HEIGHT }}>
            <CalendarTaskCard task={task} onClick={() => onTaskClick(task)} onComplete={() => onTaskComplete(task.id)} compact height={SLOT_HEIGHT} />
          </div>
        ))}

        {/* Conflict dots */}
        {Array.from(conflicts.entries()).map(([key]) => {
          const [userId, date] = key.split("-");
          if (date !== dayStr) return null;
          return <div key={key} className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive z-20" title="Zeitkonflikt" />;
        })}
      </>
    );
  };

  // --- Desktop Week View ---
  const renderWeekView = () => {
    // Collect all-day items across the week
    const allDaySections = days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const { allDayEvents, untimedTasks } = getItemsForDay(dayStr);
      return { day, dayStr, allDayEvents, untimedTasks };
    });
    const hasAllDay = allDaySections.some(s => s.allDayEvents.length > 0);

    return (
      <div className="hidden md:block border border-border rounded-xl overflow-hidden bg-card">
        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Header row */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
            <div className="p-2 text-xs text-muted-foreground" />
            {days.map(day => (
              <div
                key={day.toISOString()}
                className={`p-2 text-center border-l border-border ${isToday(day) ? "bg-primary/5" : ""}`}
              >
                <div className="text-[11px] text-muted-foreground uppercase">{format(day, "EEE", { locale: de })}</div>
                <div className={`text-sm font-bold ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* All-day section */}
          {hasAllDay && (
            <div className="grid border-b border-border" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
              <div className="p-1 text-[10px] text-muted-foreground flex items-center justify-end pr-2">Ganztag</div>
              {allDaySections.map(({ day, allDayEvents }) => (
                <div key={day.toISOString()} className={`p-1 border-l border-border min-h-[28px] ${isToday(day) ? "bg-primary/5" : ""}`}>
                  {allDayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="bg-info/20 text-info-foreground text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer truncate mb-0.5 hover:bg-info/30 transition-colors"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Time grid */}
          <div
            ref={scrollRef}
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 240px)" }}
          >
            <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)", height: GRID_HEIGHT }}>
              {/* Hour gutter */}
              <div className="relative border-r border-border">
                <HourLabels />
              </div>

              {/* Day columns */}
              {days.map(day => {
                const dayStr = format(day, "yyyy-MM-dd");
                return (
                  <DroppableColumn
                    key={dayStr}
                    id={dayStr}
                    className={`border-l border-border ${isToday(day) ? "bg-primary/5" : ""}`}
                  >
                    <GridLines />
                    <CurrentTimeLine />
                    {renderDayColumn(day, dayStr)}
                  </DroppableColumn>
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {activeItem?.type === "task" && (
              <div className="bg-card border-l-[3px] border-primary rounded-md p-2 shadow-lg opacity-90 w-[140px]">
                <span className="text-xs font-semibold">{(activeItem.item as Task).title}</span>
              </div>
            )}
            {activeItem?.type === "event" && (
              <div className="bg-info/20 border-l-[3px] border-info rounded-md p-2 shadow-lg opacity-90 w-[140px]">
                <span className="text-xs font-semibold">{(activeItem.item as Event).title}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    );
  };

  // --- Mobile Day View ---
  const renderMobileView = () => {
    const dayStr = format(mobileDay, "yyyy-MM-dd");
    const { allDayEvents, timedEvents, timedTasks, untimedTasks } = getItemsForDay(dayStr);
    const dayBlocks = timeBlocks.filter(tb => tb.weekdays.includes(mobileDay.getDay() === 0 ? 7 : mobileDay.getDay()));

    return (
      <div className="md:hidden space-y-2">
        <DayTabSelector days={days} selected={mobileDay} onSelect={setMobileDay} />

        {/* All-day section */}
        {allDayEvents.length > 0 && (
          <div className="flex gap-1 flex-wrap px-1">
            {allDayEvents.map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="bg-info/20 text-[11px] font-medium px-2 py-0.5 rounded-full cursor-pointer"
              >
                {event.title}
              </div>
            ))}
          </div>
        )}

        {/* Untimed tasks */}
        {untimedTasks.length > 0 && (
          <div className="px-1 space-y-1">
            {untimedTasks.map(task => (
              <CalendarTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onComplete={() => onTaskComplete(task.id)} />
            ))}
          </div>
        )}

        {/* Time grid */}
        <div className="overflow-y-auto border border-border rounded-lg bg-card" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <div className="grid relative" style={{ gridTemplateColumns: "48px 1fr", height: GRID_HEIGHT }}>
            <div className="relative border-r border-border">
              <HourLabels />
            </div>
            <div className="relative">
              <GridLines />
              <CurrentTimeLine />
              {dayBlocks.map(block => (
                <TimeBlockBand key={block.id} block={block} slotHeight={SLOT_HEIGHT} startHour={START_HOUR} />
              ))}
              {Array.from({ length: TOTAL_SLOTS }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 cursor-pointer hover:bg-primary/5"
                  style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                  onClick={() => handleSlotClick(mobileDay, i)}
                />
              ))}
              {timedEvents.map(event => {
                const startTime = format(new Date(event.start_at), "HH:mm");
                const endTime = event.end_at ? format(new Date(event.end_at), "HH:mm") : null;
                const top = timeToTop(startTime);
                const height = endTime ? durationHeight(startTime, endTime) : SLOT_HEIGHT;
                return (
                  <div key={event.id} className="absolute left-1 right-1 z-10" style={{ top, height }}>
                    <CalendarEventCard event={event} onClick={() => onEventClick(event)} compact height={height} />
                  </div>
                );
              })}
              {timedTasks.map(task => {
                const top = timeToTop(task.start_time!);
                const height = task.end_time ? durationHeight(task.start_time!, task.end_time) : SLOT_HEIGHT;
                return (
                  <div key={task.id} className="absolute left-1 right-1 z-10" style={{ top, height }}>
                    <CalendarTaskCard task={task} onClick={() => onTaskClick(task)} onComplete={() => onTaskComplete(task.id)} compact height={height} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isMobile ? renderMobileView() : renderWeekView()}
    </>
  );
}
