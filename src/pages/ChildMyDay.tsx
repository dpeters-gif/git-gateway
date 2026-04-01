import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, slideUp, flame, popIn, bounceIn, glow, pulse, float } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { useTasks } from "@/hooks/useTasks";
import { useFamily } from "@/hooks/useFamily";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import LevelUpCelebration from "@/components/gamification/LevelUpCelebration";
import DopamineLoop from "@/components/gamification/DopamineLoop";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Flame, CheckSquare, Square, Coins, Trophy, Gift, Swords, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { playComplete, playXPAward, playStreakFire, playLevelUp, playGoldDrop } from "@/services/soundEngine";

export default function ChildMyDay() {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { currentLevel, totalXP, xpProgress, xpInLevel, xpNeeded, streak, gold, isLoading: gamLoading } = useGamification();
  const { tasks, isLoading: tasksLoading, completeTask } = useTasks({ status: "open" });
  const { familyId } = useFamily();

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [dopamineData, setDopamineData] = useState<{ xp: number; gold: number; streakCount: number } | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayTasks = tasks.filter(task => task.due_date === today && task.assigned_to_user_id === user?.id);
  const isLoading = gamLoading || tasksLoading;

  const handleComplete = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      // Call complete-task edge function for full gamification
      const { data, error } = await supabase.functions.invoke("complete-task", {
        body: { task_id: taskId, user_id: user?.id },
      });

      if (error) {
        // Fallback: simple completion
        completeTask.mutate(taskId);
      } else if (data) {
        setDopamineData({
          xp: data.xp_awarded ?? 0,
          gold: data.gold_awarded ?? 0,
          streakCount: data.streak_count ?? 0,
        });

        if (data.level_up) {
          setTimeout(() => {
            setNewLevel(data.new_level);
            setShowLevelUp(true);
          }, 1200);
        }
      }
    } catch {
      completeTask.mutate(taskId);
    }
    setTimeout(() => setCompletingId(null), 1500);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="py-4 space-y-5"
    >
      {/* Greeting */}
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">
          {t("child.greeting", { name: profile?.name })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, d. MMMM", { locale: de })} · {todayTasks.length} {t("child.questsToday", { count: todayTasks.length })}
        </p>
      </motion.div>

      {isLoading ? (
        <SkeletonLoader type="card" count={3} />
      ) : (
        <>
          {/* Streak card */}
          <motion.div variants={slideUp} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <motion.div
                variants={streak?.current_count ? flame : undefined}
                initial="hidden"
                animate="visible"
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  streak?.current_count ? "bg-streak-light shadow-glow-streak" : "bg-muted"
                }`}
              >
                <Flame className={`w-6 h-6 ${streak?.current_count ? "text-streak" : "text-muted-foreground"}`} />
              </motion.div>
              <div>
                <span className="text-lg font-extrabold text-foreground">
                  {streak?.current_count ?? 0}
                </span>
                <p className="text-xs text-muted-foreground">
                  {streak?.current_count
                    ? t("child.streakActive", { count: streak.current_count })
                    : t("child.streakBroken")}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Coins className="w-4 h-4 text-gold" />
                <span className="text-sm font-bold text-foreground">{gold}</span>
              </div>
            </div>
          </motion.div>

          {/* XP / Level */}
          <motion.div variants={slideUp} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  variants={bounceIn}
                  initial="hidden"
                  animate="visible"
                  className="w-10 h-10 rounded-full bg-level-up-light flex items-center justify-center shadow-glow-levelup"
                >
                  <span className="text-sm font-extrabold text-level-up">{currentLevel}</span>
                </motion.div>
                <span className="text-sm font-semibold text-foreground">{t("child.levelLabel", { level: currentLevel })}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t("child.xpProgress", { current: xpInLevel, target: xpNeeded })}
              </span>
            </div>
            <Progress value={xpProgress * 100} className="h-3 bg-xp-light" />
          </motion.div>

          {/* Quest list */}
          <motion.div variants={slideUp}>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-accent" /> Heutige Quests
            </h2>
            {todayTasks.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title={t("child.empty.title")}
                body={t("child.empty.body")}
              />
            ) : (
              <div className="space-y-2">
                {todayTasks.map(task => (
                  <motion.div
                    key={task.id}
                    variants={slideUp}
                    className={`bg-card rounded-xl p-4 border border-border flex items-center gap-3 ${
                      completingId === task.id ? "ring-2 ring-xp" : ""
                    }`}
                  >
                    <button
                      onClick={() => handleComplete(task.id)}
                      disabled={completingId === task.id}
                      className="shrink-0 touch-manipulation"
                    >
                      {completingId === task.id ? (
                        <motion.div variants={popIn} initial="hidden" animate="visible">
                          <CheckSquare className="w-12 h-12 text-success" />
                        </motion.div>
                      ) : (
                        <Square className="w-12 h-12 text-muted-foreground hover:text-child-accent transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{task.title}</h3>
                      {task.description && <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>}
                    </div>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-xp bg-xp-light px-2 py-1 rounded-full shrink-0">
                      <Sparkles className="w-3 h-3" /> {task.xp_value}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Dopamine loop */}
      <AnimatePresence>
        {dopamineData && (
          <DopamineLoop
            xp={dopamineData.xp}
            gold={dopamineData.gold}
            streakCount={dopamineData.streakCount}
            onComplete={() => setDopamineData(null)}
          />
        )}
      </AnimatePresence>

      {/* Level up celebration */}
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpCelebration
            level={newLevel}
            onDismiss={() => setShowLevelUp(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
