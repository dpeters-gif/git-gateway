import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFamily } from "./useFamily";
import { getLevelForXP, getXPForNextLevel } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";

export function useGamification(userId?: string) {
  const { user } = useAuth();
  const uid = userId ?? user?.id;

  const levelQuery = useQuery({
    queryKey: ["level", uid],
    queryFn: async () => {
      const { data } = await supabase.from("levels").select("*").eq("user_id", uid!).maybeSingle();
      return data;
    },
    enabled: !!uid,
  });

  const streakQuery = useQuery({
    queryKey: ["streak", uid],
    queryFn: async () => {
      const { data } = await supabase.from("streaks").select("*").eq("user_id", uid!).maybeSingle();
      return data;
    },
    enabled: !!uid,
  });

  const goldQuery = useQuery({
    queryKey: ["gold", uid],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_gold_balance", { p_user_id: uid! });
      return (data as number) ?? 0;
    },
    enabled: !!uid,
  });

  const badgesQuery = useQuery({
    queryKey: ["user-badges", uid],
    queryFn: async () => {
      const { data } = await supabase.from("user_badges").select("*, badges(*)").eq("user_id", uid!);
      return data ?? [];
    },
    enabled: !!uid,
  });

  const level = levelQuery.data;
  const totalXP = level?.total_xp ?? 0;
  const currentLevel = level?.current_level ?? 1;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const prevLevelXP = currentLevel > 1 ? getXPForNextLevel(currentLevel - 1) : 0;
  const xpInLevel = totalXP - prevLevelXP;
  const xpNeeded = nextLevelXP - prevLevelXP;
  const xpProgress = xpNeeded > 0 ? xpInLevel / xpNeeded : 0;

  return {
    totalXP,
    currentLevel,
    nextLevelXP,
    xpProgress,
    xpInLevel,
    xpNeeded,
    streak: streakQuery.data,
    gold: goldQuery.data ?? 0,
    badges: badgesQuery.data ?? [],
    isLoading: levelQuery.isLoading || streakQuery.isLoading,
  };
}

export function useLeaderboard(period: "weekly" | "monthly" = "weekly") {
  const { familyId } = useFamily();

  return useQuery({
    queryKey: ["leaderboard", familyId, period],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_leaderboard", {
        p_family_id: familyId!,
        p_period: period,
      });
      return data ?? [];
    },
    enabled: !!familyId,
  });
}
