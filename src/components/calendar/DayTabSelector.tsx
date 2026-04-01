import { useState, useRef } from "react";
import { format, isToday, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";

interface DayTabSelectorProps {
  days: Date[];
  selected: Date;
  onSelect: (date: Date) => void;
}

export default function DayTabSelector({ days, selected, onSelect }: DayTabSelectorProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    // Only trigger if horizontal swipe > 50px and more horizontal than vertical
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;

    const currentIdx = days.findIndex(d => isSameDay(d, selected));
    if (dx < 0 && currentIdx < days.length - 1) {
      onSelect(days[currentIdx + 1]);
    } else if (dx > 0 && currentIdx > 0) {
      onSelect(days[currentIdx - 1]);
    }
  };

  return (
    <div
      className="flex gap-1 overflow-x-auto pb-2 scrollbar-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
