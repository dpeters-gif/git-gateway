import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import EmptyState from "@/components/shared/EmptyState";
import { Trophy } from "lucide-react";

export default function ChildProgress() {
  const { t } = useTranslation();

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-6 space-y-6">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">{t("nav.progress")}</h1>
      </motion.div>
      <motion.div variants={slideUp}>
        <EmptyState
          icon={Trophy}
          title="Noch keine Fortschritte"
          body="Erledige Quests um XP zu sammeln!"
        />
      </motion.div>
    </motion.div>
  );
}
