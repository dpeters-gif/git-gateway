import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { format } from "date-fns";
import { Calendar, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Event } from "@/hooks/useEvents";

interface CalendarEventCardProps {
  event: Event;
  onClick: () => void;
}

export default function CalendarEventCard({ event, onClick }: CalendarEventCardProps) {
  const startTime = event.is_all_day ? "Ganztägig" : format(new Date(event.start_at), "HH:mm");
  const endTime = event.end_at && !event.is_all_day ? format(new Date(event.end_at), "HH:mm") : null;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event-${event.id}`,
    data: { type: "event", item: event },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      variants={scaleIn}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="bg-info-light border-l-[3px] border-info rounded-md p-2 cursor-pointer hover:shadow-sm transition-shadow group relative"
    >
      <div className="flex items-center gap-1.5">
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 touch-manipulation cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <Calendar className="w-3 h-3 text-info shrink-0" />
        <span className="text-xs font-semibold text-foreground truncate">{event.title}</span>
      </div>
      <span className="text-[10px] text-muted-foreground ml-[30px]">
        {startTime}{endTime ? ` – ${endTime}` : ""}
      </span>
    </motion.div>
  );
}
