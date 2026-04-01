import type { TimeBlock } from "@/hooks/useTimeBlocks";

const blockStyles: Record<string, { bg: string; border: string }> = {
  school: { bg: "bg-block-school", border: "border-block-school-border" },
  work: { bg: "bg-block-work", border: "border-block-work-border" },
  nap: { bg: "bg-block-nap", border: "border-block-nap-border" },
  unavailable: { bg: "bg-block-unavailable", border: "border-block-unavailable-border" },
};

interface TimeBlockBandProps {
  block: TimeBlock;
}

export default function TimeBlockBand({ block }: TimeBlockBandProps) {
  const style = blockStyles[block.type] ?? blockStyles.unavailable;

  return (
    <div className={`${style.bg} border-l-2 ${style.border} rounded-sm px-1.5 py-0.5 mb-1`}>
      <span className="text-[10px] text-muted-foreground font-medium">
        {block.label || block.type} · {block.start_time}–{block.end_time}
      </span>
    </div>
  );
}
