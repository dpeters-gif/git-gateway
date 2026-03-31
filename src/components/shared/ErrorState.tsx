import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { shake } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const isChild = profile?.role === "child";

  return (
    <motion.div
      variants={shake}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="h-16 w-16 rounded-full bg-error-light flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-error" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-1">
        {isChild ? t("child.error.title") : t("common.error")}
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {message ?? (isChild ? t("child.error.body") : t("common.error"))}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="h-12 px-8">
          {t("common.retry")}
        </Button>
      )}
    </motion.div>
  );
}
