import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { format, addDays, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useFamily } from "@/hooks/useFamily";
import { DndContext, DragOverlay, closestCenter, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import type { Task } from "@/hooks/useTasks";
import type { Event } from "@/hooks/useEvents";
import type { TimeBlock } from "@/hooks/useTimeBlocks";
import CalendarTaskCard from "./CalendarTaskCard";
import CalendarEventCard from "./CalendarEventCard";
import TimeBlockBand from "./TimeBlockBand";
import DayTabSelector from "./DayTabSelector";
import { Baby } from "lucide-react";

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

function DroppableCell({ id, children, className, onClick }: { id: string; children: React.ReactNode; className?: string; onClick?: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <td
      ref={setNodeRef}
      className={`${className} ${isOver ? "bg-primary/10 ring-2 ring-primary/30" : ""}`}
      onClick={onClick}
    >
      {children}
    </td>
  );
}

export default function WeekMatrix({
  tasks, events, timeBlocks, weekStart, onTaskClick, onEventClick, onCellClick, onTaskComplete,
  onTaskReschedule, onEventReschedule, conflicts
}: WeekMatrixProps) {
  const { members } = useFamily();
  const { t } = useTranslation();
  const [mobileDay, setMobileDay] = useState(new Date());
  const [activeItem, setActiveItem] = useState<{ type: "task" | "event"; item: Task | Event } | null>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as { type: "task" | "event"; item: Task | Event } | undefined;
    if (data) setActiveItem(data);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const dropId = over.id as string;
    if (!dropId.includes("|")) return;

    const [newDate, newUserId] = dropId.split("|");
    const data = active.data.current as { type: string; item: Task | Event };

    if (data.type === "task") {
      const task = data.item as Task;
      if (task.due_date !== newDate || task.assigned_to_user_id !== (newUserId || null)) {
        onTaskReschedule(task.id, newDate, newUserId || null);
      }
    } else {
      const ev = data.item as Event;
      onEventReschedule(ev.id, newDate, newUserId || null);
    }
  }, [onTaskReschedule, onEventReschedule]);

  const renderMatrix = () => (
    <div className="hidden md:block overflow-x-auto">
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-medium text-muted-foreground w-24" />
              {days.map(day => (
                <th
                  key={day.toISOString()}
                  className={`p-2 text-xs font-medium text-center min-w-[120px] ${
                    isToday(day) ? "bg-primary-light rounded-t-lg" : ""
                  }`}
                >
                  <div className="text-muted-foreground">{format(day, "EEE", { locale: de })}</div>
                  <div className={`text-sm font-semibold ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                    {format(day, "d. MMM", { locale: de })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="border-t border-border">
                <td className="p-2 align-top">
                  <div className="flex items-center gap-2">
                    {member.role === "baby" ? (
                      <div className="w-7 h-7 rounded-full bg-secondary-light flex items-center justify-center">
                        <Baby className="w-4 h-4 text-secondary" />
                      </div>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-foreground truncate max-w-[80px]">{member.name}</span>
                  </div>
                </td>
                {days.map(day => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const userId = member.user_id;
                  const cellId = `${dayStr}|${userId ?? ""}`;
                  const dayTasks = tasks.filter(t => t.due_date === dayStr && t.assigned_to_user_id === userId);
                  const dayEvents = events.filter(e => {
                    const eDate = format(new Date(e.start_at), "yyyy-MM-dd");
                    return eDate === dayStr && e.assigned_to_user_ids.includes(userId ?? "");
                  });
                  const dayBlocks = timeBlocks.filter(
                    tb => tb.user_id === userId && tb.weekdays.includes(day.getDay() === 0 ? 7 : day.getDay())
                  );
                  const conflictKey = `${userId}-${dayStr}`;
                  const hasConflict = conflicts.has(conflictKey);

                  return (
                    <DroppableCell
                      key={cellId}
                      id={cellId}
                      className={`p-1 align-top min-h-[80px] cursor-pointer hover:bg-background-subtle/50 transition-colors relative ${
                        isToday(day) ? "bg-primary-light/50" : ""
                      }`}
                      onClick={() => onCellClick(day, userId)}
                    >
                      {dayBlocks.map(block => (
                        <TimeBlockBand key={block.id} block={block} />
                      ))}
                      <div className="relative z-10 space-y-1">
                        {dayEvents.map(event => (
                          <CalendarEventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
                        ))}
                        {dayTasks.map(task => (
                          <CalendarTaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                            onComplete={() => onTaskComplete(task.id)}
                          />
                        ))}
                      </div>
                      {hasConflict && (
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error z-20" title="Zeitkonflikt" />
                      )}
                    </DroppableCell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <DragOverlay>
          {activeItem?.type === "task" && (
            <div className="bg-card border-l-[3px] border-primary rounded-md p-2 shadow-lg opacity-90 w-[140px]">
              <span className="text-xs font-semibold">{(activeItem.item as Task).title}</span>
            </div>
          )}
          {activeItem?.type === "event" && (
            <div className="bg-info-light border-l-[3px] border-info rounded-md p-2 shadow-lg opacity-90 w-[140px]">
              <span className="text-xs font-semibold">{(activeItem.item as Event).title}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );

  const renderMobile = () => {
    const dayStr = format(mobileDay, "yyyy-MM-dd");
    const dayTasks = tasks.filter(t => t.due_date === dayStr);
    const dayEvents = events.filter(e => format(new Date(e.start_at), "yyyy-MM-dd") === dayStr);

    return (
      <div className="md:hidden space-y-3">
        <DayTabSelector days={days} selected={mobileDay} onSelect={setMobileDay} />
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
          {dayEvents.length === 0 && dayTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">{t("home.empty.title")}</p>
          )}
          {dayEvents.map(event => (
            <motion.div key={event.id} variants={slideUp}>
              <CalendarEventCard event={event} onClick={() => onEventClick(event)} />
            </motion.div>
          ))}
          {dayTasks.map(task => (
            <motion.div key={task.id} variants={slideUp}>
              <CalendarTaskCard task={task} onClick={() => onTaskClick(task)} onComplete={() => onTaskComplete(task.id)} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <>
      {renderMatrix()}
      {renderMobile()}
    </>
  );
}
