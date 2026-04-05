import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, TrendingUp, TrendingDown, Flame, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface RecapData {
  totalCompleted: number;
  prevCompleted: number;
  changePercent: number;
  members: {
    userId: string;
    name: string;
    role: string;
    tasksCompleted: number;
    xpEarned: number;
    badges: { name: string; icon: string }[];
    streak: number;
  }[];
}

export function WeeklyRecapCard() {
  const { t } = useTranslation();
  const { familyId } = useFamily();
  const [showDetail, setShowDetail] = useState(false);

  const { data: recap } = useQuery({
    queryKey: ["weekly-recap", familyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_recaps")
        .select("*")
        .eq("family_id", familyId!)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!familyId,
  });

  if (!recap) return null;

  const data = recap.data as unknown as RecapData;
  const isToday = new Date().getDay() <= 2; // Mon=1, Tue=2 → show prominently
  if (!isToday) return null;

  return (
    <>
      <motion.button
        variants={slideUp}
        onClick={() => setShowDetail(true)}
        className="w-full bg-gradient-to-r from-primary-light to-accent-light rounded-xl p-4 border border-primary/20 text-left"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{t("recap.title", "Eure Woche")}</span>
        </div>
        <p className="text-2xl font-extrabold text-foreground">
          {data.totalCompleted} {t("recap.tasksCompleted", "Aufgaben erledigt")}
        </p>
        {data.changePercent !== 0 && (
          <div className="flex items-center gap-1 mt-1">
            {data.changePercent > 0 ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-error" />
            )}
            <span className={`text-xs font-medium ${data.changePercent > 0 ? "text-success" : "text-error"}`}>
              {data.changePercent > 0 ? "+" : ""}{data.changePercent}% {t("recap.vsLastWeek", "vs. letzte Woche")}
            </span>
          </div>
        )}
      </motion.button>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("recap.title", "Eure Woche")}</DialogTitle></DialogHeader>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
            <motion.div variants={slideUp} className="text-center">
              <p className="text-3xl font-extrabold text-foreground">{data.totalCompleted}</p>
              <p className="text-sm text-muted-foreground">{t("recap.tasksCompleted", "Aufgaben erledigt")}</p>
            </motion.div>

            {data.members.map((m, i) => (
              <motion.div key={m.userId ?? i} variants={slideUp} className="flex items-center gap-3 bg-card rounded-lg p-3 border border-border">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground">{m.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{m.tasksCompleted} {t("recap.tasks", "Aufgaben")}</span>
                    <span className="text-xp">{m.xpEarned} XP</span>
                    {m.streak > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-streak" /> {m.streak}
                      </span>
                    )}
                  </div>
                </div>
                {(m.badges ?? []).length > 0 && (
                  <div className="flex gap-1">
                    {m.badges.map((b, j) => (
                      <Award key={j} className="w-4 h-4 text-gold" />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Child version
export function ChildRecapMiniCard() {
  const { t } = useTranslation();
  const { familyId } = useFamily();
  const { user } = useAuth();

  const { data: recap } = useQuery({
    queryKey: ["weekly-recap-child", familyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_recaps")
        .select("*")
        .eq("family_id", familyId!)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!familyId,
  });

  if (!recap) return null;
  const isToday = new Date().getDay() <= 2;
  if (!isToday) return null;

  const data = recap.data as unknown as RecapData;
  const me = data.members.find(m => m.userId === user?.id);
  if (!me) return null;

  return (
    <motion.div variants={slideUp} className="bg-gradient-to-r from-child-accent/10 to-accent-light rounded-xl p-4 border border-child-accent/20">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="w-4 h-4 text-child-accent" />
        <span className="text-xs font-semibold text-foreground">{t("recap.yourWeek", "Deine Woche")}</span>
      </div>
      <p className="text-sm text-foreground">
        {me.tasksCompleted} Quests · {me.xpEarned} XP
        {me.streak > 0 && ` · ${me.streak}-Tage-Serie 🔥`}
      </p>
    </motion.div>
  );
}
