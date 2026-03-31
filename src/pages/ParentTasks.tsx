import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import EmptyState from "@/components/shared/EmptyState";
import { CheckSquare } from "lucide-react";

export default function ParentTasks() {
  const { t } = useTranslation();

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-6 space-y-6">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">{t("nav.tasks")}</h1>
      </motion.div>
      <motion.div variants={slideUp}>
        <EmptyState
          icon={CheckSquare}
          title={t("home.empty.title")}
          body={t("home.empty.body")}
          ctaLabel={t("task.create")}
          onCta={() => {}}
        />
      </motion.div>
    </motion.div>
  );
}
