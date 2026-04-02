import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { bounceIn, confettiParticle } from "@/lib/animations";
import { playLevelUp } from "@/services/soundEngine";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAuth } from "@/hooks/useAuth";

interface LevelUpCelebrationProps {
  level: number;
  onDismiss: () => void;
}

const CONFETTI_COLORS = ["#FFB020", "#FF6B35", "#7C4DFF", "#00BFA5", "#FFD700", "#E040FB"];

export default function LevelUpCelebration({ level, onDismiss }: LevelUpCelebrationProps) {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();
  const { profile } = useAuth();
  const isChild = profile?.role === "child";
  const particleCount = isChild ? 50 : 30;

  useEffect(() => {
    if (!prefersReduced) {
      playLevelUp();
      if (navigator.vibrate) navigator.vibrate(isChild ? [150, 80, 150, 80, 150] : [100, 50, 100]);
    }
    const timer = setTimeout(onDismiss, isChild ? 5000 : 3000);
    return () => clearTimeout(timer);
  }, [onDismiss, prefersReduced, isChild]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      className="fixed inset-0 z-[100] bg-foreground/60 flex items-center justify-center cursor-pointer"
    >
      {/* Confetti particles */}
      {!prefersReduced && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: particleCount }).map((_, i) => (
            <motion.div
              key={i}
              variants={confettiParticle(i)}
              initial="hidden"
              animate="visible"
              className={`absolute left-1/2 top-1/2 rounded-sm ${isChild ? "w-4 h-4" : "w-3 h-3"}`}
              style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
            />
          ))}
        </div>
      )}

      {/* Level badge */}
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-4 z-10"
      >
        <motion.div
          className={`${isChild ? "w-44 h-44" : "w-32 h-32"} rounded-full bg-level-up flex items-center justify-center shadow-glow-levelup`}
          animate={prefersReduced ? {} : { boxShadow: ["0 0 30px rgba(124,77,255,0.3)", "0 0 80px rgba(124,77,255,0.6)", "0 0 30px rgba(124,77,255,0.3)"] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className={`${isChild ? "text-7xl" : "text-display"} font-extrabold text-primary-foreground`}>{level}</span>
        </motion.div>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${isChild ? "text-3xl" : "text-xl"} font-extrabold text-primary-foreground`}
        >
          {t("gamification.levelUp", { level })}
        </motion.span>
        {isChild && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="text-lg text-primary-foreground/80"
          >
            🎉🌟🎉
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!prefersReduced) {
      playLevelUp();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss, prefersReduced]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      className="fixed inset-0 z-[100] bg-foreground/60 flex items-center justify-center cursor-pointer"
    >
      {/* Confetti particles */}
      {!prefersReduced && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              variants={confettiParticle(i)}
              initial="hidden"
              animate="visible"
              className="absolute left-1/2 top-1/2 w-3 h-3 rounded-sm"
              style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
            />
          ))}
        </div>
      )}

      {/* Level badge */}
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-4 z-10"
      >
        <motion.div
          className="w-32 h-32 rounded-full bg-level-up flex items-center justify-center shadow-glow-levelup"
          animate={prefersReduced ? {} : { boxShadow: ["0 0 30px rgba(124,77,255,0.3)", "0 0 60px rgba(124,77,255,0.5)", "0 0 30px rgba(124,77,255,0.3)"] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-display font-extrabold text-primary-foreground">{level}</span>
        </motion.div>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-extrabold text-primary-foreground"
        >
          {t("gamification.levelUp", { level })}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
