import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useFamily } from "@/hooks/useFamily";
import { useSubscription } from "@/hooks/useSubscription";
import { TIERS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UpgradePrompt from "@/components/subscription/UpgradePrompt";
import EmptyState from "@/components/shared/EmptyState";
import { Link2, Plus, Trash2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function GrandparentLinks() {
  const { t } = useTranslation();
  const { familyId, members } = useFamily();
  const { canUseFeature } = useSubscription();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("7");

  if (!canUseFeature(TIERS.FAMILY)) {
    return <UpgradePrompt feature="calendarSync" requiredTier="family" />;
  }

  const { data: links = [] } = useQuery({
    queryKey: ["caregiver-links", familyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("caregiver_links")
        .select("*")
        .eq("family_id", familyId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!familyId,
  });

  const handleCreate = async () => {
    if (!name.trim() || !familyId) return;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiry));

    const { error } = await supabase.from("caregiver_links").insert({
      family_id: familyId,
      name: name.trim(),
      expires_at: expiresAt.toISOString(),
      visible_member_ids: members.map((m: any) => m.user_id).filter(Boolean),
    });

    if (error) toast.error(t("common.error"));
    else {
      toast.success(t("grandparent.linkCreated", "Link erstellt"));
      qc.invalidateQueries({ queryKey: ["caregiver-links"] });
      setShowCreate(false);
      setName("");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("caregiver_links").delete().eq("id", id);
    if (!error) {
      toast.success(t("grandparent.linkRevoked", "Link widerrufen"));
      qc.invalidateQueries({ queryKey: ["caregiver-links"] });
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/share?token=${token}`;
    navigator.clipboard.writeText(url);
    toast.success(t("grandparent.linkCopied", "Link kopiert"));
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t("grandparent.shareLinks", "Freigabelinks")}</h2>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)} className="gap-1">
          <Plus className="w-3 h-3" /> {t("grandparent.createLink", "Link erstellen")}
        </Button>
      </div>

      {links.length === 0 && (
        <EmptyState
          icon={Link2}
          title={t("grandparent.emptyTitle", "Keine Freigabelinks")}
          body={t("grandparent.emptyBody", "Erstelle einen Link für Großeltern oder Betreuer")}
        />
      )}

      {links.map((link: any) => {
        const isExpired = new Date(link.expires_at) < new Date();
        return (
          <motion.div key={link.id} variants={slideUp} className={`bg-card rounded-lg p-3 border border-border ${isExpired ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">{link.name}</span>
                <div className="text-xs text-muted-foreground">
                  {isExpired
                    ? t("grandparent.expiredLabel", "Abgelaufen")
                    : t("grandparent.expiresAt", { date: format(new Date(link.expires_at), "dd.MM.yyyy") })}
                </div>
              </div>
              <div className="flex gap-1">
                {!isExpired && (
                  <Button size="icon" variant="ghost" onClick={() => copyLink(link.token)}>
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => handleDelete(link.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("grandparent.createLinkTitle", "Freigabelink erstellen")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("grandparent.linkLabel", "Bezeichnung")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("grandparent.linkPlaceholder", "z.B. Oma Helga")} />
            </div>
            <div>
              <Label>{t("grandparent.expiryLabel", "Gültigkeitsdauer")}</Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 {t("grandparent.day", "Tag")}</SelectItem>
                  <SelectItem value="7">7 {t("grandparent.days", "Tage")}</SelectItem>
                  <SelectItem value="30">30 {t("grandparent.days", "Tage")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={!name.trim()}>
              {t("grandparent.createLink", "Link erstellen")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
