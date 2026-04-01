import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, slideUp, popIn } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { STREAK_FREEZE_COST } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Coins, Snowflake, Shirt, ShoppingBag, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { playGoldDrop } from "@/services/soundEngine";

interface ShopItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  type: "streak_freeze" | "avatar_item";
  description: string;
  locked?: boolean;
  lockReason?: string;
}

export default function GoldShop() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { gold, currentLevel } = useGamification();
  const queryClient = useQueryClient();
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const { data: avatarItems = [] } = useQuery({
    queryKey: ["avatar-items-shop"],
    queryFn: async () => {
      const { data } = await supabase
        .from("avatar_items")
        .select("*")
        .order("required_level", { ascending: true });
      return data ?? [];
    },
  });

  const { data: ownedItems = [] } = useQuery({
    queryKey: ["owned-avatar-items", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("child_avatars")
        .select("equipped_items")
        .eq("user_id", user!.id)
        .maybeSingle();
      return (data?.equipped_items as string[]) ?? [];
    },
    enabled: !!user,
  });

  const { data: freezeCount = 0 } = useQuery({
    queryKey: ["streak-freezes", user?.id],
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

  const shopItems: ShopItem[] = [
    {
      id: "streak_freeze",
      name: "Streak Freeze",
      icon: <Snowflake className="w-6 h-6 text-info" />,
      price: STREAK_FREEZE_COST,
      type: "streak_freeze",
      description: t("gamification.streakProtected"),
    },
    ...avatarItems
      .filter(item => !ownedItems.includes(item.id))
      .map(item => ({
        id: item.id,
        name: item.name,
        icon: <Shirt className="w-6 h-6 text-accent" />,
        price: item.gold_price ?? 20,
        type: "avatar_item" as const,
        description: item.description ?? "",
        locked: item.required_level > currentLevel,
        lockReason: item.required_level > currentLevel ? `Level ${item.required_level}` : undefined,
      })),
  ];

  const handlePurchase = async (item: ShopItem) => {
    if (gold < item.price) {
      toast.error(t("gamification.insufficientGold", "Nicht genug Gold"));
      return;
    }
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke("spend-gold", {
        body: {
          userId: user?.id,
          amount: item.price,
          itemType: item.type,
          itemId: item.type === "avatar_item" ? item.id : undefined,
        },
      });
      if (error || !data?.success) {
        toast.error(data?.error?.message ?? "Kauf fehlgeschlagen");
      } else {
        playGoldDrop();
        toast.success(`${item.name} gekauft!`);
        queryClient.invalidateQueries({ queryKey: ["gamification"] });
        queryClient.invalidateQueries({ queryKey: ["owned-avatar-items"] });
        queryClient.invalidateQueries({ queryKey: ["streak-freezes"] });
      }
    } catch {
      toast.error("Kauf fehlgeschlagen");
    }
    setPurchasing(false);
    setConfirmItem(null);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {/* Gold balance header */}
      <motion.div variants={slideUp} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Gold Shop</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-accent-light px-3 py-1.5 rounded-full">
          <Coins className="w-4 h-4 text-gold" />
          <span className="text-sm font-extrabold text-accent tabular-nums">{gold}</span>
        </div>
      </motion.div>

      {/* Streak freeze count */}
      {freezeCount > 0 && (
        <motion.div variants={slideUp} className="bg-info-light rounded-lg p-3 flex items-center gap-2">
          <Snowflake className="w-4 h-4 text-info" />
          <span className="text-xs text-info font-medium">{freezeCount}× Streak Freeze verfügbar</span>
        </motion.div>
      )}

      {/* Shop items grid */}
      <motion.div variants={slideUp} className="grid grid-cols-2 gap-3">
        {shopItems.map(item => (
          <motion.button
            key={item.id}
            variants={slideUp}
            onClick={() => !item.locked && setConfirmItem(item)}
            disabled={item.locked}
            className={`bg-card rounded-xl p-4 border border-border text-left transition-colors relative ${
              item.locked ? "opacity-60" : "hover:border-primary active:scale-[0.98]"
            }`}
          >
            {item.locked && (
              <div className="absolute top-2 right-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
            <div className="mb-2">{item.icon}</div>
            <h3 className="text-xs font-semibold text-foreground line-clamp-1">{item.name}</h3>
            {item.lockReason && (
              <p className="text-[10px] text-muted-foreground">{item.lockReason}</p>
            )}
            <div className="flex items-center gap-1 mt-2">
              <Coins className="w-3 h-3 text-gold" />
              <span className="text-xs font-bold text-accent">{item.price}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Purchase confirmation */}
      <Dialog open={!!confirmItem} onOpenChange={() => setConfirmItem(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>{confirmItem?.name}</DialogTitle>
            <DialogDescription>{confirmItem?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 py-4">
            <Coins className="w-5 h-5 text-gold" />
            <span className="text-xl font-extrabold text-accent">{confirmItem?.price}</span>
          </div>
          {gold < (confirmItem?.price ?? 0) && (
            <p className="text-xs text-error text-center">Nicht genug Gold ({gold}/{confirmItem?.price})</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmItem(null)}>{t("common.cancel")}</Button>
            <Button
              onClick={() => confirmItem && handlePurchase(confirmItem)}
              disabled={purchasing || gold < (confirmItem?.price ?? 0)}
            >
              {purchasing ? t("common.loading") : t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
