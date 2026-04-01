import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import type { Event } from "@/hooks/useEvents";

interface CalendarEventCardProps {
  event: Event;
  onClick: () => void;
}

export default function CalendarEventCard({ event, onClick }: CalendarEventCardProps) {
  const startTime = event.is_all_day ? "Ganztägig" : format(new Date(event.start_at), "HH:mm");
  const endTime = event.end_at && !event.is_all_day ? format(new Date(event.end_at), "HH:mm") : null;

  return (
    <motion.div
      variants={scaleIn}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="bg-info-light border-l-[3px] border-info rounded-md p-2 cursor-pointer hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3 h-3 text-info shrink-0" />
        <span className="text-xs font-semibold text-foreground truncate">{event.title}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">
        {startTime}{endTime ? ` – ${endTime}` : ""}
      </span>
    </motion.div>
  );
}
