import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all families
    const { data: families } = await supabase.from("families").select("id, timezone");

    const results = [];

    for (const family of families ?? []) {
      // Get nudge rules
      const { data: rules } = await supabase
        .from("nudge_rules")
        .select("*")
        .eq("family_id", family.id)
        .eq("is_enabled", true);

      if (!rules?.length) continue;

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      for (const rule of rules) {
        // Check quiet hours
        if (rule.quiet_start && rule.quiet_end) {
          if (currentTime >= rule.quiet_start && currentTime <= rule.quiet_end) continue;
        }

        // Check if any time matches (within 5 min window)
        const matchesTime = (rule.times as string[]).some((t: string) => {
          const diff = Math.abs(timeToMinutes(currentTime) - timeToMinutes(t));
          return diff <= 5;
        });
        if (!matchesTime) continue;

        // Check for duplicate nudge in last 30 min
        const thirtyAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const { data: recent } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", rule.child_user_id)
          .eq("type", "nudge")
          .gte("created_at", thirtyAgo)
          .limit(1);
        if (recent?.length) continue;

        // Get child's tasks for today
        const today = new Date().toISOString().split("T")[0];
        const { data: tasks } = await supabase
          .from("tasks")
          .select("id, status, priority")
          .eq("family_id", family.id)
          .eq("assigned_to_user_id", rule.child_user_id)
          .eq("due_date", today);

        if (!tasks?.length) continue; // Skip if no tasks today

        const incomplete = tasks.filter((t: any) => t.status === "open");
        const allDone = incomplete.length === 0;

        // Get streak
        const { data: streak } = await supabase
          .from("streaks")
          .select("current_count")
          .eq("user_id", rule.child_user_id)
          .maybeSingle();
        const streakCount = streak?.current_count ?? 0;

        // Get child name
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, locale")
          .eq("id", rule.child_user_id)
          .maybeSingle();
        const name = profile?.name ?? "Kind";
        const isDE = (profile?.locale ?? "de") === "de";

        // Compose message
        let title: string;
        let body: string;

        if (allDone) {
          title = isDE ? "Alle Quests erledigt! 🎉" : "All quests done! 🎉";
          body = isDE ? `Mega gemacht, ${name}!` : `Amazing, ${name}!`;
        } else if (streakCount > 0) {
          title = isDE ? `Hey ${name}! 🔥` : `Hey ${name}! 🔥`;
          body = isDE
            ? `Du hast noch ${incomplete.length} Quests — und deine ${streakCount}-Tage-Serie läuft!`
            : `${incomplete.length} quests left — and your ${streakCount}-day streak is going!`;
        } else {
          title = isDE ? `Hey ${name}!` : `Hey ${name}!`;
          body = isDE
            ? `Neue Serie starten? Du hast ${incomplete.length} Quests heute!`
            : `Start a new streak? You have ${incomplete.length} quests today!`;
        }

        // Create child nudge
        await supabase.from("notifications").insert({
          user_id: rule.child_user_id,
          type: "nudge",
          title,
          body,
          data: { taskCount: incomplete.length, streakCount },
        });

        // Parent alert for overdue high-priority tasks
        if (rule.parent_alert && !allDone) {
          const overdueHigh = incomplete.filter((t: any) => t.priority === "high");
          if (overdueHigh.length > 0) {
            // Get all admin parents
            const { data: admins } = await supabase
              .from("family_members")
              .select("user_id")
              .eq("family_id", family.id)
              .eq("is_admin", true);

            for (const admin of admins ?? []) {
              if (!admin.user_id) continue;
              const pTitle = isDE
                ? `${name} hat ${overdueHigh.length} wichtige Aufgaben nicht erledigt`
                : `${name} has ${overdueHigh.length} important tasks not completed`;
              await supabase.from("notifications").insert({
                user_id: admin.user_id,
                type: "parent_alert",
                title: pTitle,
                body: "",
              });
            }
          }
        }

        results.push({ child: rule.child_user_id, nudged: true });
      }
    }

    return new Response(JSON.stringify({ nudgesProcessed: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
