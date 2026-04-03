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
      const { data: fms } = await supabase
        .from("family_members")
        .select("*")
        .eq("family_id", familyId!);
      if (!fms?.length) return [];

      const userIds = fms.map(m => m.user_id).filter(Boolean) as string[];
      let profileMap = new Map<string, { name: string; avatar_url: string | null }>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", userIds);
        profileMap = new Map(profiles?.map(p => [p.id, { name: p.name, avatar_url: p.avatar_url }]) ?? []);
      }

      return fms.map(m => ({
        ...m,
        display_name: (m.user_id && profileMap.get(m.user_id)?.name) || m.name,
        avatar_url: m.user_id ? profileMap.get(m.user_id)?.avatar_url ?? null : null,
      }));
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
