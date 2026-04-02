import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { popIn, float, glow, pulse } from "@/lib/animations";
import { playComplete, playXPAward, playGoldDrop, playStreakFire, playDropChest, playDropOpen } from "@/services/soundEngine";
import { Sparkles, Coins, Flame, Gift } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAuth } from "@/hooks/useAuth";

interface DopamineLoopProps {
  xp: number;
  gold: number;
  streakCount: number;
  streakStartedToday?: boolean;
  dropEvent?: { type: string; value: string | number };
  onComplete: () => void;
}

export default function DopamineLoop({ xp, gold, streakCount, streakStartedToday, dropEvent, onComplete }: DopamineLoopProps) {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();
  const { profile } = useAuth();
  const isChild = profile?.role === "child";
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (prefersReduced) {
      // Skip animations, just show briefly
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }

    // T+0ms: Haptic
    if (navigator.vibrate) navigator.vibrate(15);

    // T+200ms: Complete sound
    const t1 = setTimeout(() => playComplete(), 200);
    const p1 = setTimeout(() => setPhase(1), 200);

    // T+350ms: XP + Gold pop
    const t2 = setTimeout(() => { if (xp > 0) playXPAward(); setPhase(2); }, 350);

    // T+450ms: Gold sound (staggered from XP)
    const t3 = setTimeout(() => { if (gold > 0) playGoldDrop(); }, 450);

    // T+500ms: Streak
    const t4 = setTimeout(() => {
      if (streakStartedToday && streakCount > 0) playStreakFire();
      setPhase(3);
    }, 500);

    // T+900ms: Drop event
    const t5 = setTimeout(() => {
      if (dropEvent) {
        playDropChest();
        setPhase(4);
      }
    }, 900);

    // T+1700ms: Drop open
    const t6 = setTimeout(() => {
      if (dropEvent) playDropOpen();
    }, 1700);

    // Auto-dismiss — longer for children
    const duration = dropEvent ? (isChild ? 5000 : 3500) : (isChild ? 3500 : 2500);
    const t7 = setTimeout(onComplete, duration);

    return () => {
      [t1, t2, t3, t4, t5, t6, t7, p1].forEach(clearTimeout);
    };
  }, [xp, gold, streakCount, streakStartedToday, dropEvent, onComplete, prefersReduced]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        {/* XP popup — T+350ms */}
        {xp > 0 && phase >= 2 && (
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="visible"
            className={`flex items-center gap-2 bg-xp-light ${isChild ? "px-6 py-3" : "px-4 py-2"} rounded-full shadow-glow-xp`}
          >
            <Sparkles className={`${isChild ? "w-8 h-8" : "w-5 h-5"} text-xp`} />
            <span className={`${isChild ? "text-2xl" : "text-lg"} font-extrabold text-xp tabular-nums`}>
              {t("gamification.xpAwarded", { amount: xp })}
            </span>
          </motion.div>
        )}

        {/* Gold popup — T+350ms + 100ms delay */}
        {gold > 0 && phase >= 2 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2 bg-accent-light px-4 py-2 rounded-full"
          >
            <Coins className="w-5 h-5 text-gold" />
            <span className="text-lg font-extrabold text-accent tabular-nums">
              {t("gamification.goldAwarded", { amount: gold })}
            </span>
          </motion.div>
        )}

        {/* Streak popup — T+500ms, only on first-of-day */}
        {streakStartedToday && streakCount > 0 && phase >= 3 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2 bg-streak-light px-4 py-2 rounded-full shadow-glow-streak"
          >
            <Flame className="w-5 h-5 text-streak" />
            <span className="text-lg font-extrabold text-streak tabular-nums">
              {t("gamification.streakDay", { count: streakCount })}
            </span>
          </motion.div>
        )}

        {/* Drop event — T+900ms */}
        {dropEvent && phase >= 4 && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: [0, 1.2, 1], y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-2 bg-drop-light px-4 py-2 rounded-full"
          >
            <Gift className="w-5 h-5 text-drop" />
            <span className="text-lg font-extrabold text-drop">
              {t("gamification.treasureFound")}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
