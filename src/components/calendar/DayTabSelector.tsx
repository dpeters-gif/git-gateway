import { format, isToday, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";

interface DayTabSelectorProps {
  days: Date[];
  selected: Date;
  onSelect: (date: Date) => void;
}

export default function DayTabSelector({ days, selected, onSelect }: DayTabSelectorProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
      {days.map(day => {
        const active = isSameDay(day, selected);
        const today = isToday(day);
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            className={`flex flex-col items-center min-w-[48px] px-2 py-2 rounded-lg transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : today
                ? "bg-primary-light text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="text-[10px] font-medium">{format(day, "EEE", { locale: de })}</span>
            <span className="text-sm font-bold">{format(day, "d")}</span>
          </button>
        );
      })}
    </div>
  );
}
