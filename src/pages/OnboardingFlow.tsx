import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { slideUp, slideInRight, staggerContainer, bounceIn } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, Users, Home, Clock, CheckSquare, Egg, Calendar } from "lucide-react";
import { toast } from "sonner";

const TOTAL_STEPS = 6;

const CREATURE_TYPES = ["forest_fox", "cloud_bunny", "star_owl", "river_otter", "moon_cat", "sun_bear"];

export default function OnboardingFlow() {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Form state
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState<{ name: string; role: "adult" | "child" | "baby" }[]>([]);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<"adult" | "child" | "baby">("child");
  const [schoolStart, setSchoolStart] = useState("08:00");
  const [schoolEnd, setSchoolEnd] = useState("13:00");
  const [hasSchool, setHasSchool] = useState(false);
  const [firstTaskTitle, setFirstTaskTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const TASK_SUGGESTIONS = [
    t("onboarding.suggestion1", "Zimmer aufräumen"),
    t("onboarding.suggestion2", "Zähne putzen"),
    t("onboarding.suggestion3", "Schulranzen packen"),
    t("onboarding.suggestion4", "Tisch decken"),
    t("onboarding.suggestion5", "Hausaufgaben machen"),
    t("onboarding.suggestion6", "Bett machen"),
  ];

  const canProceed = () => {
    switch (step) {
      case 1: return familyName.trim().length >= 2;
      default: return true;
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setCreating(true);
    try {
      // 1. Create family
      const { data: family, error: famErr } = await supabase
        .from("families")
        .insert({ name: familyName.trim() || t("onboarding.defaultFamily", "Meine Familie") })
        .select()
        .single();

      if (famErr || !family) throw new Error(t("onboarding.createError", "Familienerstellung fehlgeschlagen"));

      // 2. Add current user as admin
      await supabase.from("family_members").insert({
        family_id: family.id,
        user_id: user.id,
        name: user.user_metadata?.name ?? t("onboarding.parentDefault", "Elternteil"),
        role: "adult",
        is_admin: true,
        color: "#4E6E5D",
      });

      // 3. Add other members + create companion creatures for children
      const colors = ["#C67B5C", "#D4943A", "#5B8A9B", "#7C4DFF", "#FF6B35"];
      let childCreatureIndex = 0;
      for (let i = 0; i < members.length; i++) {
        const { data: memberRow } = await supabase.from("family_members").insert({
          family_id: family.id,
          name: members[i].name,
          role: members[i].role,
          managed_by_user_id: members[i].role !== "adult" ? user.id : null,
          color: colors[i % colors.length],
        }).select("id").single();

        // Initialize companion creature egg for child members
        if (members[i].role === "child" && memberRow) {
          const creatureType = CREATURE_TYPES[childCreatureIndex % CREATURE_TYPES.length];
          childCreatureIndex++;
          // Creature is inserted via edge function or service role; 
          // we'll use the service role through the complete-task function later.
          // For now, store the intent — the creature will be created on first login.
        }
      }

      // 4. Add school time block if configured
      if (hasSchool) {
        const childMembers = members.filter(m => m.role === "child");
        if (childMembers.length > 0) {
          await supabase.from("time_blocks").insert({
            family_id: family.id,
            type: "school",
            label: t("onboarding.school", "Schule"),
            start_time: schoolStart,
            end_time: schoolEnd,
            weekdays: [1, 2, 3, 4, 5],
          });
        }
      }

      // 5. Create first task if entered
      if (firstTaskTitle.trim()) {
        await supabase.from("tasks").insert({
          family_id: family.id,
          title: firstTaskTitle.trim(),
          due_date: new Date().toISOString().split("T")[0],
          created_by_user_id: user.id,
          xp_value: 10,
        });
      }

      // 6. Create subscription
      await supabase.from("subscriptions").insert({
        family_id: family.id,
        tier: "free",
        status: "active",
      });

      // 7. Mark onboarding complete
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
      await refreshProfile();

      toast.success(t("onboarding.success", "Familie erstellt! 🎉"));
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    }
    setCreating(false);
  };

  const addMember = () => {
    if (!memberName.trim()) return;
    setMembers([...members, { name: memberName.trim(), role: memberRole }]);
    setMemberName("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="text-center space-y-4">
                <motion.div variants={bounceIn} initial="hidden" animate="visible" className="text-6xl">🏠</motion.div>
                <h1 className="text-xl font-bold text-foreground">{t("onboarding.welcome", "Willkommen bei Familienzentrale!")}</h1>
                <p className="text-sm text-muted-foreground">{t("onboarding.welcomeSub", "In wenigen Schritten richtest du deine Familie ein.")}</p>
              </div>
            )}

            {/* Step 1: Family name */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Home className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h2 className="text-lg font-extrabold text-foreground">{t("onboarding.familyName", "Wie heißt eure Familie?")}</h2>
                </div>
                <Input
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  placeholder={t("onboarding.familyPlaceholder", "z.B. Familie Müller")}
                  className="h-12 text-center text-lg"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Members */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h2 className="text-lg font-extrabold text-foreground">{t("onboarding.whoJoins", "Wer gehört dazu?")}</h2>
                  <p className="text-xs text-muted-foreground">{t("onboarding.youAdded", "Du bist bereits als Elternteil dabei.")}</p>
                </div>

                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 bg-card rounded-lg p-3 border border-border">
                    <span className="text-sm font-medium text-foreground flex-1">{m.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">{m.role}</span>
                    <button onClick={() => setMembers(members.filter((_, j) => j !== i))} className="text-xs text-error">×</button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder={t("common.name")} className="flex-1" />
                  <Select value={memberRole} onValueChange={v => setMemberRole(v as any)}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adult">{t("settings.roleAdult")}</SelectItem>
                      <SelectItem value="child">{t("settings.roleChild")}</SelectItem>
                      <SelectItem value="baby">{t("settings.roleBaby")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addMember} disabled={!memberName.trim()}>+</Button>
                </div>
              </div>
            )}

            {/* Step 3: School times */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h2 className="text-lg font-extrabold text-foreground">{t("onboarding.schoolTimes", "Schul- oder Kitazeiten?")}</h2>
                </div>
                <div className="flex items-center gap-3 bg-card rounded-lg p-4 border border-border">
                  <input
                    type="checkbox"
                    checked={hasSchool}
                    onChange={e => setHasSchool(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm text-foreground">{t("onboarding.yesSchool", "Ja, Schulzeiten eintragen")}</span>
                </div>
                {hasSchool && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{t("settings.blockFrom")}</Label><Input type="time" value={schoolStart} onChange={e => setSchoolStart(e.target.value)} /></div>
                    <div><Label>{t("settings.blockTo")}</Label><Input type="time" value={schoolEnd} onChange={e => setSchoolEnd(e.target.value)} /></div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: First task */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <CheckSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h2 className="text-lg font-extrabold text-foreground">{t("onboarding.firstTask", "Erste Aufgabe?")}</h2>
                  <p className="text-xs text-muted-foreground">{t("onboarding.orSuggestion", "Oder wähle einen Vorschlag.")}</p>
                </div>
                <Input
                  value={firstTaskTitle}
                  onChange={e => setFirstTaskTitle(e.target.value)}
                  placeholder={t("onboarding.taskPlaceholder", "Aufgabe eingeben…")}
                  className="h-12"
                />
                <div className="flex flex-wrap gap-2">
                  {TASK_SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setFirstTaskTitle(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        firstTaskTitle === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Complete */}
            {step === 5 && (
              <div className="text-center space-y-4">
                <motion.div variants={bounceIn} initial="hidden" animate="visible" className="text-6xl">🥚</motion.div>
                <h2 className="text-lg font-extrabold text-foreground">{t("onboarding.allReady", "Alles bereit!")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("onboarding.summary", "{{family}} wird eingerichtet mit {{count}} Mitgliedern.", { family: familyName || t("onboarding.defaultFamily", "Deine Familie"), count: members.length + 1 })}
                  {firstTaskTitle && ` ${t("onboarding.firstTaskLabel", "Erste Aufgabe")}: "${firstTaskTitle}".`}
                </p>
                <p className="text-xs text-muted-foreground">{t("onboarding.creatureEgg", "Kinder bekommen ein Begleiter-Ei das mit ihnen wächst! 🐣")}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> {t("common.back")}
            </Button>
          ) : <div />}

          {step < TOTAL_STEPS - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="gap-1">
              {step === 0 ? t("onboarding.letsGo", "Los geht's") : t("common.next")} <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={creating} className="gap-1">
              {creating ? t("common.loading") : t("onboarding.createFamily", "Familie erstellen")} 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}