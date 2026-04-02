import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { bounceIn, popIn } from "@/lib/animations";
import { playDropChest, playDropOpen } from "@/services/soundEngine";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAuth } from "@/hooks/useAuth";
import { Gift, Coins, Sparkles, Snowflake, Egg, Shirt } from "lucide-react";

interface DropEventDisplayProps {
  dropType: string;
  dropValue: string | number;
  onComplete: () => void;
}

const DROP_ICONS_NORMAL: Record<string, React.ReactNode> = {
  bonus_gold: <Coins className="w-8 h-8 text-gold" />,
  xp_boost: <Sparkles className="w-8 h-8 text-xp" />,
  streak_freeze: <Snowflake className="w-8 h-8 text-info" />,
  mystery_egg: <Egg className="w-8 h-8 text-secondary" />,
  avatar_item: <Shirt className="w-8 h-8 text-accent" />,
};

const DROP_ICONS_CHILD: Record<string, React.ReactNode> = {
  bonus_gold: <Coins className="w-14 h-14 text-gold" />,
  xp_boost: <Sparkles className="w-14 h-14 text-xp" />,
  streak_freeze: <Snowflake className="w-14 h-14 text-info" />,
  mystery_egg: <Egg className="w-14 h-14 text-secondary" />,
  avatar_item: <Shirt className="w-14 h-14 text-accent" />,
};

export default function DropEventDisplay({ dropType, dropValue, onComplete }: DropEventDisplayProps) {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<"chest" | "open" | "reveal">("chest");

  const DROP_LABELS: Record<string, string> = {
    bonus_gold: t("drop.bonusGold", "Bonus Gold!"),
    xp_boost: t("drop.xpBoost", "2× XP Boost!"),
    streak_freeze: t("drop.streakFreeze", "Streak Freeze!"),
    mystery_egg: t("drop.mysteryEgg", "Mysteriöses Ei!"),
    avatar_item: t("drop.avatarItem", "Avatar Item!"),
  };

  useEffect(() => {
    if (prefersReduced) {
      setPhase("reveal");
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }

    playDropChest();
    const t1 = setTimeout(() => { setPhase("open"); playDropOpen(); }, 800);
    const t2 = setTimeout(() => setPhase("reveal"), 1200);
    const t3 = setTimeout(onComplete, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete, prefersReduced]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-foreground/40 flex items-center justify-center"
      onClick={onComplete}
    >
      <div className="flex flex-col items-center gap-4">
        {phase === "chest" && (
          <motion.div
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className="w-24 h-24 rounded-2xl bg-accent flex items-center justify-center shadow-glow-gold"
          >
            <Gift className="w-12 h-12 text-primary-foreground" />
          </motion.div>
        )}

        {phase === "open" && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.3, 0.8], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
            className="w-24 h-24 rounded-2xl bg-accent flex items-center justify-center"
          >
            <Gift className="w-12 h-12 text-primary-foreground" />
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-3"
          >
            <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center shadow-lg border-2 border-accent">
              {DROP_ICONS[dropType] ?? <Gift className="w-8 h-8 text-accent" />}
            </div>
            <span className="text-lg font-extrabold text-primary-foreground">
              {DROP_LABELS[dropType] ?? t("drop.reward", "Belohnung!")}
            </span>
            {dropType === "bonus_gold" && (
              <span className="text-sm text-primary-foreground/80">+{dropValue} 🪙</span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}