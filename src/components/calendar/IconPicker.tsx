import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  CheckSquare, Calendar, Star, Heart, Home, Book, ShoppingCart, Utensils,
  Music, Palette, Bike, Dog, Shirt, Bath, Moon, Sun, Cloud, Leaf,
  Award, Target, Zap, Clock, MapPin, Phone, Camera, Gift, Smile, Coffee
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<any>> = {
  CheckSquare, Calendar, Star, Heart, Home, Book, ShoppingCart, Utensils,
  Music, Palette, Bike, Dog, Shirt, Bath, Moon, Sun, Cloud, Leaf,
  Award, Target, Zap, Clock, MapPin, Phone, Camera, Gift, Smile, Coffee,
};

const iconNames = Object.keys(ICONS);

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const SelectedIcon = ICONS[value] ?? CheckSquare;
  const filtered = search ? iconNames.filter(n => n.toLowerCase().includes(search.toLowerCase())) : iconNames;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <SelectedIcon className="w-5 h-5 text-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <Input
          placeholder="Icon suchen…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2"
          autoFocus
        />
        <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
          {filtered.map(name => {
            const Icon = ICONS[name];
            return (
              <button
                key={name}
                type="button"
                onClick={() => { onChange(name); setOpen(false); }}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${
                  value === name ? "bg-primary-light ring-1 ring-primary" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
