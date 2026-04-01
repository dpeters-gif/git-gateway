import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { useFamily } from "@/hooks/useFamily";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import { Progress } from "@/components/ui/progress";
import { Gift, Sparkles, Coins, Lock, CheckCircle2 } from "lucide-react";

export default function ChildRewards() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { familyId } = useFamily();
  const { totalXP, gold } = useGamification();

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["rewards", familyId],
    queryFn: async () => {
      const { data } = await supabase.from("rewards").select("*").eq("family_id", familyId!).eq("is_active", true).order("xp_threshold");
      return data ?? [];
    },
    enabled: !!familyId,
  });

  const { data: fulfillments = [] } = useQuery({
    queryKey: ["fulfillments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("reward_fulfillments").select("*").eq("child_user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const fulfilledIds = new Set(fulfillments.map((f: any) => f.reward_id));

  const available = rewards.filter(r => {
    if (fulfilledIds.has(r.id)) return false;
    if (r.xp_threshold && totalXP >= r.xp_threshold) return true;
    if (r.gold_price && gold >= r.gold_price) return true;
    return false;
  });

  const upcoming = rewards.filter(r => {
    if (fulfilledIds.has(r.id)) return false;
    if (r.xp_threshold && totalXP < r.xp_threshold) return true;
    return false;
  });

  const history = rewards.filter(r => fulfilledIds.has(r.id));

  if (isLoading) return <SkeletonLoader type="card" count={3} />;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-5">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">{t("nav.rewards")}</h1>
      </motion.div>

      {rewards.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Noch keine Belohnungen"
          body="Erledige Quests und sammle Gold!"
        />
      ) : (
        <>
          {/* Available */}
          {available.length > 0 && (
            <motion.div variants={slideUp}>
              <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-success" /> Verfügbar
              </h2>
              <div className="space-y-2">
                {available.map(r => (
                  <div key={r.id} className="bg-card rounded-xl p-4 border border-success/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success-light flex items-center justify-center">
                      <Gift className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                      <div className="flex gap-2 mt-0.5">
                        {r.xp_threshold && <span className="text-[10px] text-xp"><Sparkles className="w-3 h-3 inline" /> {r.xp_threshold} XP</span>}
                        {r.gold_price && <span className="text-[10px] text-accent"><Coins className="w-3 h-3 inline" /> {r.gold_price}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <motion.div variants={slideUp}>
              <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-muted-foreground" /> Bald verfügbar
              </h2>
              <div className="space-y-2">
                {upcoming.map(r => (
                  <div key={r.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 opacity-75">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Gift className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                      {r.xp_threshold && (
                        <div className="mt-1">
                          <Progress value={(totalXP / r.xp_threshold) * 100} className="h-2 bg-muted" />
                          <span className="text-[10px] text-muted-foreground">{totalXP}/{r.xp_threshold} XP</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* History */}
          {history.length > 0 && (
            <motion.div variants={slideUp}>
              <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" /> Erhalten
              </h2>
              <div className="space-y-2">
                {history.map(r => (
                  <div key={r.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3 opacity-60">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground line-through">{r.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
