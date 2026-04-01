import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { task_id, user_id } = await req.json();
    if (!task_id || !user_id) {
      return new Response(JSON.stringify({ error: "task_id and user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get task
    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("id", task_id)
      .single();

    if (taskError || !task) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (task.status === "completed") {
      return new Response(JSON.stringify({ error: "Task already completed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const xp = task.xp_value || 10;
    const gold = Math.max(1, Math.floor(xp / 5));

    // 2. Mark task completed
    await supabaseAdmin
      .from("tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", task_id);

    // 3. Award XP + Gold (append-only ledger)
    await supabaseAdmin.from("points_ledger").insert({
      user_id,
      task_id,
      xp_awarded: xp,
      gold_awarded: gold,
      reason: "task_completion",
    });

    // 4. Gold transaction
    await supabaseAdmin.from("gold_transactions").insert({
      user_id,
      amount: gold,
      item_type: "task_completion",
      item_id: task_id,
    });

    // 5. Update level
    const { data: levelRow } = await supabaseAdmin
      .from("levels")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    const oldXP = levelRow?.total_xp ?? 0;
    const newXP = oldXP + xp;
    const oldLevel = levelRow?.current_level ?? 1;

    // Calculate new level
    const thresholds = [0, 100, 250, 500, 800];
    let newLevel = 1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (newXP >= thresholds[i]) {
        if (i === thresholds.length - 1) {
          const extra = newXP - thresholds[i];
          newLevel = i + 1 + Math.floor(extra / 400);
        } else {
          newLevel = i + 1;
        }
        break;
      }
    }

    if (levelRow) {
      await supabaseAdmin
        .from("levels")
        .update({ total_xp: newXP, current_level: newLevel, updated_at: new Date().toISOString() })
        .eq("user_id", user_id);
    } else {
      await supabaseAdmin.from("levels").insert({
        user_id,
        total_xp: newXP,
        current_level: newLevel,
      });
    }

    const levelUp = newLevel > oldLevel;

    // 6. Update streak
    const today = new Date().toISOString().split("T")[0];
    const { data: streakRow } = await supabaseAdmin
      .from("streaks")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    let streakCount = 1;
    if (streakRow) {
      const lastDate = streakRow.last_activity_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (lastDate === today) {
        streakCount = streakRow.current_count;
      } else if (lastDate === yesterday) {
        streakCount = streakRow.current_count + 1;
      } else {
        // Check for streak freeze
        const { data: freeze } = await supabaseAdmin
          .from("streak_freezes")
          .select("*")
          .eq("user_id", user_id)
          .eq("is_used", false)
          .limit(1)
          .maybeSingle();

        if (freeze) {
          await supabaseAdmin.from("streak_freezes").update({ is_used: true, used_at: new Date().toISOString() }).eq("id", freeze.id);
          streakCount = streakRow.current_count + 1;
        } else {
          streakCount = 1;
        }
      }

      await supabaseAdmin
        .from("streaks")
        .update({
          current_count: streakCount,
          longest_count: Math.max(streakRow.longest_count, streakCount),
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id);
    } else {
      await supabaseAdmin.from("streaks").insert({
        user_id,
        current_count: 1,
        longest_count: 1,
        last_activity_date: today,
      });
    }

    // 7. Drop chance (20%)
    let drop = null;
    if (Math.random() < 0.2) {
      const dropTypes = ["bonus_gold", "xp_boost", "streak_freeze", "mystery_egg"] as const;
      const dropType = dropTypes[Math.floor(Math.random() * dropTypes.length)];
      let value = "1";

      if (dropType === "bonus_gold") {
        const bonusGold = Math.floor(Math.random() * 5) + 1;
        value = String(bonusGold);
        await supabaseAdmin.from("gold_transactions").insert({
          user_id, amount: bonusGold, item_type: "drop_bonus_gold",
        });
      } else if (dropType === "xp_boost") {
        const bonusXP = Math.floor(Math.random() * 10) + 5;
        value = String(bonusXP);
        await supabaseAdmin.from("points_ledger").insert({
          user_id, xp_awarded: bonusXP, gold_awarded: 0, reason: "drop_bonus_xp",
        });
        // Update level XP
        await supabaseAdmin
          .from("levels")
          .update({ total_xp: newXP + bonusXP, updated_at: new Date().toISOString() })
          .eq("user_id", user_id);
      } else if (dropType === "streak_freeze") {
        await supabaseAdmin.from("streak_freezes").insert({ user_id });
      }

      await supabaseAdmin.from("drop_events").insert({
        user_id, task_id, type: dropType, value,
      });

      drop = { type: dropType, value };
    }

    // 8. Challenge progress
    if (task.challenge_id) {
      const { data: progress } = await supabaseAdmin
        .from("challenge_progress")
        .select("*")
        .eq("challenge_id", task.challenge_id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (progress) {
        await supabaseAdmin.from("challenge_progress")
          .update({ count: progress.count + 1, updated_at: new Date().toISOString() })
          .eq("id", progress.id);
      } else {
        await supabaseAdmin.from("challenge_progress").insert({
          challenge_id: task.challenge_id, user_id, count: 1,
        });
      }

      // Check boss battle HP
      const { data: challenge } = await supabaseAdmin
        .from("challenges")
        .select("*")
        .eq("id", task.challenge_id)
        .single();

      if (challenge?.type === "boss_battle" && challenge.boss_hp) {
        const newHp = Math.max(0, (challenge.boss_current_hp ?? challenge.boss_hp) - 1);
        await supabaseAdmin.from("challenges")
          .update({ boss_current_hp: newHp, is_completed: newHp === 0 })
          .eq("id", task.challenge_id);
      }
    }

    // 9. Companion creature feeding
    const { data: creature } = await supabaseAdmin
      .from("companion_creatures")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true)
      .maybeSingle();

    if (creature) {
      const newFeed = creature.feed_count + 1;
      const stages = ["egg", "baby", "juvenile", "adult"] as const;
      const stageIndex = stages.indexOf(creature.stage as any);
      let newStage = creature.stage;
      let newHatch = creature.hatch_progress;

      if (creature.stage === "egg") {
        newHatch = Math.min(100, creature.hatch_progress + 10);
        if (newHatch >= 100) newStage = "baby";
      } else if (stageIndex < 3 && newFeed % 10 === 0) {
        newStage = stages[stageIndex + 1];
      }

      await supabaseAdmin.from("companion_creatures")
        .update({ feed_count: newFeed, stage: newStage, hatch_progress: newHatch, updated_at: new Date().toISOString() })
        .eq("id", creature.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        xp_awarded: xp,
        gold_awarded: gold,
        streak_count: streakCount,
        level_up: levelUp,
        new_level: newLevel,
        drop,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
