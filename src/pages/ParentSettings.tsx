import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { Settings } from "lucide-react";

export default function ParentSettings() {
  const { t } = useTranslation();

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-6 space-y-6">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">{t("nav.settings")}</h1>
      </motion.div>
      <motion.div variants={slideUp}>
        <div className="bg-card rounded-lg p-5 border border-border">
          <p className="text-sm text-muted-foreground">Einstellungen werden hier angezeigt.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
