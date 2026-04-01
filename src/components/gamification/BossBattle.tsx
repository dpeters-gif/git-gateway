import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { slideUp, popIn, pulse, shake } from "@/lib/animations";
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, Heart, Trophy, Users } from "lucide-react";

interface BossBattleProps {
  challenge: {
    id: string;
    title: string;
    description?: string | null;
    boss_creature_type?: string | null;
    boss_hp?: number | null;
    boss_current_hp?: number | null;
    target_count: number;
    is_completed: boolean;
    reward_xp: number;
  };
  contributors?: { name: string; count: number }[];
}

const BOSS_EMOJIS: Record<string, string> = {
  dragon: "🐉",
  troll: "🧌",
  ghost: "👻",
  robot: "🤖",
  kraken: "🐙",
  phoenix: "🔥",
};

export default function BossBattle({ challenge, contributors = [] }: BossBattleProps) {
  const { t } = useTranslation();
  const bossHp = challenge.boss_hp ?? 100;
  const currentHp = challenge.boss_current_hp ?? bossHp;
  const hpPercent = Math.max(0, (currentHp / bossHp) * 100);
  const defeated = challenge.is_completed || currentHp <= 0;

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className={`bg-card rounded-xl p-5 border-2 ${
        defeated ? "border-success bg-success-light" : "border-error"
      }`}
    >
      {/* Boss header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          variants={defeated ? popIn : pulse}
          initial="hidden"
          animate="visible"
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
            defeated ? "bg-success-light" : "bg-error-light"
          }`}
        >
          {defeated ? "🏆" : BOSS_EMOJIS[challenge.boss_creature_type ?? "dragon"] ?? "🐉"}
        </motion.div>
        <div className="flex-1">
          <h3 className="text-sm font-extrabold text-foreground">{challenge.title}</h3>
          {challenge.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{challenge.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-xp-light px-2 py-1 rounded-full">
          <Trophy className="w-3 h-3 text-xp" />
          <span className="text-xs font-bold text-xp">{challenge.reward_xp} XP</span>
        </div>
      </div>

      {/* HP bar */}
      {!defeated && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-error" />
              <span className="text-[10px] font-medium text-muted-foreground">Boss HP</span>
            </div>
            <span className="text-xs font-bold text-error tabular-nums">{currentHp}/{bossHp}</span>
          </div>
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={`h-full rounded-full ${
                hpPercent > 50 ? "bg-error" : hpPercent > 25 ? "bg-warning" : "bg-error animate-pulse"
              }`}
            />
          </div>
        </div>
      )}

      {/* Defeated state */}
      {defeated && (
        <motion.div
          variants={popIn}
          initial="hidden"
          animate="visible"
          className="text-center py-2"
        >
          <span className="text-sm font-extrabold text-success">Boss besiegt! 🎉</span>
        </motion.div>
      )}

      {/* Contributors */}
      {contributors.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1 mb-2">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Team</span>
          </div>
          <div className="space-y-1">
            {contributors.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-foreground">{c.name}</span>
                <div className="flex items-center gap-1">
                  <Sword className="w-3 h-3 text-primary" />
                  <span className="text-xs font-bold text-primary">{c.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
