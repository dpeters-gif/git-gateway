import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { slideUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export default function EmptyState({ icon: Icon, title, body, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="h-16 w-16 rounded-full bg-primary-light flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{body}</p>
      {ctaLabel && onCta && (
        <Button onClick={onCta} className="h-12 px-8">
          {ctaLabel}
        </Button>
      )}
    </motion.div>
  );
}
