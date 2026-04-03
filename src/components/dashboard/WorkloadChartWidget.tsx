import { useTranslation } from "react-i18next";
import { useTasks } from "@/hooks/useTasks";
import { useRoutines } from "@/hooks/useRoutines";
import { useFamily } from "@/hooks/useFamily";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { startOfWeek, addDays, format, isEqual } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { BarChart3 } from "lucide-react";

export default function WorkloadChartWidget() {
  const { t, i18n } = useTranslation();
  const { tasks } = useTasks();
  const { routines } = useRoutines();
  const { members } = useFamily();
  const locale = i18n.language === "de" ? de : enUS;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // For each member (non-baby), count tasks + active routines per day
  const activeMembersList = members.filter(m => m.role !== "baby");

  const chartData = days.map(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayOfWeek = day.getDay(); // 0=Sun, 1=Mon...

    const entry: Record<string, any> = {
      day: format(day, "EEE", { locale }),
    };

    activeMembersList.forEach(member => {
      const taskCount = tasks.filter(
        tk => tk.due_date === dateStr && tk.assigned_to_user_id === member.user_id
      ).length;

      const routineCount = routines.filter(
        r =>
          r.is_active &&
          r.assigned_to_user_id === member.user_id &&
          r.weekdays.includes(dayOfWeek === 0 ? 7 : dayOfWeek)
      ).length;

      entry[member.display_name] = taskCount + routineCount;
    });

    return entry;
  });

  if (activeMembersList.length === 0) return null;

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          {t("home.workloadChart", "Wochenauslastung")}
        </h2>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis dataKey="day" tick={{ fontSize: 10 }} className="text-muted-foreground" />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={20} />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
              }}
            />
            {activeMembersList.map((member) => (
              <Bar
                key={member.id}
                dataKey={member.name}
                stackId="workload"
                fill={member.color}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {activeMembersList.map(m => (
          <div key={m.id} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
            {m.name}
          </div>
        ))}
      </div>
    </div>
  );
}
