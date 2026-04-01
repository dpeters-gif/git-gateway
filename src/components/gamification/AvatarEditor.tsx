import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Check, Coins } from "lucide-react";
import { toast } from "sonner";
import { playGoldDrop } from "@/services/soundEngine";

export default function AvatarEditor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLevel, gold } = useGamification();
  const queryClient = useQueryClient();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { data: allItems = [] } = useQuery({
    queryKey: ["all-avatar-items"],
    queryFn: async () => {
      const { data } = await supabase.from("avatar_items").select("*").order("category").order("required_level");
      return data ?? [];
    },
  });

  const { data: avatar } = useQuery({
    queryKey: ["child-avatar", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("child_avatars")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const equippedItems = (avatar?.equipped_items as string[]) ?? [];
  const categories = [...new Set(allItems.map(i => i.category))];

  const handleItemClick = async (itemId: string) => {
    if (!user) return;
    const isEquipped = equippedItems.includes(itemId);

    if (isEquipped) {
      // Unequip
      const newItems = equippedItems.filter(id => id !== itemId);
      if (avatar) {
        await supabase.from("child_avatars").update({ equipped_items: newItems }).eq("user_id", user.id);
      }
      queryClient.invalidateQueries({ queryKey: ["child-avatar", user.id] });
      toast.success(t("avatar.unequipped", "Item abgelegt"));
      return;
    }

    // Not owned — must purchase via spend-gold
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    const price = item.gold_price ?? 20;

    if (gold < price) {
      toast.error(t("gamification.insufficientGold", "Nicht genug Gold"));
      return;
    }

    setPurchasing(itemId);
    try {
      const { data, error } = await supabase.functions.invoke("spend-gold", {
        body: { userId: user.id, amount: price, itemType: "avatar_item", itemId },
      });
      if (error || !data?.success) {
        toast.error(data?.error?.message ?? t("common.error"));
      } else {
        playGoldDrop();
        toast.success(t("avatar.purchased", "{{name}} gekauft!", { name: item.name }));
        queryClient.invalidateQueries({ queryKey: ["child-avatar", user.id] });
        queryClient.invalidateQueries({ queryKey: ["gamification"] });
        queryClient.invalidateQueries({ queryKey: ["owned-avatar-items"] });
      }
    } catch {
      toast.error(t("common.error"));
    }
    setPurchasing(null);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {/* Avatar preview */}
      <motion.div variants={slideUp} className="bg-card rounded-xl p-6 border border-border flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-extrabold text-primary-foreground mb-2">
          {user?.user_metadata?.name?.charAt(0) ?? "?"}
        </div>
        <span className="text-sm font-semibold text-foreground">
          {t("avatar.equippedCount", "{{count}} Items angelegt", { count: equippedItems.length })}
        </span>
      </motion.div>

      {/* Category tabs */}
      <Tabs defaultValue={categories[0] ?? "accessory"} className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="text-xs capitalize">{cat}</TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-3">
            <div className="grid grid-cols-3 gap-2">
              {allItems.filter(i => i.category === cat).map(item => {
                const owned = equippedItems.includes(item.id);
                const locked = item.required_level > currentLevel;
                const isPurchasing = purchasing === item.id;

                return (
                  <motion.button
                    key={item.id}
                    variants={slideUp}
                    onClick={() => !locked && !isPurchasing && handleItemClick(item.id)}
                    disabled={locked || isPurchasing}
                    className={`relative bg-card rounded-lg p-3 border text-center transition-all ${
                      owned ? "border-primary ring-2 ring-primary/30" : locked ? "border-border opacity-50" : "border-border hover:border-primary"
                    }`}
                  >
                    {owned && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                    {locked && (
                      <div className="absolute top-1 right-1">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-2xl">{item.icon === "shirt" ? "👕" : "✨"}</span>
                    <p className="text-[10px] font-medium text-foreground mt-1 line-clamp-1">{item.name}</p>
                    {locked && (
                      <p className="text-[8px] text-muted-foreground">Lv. {item.required_level}</p>
                    )}
                    {!owned && !locked && item.gold_price && (
                      <div className="flex items-center justify-center gap-0.5 mt-0.5">
                        <Coins className="w-2.5 h-2.5 text-gold" />
                        <span className="text-[9px] font-bold text-accent">{item.gold_price}</span>
                      </div>
                    )}
                    {isPurchasing && (
                      <p className="text-[8px] text-muted-foreground">{t("common.loading")}</p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}