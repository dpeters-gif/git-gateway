import { useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, slideUp, fadeIn } from "@/lib/animations";
import { useShoppingList, type ShoppingItem } from "@/hooks/useShoppingList";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShoppingCart, Plus, Trash2, Milk, Apple, Beef, Croissant,
  Wine, Snowflake, Home, Package
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, any> = {
  dairy: Milk, produce: Apple, meat: Beef, bakery: Croissant,
  drinks: Wine, frozen: Snowflake, household: Home, other: Package,
};

const CATEGORY_ORDER = ["produce", "dairy", "meat", "bakery", "drinks", "frozen", "household", "other"];

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  de: { dairy: "Milchprodukte", produce: "Obst & Gemüse", meat: "Fleisch & Wurst", bakery: "Backwaren", drinks: "Getränke", frozen: "Tiefkühl", household: "Haushalt", other: "Sonstiges" },
  en: { dairy: "Dairy", produce: "Produce", meat: "Meat", bakery: "Bakery", drinks: "Drinks", frozen: "Frozen", household: "Household", other: "Other" },
};

export default function ShoppingList() {
  const { t, i18n } = useTranslation();
  const { items, isLoading, isError, refetch, addItem, toggleItem, clearChecked, history } = useShoppingList();
  const [newItem, setNewItem] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!newItem.trim()) return [];
    const lower = newItem.toLowerCase();
    return history.filter(h => h.toLowerCase().includes(lower) && h.toLowerCase() !== lower).slice(0, 5);
  }, [newItem, history]);

  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  const grouped = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    for (const item of unchecked) {
      const cat = item.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return CATEGORY_ORDER.filter(c => groups[c]).map(c => ({ category: c, items: groups[c] }));
  }, [unchecked]);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    addItem.mutate(newItem);
    setNewItem("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const lang = i18n.language.startsWith("de") ? "de" : "en";

  if (isError) return <ErrorState message={t("common.error")} onRetry={refetch} />;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          {t("shopping.title", "Einkaufsliste")}
        </h1>
      </motion.div>

      {/* Sticky add field */}
      <motion.div variants={slideUp} className="sticky top-0 z-10 bg-background pb-2">
        <div className="relative">
          <form onSubmit={e => { e.preventDefault(); handleAdd(); }} className="flex gap-2">
            <Input
              ref={inputRef}
              value={newItem}
              onChange={e => { setNewItem(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t("shopping.addPlaceholder", "Artikel hinzufügen…")}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newItem.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-12 mt-1 bg-card border border-border rounded-lg shadow-md z-20">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setNewItem(s); setShowSuggestions(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <SkeletonLoader type="list" count={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={t("shopping.emptyTitle", "Alles eingekauft! 🛒")}
          body={t("shopping.emptyBody", "Füge Artikel über das Feld oben hinzu.")}
        />
      ) : (
        <>
          {/* Grouped unchecked items */}
          {grouped.map(group => {
            const Icon = CATEGORY_ICONS[group.category] ?? Package;
            return (
              <motion.div key={group.category} variants={slideUp}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {CATEGORY_LABELS[lang]?.[group.category] ?? group.category}
                  </h2>
                </div>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <ShoppingItemRow key={item.id} item={item} onToggle={toggleItem.mutate} />
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Checked items */}
          {checked.length > 0 && (
            <motion.div variants={slideUp}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("shopping.checked", "Erledigt")} ({checked.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(t("shopping.clearConfirm", "Alle erledigten Einträge löschen?"))) {
                      clearChecked.mutate();
                    }
                  }}
                  className="text-xs text-muted-foreground gap-1"
                >
                  <Trash2 className="w-3 h-3" /> {t("shopping.clearChecked", "Erledigte löschen")}
                </Button>
              </div>
              <div className="space-y-1 opacity-60">
                {checked.map(item => (
                  <ShoppingItemRow key={item.id} item={item} onToggle={toggleItem.mutate} />
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

function ShoppingItemRow({ item, onToggle }: { item: ShoppingItem; onToggle: (p: { id: string; checked: boolean }) => void }) {
  const Icon = CATEGORY_ICONS[item.category] ?? Package;
  return (
    <motion.div
      layout
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 bg-card rounded-lg px-3 py-2.5 border border-border min-h-[44px]"
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={() => onToggle({ id: item.id, checked: !item.checked })}
        className="h-5 w-5"
      />
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className={`text-sm flex-1 ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
        {item.name}
      </span>
    </motion.div>
  );
}
