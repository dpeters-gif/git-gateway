import type { TimeBlock } from "@/hooks/useTimeBlocks";

const blockStyles: Record<string, { bg: string; border: string }> = {
  school: { bg: "bg-block-school/40", border: "border-block-school-border" },
  work: { bg: "bg-block-work/40", border: "border-block-work-border" },
  nap: { bg: "bg-block-nap/40", border: "border-block-nap-border" },
  unavailable: { bg: "bg-block-unavailable/40", border: "border-block-unavailable-border" },
};

interface TimeBlockBandProps {
  block: TimeBlock;
  slotHeight?: number;
  startHour?: number;
}

function timeToPixels(timeStr: string, startHour: number, slotHeight: number): number {
  const [h, m] = timeStr.split(":").map(Number);
  return ((h - startHour) * 2 + Math.floor(m / 30)) * slotHeight;
}

export default function TimeBlockBand({ block, slotHeight, startHour }: TimeBlockBandProps) {
  const style = blockStyles[block.type] ?? blockStyles.unavailable;

  // Legacy inline mode (no positioning props)
  if (slotHeight === undefined || startHour === undefined) {
    return (
      <div className={`${style.bg} border-l-2 ${style.border} rounded-sm px-1.5 py-0.5 mb-1`}>
        <span className="text-[10px] text-muted-foreground font-medium">
          {block.label || block.type} · {block.start_time}–{block.end_time}
        </span>
      </div>
    );
  }

  // Positioned band mode
  const top = timeToPixels(block.start_time, startHour, slotHeight);
  const bottom = timeToPixels(block.end_time, startHour, slotHeight);
  const height = Math.max(slotHeight, bottom - top);

  return (
    <div
      className={`absolute left-0 right-0 ${style.bg} border-l-2 ${style.border} z-[1] pointer-events-none`}
      style={{ top, height }}
    >
      <span className="text-[10px] text-muted-foreground/70 font-medium px-1.5 py-0.5 block">
        {block.label || block.type}
      </span>
    </div>
  );
}
