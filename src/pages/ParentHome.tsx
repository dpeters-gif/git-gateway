import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import EmptyState from "@/components/shared/EmptyState";
import { ClipboardList } from "lucide-react";

export default function ParentHome() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-6 space-y-6">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">
          {t("home.welcome")}, {profile?.name}
        </h1>
      </motion.div>

      <motion.div variants={slideUp}>
        <EmptyState
          icon={ClipboardList}
          title={t("home.empty.title")}
          body={t("home.empty.body")}
          ctaLabel={t("home.empty.cta")}
          onCta={() => {}}
        />
      </motion.div>
    </motion.div>
  );
}
