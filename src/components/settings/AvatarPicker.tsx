import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  User, Cat, Dog, Star, Heart, Flower2, Rocket, Crown, Music, Palette, Sun, Moon,
  Bird, Fish, TreePine, Zap
} from "lucide-react";

const PRESET_AVATARS = [
  { icon: User, color: "hsl(var(--primary))", label: "User" },
  { icon: Cat, color: "#FF6B35", label: "Cat" },
  { icon: Dog, color: "#D4943A", label: "Dog" },
  { icon: Star, color: "#FFB020", label: "Star" },
  { icon: Heart, color: "#E040FB", label: "Heart" },
  { icon: Flower2, color: "#00BFA5", label: "Flower" },
  { icon: Rocket, color: "#5B8A9B", label: "Rocket" },
  { icon: Crown, color: "#FFD700", label: "Crown" },
  { icon: Music, color: "#7C4DFF", label: "Music" },
  { icon: Palette, color: "#4E6E5D", label: "Palette" },
  { icon: Sun, color: "#FF9800", label: "Sun" },
  { icon: Moon, color: "#3F51B5", label: "Moon" },
  { icon: Bird, color: "#009688", label: "Bird" },
  { icon: Fish, color: "#2196F3", label: "Fish" },
  { icon: TreePine, color: "#4CAF50", label: "Tree" },
  { icon: Zap, color: "#FFC107", label: "Zap" },
];

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AvatarPicker({ open, onOpenChange }: AvatarPickerProps) {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePreset = async (presetIndex: number) => {
    // Store preset as a special URL format: preset://<index>
    const url = `preset://${presetIndex}`;
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", user!.id);
    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("avatar.avatarChanged"));
      await refreshProfile();
      onOpenChange(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user!.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast.error(t("avatar.uploadError"));
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user!.id);

    setUploading(false);
    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("avatar.avatarChanged"));
      await refreshProfile();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("avatar.changeAvatar")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("avatar.presets")}</p>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_AVATARS.map((preset, i) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(i)}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  style={{ backgroundColor: preset.color }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </button>
              );
            })}
          </div>

          <div className="border-t border-border pt-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? t("common.loading") : t("avatar.uploadCustom")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Helper to render avatar for a user, handling preset:// URLs */
export function UserAvatar({ avatarUrl, name, color, className = "h-8 w-8" }: { avatarUrl?: string | null; name: string; color?: string; className?: string }) {
  if (avatarUrl?.startsWith("preset://")) {
    const idx = parseInt(avatarUrl.replace("preset://", ""), 10);
    const preset = PRESET_AVATARS[idx] ?? PRESET_AVATARS[0];
    const Icon = preset.icon;
    return (
      <div
        className={`rounded-full flex items-center justify-center ${className}`}
        style={{ backgroundColor: preset.color }}
      >
        <Icon className="w-1/2 h-1/2 text-white" />
      </div>
    );
  }

  return (
    <Avatar className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback
        className="text-xs text-primary-foreground"
        style={{ backgroundColor: color || "hsl(var(--primary))" }}
      >
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </AvatarFallback>
    </Avatar>
  );
}
