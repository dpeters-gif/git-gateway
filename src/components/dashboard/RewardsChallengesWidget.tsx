import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/hooks/useFamily";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Trophy, Gift } from "lucide-react";
import { format } from "date-fns";

export default function RewardsChallengesWidget() {
  const { t } = useTranslation();
  const { familyId } = useFamily();

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges-active", familyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("challenges")
        .select("*, challenge_progress(*)")
        .eq("family_id", familyId!)
        .eq("is_completed", false)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
    enabled: !!familyId,
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ["rewards-active", familyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("rewards")
        .select("*")
        .eq("family_id", familyId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
    enabled: !!familyId,
  });

  if (challenges.length === 0 && rewards.length === 0) return null;

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" />
          <h2 className="text-md font-extrabold text-foreground">
            {t("home.rewardsAndChallenges")}
          </h2>
        </div>
        <Link to="/rewards" className="text-xs text-primary hover:underline">
          {t("home.viewAll")}
        </Link>
      </div>

      <div className="space-y-3">
        {challenges.map((c: any) => {
          const progress = (c.challenge_progress ?? []).reduce(
            (sum: number, p: any) => sum + (p.count ?? 0),
            0
          );
          const pct = Math.min(
            100,
            Math.round((progress / c.target_count) * 100)
          );
          return (
            <div key={c.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">
                  {c.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {progress}/{c.target_count}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
              {c.end_date && (
                <span className="text-xs text-muted-foreground">
                  bis {format(new Date(c.end_date), "dd.MM.")}
                </span>
              )}
            </div>
          );
        })}

        {rewards.map((r: any) => (
          <div
            key={r.id}
            className="flex items-center gap-2"
          >
            <Gift className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs text-foreground flex-1 truncate">
              {r.title}
            </span>
            {r.xp_threshold && (
              <span className="text-xs text-muted-foreground">
                {r.xp_threshold} XP
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
