import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Tables } from "@/integrations/supabase/types";

export type ShoppingItem = Tables<"shopping_items">;
export type ShoppingList = Tables<"shopping_lists">;

const CATEGORY_MAP: Record<string, string> = {
  milch: "dairy", käse: "dairy", joghurt: "dairy", butter: "dairy", sahne: "dairy", quark: "dairy",
  milk: "dairy", cheese: "dairy", yogurt: "dairy", cream: "dairy",
  apfel: "produce", banane: "produce", tomate: "produce", gurke: "produce", salat: "produce",
  kartoffel: "produce", zwiebel: "produce", möhre: "produce", obst: "produce", gemüse: "produce",
  apple: "produce", banana: "produce", tomato: "produce", lettuce: "produce", potato: "produce",
  brot: "bakery", brötchen: "bakery", kuchen: "bakery", bread: "bakery", cake: "bakery",
  wurst: "meat", fleisch: "meat", hähnchen: "meat", schinken: "meat",
  meat: "meat", chicken: "meat", sausage: "meat",
  wasser: "drinks", saft: "drinks", bier: "drinks", wein: "drinks", cola: "drinks", limo: "drinks",
  water: "drinks", juice: "drinks", beer: "drinks", wine: "drinks",
  eis: "frozen", pizza: "frozen", tiefkühl: "frozen", frozen: "frozen",
  spülmittel: "household", toilettenpapier: "household", seife: "household", waschmittel: "household",
  soap: "household", detergent: "household",
};

function categorize(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  return "other";
}

export function useShoppingList() {
  const { familyId } = useFamily();
  const { user } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();

  // Get or create the family's single shopping list
  const listQuery = useQuery({
    queryKey: ["shopping-list", familyId],
    queryFn: async () => {
      let { data } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("family_id", familyId!)
        .maybeSingle();
      if (!data) {
        const { data: created, error } = await supabase
          .from("shopping_lists")
          .insert({ family_id: familyId! })
          .select()
          .single();
        if (error) throw error;
        data = created;
      }
      return data as ShoppingList;
    },
    enabled: !!familyId,
  });

  const listId = listQuery.data?.id;

  const itemsQuery = useQuery({
    queryKey: ["shopping-items", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_items")
        .select("*")
        .eq("list_id", listId!)
        .order("checked", { ascending: true })
        .order("category")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ShoppingItem[];
    },
    enabled: !!listId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!listId) return;
    const channel = supabase
      .channel(`shopping-${listId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "shopping_items",
        filter: `list_id=eq.${listId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["shopping-items", listId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [listId, qc]);

  const addItem = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("shopping_items")
        .insert({
          list_id: listId!,
          name: name.trim(),
          added_by_user_id: user?.id ?? null,
          category: categorize(name),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping-items", listId] }),
    onError: () => toast.error(t("common.error")),
  });

  const toggleItem = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await supabase
        .from("shopping_items")
        .update({
          checked,
          checked_by_user_id: checked ? (user?.id ?? null) : null,
          checked_at: checked ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopping-items", listId] }),
  });

  const clearChecked = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("shopping_items")
        .delete()
        .eq("list_id", listId!)
        .eq("checked", true);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopping-items", listId] });
      toast.success(t("shopping.cleared", "Erledigte gelöscht"));
    },
  });

  // History for autocomplete
  const historyQuery = useQuery({
    queryKey: ["shopping-history", listId],
    queryFn: async () => {
      const { data } = await supabase
        .from("shopping_items")
        .select("name")
        .eq("list_id", listId!)
        .order("created_at", { ascending: false })
        .limit(100);
      const unique = [...new Set((data ?? []).map(d => d.name))];
      return unique;
    },
    enabled: !!listId,
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: listQuery.isLoading || itemsQuery.isLoading,
    isError: itemsQuery.isError,
    refetch: itemsQuery.refetch,
    addItem,
    toggleItem,
    clearChecked,
    history: historyQuery.data ?? [],
  };
}
