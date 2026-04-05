import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Plus, Sparkles, Coins, Swords, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ParentRewards() {
  const { t } = useTranslation();
  const { familyId, members } = useFamily();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"rewards" | "challenges">("rewards");

  const { data: rewards = [], isLoading: rLoading } = useQuery({
    queryKey: ["rewards", familyId],
    queryFn: async () => {
      const { data } = await supabase.from("rewards").select("*").eq("family_id", familyId!).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!familyId,
  });

  const { data: challenges = [], isLoading: cLoading } = useQuery({
    queryKey: ["challenges", familyId],
    queryFn: async () => {
      const { data } = await supabase.from("challenges").select("*, challenge_progress(*)").eq("family_id", familyId!).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!familyId,
  });

  const createReward = useMutation({
    mutationFn: async (r: any) => {
      const { error } = await supabase.from("rewards").insert({ ...r, family_id: familyId! });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rewards"] }); toast.success(t("rewards.created", "Belohnung erstellt")); },
  });

  const createChallenge = useMutation({
    mutationFn: async (c: any) => {
      const payload: any = { ...c, family_id: familyId! };
      if (c.type === "boss_battle") {
        payload.boss_hp = c.target_count * 10;
        payload.boss_current_hp = c.target_count * 10;
      }
      const { error } = await supabase.from("challenges").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["challenges"] }); toast.success(t("challenges.created", "Challenge erstellt")); },
  });

  const deleteReward = useMutation({
    mutationFn: async (id: string) => { await supabase.from("rewards").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rewards"] }),
  });

  const deleteChallenge = useMutation({
    mutationFn: async (id: string) => { await supabase.from("challenges").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });

  const isLoading = rLoading || cLoading;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
      <motion.div variants={slideUp} className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{t("nav.rewards")}</h1>
        <Button
          size="sm"
          onClick={() => setShowCreate(true)}
          className="gap-1 rounded-full"
        >
          <Plus className="w-3 h-3" />
          {tab === "rewards" ? t("rewards.create") : t("challenges.create", "Challenge erstellen")}
        </Button>
      </motion.div>

      <motion.div variants={slideUp} className="flex gap-2">
        <button
          onClick={() => setTab("rewards")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            tab === "rewards" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <Gift className="w-3 h-3 inline mr-1" /> {t("rewards.title")}
        </button>
        <button
          onClick={() => setTab("challenges")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            tab === "challenges" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <Swords className="w-3 h-3 inline mr-1" /> {t("challenges.title", "Challenges")}
        </button>
      </motion.div>

      {isLoading ? (
        <SkeletonLoader type="list" count={3} />
      ) : tab === "rewards" ? (
        rewards.length === 0 ? (
          <EmptyState
            icon={Gift}
            title={t("rewards.empty.heading", "Noch keine Belohnungen")}
            body={t("rewards.empty.body", "Füge Belohnungen hinzu, auf die eure Familie hinarbeiten kann.")}
            ctaLabel={t("rewards.empty.cta", "Belohnung erstellen")}
            onCta={() => setShowCreate(true)}
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
          >
            {rewards.map((r: any) => (
              <RewardCard key={r.id} reward={r} onDelete={() => deleteReward.mutate(r.id)} />
            ))}
          </motion.div>
        )
      ) : (
        challenges.length === 0 ? (
          <EmptyState
            icon={Swords}
            title={t("challenges.empty", "Noch keine Challenges")}
            body={t("challenges.emptyBody", "Erstelle eine Challenge für die Familie.")}
            ctaLabel={t("challenges.create", "Challenge erstellen")}
            onCta={() => setShowCreate(true)}
          />
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            {challenges.map((c: any) => (
              <ChallengeCard key={c.id} challenge={c} onDelete={() => deleteChallenge.mutate(c.id)} />
            ))}
          </motion.div>
        )
      )}

      <RewardChallengeDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        tab={tab}
        members={members}
        onCreateReward={(r: any) => createReward.mutate(r)}
        onCreateChallenge={(c: any) => createChallenge.mutate(c)}
      />
    </motion.div>
  );
}

function RewardCard({ reward, onDelete }: { reward: any; onDelete: () => void }) {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={slideUp}
      whileHover={{ boxShadow: "0 4px 12px rgba(45,58,50,0.08)" }}
      transition={{ duration: 0.2 }}
      className="relative rounded-2xl p-5 border"
      style={{
        background: "#FEFEFB",
        borderColor: "rgba(45,58,50,0.08)",
      }}
    >
      <button
        onClick={onDelete}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
      >
        <Trash2 className="w-4 h-4" style={{ color: "#C25B4E" }} />
      </button>

      <h3 className="text-md font-semibold text-foreground pr-10 line-clamp-2">
        {reward.title}
      </h3>

      <div className="flex items-center gap-2 mt-2">
        {reward.xp_threshold > 0 && (
          <span
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-bold"
            style={{
              background: "rgba(255,176,32,0.15)",
              border: "1px solid rgba(255,176,32,0.4)",
              color: "#B8860B",
            }}
          >
            <Sparkles className="w-3 h-3" /> {reward.xp_threshold} XP
          </span>
        )}
        {reward.gold_price > 0 && (
          <span
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-bold"
            style={{
              background: "rgba(212,148,58,0.12)",
              border: "1px solid rgba(212,148,58,0.4)",
              color: "#854F0B",
            }}
          >
            <Coins className="w-3 h-3" /> {reward.gold_price} Gold
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ChallengeCard({ challenge, onDelete }: { challenge: any; onDelete: () => void }) {
  const { t } = useTranslation();
  const currentCount = (challenge.challenge_progress ?? []).reduce(
    (sum: number, p: any) => sum + (p.count ?? 0),
    0
  );
  const target = challenge.target_count ?? 1;
  const pct = Math.min((currentCount / target) * 100, 100);
  const isActive = !challenge.is_completed;

  return (
    <motion.div
      variants={slideUp}
      whileHover={{ boxShadow: "0 4px 12px rgba(45,58,50,0.08)" }}
      transition={{ duration: 0.2 }}
      className="relative rounded-2xl p-5 border"
      style={{
        background: "#FEFEFB",
        borderColor: "rgba(45,58,50,0.08)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-md font-semibold text-foreground truncate">{challenge.title}</h3>
            <span className="text-xs text-muted-foreground shrink-0">
              {challenge.type === "boss_battle"
                ? t("challenges.bossBattle", "Boss-Kampf")
                : challenge.type === "individual"
                ? t("challenges.individual", "Individuell")
                : t("challenges.family", "Familie")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isActive && (
            <span
              className="inline-flex items-center h-[22px] px-2 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(0,191,165,0.12)",
                color: "#0F6E56",
                fontSize: "12px",
              }}
            >
              {t("rewards.active", "Aktiv")}
            </span>
          )}
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <Trash2 className="w-4 h-4" style={{ color: "#C25B4E" }} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(0,191,165,0.12)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "#00BFA5" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div>
            {challenge.end_date && (
              <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                bis {format(new Date(challenge.end_date), "dd.MM.")}
              </span>
            )}
          </div>
          <span className="text-xs font-bold" style={{ color: "#0F6E56" }}>
            {currentCount} / {target} {t("careShare.tasks", "Aufgaben")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function RewardChallengeDialog({ open, onOpenChange, tab, members, onCreateReward, onCreateChallenge }: any) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [xpThreshold, setXpThreshold] = useState(100);
  const [goldPrice, setGoldPrice] = useState(0);
  const [targetCount, setTargetCount] = useState(10);
  const [challengeType, setChallengeType] = useState<"individual" | "family" | "boss_battle">("family");

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (tab === "rewards") {
      onCreateReward({ title, xp_threshold: xpThreshold || null, gold_price: goldPrice || null });
    } else {
      onCreateChallenge({ title, type: challengeType, target_count: targetCount, reward_xp: 50, start_date: new Date().toISOString().split("T")[0] });
    }
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{tab === "rewards" ? t("rewards.create") : t("challenges.create", "Challenge erstellen")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label>{t("task.title")}</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t("task.title")} /></div>
          {tab === "rewards" ? (
            <>
              <div><Label>{t("rewards.xpThreshold")}</Label><Input type="number" value={xpThreshold} onChange={e => setXpThreshold(Number(e.target.value))} /></div>
              <div><Label>{t("rewards.goldPrice")}</Label><Input type="number" value={goldPrice} onChange={e => setGoldPrice(Number(e.target.value))} /></div>
            </>
          ) : (
            <>
              <div>
                <Label>{t("challenges.type", "Typ")}</Label>
                <Select value={challengeType} onValueChange={v => setChallengeType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">{t("challenges.individual", "Individuell")}</SelectItem>
                    <SelectItem value="family">{t("challenges.family", "Familie")}</SelectItem>
                    <SelectItem value="boss_battle">{t("challenges.bossBattle", "Boss-Kampf")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("challenges.target", "Ziel-Anzahl")}</Label><Input type="number" value={targetCount} onChange={e => setTargetCount(Number(e.target.value))} /></div>
              {challengeType === "boss_battle" && (
                <p className="text-xs text-muted-foreground">Boss HP = {targetCount * 10}</p>
              )}
            </>
          )}
          <Button onClick={handleSubmit} className="w-full" disabled={!title.trim()}>{t("common.create")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
