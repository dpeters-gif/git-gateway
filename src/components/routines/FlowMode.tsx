import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { slideInRight, popIn, bounceIn } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, CheckCircle2, Clock, Sparkles, ArrowLeft } from "lucide-react";
import { playFlowStep, playFlowDone } from "@/services/soundEngine";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"tasks">;
type Routine = Tables<"routines">;

interface FlowModeProps {
  routine: Routine;
  tasks: Task[];
  open: boolean;
  onClose: () => void;
}

export default function FlowMode({ routine, tasks, open, onClose }: FlowModeProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [totalXp, setTotalXp] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(false);
  const [startTime] = useState(Date.now());

  // Skip already completed tasks
  const pendingTasks = tasks.filter(t => t.status !== "completed" && !completed.has(t.id));
  const allTasks = tasks;
  const totalSteps = allTasks.length;
  const completedCount = allTasks.filter(t => t.status === "completed").length + completed.size;

  // Timer
  useEffect(() => {
    if (!open || isComplete) return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [open, startTime, isComplete]);

  const targetSeconds = (routine.flow_target_minutes ?? 15) * 60;
  const remaining = Math.max(0, targetSeconds - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const currentTask = pendingTasks[0];

  const handleComplete = useCallback(async () => {
    if (!currentTask) return;
    setError(false);
    try {
      const { data, error: err } = await supabase.functions.invoke("complete-task", {
        body: { taskId: currentTask.id, userId: user?.id },
      });
      if (err) throw err;
      const xp = data?.gamification?.xpAwarded ?? currentTask.xp_value;
      setTotalXp(prev => prev + xp);
      setCompleted(prev => new Set(prev).add(currentTask.id));
      soundEngine.playFlowStep();

      // Check if all done
      if (completedCount + 1 >= totalSteps) {
        setIsComplete(true);
        soundEngine.playFlowDone();
      }
    } catch {
      setError(true);
    }
  }, [currentTask, user?.id, completedCount, totalSteps]);

  const handleExit = () => {
    if (!isComplete && completed.size > 0) {
      if (!confirm(t("flow.exitConfirm", "Routine abbrechen? Dein Fortschritt wird gespeichert."))) return;
    }
    onClose();
  };

  const underTime = isComplete && elapsed < targetSeconds;

  return (
    <Dialog open={open} onOpenChange={() => handleExit()}>
      <DialogContent className="max-w-full w-full h-full max-h-full m-0 p-0 rounded-none border-none bg-child-bg">
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={handleExit} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> {t("common.back")}
            </Button>
            <div className="flex items-center gap-2 text-sm font-mono">
              <Clock className={`w-4 h-4 ${remaining === 0 ? "text-error" : "text-muted-foreground"}`} />
              <span className={remaining === 0 ? "text-error" : "text-foreground"}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <Progress value={(completedCount / totalSteps) * 100} className="h-3 bg-xp-light" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {t("flow.step", "Schritt {{current}} von {{total}}", { current: completedCount + (isComplete ? 0 : 1), total: totalSteps })}
            </p>
          </div>

          {/* Content area */}
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key="complete"
                  variants={bounceIn}
                  initial="hidden"
                  animate="visible"
                  className="text-center space-y-4"
                >
                  <motion.div variants={confetti} className="text-6xl">🎉</motion.div>
                  <h1 className="text-2xl font-extrabold text-foreground">
                    {t("flow.done", "Geschafft!")}
                  </h1>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-xp" />
                    <span className="text-lg font-bold text-xp">{totalXp} XP</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("flow.time", "Zeit: {{minutes}} Min", { minutes: Math.ceil(elapsed / 60) })}
                  </p>
                  {underTime && (
                    <motion.p variants={popIn} initial="hidden" animate="visible" className="text-sm font-bold text-success">
                      {t("flow.underTime", "Unter der Zeit! Mega! 🚀")}
                    </motion.p>
                  )}
                  <Button onClick={onClose} className="mt-4 h-14 px-8 text-base">
                    {t("common.back")}
                  </Button>
                </motion.div>
              ) : currentTask ? (
                <motion.div
                  key={currentTask.id}
                  variants={slideInRight}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -100 }}
                  className="text-center space-y-6 w-full max-w-sm"
                >
                  <div className="w-20 h-20 rounded-full bg-child-accent/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-child-accent" />
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground">{currentTask.title}</h2>
                  {currentTask.description && (
                    <p className="text-sm text-muted-foreground">{currentTask.description}</p>
                  )}
                  {error && (
                    <p className="text-xs text-error">
                      {t("flow.error", "Verbindungsproblem — nochmal versuchen")}
                    </p>
                  )}
                  <Button
                    onClick={handleComplete}
                    className="h-14 w-full text-base bg-child-accent hover:bg-child-accent/90 text-white"
                  >
                    {error ? t("common.retry") : t("flow.stepDone", "Fertig ✓")}
                  </Button>
                </motion.div>
              ) : (
                <p className="text-muted-foreground">{t("flow.noSteps", "Keine Schritte übrig")}</p>
              )}
            </AnimatePresence>
          </div>

          {/* Timer expired message */}
          {remaining === 0 && !isComplete && (
            <p className="text-xs text-center text-muted-foreground pb-2">
              {t("flow.noStress", "Kein Stress — mach einfach weiter")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
