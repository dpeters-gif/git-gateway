import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import EmptyState from "@/components/shared/EmptyState";
import { Star } from "lucide-react";

export default function ChildQuests() {
  const { t } = useTranslation();

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-6 space-y-6">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">{t("nav.quests")}</h1>
      </motion.div>
      <motion.div variants={slideUp}>
        <EmptyState
          icon={Star}
          title={t("child.empty.title")}
          body={t("child.empty.body")}
        />
      </motion.div>
    </motion.div>
  );
}
