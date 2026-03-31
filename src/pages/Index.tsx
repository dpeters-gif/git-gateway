import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-center space-y-4"
      >
        <h1 className="text-2xl font-extrabold text-foreground">
          Familienzentrale
        </h1>
        <p className="text-base text-muted-foreground">
          {t("home.empty.body")}
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
