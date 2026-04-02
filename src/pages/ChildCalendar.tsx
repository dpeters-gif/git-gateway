import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { useRoutines } from "@/hooks/useRoutines";
import { useFamily } from "@/hooks/useFamily";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Sparkles, Calendar as CalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChildCalendar() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { events } = useEvents();
  const { routines } = useRoutines();
  const locale = i18n.language === "de" ? de : enUS;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayNum = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();

  // Filter items for this child on selected day
  const myTasks = tasks.filter(
    tk => tk.due_date === dateStr && (tk.assigned_to_user_id === user?.id || !tk.assigned_to_user_id)
  );

  const myEvents = events.filter(ev => {
    if (!ev.start_at) return false;
    return ev.start_at.startsWith(dateStr) && (
      ev.assigned_to_user_ids.length === 0 || ev.assigned_to_user_ids.includes(user?.id ?? "")
    );
  });

  const myRoutines = routines.filter(
    r => r.is_active && r.weekdays.includes(dayNum) && (r.assigned_to_user_id === user?.id || !r.assigned_to_user_id)
  );

  // Combine and sort by time
  const allItems = useMemo(() => {
    const items: { id: string; time: string; title: string; type: "task" | "event" | "routine"; xp?: number }[] = [];

    myTasks.forEach(tk => items.push({
      id: tk.id, time: tk.start_time ?? "99:99", title: tk.title, type: "task", xp: tk.xp_value,
    }));

    myEvents.forEach(ev => items.push({
      id: ev.id, time: ev.start_at ? format(new Date(ev.start_at), "HH:mm") : "99:99", title: ev.title, type: "event",
    }));

    myRoutines.forEach(r => items.push({
      id: r.id, time: r.scheduled_time ?? "99:99", title: r.title, type: "routine",
    }));

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [myTasks, myEvents, myRoutines]);

  const typeColors = {
    task: "bg-primary/10 border-primary/30",
    event: "bg-info/10 border-info/30",
    routine: "bg-accent/10 border-accent/30",
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <CalIcon className="w-5 h-5 text-primary" />
          {t("nav.calendar", "Kalender")}
        </h1>
      </motion.div>

      {/* Week day selector */}
      <motion.div variants={slideUp} className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSelectedDate(d => addDays(d, -7))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 flex gap-1 justify-between">
          {days.map(day => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-colors min-w-[40px] ${
                  isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <span className="text-[10px] font-medium uppercase">{format(day, "EEE", { locale }).slice(0, 2)}</span>
                <span className={`text-sm font-bold ${isSelected ? "" : "text-foreground"}`}>{format(day, "d")}</span>
              </button>
            );
          })}
        </div>
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSelectedDate(d => addDays(d, 7))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Date label */}
      <motion.div variants={slideUp}>
        <p className="text-sm text-muted-foreground font-medium">
          {format(selectedDate, "EEEE, d. MMMM", { locale })}
        </p>
      </motion.div>

      {/* Items */}
      <motion.div variants={slideUp} className="space-y-2">
        {allItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{t("child.noItemsToday", "Nichts geplant für heute 🎉")}</p>
          </div>
        ) : (
          allItems.map(item => (
            <motion.div
              key={item.id}
              variants={slideUp}
              className={`rounded-xl p-4 border ${typeColors[item.type]} flex items-center gap-3`}
            >
              {/* Time */}
              <span className="text-xs font-mono text-muted-foreground w-10 shrink-0">
                {item.time !== "99:99" ? item.time : "—"}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {item.type === "task" ? t("common.task", "Aufgabe") : item.type === "event" ? t("common.event", "Termin") : t("common.routine", "Routine")}
                </span>
              </div>

              {/* XP badge for tasks */}
              {item.xp && item.xp > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-bold text-xp bg-xp-light px-2 py-1 rounded-full shrink-0">
                  <Sparkles className="w-3 h-3" /> {item.xp}
                </span>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
