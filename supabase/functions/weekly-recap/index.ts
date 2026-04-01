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

    const { data: families } = await supabase.from("families").select("id");

    for (const family of families ?? []) {
      const weekStart = getWeekStart();
      const weekEnd = getWeekEnd();

      // Check if recap already exists
      const { data: existing } = await supabase
        .from("weekly_recaps")
        .select("id")
        .eq("family_id", family.id)
        .eq("week_start", weekStart)
        .maybeSingle();
      if (existing) continue;

      // Get task completions
      const { data: tasks } = await supabase
        .from("tasks")
        .select("assigned_to_user_id, xp_value, completed_at, status")
        .eq("family_id", family.id)
        .eq("status", "completed")
        .gte("completed_at", weekStart)
        .lte("completed_at", weekEnd + "T23:59:59Z");

      // Get members
      const { data: members } = await supabase
        .from("family_members")
        .select("user_id, name, role")
        .eq("family_id", family.id);

      // Get badges earned this week
      const { data: badges } = await supabase
        .from("user_badges")
        .select("user_id, badge_id, badges(name, icon)")
        .gte("earned_at", weekStart);

      // Get streaks
      const memberIds = (members ?? []).map(m => m.user_id).filter(Boolean);
      const { data: streaks } = await supabase
        .from("streaks")
        .select("user_id, current_count")
        .in("user_id", memberIds);

      // Get previous week for comparison
      const prevStart = getPrevWeekStart();
      const { data: prevTasks } = await supabase
        .from("tasks")
        .select("id")
        .eq("family_id", family.id)
        .eq("status", "completed")
        .gte("completed_at", prevStart)
        .lt("completed_at", weekStart);

      const totalCompleted = tasks?.length ?? 0;
      const prevCompleted = prevTasks?.length ?? 0;
      const change = prevCompleted > 0 ? Math.round(((totalCompleted - prevCompleted) / prevCompleted) * 100) : 0;

      // Per-member breakdown
      const memberStats = (members ?? []).map(m => {
        const memberTasks = (tasks ?? []).filter(t => t.assigned_to_user_id === m.user_id);
        const xp = memberTasks.reduce((sum, t) => sum + (t.xp_value ?? 0), 0);
        const memberBadges = (badges ?? []).filter(b => b.user_id === m.user_id);
        const streak = (streaks ?? []).find(s => s.user_id === m.user_id);
        return {
          userId: m.user_id,
          name: m.name,
          role: m.role,
          tasksCompleted: memberTasks.length,
          xpEarned: xp,
          badges: memberBadges.map(b => ({ name: (b as any).badges?.name, icon: (b as any).badges?.icon })),
          streak: streak?.current_count ?? 0,
        };
      }).sort((a, b) => b.xpEarned - a.xpEarned);

      const recapData = {
        totalCompleted,
        prevCompleted,
        changePercent: change,
        members: memberStats,
      };

      await supabase.from("weekly_recaps").insert({
        family_id: family.id,
        week_start: weekStart,
        data: recapData,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() - 6); // Previous Monday
  return d.toISOString().split("T")[0];
}

function getWeekEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay()); // Previous Sunday
  return d.toISOString().split("T")[0];
}

function getPrevWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() - 13);
  return d.toISOString().split("T")[0];
}
