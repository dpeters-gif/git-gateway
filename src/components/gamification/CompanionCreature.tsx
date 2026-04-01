import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bounceIn, float, popIn } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Heart } from "lucide-react";

interface CompanionCreatureProps {
  creatureType: string;
  stage: "egg" | "baby" | "juvenile" | "adult";
  name?: string | null;
  feedCount: number;
  hatchProgress: number;
  compact?: boolean;
}

const CREATURE_EMOJIS: Record<string, Record<string, string>> = {
  forest_fox: { egg: "🥚", baby: "🦊", juvenile: "🦊", adult: "🦊" },
  cloud_bunny: { egg: "🥚", baby: "🐰", juvenile: "🐇", adult: "🐇" },
  star_owl: { egg: "🥚", baby: "🦉", juvenile: "🦉", adult: "🦉" },
  river_otter: { egg: "🥚", baby: "🦦", juvenile: "🦦", adult: "🦦" },
  moon_cat: { egg: "🥚", baby: "🐱", juvenile: "🐈", adult: "🐈‍⬛" },
  sun_bear: { egg: "🥚", baby: "🐻", juvenile: "🐻", adult: "🐻" },
};

const STAGE_SIZES: Record<string, string> = {
  egg: "w-12 h-12 text-2xl",
  baby: "w-14 h-14 text-3xl",
  juvenile: "w-16 h-16 text-4xl",
  adult: "w-20 h-20 text-5xl",
};

export default function CompanionCreature({ creatureType, stage, name, feedCount, hatchProgress, compact }: CompanionCreatureProps) {
  const prefersReduced = useReducedMotion();
  const [showHeart, setShowHeart] = useState(false);

  const emoji = CREATURE_EMOJIS[creatureType]?.[stage] ?? "🥚";
  const sizeClass = compact ? "w-10 h-10 text-xl" : STAGE_SIZES[stage];

  const handleTap = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  return (
    <div className="flex flex-col items-center gap-1 relative">
      <motion.button
        variants={prefersReduced ? undefined : float}
        initial="hidden"
        animate="visible"
        onClick={handleTap}
        className={`${sizeClass} rounded-full bg-card border border-border flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform`}
      >
        {emoji}
      </motion.button>

      {/* Feeding heart animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -30, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute -top-4"
          >
            <Heart className="w-5 h-5 text-error fill-error" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name + stage */}
      {!compact && (
        <>
          <span className="text-xs font-semibold text-foreground">{name ?? creatureType.replace("_", " ")}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{stage}</span>
          {stage === "egg" && (
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hatchProgress}%` }}
                className="h-full bg-accent rounded-full"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
