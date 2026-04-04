import type { TimeBlock } from "@/hooks/useTimeBlocks";

const blockStyles: Record<string, { bg: string; border: string }> = {
  school: { bg: "bg-block-school", border: "border-l-block-school-border" },
  work: { bg: "bg-block-work", border: "border-l-block-work-border" },
  nap: { bg: "bg-block-nap", border: "border-l-block-nap-border" },
  unavailable: { bg: "bg-block-unavailable", border: "border-l-block-unavailable-border" },
};

interface TimeBlockBandProps {
  block: TimeBlock;
  /** Top offset in px (from time grid) */
  top: number;
  /** Height in px */
  height: number;
}

export default function TimeBlockBand({ block, top, height }: TimeBlockBandProps) {
  const style = blockStyles[block.type] ?? blockStyles.unavailable;

  return (
    <div
      className={`absolute left-0 right-0 ${style.bg} border-l-[3px] ${style.border} rounded-sm pointer-events-none`}
      style={{ top, height, zIndex: 1 }}
    >
      <span className="text-xs text-muted-foreground font-medium px-1 pt-1 block truncate">
        {block.label || block.type}
      </span>
    </div>
  );
}
