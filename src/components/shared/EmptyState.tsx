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
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-md font-semibold text-foreground mb-1">{title}</h2>
      <p className="text-xs text-muted-foreground mb-6 max-w-[280px]">{body}</p>
      {ctaLabel && onCta && (
        <Button onClick={onCta} className="h-10 px-6 rounded-full">
          {ctaLabel}
        </Button>
      )}
    </motion.div>
  );
}
