import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { popIn, float, glow, pulse } from "@/lib/animations";
import { playComplete, playXPAward, playGoldDrop, playStreakFire } from "@/services/soundEngine";
import { Sparkles, Coins, Flame } from "lucide-react";

interface DopamineLoopProps {
  xp: number;
  gold: number;
  streakCount: number;
  onComplete: () => void;
}

export default function DopamineLoop({ xp, gold, streakCount, onComplete }: DopamineLoopProps) {
  useEffect(() => {
    // T+0ms: Haptic + sound
    if (navigator.vibrate) navigator.vibrate(50);
    
    // T+200ms: Complete sound
    const t1 = setTimeout(() => playComplete(), 200);
    
    // T+350ms: XP sound
    const t2 = setTimeout(() => { if (xp > 0) playXPAward(); }, 350);
    
    // T+500ms: Streak sound
    const t3 = setTimeout(() => { if (streakCount > 0) playStreakFire(); }, 500);
    
    // T+600ms: Gold sound
    const t4 = setTimeout(() => { if (gold > 0) playGoldDrop(); }, 600);
    
    // Auto-dismiss
    const t5 = setTimeout(onComplete, 2500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [xp, gold, streakCount, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        {/* XP popup */}
        {xp > 0 && (
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-2 bg-xp-light px-4 py-2 rounded-full shadow-glow-xp"
          >
            <Sparkles className="w-5 h-5 text-xp" />
            <span className="text-lg font-extrabold text-xp">+{xp} XP</span>
          </motion.div>
        )}

        {/* Gold popup */}
        {gold > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2 bg-accent-light px-4 py-2 rounded-full"
          >
            <Coins className="w-5 h-5 text-gold" />
            <span className="text-lg font-extrabold text-accent">+{gold} 🪙</span>
          </motion.div>
        )}

        {/* Streak popup */}
        {streakCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2 bg-streak-light px-4 py-2 rounded-full shadow-glow-streak"
          >
            <Flame className="w-5 h-5 text-streak" />
            <span className="text-lg font-extrabold text-streak">{streakCount} Tage 🔥</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
