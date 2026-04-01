import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp, bounceIn } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useGamification, useLeaderboard } from "@/hooks/useGamification";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Award, ArrowUp, ArrowDown, Minus, Calendar, Lock } from "lucide-react";

export default function ChildProgress() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLevel, totalXP, xpProgress, xpInLevel, xpNeeded, streak, badges, isLoading } = useGamification();
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"weekly" | "monthly">("weekly");
  const { data: leaderboard = [], isLoading: lbLoading } = useLeaderboard(leaderboardPeriod);

  // All badges
  const { data: allBadges = [] } = useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data } = await supabase.from("badges").select("*").order("criteria_value");
      return data ?? [];
    },
  });

  const earnedBadgeIds = new Set(badges.map((b: any) => b.badge_id));

  if (isLoading) return <SkeletonLoader type="card" count={4} />;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-5">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">{t("nav.progress")}</h1>
      </motion.div>

      {/* Level badge */}
      <motion.div variants={slideUp} className="flex items-center gap-4">
        <motion.div
          variants={bounceIn}
          initial="hidden"
          animate="visible"
          className="w-20 h-20 rounded-full bg-level-up flex items-center justify-center shadow-glow-levelup"
        >
          <span className="text-2xl font-extrabold text-primary-foreground">{currentLevel}</span>
        </motion.div>
        <div className="flex-1">
          <h2 className="text-lg font-extrabold text-foreground">{t("child.levelLabel", { level: currentLevel })}</h2>
          <p className="text-xs text-muted-foreground mb-2">{t("child.xpProgress", { current: xpInLevel, target: xpNeeded })}</p>
          <Progress value={xpProgress * 100} className="h-3 bg-xp-light" />
        </div>
      </motion.div>

      {/* Streak history */}
      <motion.div variants={slideUp} className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-streak" />
          <h2 className="text-sm font-semibold text-foreground">Streak</h2>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 30 }).map((_, i) => {
            const isActive = i < (streak?.current_count ?? 0);
            return (
              <div
                key={i}
                className={`w-full aspect-square rounded-sm ${
                  isActive ? "bg-streak" : "bg-muted"
                }`}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Bester Streak: {streak?.longest_count ?? 0} Tage
        </p>
      </motion.div>

      {/* Badge collection */}
      <motion.div variants={slideUp} className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Abzeichen ({badges.length}/{allBadges.length})</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {allBadges.map((badge: any) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                  earned ? "bg-accent-light" : "bg-muted opacity-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  earned ? "bg-accent shadow-md" : "bg-muted-foreground/20"
                }`}>
                  {earned ? (
                    <Award className="w-5 h-5 text-accent-foreground" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-center text-foreground line-clamp-1">{badge.name}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div variants={slideUp} className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-gold" />
          <h2 className="text-sm font-semibold text-foreground">Rangliste</h2>
        </div>
        <Tabs value={leaderboardPeriod} onValueChange={v => setLeaderboardPeriod(v as any)}>
          <TabsList className="mb-3">
            <TabsTrigger value="weekly">Woche</TabsTrigger>
            <TabsTrigger value="monthly">Monat</TabsTrigger>
          </TabsList>
          <TabsContent value={leaderboardPeriod}>
            {lbLoading ? (
              <SkeletonLoader type="list" count={3} />
            ) : leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Noch keine Daten</p>
            ) : (
              <div className="space-y-2">
                {(leaderboard as any[]).map((entry, i) => {
                  const isMe = entry.uid === user?.id;
                  const posColors = ["text-leaderboard-1st", "text-leaderboard-2nd", "text-leaderboard-3rd"];
                  return (
                    <div
                      key={entry.uid}
                      className={`flex items-center gap-3 p-2 rounded-lg ${isMe ? "bg-primary-light ring-1 ring-primary" : ""}`}
                    >
                      <span className={`text-lg font-extrabold w-8 text-center ${posColors[i] ?? "text-foreground"}`}>
                        {entry.pos}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-foreground">{entry.uname}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {entry.pos_change > 0 && <ArrowUp className="w-3 h-3 text-success" />}
                        {entry.pos_change < 0 && <ArrowDown className="w-3 h-3 text-error" />}
                        {entry.pos_change === 0 && <Minus className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-xs font-medium text-xp">{entry.xp} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
