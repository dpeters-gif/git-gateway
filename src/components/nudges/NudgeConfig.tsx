import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { slideUp, staggerContainer } from "@/lib/animations";
import { useFamily } from "@/hooks/useFamily";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Plus, Trash2 } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

export default function NudgeConfig() {
  const { t } = useTranslation();
  const { familyId, members } = useFamily();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedChild, setSelectedChild] = useState("");
  const [times, setTimes] = useState<string[]>(["15:00"]);
  const [parentAlert, setParentAlert] = useState(false);
  const [quietStart, setQuietStart] = useState("21:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  const children = members.filter(m => m.role === "child");

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["nudge-rules", familyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("nudge_rules")
        .select("*")
        .eq("family_id", familyId!);
      return data ?? [];
    },
    enabled: !!familyId,
  });

  const createRule = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("nudge_rules").insert({
        family_id: familyId!,
        child_user_id: selectedChild,
        times,
        parent_alert: parentAlert,
        quiet_start: quietStart,
        quiet_end: quietEnd,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nudge-rules"] });
      setShowAdd(false);
      toast.success(t("nudge.created", "Erinnerung erstellt"));
    },
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await supabase.from("nudge_rules").update({ is_enabled: enabled }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nudge-rules"] }),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("nudge_rules").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nudge-rules"] });
      toast.success(t("nudge.deleted", "Erinnerung gelöscht"));
    },
  });

  const getChildName = (userId: string) => {
    return members.find(m => m.user_id === userId)?.name ?? "?";
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-extrabold text-foreground flex items-center gap-1.5">
          <Bell className="w-4 h-4" /> {t("nudge.title", "Erinnerungen")}
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1" disabled={children.length === 0}>
          <Plus className="w-3 h-3" /> {t("settings.addMember")}
        </Button>
      </div>

      {rules.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t("nudges.empty.heading", "Noch keine Erinnerungen")}
          body={t("nudges.empty.body", "Richte Erinnerungen ein, die zur richtigen Zeit anklopfen.")}
          ctaLabel={t("nudges.empty.cta", "Erinnerung erstellen")}
          onCta={() => setShowAdd(true)}
        />
      ) : (
        rules.map((rule: any) => (
          <motion.div key={rule.id} variants={slideUp} className="bg-card rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">{getChildName(rule.child_user_id)}</span>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {(rule.times as string[]).join(", ")}
                  {rule.parent_alert && ` · ${t("nudge.parentAlert", "Eltern-Alarm")}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={rule.is_enabled} onCheckedChange={v => toggleRule.mutate({ id: rule.id, enabled: v })} />
                <Button size="icon" variant="ghost" onClick={() => deleteRule.mutate(rule.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("nudge.create", "Erinnerung erstellen")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("nudge.child", "Kind")}</Label>
              <select
                value={selectedChild}
                onChange={e => setSelectedChild(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              >
                <option value="">{t("settings.selectPlaceholder")}</option>
                {children.map(c => (
                  <option key={c.id} value={c.user_id ?? c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t("nudge.times", "Zeiten")}</Label>
              {times.map((time, i) => (
                <div key={i} className="flex gap-2 mt-1">
                  <Input
                    type="time"
                    value={time}
                    onChange={e => {
                      const newTimes = [...times];
                      newTimes[i] = e.target.value;
                      setTimes(newTimes);
                    }}
                    className="flex-1"
                  />
                  {times.length > 1 && (
                    <Button size="icon" variant="ghost" onClick={() => setTimes(times.filter((_, j) => j !== i))}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
              {times.length < 3 && (
                <Button variant="link" size="sm" onClick={() => setTimes([...times, "18:00"])} className="mt-1">
                  + {t("nudge.addTime", "Zeit hinzufügen")}
                </Button>
              )}
            </div>
            <div>
              <Label>{t("nudge.quietHours", "Ruhezeiten")}</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} />
                <Input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label>{t("nudge.parentAlert", "Eltern-Alarm")}</Label>
              <Switch checked={parentAlert} onCheckedChange={setParentAlert} />
            </div>
            <Button
              onClick={() => createRule.mutate()}
              className="w-full"
              disabled={!selectedChild}
            >
              {t("common.create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
