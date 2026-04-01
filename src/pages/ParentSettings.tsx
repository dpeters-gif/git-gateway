import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MEMBER_LIMITS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import NudgeConfig from "@/components/nudges/NudgeConfig";
import {
  Users, Clock, RotateCcw, Plus, Trash2, Baby, User, UserCheck, Shield, Bell
} from "lucide-react";
import { toast } from "sonner";

export default function ParentSettings() {
  const { t } = useTranslation();
  const { members, familyId, isAdmin, isLoading: famLoading } = useFamily();
  const { timeBlocks, createTimeBlock, deleteTimeBlock, isLoading: blocksLoading } = useTimeBlocks();
  const { routines, createRoutine, deleteRoutine, isLoading: routinesLoading } = useRoutines();
  const { tier } = useSubscription();

  const isLoading = famLoading || blocksLoading || routinesLoading;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-4 space-y-4">
      <motion.div variants={slideUp}>
        <h1 className="text-xl font-extrabold text-foreground">{t("nav.settings")}</h1>
      </motion.div>

      {isLoading ? (
        <SkeletonLoader type="card" count={3} />
      ) : (
        <Tabs defaultValue="family" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="family" className="flex-1 gap-1"><Users className="w-4 h-4" /> {t("settings.familyTab")}</TabsTrigger>
            <TabsTrigger value="timeblocks" className="flex-1 gap-1"><Clock className="w-4 h-4" /> {t("settings.timeBlocksTab")}</TabsTrigger>
            <TabsTrigger value="routines" className="flex-1 gap-1"><RotateCcw className="w-4 h-4" /> {t("settings.routinesTab")}</TabsTrigger>
            <TabsTrigger value="nudges" className="flex-1 gap-1"><Bell className="w-4 h-4" /> {t("settings.nudgesTab", "Nudges")}</TabsTrigger>
          </TabsList>

          <TabsContent value="family" className="space-y-4 mt-4">
            <FamilyManagement
              members={members}
              familyId={familyId}
              isAdmin={isAdmin}
              memberLimit={MEMBER_LIMITS[tier as keyof typeof MEMBER_LIMITS] ?? 3}
            />
          </TabsContent>

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
        </Tabs>
      )}
    </motion.div>
  );
}

function FamilyManagement({ members, familyId, isAdmin, memberLimit }: any) {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"adult" | "child" | "baby">("child");

  const handleAdd = async () => {
    if (!name.trim() || !familyId) return;
    if (members.length >= memberLimit) {
      toast.error(t("settings.memberLimitReached", { limit: memberLimit }));
      return;
    }
    const colors = ["#4E6E5D", "#C67B5C", "#D4943A", "#5B8A9B", "#7C4DFF", "#FF6B35"];
    const { error } = await supabase.from("family_members").insert({
      family_id: familyId,
      name: name.trim(),
      role,
      color: colors[members.length % colors.length],
    });
    if (error) toast.error(t("settings.addError"));
    else {
      toast.success(t("settings.memberAdded", { name: name.trim() }));
      setName("");
      setShowAdd(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {t("settings.members")} ({members.length}/{memberLimit})
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1">
          <Plus className="w-3 h-3" /> {t("settings.addMember")}
        </Button>
      </div>

      {members.map((m: any) => (
        <motion.div key={m.id} variants={slideUp} className="bg-card rounded-lg p-4 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ backgroundColor: m.color }}>
            {m.role === "baby" ? <Baby className="w-4 h-4" /> : m.name.charAt(0)}
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold text-foreground">{m.name}</span>
            <div className="flex items-center gap-1 mt-0.5">
              {m.role === "adult" && <UserCheck className="w-3 h-3 text-primary" />}
              {m.role === "child" && <User className="w-3 h-3 text-accent" />}
              {m.role === "baby" && <Baby className="w-3 h-3 text-secondary" />}
              <span className="text-[10px] text-muted-foreground capitalize">{t(`settings.role${m.role.charAt(0).toUpperCase() + m.role.slice(1)}`)}</span>
              {m.is_admin && <Shield className="w-3 h-3 text-primary ml-1" />}
            </div>
          </div>
        </motion.div>
      ))}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("settings.addMemberTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("common.name")}</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder={t("common.name")} />
            </div>
            <div>
              <Label>{t("settings.role")}</Label>
              <Select value={role} onValueChange={v => setRole(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">{t("settings.roleAdult")}</SelectItem>
                  <SelectItem value="child">{t("settings.roleChild")}</SelectItem>
                  <SelectItem value="baby">{t("settings.roleBaby")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="w-full" disabled={!name.trim()}>{t("settings.addMember")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

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
        <h2 className="text-sm font-semibold text-foreground">{t("settings.timeBlocks")}</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1">
          <Plus className="w-3 h-3" /> {t("settings.addMember")}
        </Button>
      </div>

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
                  {members.map((m: any) => (
                    <SelectItem key={m.id} value={m.user_id ?? m.id}>{m.name}</SelectItem>
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

function RoutineManagement({ routines, members, onCreateRoutine, onDeleteRoutine }: any) {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [flowMode, setFlowMode] = useState(false);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t("settings.routines")}</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1">
          <Plus className="w-3 h-3" /> {t("settings.addMember")}
        </Button>
      </div>

      {routines.length === 0 && (
        <EmptyState icon={RotateCcw} title={t("settings.routineEmpty")} body={t("settings.routineEmptyBody")} />
      )}

      {routines.map((r: any) => (
        <motion.div key={r.id} variants={slideUp} className="bg-card rounded-lg p-3 border border-border flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-foreground">{r.title}</span>
            {r.flow_mode && <span className="text-[10px] bg-accent-light text-accent px-1.5 py-0.5 rounded-full ml-2">Flow</span>}
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
                  {members.map((m: any) => (
                    <SelectItem key={m.id} value={m.user_id ?? m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="flowMode">{t("settings.routineFlowMode")}</Label>
              <Switch id="flowMode" checked={flowMode} onCheckedChange={setFlowMode} />
            </div>
            <Button
              onClick={() => {
                onCreateRoutine({ title, assigned_to_user_id: assignee || null, flow_mode: flowMode });
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
