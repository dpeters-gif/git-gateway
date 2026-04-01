import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { useGamification } from "@/hooks/useGamification";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import { ClipboardList, Calendar, CheckCircle2, Flame, Coins, Users, StickyNote } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function ParentHome() {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { members, isLoading: famLoading } = useFamily();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { events, isLoading: eventsLoading } = useEvents();

  const isLoading = famLoading || tasksLoading || eventsLoading;

  const openTasks = tasks.filter(t => t.status === "open");
  const completedToday = tasks.filter(t => {
    if (t.status !== "completed" || !t.completed_at) return false;
    return t.completed_at.startsWith(new Date().toISOString().split("T")[0]);
  });

  // Task distribution by member
  const distribution = members.map(m => ({
    name: m.name,
    value: tasks.filter(t => t.assigned_to_user_id === m.user_id).length,
    color: m.color,
  })).filter(d => d.value > 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-6">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">
          {t("home.welcome")}, {profile?.name}
        </h1>
      </motion.div>

      {isLoading ? (
        <SkeletonLoader type="card" count={3} />
      ) : (
        <>
          {/* Stats row */}
          <motion.div variants={slideUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={ClipboardList} label={t("home.openTasks")} value={openTasks.length} color="text-primary" />
            <StatCard icon={CheckCircle2} label={t("home.completedToday")} value={completedToday.length} color="text-success" />
            <StatCard icon={Calendar} label="Events" value={events.length} color="text-info" />
            <StatCard icon={Users} label="Mitglieder" value={members.length} color="text-secondary" />
          </motion.div>

          {/* Task distribution */}
          {distribution.length > 0 && (
            <motion.div variants={slideUp} className="bg-card rounded-lg p-5 border border-border">
              <h2 className="text-sm font-semibold text-foreground mb-3">Aufgabenverteilung</h2>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={distribution} dataKey="value" innerRadius={30} outerRadius={55} paddingAngle={2}>
                      {distribution.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {distribution.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-foreground font-medium">{d.name}</span>
                      <span className="text-muted-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Pinnwand preview */}
          <motion.div variants={slideUp} className="bg-card rounded-lg p-5 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">{t("home.familyBoard")}</h2>
            </div>
            <p className="text-xs text-muted-foreground">Noch keine Notizen. Erstelle eine über das + Menü.</p>
          </motion.div>

          {tasks.length === 0 && events.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title={t("home.empty.title")}
              body={t("home.empty.body")}
              ctaLabel={t("home.empty.cta")}
              onCta={() => {}}
            />
          )}
        </>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-2xl font-extrabold text-foreground">{value}</span>
    </div>
  );
}
