import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";

export default function CareShare() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { familyId, members, isLoading: famLoading } = useFamily();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  // Redirect children away
  if (profile?.role === "child") return <Navigate to="/" replace />;

  const { data: careData = [], isLoading: dataLoading } = useQuery({
    queryKey: ["care-share", familyId, period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_care_share", {
        p_family_id: familyId!,
        p_period: period,
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!familyId,
  });

  const isLoading = famLoading || dataLoading;

  const adultMembers = members.filter((m) => m.role === "adult");
  const chartData = careData.map((d: any) => {
    const member = adultMembers.find((m) => m.user_id === d.uid);
    return {
      name: d.uname,
      value: d.completed_count,
      pct: d.pct,
      color: member?.color ?? "#4E6E5D",
    };
  });

  const WARM_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--info))"];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-6">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-bold text-foreground">{t("careShare.title", "Care-Share")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("careShare.subtitle", "Aufgabenverteilung unter Erwachsenen")}</p>
      </motion.div>

      <motion.div variants={slideUp}>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="weekly" className="flex-1">{t("careShare.thisWeek", "Diese Woche")}</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">{t("careShare.thisMonth", "Diesen Monat")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {isLoading ? (
        <SkeletonLoader type="card" count={2} />
      ) : chartData.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title={t("careShare.emptyTitle", "Noch keine erledigten Aufgaben")}
          body={t("careShare.emptyBody", period === "weekly" ? "Noch keine erledigten Aufgaben diese Woche" : "Noch keine erledigten Aufgaben diesen Monat")}
        />
      ) : adultMembers.length === 1 ? (
        <motion.div variants={slideUp} className="bg-card rounded-lg p-6 border border-border text-center">
          <p className="text-sm text-foreground">
            {t("careShare.singleAdult", { name: adultMembers[0]?.name })}
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={slideUp} className="bg-card rounded-lg p-6 border border-border">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {chartData.map((d: any, i: number) => (
                      <Cell key={i} fill={d.color || WARM_COLORS[i % WARM_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} ${t("careShare.tasks", "Aufgaben")}`, ""]} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 flex-1">
                {chartData.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: d.color || WARM_COLORS[i % WARM_COLORS.length] }} />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">{d.name}</span>
                      <div className="text-xs text-muted-foreground">{d.value} {t("careShare.tasks", "Aufgaben")} · {d.pct}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
