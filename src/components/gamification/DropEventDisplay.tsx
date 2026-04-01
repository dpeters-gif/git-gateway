import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bounceIn, popIn } from "@/lib/animations";
import { playDropChest, playDropOpen } from "@/services/soundEngine";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Gift, Coins, Sparkles, Snowflake, Egg, Shirt } from "lucide-react";

interface DropEventDisplayProps {
  dropType: string;
  dropValue: string | number;
  onComplete: () => void;
}

const DROP_ICONS: Record<string, React.ReactNode> = {
  bonus_gold: <Coins className="w-8 h-8 text-gold" />,
  xp_boost: <Sparkles className="w-8 h-8 text-xp" />,
  streak_freeze: <Snowflake className="w-8 h-8 text-info" />,
  mystery_egg: <Egg className="w-8 h-8 text-secondary" />,
  avatar_item: <Shirt className="w-8 h-8 text-accent" />,
};

const DROP_LABELS: Record<string, string> = {
  bonus_gold: "Bonus Gold!",
  xp_boost: "2× XP Boost!",
  streak_freeze: "Streak Freeze!",
  mystery_egg: "Mysteriöses Ei!",
  avatar_item: "Avatar Item!",
};

export default function DropEventDisplay({ dropType, dropValue, onComplete }: DropEventDisplayProps) {
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<"chest" | "open" | "reveal">("chest");

  useEffect(() => {
    if (prefersReduced) {
      setPhase("reveal");
      const t = setTimeout(onComplete, 1500);
      return () => clearTimeout(t);
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
        {/* Chest phase */}
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

        {/* Open phase — chest splits */}
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

        {/* Reveal phase — item shown */}
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
              {DROP_LABELS[dropType] ?? "Belohnung!"}
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
