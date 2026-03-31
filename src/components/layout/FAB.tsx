import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckSquare, Calendar, Repeat, StickyNote } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FABAction {
  icon: typeof CheckSquare;
  label: string;
  onClick: () => void;
}

interface FABProps {
  onCreateTask?: () => void;
  onCreateEvent?: () => void;
  onCreateRoutine?: () => void;
  onCreateNote?: () => void;
}

export default function FAB({ onCreateTask, onCreateEvent, onCreateRoutine, onCreateNote }: FABProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const isChild = profile?.role === "child";

  const actions: FABAction[] = [
    { icon: CheckSquare, label: t("fab.task"), onClick: () => { onCreateTask?.(); setOpen(false); } },
    { icon: Calendar, label: t("fab.event"), onClick: () => { onCreateEvent?.(); setOpen(false); } },
    ...(!isChild ? [{ icon: Repeat, label: t("fab.routine"), onClick: () => { onCreateRoutine?.(); setOpen(false); } }] : []),
    { icon: StickyNote, label: t("fab.boardNote"), onClick: () => { onCreateNote?.(); setOpen(false); } },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/30"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-[88px] right-6 z-50 flex flex-col-reverse items-end gap-3">
        <AnimatePresence>
          {open && actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                onClick={action.onClick}
                className="flex items-center gap-2 bg-card shadow-lg rounded-full pl-4 pr-3 py-2 min-h-[44px]"
              >
                <span className="text-sm font-medium text-foreground">{action.label}</span>
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          onClick={() => setOpen(!open)}
          className="h-fab w-fab rounded-full bg-primary shadow-lg flex items-center justify-center"
        >
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus className="h-6 w-6 text-primary-foreground" />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}
