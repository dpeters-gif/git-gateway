import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import WorkloadChartWidget from "@/components/dashboard/WorkloadChartWidget";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/settings/AvatarPicker";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ParentHome() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { members, familyId, isLoading: famLoading } = useFamily();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { isLoading: eventsLoading } = useEvents();

  const isLoading = famLoading || tasksLoading || eventsLoading;

  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-6">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-bold text-foreground">
          {t("home.welcome")}, {profile?.name}
        </h1>
      </motion.div>

      {isLoading ? (
        <SkeletonLoader type="card" count={3} />
      ) : (
        <>
          {/* Section 1 — Family Status Bar */}
          <motion.div variants={slideUp}>
            <FamilyStatusBar members={members} tasks={tasks} today={today} />
          </motion.div>

          {/* Section 2 — Today's Focus */}
          <motion.div variants={slideUp}>
            <TodaysFocus tasks={tasks} members={members} today={today} />
          </motion.div>

          {/* Section 3 — Active Challenges */}
          <motion.div variants={slideUp}>
            <ActiveChallenges familyId={familyId} />
          </motion.div>

          {/* Section 4 — Weekly Workload */}
          <motion.div variants={slideUp}>
            <WorkloadChartWidget />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

/* ── Section 1: Family Status Bar ──────────────────── */

function FamilyStatusBar({ members, tasks, today }: { members: any[]; tasks: any[]; today: string }) {
  const openCountForMember = (userId: string | null) =>
    tasks.filter(t => t.due_date === today && t.status === "open" && t.assigned_to_user_id === userId).length;

  return (
    <div className="flex flex-wrap gap-3 py-4">
      {members.map((m: any) => {
        const count = openCountForMember(m.user_id);
        return (
          <div key={m.id} className="flex flex-col items-center" style={{ gap: "4px" }}>
            <div className="relative">
              <UserAvatar
                avatarUrl={m.avatar_url}
                name={m.display_name || m.name}
                className="h-10 w-10"
              />
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[11px] font-semibold bg-primary-light text-primary px-1"
                >
                  {count}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-medium truncate max-w-[56px] text-center">
              {(m.display_name || m.name).split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Section 2: Today's Focus ──────────────────── */

function TodaysFocus({ tasks, members, today }: { tasks: any[]; members: any[]; today: string }) {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const todayOpen = tasks.filter(tk => tk.due_date === today && tk.status === "open");
  const visible = todayOpen.slice(0, 5);
  const remaining = todayOpen.length - 5;

  const getMember = (userId: string | null) =>
    userId ? members.find((m: any) => m.user_id === userId) : undefined;

  const borderColor: Record<string, string> = {
    high: "#C25B4E",
    normal: "#5B7A6B",
    low: "#9BA89F",
  };

  const handleComplete = async (taskId: string) => {
    await supabase
      .from("tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", taskId);
    qc.invalidateQueries({ queryKey: ["tasks"] });
    toast.success(t("task.completed"));
  };

  const isOverdue = (task: any) => {
    if (!task.due_date) return false;
    return task.due_date < today;
  };

  return (
    <div>
      <h2 className="text-md font-extrabold text-foreground mb-3">
        Heute für die Familie
      </h2>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("home.noTasksToday")}</p>
      ) : (
        <div className="space-y-2">
          {visible.map(task => {
            const member = getMember(task.assigned_to_user_id);
            const overdue = isOverdue(task);
            return (
              <div
                key={task.id}
                className="bg-card rounded-lg border border-border flex items-center"
                style={{
                  borderLeft: `3px solid ${borderColor[task.priority] ?? "#5B7A6B"}`,
                  minHeight: "56px",
                }}
              >
                {/* Tap target zone */}
                <button
                  onClick={() => handleComplete(task.id)}
                  className="flex items-center justify-center shrink-0 h-14"
                  style={{ width: "48px" }}
                >
                  <Checkbox checked={false} onCheckedChange={() => handleComplete(task.id)} />
                </button>

                {/* Title */}
                <span className={`text-base flex-1 truncate ${overdue ? "font-semibold" : "font-normal"} text-foreground`}>
                  {task.title}
                </span>

                {/* Assignee avatar */}
                {member && (
                  <div className="pr-3 shrink-0">
                    <UserAvatar
                      avatarUrl={member.avatar_url}
                      name={member.display_name || member.name}
                      className="h-7 w-7"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {remaining > 0 && (
        <Link to="/tasks" className="text-sm text-primary font-medium mt-2 inline-block hover:underline">
          {remaining} weitere Aufgaben →
        </Link>
      )}
    </div>
  );
}

/* ── Section 3: Active Challenges ──────────────────── */

function ActiveChallenges({ familyId }: { familyId: string | null }) {
  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges-active", familyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("challenges")
        .select("*, challenge_progress(*)")
        .eq("family_id", familyId!)
        .eq("is_completed", false)
        .order("created_at", { ascending: false })
        .limit(2);
      return data ?? [];
    },
    enabled: !!familyId,
  });

  if (challenges.length === 0) return null;

  return (
    <div>
      <h2 className="text-md font-extrabold text-foreground mb-3">
        Aktive Challenges
      </h2>

      <div className="space-y-3">
        {challenges.map((c: any) => {
          const progress = (c.challenge_progress ?? []).reduce(
            (sum: number, p: any) => sum + (p.count ?? 0),
            0
          );
          const pct = Math.min(100, Math.round((progress / c.target_count) * 100));

          return (
            <div
              key={c.id}
              className="rounded-xl p-4"
              style={{
                background: "#FFFBF0",
                border: "1px solid rgba(0,191,165,0.3)",
              }}
            >
              <h3 className="text-md font-semibold text-foreground mb-2">{c.title}</h3>

              <div
                className="h-2 rounded-full overflow-hidden mb-1.5"
                style={{ background: "rgba(0,191,165,0.12)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: "#00BFA5" }}
                />
              </div>

              <div className="flex items-center justify-between">
                {c.end_date && (
                  <span className="text-xs text-muted-foreground">
                    bis {format(new Date(c.end_date), "dd.MM.")}
                  </span>
                )}
                <span className="text-xs font-bold" style={{ color: "#0F6E56" }}>
                  {progress} / {c.target_count} Aufgaben
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
