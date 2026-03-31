import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { TIERS, MEMBER_LIMITS, FREE_ACTIVE_ITEM_LIMIT } from "@/lib/constants";

export function useSubscription() {
  const { familyId } = useFamily();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", familyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("family_id", familyId!)
        .eq("status", "active")
        .maybeSingle();
      return data;
    },
    enabled: !!familyId,
  });

  const tier = (subscription?.tier ?? TIERS.FREE) as keyof typeof MEMBER_LIMITS;
  const memberLimit = MEMBER_LIMITS[tier] ?? MEMBER_LIMITS[TIERS.FREE];

  return {
    subscription,
    tier,
    isLoading,
    isFree: tier === TIERS.FREE,
    isFamily: tier === TIERS.FAMILY,
    isFamilyPlus: tier === TIERS.FAMILY_PLUS,
    memberLimit,
    activeItemLimit: tier === TIERS.FREE ? FREE_ACTIVE_ITEM_LIMIT : Infinity,
    canUseFeature: (requiredTier: string) => {
      const tierOrder = [TIERS.FREE, TIERS.FAMILY, TIERS.FAMILY_PLUS];
      return tierOrder.indexOf(tier) >= tierOrder.indexOf(requiredTier);
    },
  };
}
