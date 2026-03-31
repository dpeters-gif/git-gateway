import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFamily() {
  const { user } = useAuth();

  const { data: familyMember, isLoading: memberLoading } = useQuery({
    queryKey: ["family-member", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("family_members")
        .select("*, families(*)")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const familyId = familyMember?.family_id ?? null;
  const family = familyMember?.families ?? null;
  const isAdmin = familyMember?.is_admin ?? false;

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["family-members", familyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("family_members")
        .select("*")
        .eq("family_id", familyId!);
      return data ?? [];
    },
    enabled: !!familyId,
  });

  return {
    familyId,
    family,
    familyMember,
    members,
    isAdmin,
    isLoading: memberLoading || membersLoading,
    hasFamily: !!familyId,
  };
}
