import { useTranslation } from "react-i18next";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { useFamily } from "@/hooks/useFamily";
import { useRoutines } from "@/hooks/useRoutines";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface TimelineItem {
  id: string;
  time: string; // HH:mm for sorting
  label: string;
  memberName?: string;
  memberColor?: string;
  type: "task" | "event" | "routine";
}

export default function TodayTimelineWidget() {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const { events } = useEvents();
  const { routines } = useRoutines();
  const { members } = useFamily();

  const today = new Date().toISOString().split("T")[0];
  const dayOfWeek = new Date().getDay();
  const dayNum = dayOfWeek === 0 ? 7 : dayOfWeek;

  const getMember = (userId: string | null) =>
    userId ? members.find(m => m.user_id === userId) : undefined;

  const items: TimelineItem[] = [];

  // Tasks with start_time today
  tasks
    .filter(tk => tk.due_date === today && tk.start_time)
    .forEach(tk => {
      const member = getMember(tk.assigned_to_user_id);
      items.push({
        id: `t-${tk.id}`,
        time: tk.start_time!,
        label: tk.title,
      memberName: member?.display_name,
        memberColor: member?.color,
        type: "task",
      });
    });

  // Events today
  events
    .filter(ev => ev.start_at?.startsWith(today))
    .forEach(ev => {
      const time = ev.start_at ? format(new Date(ev.start_at), "HH:mm") : "00:00";
      items.push({
        id: `e-${ev.id}`,
        time,
        label: ev.title,
        type: "event",
      });
    });

  // Routines active today
  routines
    .filter(r => r.is_active && r.weekdays.includes(dayNum) && r.scheduled_time)
    .forEach(r => {
      const member = getMember(r.assigned_to_user_id);
      items.push({
        id: `r-${r.id}`,
        time: r.scheduled_time!,
        label: r.title,
      memberName: member?.display_name,
      memberColor: member?.color,
      type: "routine",
      });
    });

  items.sort((a, b) => a.time.localeCompare(b.time));

  if (items.length === 0) return null;

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          {t("home.todayTimeline", "Heute")}
        </h2>
      </div>

      <div className="relative space-y-0">
        {/* vertical line */}
        <div className="absolute left-[23px] top-1 bottom-1 w-px bg-border" />

        {items.slice(0, 10).map((item) => {
          const [h, m] = item.time.split(":").map(Number);
          const itemMinutes = h * 60 + m;
          const isPast = itemMinutes < nowMinutes;

          return (
            <div key={item.id} className={`relative flex items-start gap-3 py-1.5 ${isPast ? "opacity-50" : ""}`}>
              {/* time */}
              <span className="text-[10px] font-mono text-muted-foreground w-10 text-right shrink-0 pt-0.5">
                {item.time}
              </span>
              {/* dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0 mt-1.5 z-10"
                style={{ backgroundColor: item.memberColor ?? "hsl(var(--primary))" }}
              />
              {/* content */}
              <div className="flex-1 min-w-0">
                <span className="text-xs text-foreground truncate block">{item.label}</span>
                {item.memberName && (
                  <span className="text-[10px] text-muted-foreground">{item.memberName}</span>
                )}
              </div>
            </div>
          );
        })}

        {items.length > 10 && (
          <p className="text-[10px] text-muted-foreground ml-[52px]">
            +{items.length - 10} {t("common.more", "weitere")}
          </p>
        )}
      </div>
    </div>
  );
}
