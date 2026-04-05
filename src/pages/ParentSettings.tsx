import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { useTimeBlocks } from "@/hooks/useTimeBlocks";
import { useRoutines } from "@/hooks/useRoutines";
import { useSubscription } from "@/hooks/useSubscription";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MEMBER_LIMITS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import NudgeConfig from "@/components/nudges/NudgeConfig";
import GrandparentLinks from "@/components/settings/GrandparentLinks";
import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";
import {
  Users, Clock, RotateCcw, Plus, Trash2, Baby, User, UserCheck, Shield, Bell, CreditCard, Link2, UserPlus, KeyRound, Globe
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import i18n from "@/i18n";
import AvatarPicker, { UserAvatar } from "@/components/settings/AvatarPicker";

export default function ParentSettings() {
  const { t } = useTranslation();
  const { members, familyId, isAdmin, isLoading: famLoading } = useFamily();
  const { timeBlocks, createTimeBlock, deleteTimeBlock, isLoading: blocksLoading } = useTimeBlocks();
  const { routines, createRoutine, deleteRoutine, isLoading: routinesLoading } = useRoutines();
  const { tier } = useSubscription();

  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const isLoading = famLoading || blocksLoading || routinesLoading;

  const showAdminTabs = isAdmin;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-bold text-foreground">{t("nav.settings")}</h1>
      </motion.div>

      {isLoading ? (
        <SkeletonLoader type="card" count={3} />
      ) : (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="profile" className="flex-1 gap-1"><User className="w-4 h-4" /> {t("settings.profileTab")}</TabsTrigger>
            <TabsTrigger value="family" className="flex-1 gap-1"><Users className="w-4 h-4" /> {t("settings.familyTab")}</TabsTrigger>
            {showAdminTabs && (
              <>
                <TabsTrigger value="timeblocks" className="flex-1 gap-1"><Clock className="w-4 h-4" /> {t("settings.timeBlocksTab")}</TabsTrigger>
                <TabsTrigger value="routines" className="flex-1 gap-1"><RotateCcw className="w-4 h-4" /> {t("settings.routinesTab")}</TabsTrigger>
                <TabsTrigger value="nudges" className="flex-1 gap-1"><Bell className="w-4 h-4" /> {t("settings.nudgesTab")}</TabsTrigger>
                <TabsTrigger value="sharing" className="flex-1 gap-1"><Link2 className="w-4 h-4" /> {t("settings.sharingTab")}</TabsTrigger>
              </>
            )}
            <TabsTrigger value="subscription" className="flex-1 gap-1"><CreditCard className="w-4 h-4" /> {t("settings.subscriptionTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <ProfileSection />
          </TabsContent>

          <TabsContent value="family" className="space-y-4 mt-4">
            <FamilyManagement
              members={members}
              familyId={familyId}
              isAdmin={isAdmin}
              memberLimit={MEMBER_LIMITS[tier as keyof typeof MEMBER_LIMITS] ?? 3}
            />
          </TabsContent>

          {showAdminTabs && (
            <>
              <TabsContent value="timeblocks" className="space-y-4 mt-4">
                <TimeBlockManagement
                  timeBlocks={timeBlocks}
                  members={members}
                  onCreateBlock={createTimeBlock.mutate}
                  onDeleteBlock={deleteTimeBlock.mutate}
                />
              </TabsContent>

              <TabsContent value="routines" className="space-y-4 mt-4">
                <RoutineManagement
                  routines={routines}
                  members={members}
                  onCreateRoutine={createRoutine.mutate}
                  onDeleteRoutine={deleteRoutine.mutate}
                />
              </TabsContent>

              <TabsContent value="nudges" className="space-y-4 mt-4">
                <NudgeConfig />
              </TabsContent>

              <TabsContent value="sharing" className="space-y-4 mt-4">
                <GrandparentLinks />
              </TabsContent>
            </>
          )}

          <TabsContent value="subscription" className="space-y-4 mt-4">
            <SubscriptionManagement />
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}

/* ── Profile Section ────────────────────────── */

function ProfileSection() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [showPwDialog, setShowPwDialog] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const currentLocale = profile?.locale ?? "de";

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name: name.trim() }).eq("id", user!.id);
    // Also sync family_members.name
    await supabase.from("family_members").update({ name: name.trim() }).eq("user_id", user!.id);
    setSaving(false);
    if (error) toast.error(t("common.error"));
    else {
      toast.success(t("settings.profileSaved"));
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["family-members"] });
      qc.invalidateQueries({ queryKey: ["family-member"] });
    }
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { toast.error(t("settings.passwordMismatch")); return; }
    if (newPw.length < 6) { toast.error("Min 6 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) toast.error(error.message);
    else {
      toast.success(t("settings.passwordChanged"));
      setShowPwDialog(false);
      setNewPw("");
      setConfirmPw("");
    }
  };

  const handleLanguage = async (locale: string) => {
    await supabase.from("profiles").update({ locale }).eq("id", user!.id);
    i18n.changeLanguage(locale);
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={slideUp} className="bg-card rounded-lg p-4 border border-border space-y-4">
        <h2 className="text-md font-extrabold text-foreground">{t("settings.editProfile")}</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAvatarPicker(true)} className="focus:outline-none group relative">
            <UserAvatar avatarUrl={profile?.avatar_url} name={profile?.name ?? "?"} className="h-16 w-16" />
            <span className="absolute inset-0 bg-foreground/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-primary-foreground text-xs font-medium">✎</span>
          </button>
          <Button variant="outline" size="sm" onClick={() => setShowAvatarPicker(true)}>
            {t("avatar.changeAvatar")}
          </Button>
        </div>
        <div>
          <Label>{t("common.name")}</Label>
          <div className="flex gap-2 mt-1">
            <Input value={name} onChange={e => setName(e.target.value)} />
            <Button onClick={handleSaveName} disabled={saving || name.trim() === profile?.name} size="sm" className="rounded-full">
              {t("common.save")}
            </Button>
          </div>
        </div>
        <div>
          <Label>{t("auth.email")}</Label>
          <Input value={user?.email ?? ""} disabled className="mt-1 opacity-60" />
        </div>
        <Button variant="ghost" onClick={() => setShowPwDialog(true)} className="gap-1.5 text-muted-foreground hover:text-foreground px-0">
          <KeyRound className="w-4 h-4" /> {t("settings.changePassword")}
        </Button>
      </motion.div>

      <motion.div variants={slideUp} className="bg-card rounded-lg p-4 border border-border space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-md font-extrabold text-foreground">{t("settings.language")}</h2>
        </div>
        <div
          className="inline-flex rounded-full p-[3px]"
          style={{ background: "#F3F0EB" }}
        >
          <button
            onClick={() => handleLanguage("de")}
            className="h-9 w-[100px] rounded-full text-xs transition-all"
            style={
              currentLocale === "de"
                ? { background: "white", color: "#2D3A32", fontWeight: 600, boxShadow: "0 1px 3px rgba(45,58,50,0.1)" }
                : { background: "transparent", color: "#6B7B72", fontWeight: 400 }
            }
          >
            Deutsch
          </button>
          <button
            onClick={() => handleLanguage("en")}
            className="h-9 w-[100px] rounded-full text-xs transition-all"
            style={
              currentLocale === "en"
                ? { background: "white", color: "#2D3A32", fontWeight: 600, boxShadow: "0 1px 3px rgba(45,58,50,0.1)" }
                : { background: "transparent", color: "#6B7B72", fontWeight: 400 }
            }
          >
            English
          </button>
        </div>
      </motion.div>

      <Dialog open={showPwDialog} onOpenChange={setShowPwDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("settings.changePassword")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t("settings.newPassword")}</Label>
              <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
            </div>
            <div>
              <Label>{t("settings.confirmPassword")}</Label>
              <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword} disabled={!newPw || !confirmPw}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AvatarPicker open={showAvatarPicker} onOpenChange={setShowAvatarPicker} />
    </motion.div>
  );
}

