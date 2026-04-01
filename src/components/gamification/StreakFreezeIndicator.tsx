import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Snowflake } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function StreakFreezeIndicator() {
  const { user } = useAuth();

  const { data: count = 0 } = useQuery({
    queryKey: ["streak-freezes-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("streak_freezes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_used", false);
      return count ?? 0;
    },
    enabled: !!user,
  });

  if (count === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-0.5 bg-info-light px-1.5 py-0.5 rounded-full">
            <Snowflake className="w-3 h-3 text-info" />
            <span className="text-[10px] font-bold text-info">{count}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{count}× Streak Freeze verfügbar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
