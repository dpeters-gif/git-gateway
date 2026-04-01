import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2, Database } from "lucide-react";

type SeedStatus = "idle" | "running" | "done" | "error";

export default function SeedPage() {
  const [status, setStatus] = useState<SeedStatus>(
    localStorage.getItem("demo_seeded") ? "done" : "idle"
  );
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const seed = async () => {
    setStatus("running");
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");
      const userId = user.id;
      const today = new Date();

      function dayOffset(days: number, hour = 10, min = 0) {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        d.setHours(hour, min, 0, 0);
        return d.toISOString();
      }

      // 1. Family + Subscription
      setProgress("Erstelle Familie...");
      const familyId = crypto.randomUUID();
      await supabase.from("families").insert({
        id: familyId,
        name: "Familie Mustermann",
        timezone: "Europe/Berlin",
      });

      // Check if subscriptions allows insert — it's read-only per RLS, skip if fails
      const subRes = await supabase.from("subscriptions" as any).insert({
        family_id: familyId,
        tier: "familyplus",
        status: "active",
        started_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        expires_at: new Date(Date.now() + 335 * 86400000).toISOString(),
      } as any);
      // Not critical if this fails

      // 2. Family Members
      setProgress("Erstelle Familienmitglieder...");
      await supabase.from("profiles").update({
        name: "Sarah",
        role: "adult",
        onboarding_completed: true,
        locale: "de",
        sound_enabled: true,
        sound_volume: 0.7,
      }).eq("id", userId);

      await supabase.from("family_members").insert({
        family_id: familyId,
        user_id: userId,
        name: "Sarah",
        role: "adult",
        is_admin: true,
        color: "#4E6E5D",
      });

      const partnerId = crypto.randomUUID();
      const childId = crypto.randomUUID();

      await supabase.from("family_members").insert({
        family_id: familyId,
        user_id: partnerId,
        name: "Thomas",
        role: "adult",
        is_admin: false,
        color: "#5B8A9B",
      });

      await supabase.from("family_members").insert({
        family_id: familyId,
        user_id: childId,
        name: "Dennis",
        role: "child",
        is_admin: false,
        color: "#FF6B35",
      });

      await supabase.from("child_permissions").insert({
        user_id: childId,
        can_create_tasks: true,
        can_create_events: false,
      });

      await supabase.from("family_members").insert({
        family_id: familyId,
        user_id: null,
        name: "Leo",
        role: "baby",
        is_admin: false,
        color: "#C67B5C",
        managed_by_user_id: userId,
      });

      // 3. Time Blocks
      setProgress("Erstelle Zeitblöcke...");
      const weekdays = [1, 2, 3, 4, 5];
      await supabase.from("time_blocks").insert([
        { family_id: familyId, user_id: childId, type: "school" as const, label: "Schule", weekdays, start_time: "07:45", end_time: "13:30" },
        { family_id: familyId, user_id: userId, type: "work" as const, label: "Arbeit", weekdays, start_time: "09:00", end_time: "16:00" },
        { family_id: familyId, user_id: partnerId, type: "work" as const, label: "Arbeit", weekdays, start_time: "08:00", end_time: "17:00" },
        { family_id: familyId, user_id: null, type: "nap" as const, label: "Mittagsschlaf", weekdays: [1, 2, 3, 4, 5, 6, 7], start_time: "12:30", end_time: "14:30" },
      ]);

      // 4. Events
      setProgress("Erstelle Termine...");
      const events = [
        { title: "Kinderarzt Leo", start_at: dayOffset(1, 10, 0), end_at: dayOffset(1, 11, 0), icon: "heart-pulse", assigned_to_user_ids: [userId], description: "U7a Untersuchung", is_all_day: false },
        { title: "Elternabend Schule", start_at: dayOffset(2, 19, 0), end_at: dayOffset(2, 21, 0), icon: "school", assigned_to_user_ids: [userId, partnerId], is_all_day: false },
        { title: "Fußballtraining Dennis", start_at: dayOffset(3, 15, 0), end_at: dayOffset(3, 16, 30), icon: "trophy", assigned_to_user_ids: [childId], description: "Sportschuhe und Schienbeinschoner mitbringen", is_all_day: false },
        { title: "Oma & Opa besuchen", start_at: dayOffset(5, 14, 0), end_at: dayOffset(5, 18, 0), icon: "home", assigned_to_user_ids: [userId, partnerId, childId], is_all_day: false },
        { title: "Zahnarzt Sarah", start_at: dayOffset(7, 9, 0), end_at: dayOffset(7, 10, 0), icon: "stethoscope", assigned_to_user_ids: [userId], is_all_day: false },
        { title: "Geburtstag Tante Claudia", start_at: dayOffset(8, 0, 0), end_at: null, icon: "cake", is_all_day: true, assigned_to_user_ids: [userId, partnerId, childId] },
        { title: "Schwimmkurs Dennis", start_at: dayOffset(4, 16, 0), end_at: dayOffset(4, 17, 0), icon: "waves", assigned_to_user_ids: [childId], is_all_day: false },
      ];

      for (const e of events) {
        await supabase.from("events").insert({
          family_id: familyId,
          created_by_user_id: userId,
          status: "active" as const,
          title: e.title,
          start_at: e.start_at,
          end_at: e.end_at,
          icon: e.icon,
          assigned_to_user_ids: e.assigned_to_user_ids,
          description: e.description ?? null,
          is_all_day: e.is_all_day,
        });
      }

      // Pending child event
      await supabase.from("events").insert({
        family_id: familyId,
        created_by_user_id: childId,
        title: "Spielenachmittag bei Max",
        start_at: dayOffset(6, 14, 0),
        end_at: dayOffset(6, 17, 0),
        icon: "gamepad-2",
        status: "pending" as const,
        assigned_to_user_ids: [childId],
        description: "Dennis möchte zu Max zum Spielen",
        is_all_day: false,
      });

      // 5. Tasks
      setProgress("Erstelle Aufgaben...");
      const taskData = [
        { title: "Zimmer aufräumen", xp_value: 15, priority: "high" as const, assigned_to_user_id: childId, due_date: dayOffset(0).split("T")[0], icon: "sparkles" },
        { title: "Zähne putzen (morgens)", xp_value: 5, priority: "normal" as const, assigned_to_user_id: childId, due_date: dayOffset(0).split("T")[0], icon: "smile" },
        { title: "Hausaufgaben erledigen", xp_value: 20, priority: "high" as const, assigned_to_user_id: childId, due_date: dayOffset(0).split("T")[0], icon: "book-open", start_time: "14:00", end_time: "15:00" },
        { title: "Rucksack für morgen packen", xp_value: 10, priority: "normal" as const, assigned_to_user_id: childId, due_date: dayOffset(0).split("T")[0], icon: "backpack" },
        { title: "Müll rausbringen", xp_value: 10, priority: "normal" as const, assigned_to_user_id: childId, due_date: dayOffset(1).split("T")[0], icon: "trash-2" },
        { title: "Einkaufen gehen", xp_value: 0, priority: "normal" as const, assigned_to_user_id: userId, due_date: dayOffset(1).split("T")[0], icon: "shopping-cart" },
        { title: "Windeln für Leo kaufen", xp_value: 0, priority: "high" as const, assigned_to_user_id: partnerId, due_date: dayOffset(0).split("T")[0], icon: "baby" },
        { title: "Elternbrief unterschreiben", xp_value: 0, priority: "high" as const, assigned_to_user_id: userId, due_date: dayOffset(1).split("T")[0], icon: "file-text" },
        { title: "Fahrrad Reifen prüfen", xp_value: 15, priority: "low" as const, assigned_to_user_id: childId, due_date: dayOffset(3).split("T")[0], icon: "bike" },
        { title: "Blumen gießen", xp_value: 10, priority: "low" as const, assigned_to_user_id: childId, due_date: dayOffset(2).split("T")[0], icon: "flower-2" },
      ];

      for (const t of taskData) {
        await supabase.from("tasks").insert({
          family_id: familyId,
          created_by_user_id: userId,
          status: "open" as const,
          visibility: "family",
          photo_required: false,
          title: t.title,
          xp_value: t.xp_value,
          priority: t.priority,
          assigned_to_user_id: t.assigned_to_user_id,
          due_date: t.due_date,
          icon: t.icon,
          start_time: (t as any).start_time ?? null,
          end_time: (t as any).end_time ?? null,
        });
      }

      // Completed tasks
      setProgress("Erstelle erledigte Aufgaben & XP...");
      const completedTasks = [
        { title: "Geschirrspüler ausräumen", xp: 10 },
        { title: "Zähne putzen", xp: 5 },
        { title: "Bett machen", xp: 5 },
        { title: "Spielsachen aufräumen", xp: 10 },
        { title: "Jacke aufhängen", xp: 5 },
        { title: "Tisch abräumen", xp: 10 },
        { title: "Schuhe wegstellen", xp: 5 },
        { title: "Müll rausbringen", xp: 10 },
        { title: "Haustier füttern", xp: 10 },
        { title: "Zähne putzen (abends)", xp: 5 },
        { title: "Tasche packen", xp: 10 },
        { title: "Zimmer saugen", xp: 20 },
        { title: "Tisch decken", xp: 10 },
        { title: "Wäsche zusammenlegen", xp: 15 },
      ];

      for (let i = 0; i < completedTasks.length; i++) {
        const daysAgo = Math.floor(i / 2);
        const t = completedTasks[i];
        const taskId = crypto.randomUUID();
        const completedAt = new Date(Date.now() - daysAgo * 86400000);
        completedAt.setHours(15 + (i % 2), 0, 0, 0);

        await supabase.from("tasks").insert({
          id: taskId,
          family_id: familyId,
          title: t.title,
          xp_value: t.xp,
          priority: "normal" as const,
          status: "completed" as const,
          completed_at: completedAt.toISOString(),
          assigned_to_user_id: childId,
          created_by_user_id: userId,
          due_date: completedAt.toISOString().split("T")[0],
          icon: "check-circle",
          visibility: "family",
          photo_required: false,
        });

        // Points ledger — may fail due to RLS, that's OK
        await supabase.from("points_ledger" as any).insert({
          user_id: childId,
          task_id: taskId,
          xp_awarded: t.xp,
          gold_awarded: Math.max(1, Math.floor(t.xp / 5)),
          reason: "task_complete",
          created_at: completedAt.toISOString(),
        } as any);
      }

      // 6. Gamification State
      setProgress("Erstelle Gamification-Daten...");
      const totalXP = completedTasks.reduce((sum, t) => sum + t.xp, 0);

      // These tables may not allow inserts via client RLS — try anyway
      await supabase.from("levels" as any).insert({ user_id: childId, total_xp: totalXP, current_level: 3 } as any);
      await supabase.from("streaks" as any).insert({ user_id: childId, current_count: 7, longest_count: 7, last_activity_date: new Date().toISOString().split("T")[0] } as any);
      await supabase.from("companion_creatures" as any).insert({ user_id: childId, creature_type: "fox", name: "Foxy", stage: "baby", feed_count: 14, hatch_progress: 100, is_active: true } as any);
      await supabase.from("child_avatars" as any).insert({ user_id: childId, equipped_items: [], background: null } as any);

      // Badges
      const { data: badges } = await supabase.from("badges").select("id, name");
      if (badges && badges.length > 0) {
        for (const badge of badges.slice(0, 3)) {
          await supabase.from("user_badges" as any).insert({ user_id: childId, badge_id: badge.id, earned_at: new Date(Date.now() - 3 * 86400000).toISOString() } as any);
        }
      }

      await supabase.from("streak_freezes" as any).insert({ user_id: childId, is_used: false } as any);
      await supabase.from("drop_events" as any).insert([
        { user_id: childId, type: "bonus_gold", value: "5" },
        { user_id: childId, type: "streak_freeze", value: "1" },
      ] as any);
      await supabase.from("leaderboard_snapshots" as any).insert({
        family_id: familyId, user_id: childId, period: "weekly",
        period_start: new Date().toISOString().split("T")[0],
        xp_earned: totalXP, rank: 1,
      } as any);

      // 7. Routines
      setProgress("Erstelle Routinen...");
      await supabase.from("routines").insert([
        { family_id: familyId, title: "Morgenroutine Dennis", assigned_to_user_id: childId, weekdays: [1, 2, 3, 4, 5], is_active: true, flow_mode: true, flow_target_minutes: 20, flow_step_order: [], photo_required: false },
        { family_id: familyId, title: "Abendroutine Dennis", assigned_to_user_id: childId, weekdays: [1, 2, 3, 4, 5, 6, 7], is_active: true, flow_mode: false, flow_step_order: [], photo_required: false },
      ]);

      // 8. Challenges
      setProgress("Erstelle Challenges...");
      const challengeId = crypto.randomUUID();
      await supabase.from("challenges").insert({
        id: challengeId, family_id: familyId,
        title: "Familien-Fleißwoche", type: "family" as const,
        target_count: 20, start_date: new Date().toISOString().split("T")[0],
        end_date: dayOffset(7).split("T")[0],
        reward_xp: 50, description: "Gemeinsam 20 Aufgaben diese Woche schaffen!",
        is_completed: false,
      });
      await supabase.from("challenge_progress" as any).insert([
        { challenge_id: challengeId, user_id: childId, count: 8 },
        { challenge_id: challengeId, user_id: userId, count: 3 },
      ] as any);

      const bossId = crypto.randomUUID();
      await supabase.from("challenges").insert({
        id: bossId, family_id: familyId,
        title: "Drache des Chaos", type: "boss_battle" as const,
        target_count: 30, start_date: new Date().toISOString().split("T")[0],
        end_date: dayOffset(14).split("T")[0],
        reward_xp: 100, boss_creature_type: "dragon",
        boss_hp: 30, boss_current_hp: 18,
        description: "Besiegt den Drachen, indem ihr 30 Quests erledigt!",
        is_completed: false,
      });
      await supabase.from("challenge_progress" as any).insert([
        { challenge_id: bossId, user_id: childId, count: 10 },
        { challenge_id: bossId, user_id: userId, count: 2 },
      ] as any);

      // 9. Rewards
      setProgress("Erstelle Belohnungen...");
      await supabase.from("rewards").insert([
        { family_id: familyId, title: "Eis essen gehen", description: "Eine Kugel Eis als Belohnung", icon: "ice-cream-cone", xp_threshold: 200, gold_price: null, child_user_id: childId, is_active: true },
        { family_id: familyId, title: "30 Min extra Bildschirmzeit", description: "Tablet oder TV", icon: "monitor", xp_threshold: 150, gold_price: 20, child_user_id: childId, is_active: true },
        { family_id: familyId, title: "Ausflug in den Zoo", description: "Wochenendausflug als Familie", icon: "paw-print", xp_threshold: 500, gold_price: null, child_user_id: null, is_active: true },
      ]);

      // 10. Shopping List
      setProgress("Erstelle Einkaufsliste...");
      const { data: listData } = await supabase.from("shopping_lists").insert({
        family_id: familyId, name: "Einkaufsliste",
      }).select("id").single();
      const listId = listData?.id;

      if (listId) {
        const items = [
          { name: "Milch", category: "dairy", checked: false, added_by_user_id: userId },
          { name: "Vollkornbrot", category: "bakery", checked: false, added_by_user_id: userId },
          { name: "Äpfel", category: "produce", checked: false, added_by_user_id: partnerId },
          { name: "Bananen", category: "produce", checked: true, added_by_user_id: userId, checked_by_user_id: partnerId },
          { name: "Windeln Gr. 5", category: "household", checked: false, added_by_user_id: userId },
          { name: "Joghurt", category: "dairy", checked: true, added_by_user_id: partnerId, checked_by_user_id: userId },
          { name: "Hähnchenbrust", category: "meat", checked: false, added_by_user_id: userId },
          { name: "Spülmittel", category: "household", checked: false, added_by_user_id: partnerId },
          { name: "Orangensaft", category: "drinks", checked: false, added_by_user_id: childId },
          { name: "Tiefkühlpizza", category: "frozen", checked: false, added_by_user_id: childId },
        ];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await supabase.from("shopping_items").insert({
            list_id: listId,
            sort_order: i,
            name: item.name,
            category: item.category,
            checked: item.checked,
            added_by_user_id: item.added_by_user_id,
            checked_by_user_id: (item as any).checked_by_user_id ?? null,
            checked_at: item.checked ? new Date().toISOString() : null,
          });
        }
      }

      // 11. Board Notes
      setProgress("Erstelle Pinnwand-Notizen...");
      await supabase.from("board_notes").insert([
        { family_id: familyId, author_user_id: userId, text: "Denkt dran: Elternabend Mittwoch 19 Uhr! Bitte pünktlich." },
        { family_id: familyId, author_user_id: partnerId, text: "Dennis hat heute Schwimmkurs — Badesachen einpacken!" },
        { family_id: familyId, author_user_id: userId, text: "Leo hat morgen Kinderarzt um 10. Impfpass mitnehmen!", expires_at: dayOffset(2) },
      ]);

      // 12. Nudge Rules
      setProgress("Erstelle Nudge-Regeln...");
      await supabase.from("nudge_rules").insert({
        family_id: familyId, child_user_id: childId,
        times: ["15:00", "18:00"], is_enabled: true,
        parent_alert: true, quiet_start: "21:00", quiet_end: "07:00",
      });

      // 13. Notifications
      setProgress("Erstelle Benachrichtigungen...");
      await supabase.from("notifications" as any).insert([
        { user_id: userId, type: "task_assigned", title: "Neue Aufgabe", body: "Dennis hat eine Quest erstellt: Spielsachen aufräumen", read: false },
        { user_id: userId, type: "event_suggested", title: "Terminvorschlag", body: "Dennis möchte zu Max zum Spielen (Samstag 14-17 Uhr)", read: false, data: { event_status: "pending" } },
        { user_id: userId, type: "streak_milestone", title: "Streak-Meilenstein! 🔥", body: "Dennis hat eine 7-Tage-Serie erreicht!", read: true },
        { user_id: userId, type: "challenge_progress", title: "Challenge Update", body: "Familien-Fleißwoche: 11/20 geschafft!", read: true },
        { user_id: childId, type: "nudge", title: "Hey Dennis! 🔥", body: "Du hast noch 4 Quests — und deine 7-Tage-Serie läuft!", read: false },
      ] as any);

      // 14. Weekly Recap
      setProgress("Erstelle Wochenrückblick...");
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - today.getDay() - 6);
      await supabase.from("weekly_recaps" as any).insert({
        family_id: familyId,
        week_start: lastMonday.toISOString().split("T")[0],
        data: {
          summary: { totalTasksCompleted: 18, totalXPEarned: 155, weekOverWeekChange: 12 },
          members: [
            { userId: childId, name: "Dennis", tasksCompleted: 14, xpEarned: 130, streakStatus: "active", streakCount: 7 },
            { userId, name: "Sarah", tasksCompleted: 3, xpEarned: 0 },
            { userId: partnerId, name: "Thomas", tasksCompleted: 1, xpEarned: 0 },
          ],
        },
      } as any);

      // 15. Email Inbox Items
      setProgress("Erstelle E-Mail-Posteingang...");
      await supabase.from("email_inbox_items").insert([
        { family_id: familyId, user_id: userId, extracted_title: "Wandertag Klasse 3b", extracted_type: "event", extracted_date: dayOffset(10), original_subject: "RE: Elterninfo KW15", is_processed: false },
        { family_id: familyId, user_id: userId, extracted_title: "Einverständniserklärung Schwimmen", extracted_type: "deadline", extracted_date: dayOffset(5), original_subject: "Schwimmunterricht ab Mai", is_processed: false },
      ]);

      // 16. Caregiver Link
      setProgress("Erstelle Großeltern-Link...");
      await supabase.from("caregiver_links").insert({
        family_id: familyId, name: "Oma Helga",
        token: "demo-share-" + crypto.randomUUID().slice(0, 8),
        visible_member_ids: [userId, childId],
        expires_at: dayOffset(7),
      });

      localStorage.setItem("demo_seeded", "true");
      setStatus("done");
      setProgress("");
    } catch (err: any) {
      console.error("Seed error:", err);
      setError(err.message || "Unbekannter Fehler");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-[480px]">
        <CardHeader className="text-center">
          <Database className="w-10 h-10 mx-auto text-primary mb-2" />
          <CardTitle className="text-xl">Demo-Daten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "idle" && (
            <Button size="lg" className="w-full" onClick={seed}>
              Seed Demo Data
            </Button>
          )}

          {status === "running" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{progress}</p>
            </div>
          )}

          {status === "done" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="w-10 h-10 text-success" />
              <p className="text-sm font-medium text-foreground">
                Demo-Daten erfolgreich erstellt!
              </p>
              <Link to="/" className="text-primary underline text-sm">
                Gehe zur Startseite →
              </Link>
              <Button variant="outline" disabled className="w-full mt-2">
                Demo-Daten bereits erstellt
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={seed}>
                Erneut versuchen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