/* ── Family Management ────────────────────────── */

function FamilyManagement({ members, familyId, isAdmin, memberLimit }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddBaby, setShowAddBaby] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<any>(null);

  // Invite adult
  const [inviteToken, setInviteToken] = useState("");
  const handleInvite = async () => {
    const { data, error } = await supabase
      .from("family_invites")
      .insert({ family_id: familyId, created_by: user!.id })
      .select()
      .single();
    if (error) { toast.error(t("common.error")); return; }
    const link = `${window.location.origin}/signup?invite=${data.token}`;
    setInviteToken(link);
    try { await navigator.clipboard.writeText(link); toast.success(t("grandparent.linkCopied")); } catch {}
  };

  // Add baby
  const [babyName, setBabyName] = useState("");
  const handleAddBaby = async () => {
    if (!babyName.trim()) return;
    const colors = ["#4E6E5D", "#C67B5C", "#D4943A", "#5B8A9B", "#7C4DFF", "#FF6B35"];
    const { error } = await supabase.from("family_members").insert({
      family_id: familyId,
      name: babyName.trim(),
      role: "baby",
      managed_by_user_id: user!.id,
      color: colors[members.length % colors.length],
    });
    if (error) toast.error(t("settings.addError"));
    else {
      toast.success(t("settings.memberAdded", { name: babyName.trim() }));
      setBabyName("");
      setShowAddBaby(false);
      qc.invalidateQueries({ queryKey: ["family-members"] });
    }
  };

  // Remove member
  const handleRemove = async () => {
    if (!removeTarget) return;
    const { error } = await supabase.from("family_members").delete().eq("id", removeTarget.id);
    if (error) toast.error(t("common.error"));
    else {
      toast.success(t("settings.memberRemoved", { name: removeTarget.name }));
      qc.invalidateQueries({ queryKey: ["family-members"] });
    }
    setRemoveTarget(null);
  };

  const canRemove = (m: any) => isAdmin && m.user_id !== user?.id && !m.is_admin;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-extrabold text-foreground">
          {t("settings.members")} ({members.length}/{memberLimit})
        </h2>
      </div>

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowInvite(true)} className="gap-1">
            <UserPlus className="w-3 h-3" /> {t("settings.inviteAdult")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowAddChild(true)} className="gap-1">
            <User className="w-3 h-3" /> {t("settings.addChild")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowAddBaby(true)} className="gap-1">
            <Baby className="w-3 h-3" /> {t("settings.addBaby")}
          </Button>
        </div>
      )}

      {members.map((m: any) => {
        const displayName = m.display_name || m.name;
        const isSelf = m.user_id === user?.id;
        const roleKey = m.role as "adult" | "child" | "baby";
        const roleStyles: Record<string, { bg: string; color: string }> = {
          adult: { bg: "#F3F0EB", color: "#6B7B72" },
          child: { bg: "#EEF2EE", color: "#5B7A6B" },
          baby: { bg: "rgba(198,123,92,0.12)", color: "#A65F3F" },
        };
        const rs = roleStyles[roleKey] ?? roleStyles.child;

        return (
          <motion.div
            key={m.id}
            variants={slideUp}
            className="flex items-center gap-4 rounded-xl p-4 border"
            style={{ background: "#FEFEFB", borderColor: "rgba(45,58,50,0.08)" }}
          >
            <UserAvatar avatarUrl={m.avatar_url} name={displayName} color={m.color} className="h-12 w-12 text-base" />
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="text-md font-semibold text-foreground truncate">{displayName}</span>
              <span
                className="inline-flex items-center self-start h-[22px] px-2 rounded-full"
                style={{
                  background: rs.bg,
                  color: rs.color,
                  fontSize: "12px",
                  fontWeight: roleKey === "adult" ? 500 : 600,
                }}
              >
                {t(`settings.role${m.role.charAt(0).toUpperCase() + m.role.slice(1)}`)}
                {m.is_admin && <Shield className="w-3 h-3 ml-1" />}
              </span>
            </div>
            {canRemove(m) && (
              <button
                onClick={() => setRemoveTarget(m)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
              >
                <Trash2 className="w-5 h-5" style={{ color: "#C25B4E" }} />
              </button>
            )}
          </motion.div>
        );
      })}

      {/* Invite Adult Dialog */}
      <Dialog open={showInvite} onOpenChange={v => { setShowInvite(v); if (!v) setInviteToken(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("settings.inviteAdult")}</DialogTitle></DialogHeader>
          {inviteToken ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{t("grandparent.linkCopied")}</p>
              <Input value={inviteToken} readOnly className="text-xs" onClick={e => (e.target as HTMLInputElement).select()} />
              <Button variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText(inviteToken); toast.success(t("grandparent.linkCopied")); }}>
                {t("grandparent.linkCopied")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Generate a shareable invite link for another adult to join your family.
              </p>
              <Button onClick={handleInvite} className="w-full">{t("settings.inviteAdult")}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Child Dialog */}
      <AddChildDialog open={showAddChild} onOpenChange={setShowAddChild} familyId={familyId} membersCount={members.length} />

      {/* Add Baby Dialog */}
      <Dialog open={showAddBaby} onOpenChange={setShowAddBaby}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("settings.addBaby")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("common.name")}</Label>
              <Input value={babyName} onChange={e => setBabyName(e.target.value)} placeholder={t("common.name")} />
            </div>
            <Button onClick={handleAddBaby} className="w-full" disabled={!babyName.trim()}>{t("settings.addBaby")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("settings.removeMember")}</DialogTitle>
            <DialogDescription>
              {t("settings.removeConfirm", { name: removeTarget?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleRemove}>{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ── Add Child Dialog ────────────────────────── */

function AddChildDialog({ open, onOpenChange, familyId, membersCount }: { open: boolean; onOpenChange: (v: boolean) => void; familyId: string | null; membersCount: number }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCreate = async () => {
    const trimmedName = name.trim();
    const normalizedUsername = username.trim().toLowerCase();

    if (!trimmedName || !normalizedUsername || pin.length !== 4 || !familyId || !user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("child-auth", {
        body: {
          action: "create",
          familyId,
          name: trimmedName,
          username: normalizedUsername,
          pin,
          managedBy: user.id,
        },
      });

      if (error) {
        const response = (error as { context?: Response }).context;
        if (response instanceof Response) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error?.message ?? payload?.error ?? error.message);
        }
        throw error;
      }

      if (data?.error) throw new Error(data.error);

      setResult(t("settings.childCreated", { username: data?.username ?? normalizedUsername, pin }));
      qc.invalidateQueries({ queryKey: ["family-members"] });
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    }
    setLoading(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setName(""); setUsername(""); setPin(""); setResult(null);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{t("settings.addChild")}</DialogTitle></DialogHeader>
        {result ? (
          <div className="space-y-3">
            <p className="text-sm text-foreground">{result}</p>
            <Button className="w-full" onClick={() => handleClose(false)}>{t("common.close")}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>{t("common.name")}</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Max" />
            </div>
            <div>
              <Label>{t("settings.childUsername")}</Label>
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="max123" />
            </div>
            <div>
              <Label>{t("settings.childPin")}</Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
              />
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={loading || !name.trim() || !username.trim() || pin.length !== 4}>
              {loading ? t("common.loading") : t("settings.addChild")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Time Block Management ────────────────────────── */

function TimeBlockManagement({ timeBlocks, members, onCreateBlock, onDeleteBlock }: any) {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"school" | "work" | "nap" | "unavailable">("school");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("13:00");
  const [userId, setUserId] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

  const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const dayValues = [1, 2, 3, 4, 5, 6, 7];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-extrabold text-foreground">{t("settings.timeBlocks")}</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1">
          <Plus className="w-3 h-3" /> {t("common.create")}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground" style={{ marginBottom: "16px" }}>
        Zeitblöcke zeigen im Kalender, wann Familienmitglieder nicht verfügbar sind.
      </p>

      {timeBlocks.length === 0 && (
        <EmptyState icon={Clock} title={t("settings.timeBlockEmpty")} body={t("settings.timeBlockEmptyBody")} />
      )}

      {timeBlocks.map((block: any) => (
        <motion.div key={block.id} variants={slideUp} className="bg-card rounded-lg p-3 border border-border flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-foreground">{block.label || block.type}</span>
            <div className="text-xs text-muted-foreground">{block.start_time} – {block.end_time}</div>
          </div>
          <Button size="icon" variant="ghost" onClick={() => onDeleteBlock(block.id)}>
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </motion.div>
      ))}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("settings.createTimeBlock")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("settings.blockLabel")}</Label>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder={t("settings.blockLabel")} />
            </div>
            <div>
              <Label>{t("settings.blockType")}</Label>
              <Select value={type} onValueChange={v => setType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">{t("settings.blockTypeSchool")}</SelectItem>
                  <SelectItem value="work">{t("settings.blockTypeWork")}</SelectItem>
                  <SelectItem value="nap">{t("settings.blockTypeNap")}</SelectItem>
                  <SelectItem value="unavailable">{t("settings.blockTypeUnavailable")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("settings.blockPerson")}</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger><SelectValue placeholder={t("settings.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {members.filter((m: any) => m.user_id || m.id).map((m: any) => (
                    <SelectItem key={m.id} value={m.user_id || m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("settings.blockFrom")}</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
              <div><Label>{t("settings.blockTo")}</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
            </div>
            <div>
              <Label>{t("settings.blockWeekdays")}</Label>
              <div className="flex gap-1 mt-1">
                {dayLabels.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setWeekdays(prev =>
                      prev.includes(dayValues[i]) ? prev.filter(x => x !== dayValues[i]) : [...prev, dayValues[i]]
                    )}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      weekdays.includes(dayValues[i]) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => {
                onCreateBlock({ label, type, start_time: startTime, end_time: endTime, user_id: userId || null, weekdays });
                setShowAdd(false);
              }}
              className="w-full"
            >
              {t("common.create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ── Routine Management ────────────────────────── */

function RoutineManagement({ routines, members, onCreateRoutine, onDeleteRoutine }: any) {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [flowMode, setFlowMode] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState("weekly");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [scheduledTime, setScheduledTime] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

  const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const dayValues = [1, 2, 3, 4, 5, 6, 7];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-extrabold text-foreground">{t("settings.routines")}</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1">
          <Plus className="w-3 h-3" /> {t("common.create")}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground" style={{ marginBottom: "16px" }}>
        Routinen erstellen automatisch wiederkehrende Aufgaben für deine Familie.
      </p>

      {routines.length === 0 && (
        <EmptyState icon={RotateCcw} title={t("settings.routineEmpty")} body={t("settings.routineEmptyBody")} />
      )}

      {routines.map((r: any) => (
        <motion.div key={r.id} variants={slideUp} className="bg-card rounded-lg p-3 border border-border flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-foreground">{r.title}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {r.flow_mode && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">Flow</span>}
              {r.scheduled_time && <span className="text-[10px] text-muted-foreground">{r.scheduled_time?.slice(0, 5)}</span>}
              <span className="text-[10px] text-muted-foreground capitalize">{r.recurrence_type}</span>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={() => onDeleteRoutine(r.id)}>
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </motion.div>
      ))}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("settings.createRoutine")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("task.title")}</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t("settings.createRoutine")} />
            </div>
            <div>
              <Label>{t("settings.routineAssignee")}</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue placeholder={t("settings.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {members.filter((m: any) => m.user_id || m.id).map((m: any) => (
                    <SelectItem key={m.id} value={m.user_id || m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("settings.routineFrequency")}</Label>
              <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("settings.routineDaily")}</SelectItem>
                  <SelectItem value="weekly">{t("settings.routineWeekly")}</SelectItem>
                  <SelectItem value="monthly">{t("settings.routineMonthly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recurrenceType === "weekly" && (
              <>
                <div>
                  <Label>{t("settings.blockWeekdays")}</Label>
                  <div className="flex gap-1 mt-1">
                    {dayLabels.map((d, i) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setWeekdays(prev =>
                          prev.includes(dayValues[i]) ? prev.filter(x => x !== dayValues[i]) : [...prev, dayValues[i]]
                        )}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          weekdays.includes(dayValues[i]) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label>{t("settings.routineInterval")}</Label>
                  <Input type="number" min={1} max={12} value={recurrenceInterval} onChange={e => setRecurrenceInterval(Number(e.target.value))} className="w-16" />
                  <span className="text-xs text-muted-foreground">{t("settings.routineIntervalWeeks")}</span>
                </div>
              </>
            )}
            <div>
              <Label>{t("settings.routineTime")}</Label>
              <Input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="flowMode">{t("settings.routineFlowMode")}</Label>
              <Switch id="flowMode" checked={flowMode} onCheckedChange={setFlowMode} />
            </div>
            <Button
              onClick={() => {
                onCreateRoutine({
                  title,
                  assigned_to_user_id: assignee || null,
                  flow_mode: flowMode,
                  recurrence_type: recurrenceType,
                  recurrence_interval: recurrenceInterval,
                  scheduled_time: scheduledTime || null,
                  weekdays,
                });
                setShowAdd(false);
                setTitle("");
              }}
              className="w-full"
              disabled={!title.trim()}
            >
              {t("common.create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
