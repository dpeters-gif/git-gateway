import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { format } from "date-fns";
import { Calendar, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useFamily } from "@/hooks/useFamily";
import type { Event } from "@/hooks/useEvents";

interface CalendarEventCardProps {
  event: Event;
  onClick: () => void;
}

function MemberAvatar({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.45, backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
}

function formatTimeShort(dateStr: string): string {
  return format(new Date(dateStr), "HH:mm");
}

export default function CalendarEventCard({ event, onClick }: CalendarEventCardProps) {
  const { members } = useFamily();
  const startTime = event.is_all_day ? "Ganztägig" : formatTimeShort(event.start_at);
  const endTime = event.end_at && !event.is_all_day ? formatTimeShort(event.end_at) : null;

  const assignedMembers = members.filter(m => (event.assigned_to_user_ids ?? []).includes(m.user_id ?? ""));
  const visibleMembers = assignedMembers.slice(0, 2);
  const extraCount = assignedMembers.length - 2;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event-${event.id}`,
    data: { type: "event", item: event },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 4,
  } : { zIndex: 4 };

  return (
    <motion.div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: "rgba(91, 138, 155, 0.10)", borderLeftColor: "#5B8A9B" }}
      variants={scaleIn}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="border-l-[4px] rounded-md p-2 cursor-pointer hover:shadow-sm transition-shadow group relative flex flex-col"
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
        <Calendar className="w-3 h-3 shrink-0" style={{ color: "#5B8A9B" }} />
        <span className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "#2D3A32" }}>{event.title}</span>
      </div>
      <div className="flex items-center justify-between mt-0.5 ml-[30px]">
        <span style={{ fontSize: 12, fontWeight: 400, color: "#6B7B72" }}>
          {startTime}{endTime ? ` – ${endTime}` : ""}
        </span>
        {assignedMembers.length > 0 && (
          <div className="flex items-center -space-x-1">
            {visibleMembers.map(m => (
              <MemberAvatar key={m.id} name={m.display_name ?? m.name} color={m.color} size={20} />
            ))}
            {extraCount > 0 && (
              <span className="text-[9px] font-medium text-muted-foreground ml-1">+{extraCount}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
