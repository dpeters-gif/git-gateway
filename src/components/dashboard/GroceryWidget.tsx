import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShoppingList } from "@/hooks/useShoppingList";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function GroceryWidget() {
  const { t } = useTranslation();
  const { items, addItem, toggleItem, isLoading } = useShoppingList();
  const [newItem, setNewItem] = useState("");

  const unchecked = items.filter((i) => !i.checked);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    addItem.mutate(newItem.trim());
    setNewItem("");
  };

  if (isLoading) return null;

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-accent" />
          <h2 className="text-md font-extrabold text-foreground">
            {t("home.groceryList")}
          </h2>
        </div>
        <Link to="/shopping" className="text-xs text-primary hover:underline">
          {t("home.toList")}
        </Link>
      </div>

      {unchecked.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("shopping.emptyTitle")}
        </p>
      ) : (
        <div className="space-y-1.5 mb-3">
          {unchecked.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                checked={false}
                onCheckedChange={() =>
                  toggleItem.mutate({ id: item.id, checked: true })
                }
                className="shrink-0"
              />
              <span className="text-xs text-foreground truncate">
                {item.name}
              </span>
            </div>
          ))}
          {unchecked.length > 5 && (
            <span className="text-[10px] text-muted-foreground">
              +{unchecked.length - 5} more
            </span>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={t("shopping.addPlaceholder")}
          className="h-8 text-xs"
        />
      </form>
    </div>
  );
}
