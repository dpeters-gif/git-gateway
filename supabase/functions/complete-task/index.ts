import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const taskId = body.taskId ?? body.task_id;
    const userId = body.userId ?? body.user_id;
    const photoUrl = body.photoUrl ?? body.photo_url ?? null;

    if (!taskId || !userId) {
      return new Response(JSON.stringify({ error: { code: "INVALID_INPUT", message: "taskId and userId required" } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Validate task
    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Task not found" } }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (task.status === "completed") {
      return new Response(JSON.stringify({ error: { code: "ALREADY_COMPLETED", message: "Task already completed" } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Photo required check
    if (task.photo_required && !photoUrl) {
      return new Response(JSON.stringify({ error: { code: "PHOTO_REQUIRED", message: "Photo proof is required for this task" } }), {
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
      .eq("id", taskId);

    // Save photo if provided
    if (photoUrl) {
      await supabaseAdmin.from("task_completion_photos").insert({
        task_id: taskId,
        user_id: userId,
        photo_url: photoUrl,
      });
    }

    // 3. Award XP + Gold (append-only ledger)
    await supabaseAdmin.from("points_ledger").insert({
      user_id: userId,
      task_id: taskId,
      xp_awarded: xp,
      gold_awarded: gold,
      reason: "task_complete",
    });

    // 4. Update level
    const { data: levelRow } = await supabaseAdmin
      .from("levels")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const oldXP = levelRow?.total_xp ?? 0;
    const newXP = oldXP + xp;
    const oldLevel = levelRow?.current_level ?? 1;

    // Calculate new level using thresholds
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

    // Calculate XP within current level for progress bar
    let currentLevelXP = 0;
    let nextLevelXP = 100;
    if (newLevel <= thresholds.length) {
      const base = thresholds[newLevel - 1] ?? 0;
      const next = thresholds[newLevel] ?? (base + 400);
      currentLevelXP = newXP - base;
      nextLevelXP = next - base;
    } else {
      const baseForLevel = thresholds[thresholds.length - 1] + (newLevel - thresholds.length) * 400;
      currentLevelXP = newXP - baseForLevel;
      nextLevelXP = 400;
    }

    if (levelRow) {
      await supabaseAdmin
        .from("levels")
        .update({ total_xp: newXP, current_level: newLevel, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    } else {
      await supabaseAdmin.from("levels").insert({
        user_id: userId,
        total_xp: newXP,
        current_level: newLevel,
      });
    }

    const leveledUp = newLevel > oldLevel;

    // 5. Update streak
    const today = new Date().toISOString().split("T")[0];
    const { data: streakRow } = await supabaseAdmin
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    let streakCount = 1;
    let streakStartedToday = true;

    if (streakRow) {
      const lastDate = streakRow.last_activity_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (lastDate === today) {
        streakCount = streakRow.current_count;
        streakStartedToday = false;
      } else if (lastDate === yesterday) {
        streakCount = streakRow.current_count + 1;
      } else {
        // Check for streak freeze
        const { data: freeze } = await supabaseAdmin
          .from("streak_freezes")
          .select("*")
          .eq("user_id", userId)
          .eq("is_used", false)
          .limit(1)
          .maybeSingle();

        if (freeze) {
          await supabaseAdmin.from("streak_freezes")
            .update({ is_used: true, used_at: new Date().toISOString() })
            .eq("id", freeze.id);
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
        .eq("user_id", userId);
    } else {
      await supabaseAdmin.from("streaks").insert({
        user_id: userId,
        current_count: 1,
        longest_count: 1,
        last_activity_date: today,
      });
    }

    // 6. Drop chance (20% base, +5% for photo, +5% for high priority)
    let dropProbability = 0.2;
    if (task.photo_required && photoUrl) dropProbability += 0.05;
    if (task.priority === "high") dropProbability += 0.05;

    // Check for adult creature luck bonus
    const { data: adultCreature } = await supabaseAdmin
      .from("companion_creatures")
      .select("stage")
      .eq("user_id", userId)
      .eq("is_active", true)
      .eq("stage", "adult")
      .maybeSingle();
    if (adultCreature) dropProbability += 0.05;

    let dropEvent: { type: string; value: string | number } | undefined;
    if (Math.random() < dropProbability) {
      // Weighted distribution: bonus_gold 40%, xp_boost 25%, avatar_item 15%, streak_freeze 10%, mystery_egg 10%
      const roll = Math.random();
      let dropType: string;
      let value: string = "1";

      if (roll < 0.40) {
        dropType = "bonus_gold";
        const bonusGold = Math.floor(Math.random() * 4) + 2; // 2-5
        value = String(bonusGold);
        await supabaseAdmin.from("points_ledger").insert({
          user_id: userId, xp_awarded: 0, gold_awarded: bonusGold, reason: "drop_bonus_gold",
        });
      } else if (roll < 0.65) {
        dropType = "xp_boost";
        value = "2x_next"; // 2× XP on next task
      } else if (roll < 0.80) {
        dropType = "avatar_item";
        // Pick a random locked avatar item
        const { data: items } = await supabaseAdmin
          .from("avatar_items")
          .select("id, name")
          .gt("required_level", Math.max(1, newLevel - 1))
          .limit(1);
        if (items && items.length > 0) {
          value = items[0].id;
        }
      } else if (roll < 0.90) {
        dropType = "streak_freeze";
        await supabaseAdmin.from("streak_freezes").insert({ user_id: userId });
        value = "1";
      } else {
        dropType = "mystery_egg";
        value = "1";
      }

      await supabaseAdmin.from("drop_events").insert({
        user_id: userId, task_id: taskId, type: dropType, value,
      });

      dropEvent = { type: dropType, value };
    }

    // 7. Challenge progress
    let challengeProgress: { challengeId: string; currentCount: number; targetCount: number; completed: boolean } | undefined;
    if (task.challenge_id) {
      const { data: progress } = await supabaseAdmin
        .from("challenge_progress")
        .select("*")
        .eq("challenge_id", task.challenge_id)
        .eq("user_id", userId)
        .maybeSingle();

      const newCount = (progress?.count ?? 0) + 1;

      if (progress) {
        await supabaseAdmin.from("challenge_progress")
          .update({ count: newCount, updated_at: new Date().toISOString() })
          .eq("id", progress.id);
      } else {
        await supabaseAdmin.from("challenge_progress").insert({
          challenge_id: task.challenge_id, user_id: userId, count: 1,
        });
      }

      const { data: challenge } = await supabaseAdmin
        .from("challenges")
        .select("*")
        .eq("id", task.challenge_id)
        .single();

      if (challenge) {
        let challengeCompleted = false;
        if (challenge.type === "boss_battle" && challenge.boss_hp) {
          const newHp = Math.max(0, (challenge.boss_current_hp ?? challenge.boss_hp) - 10);
          challengeCompleted = newHp === 0;
          await supabaseAdmin.from("challenges")
            .update({ boss_current_hp: newHp, is_completed: challengeCompleted })
            .eq("id", task.challenge_id);
        } else if (newCount >= challenge.target_count) {
          challengeCompleted = true;
          await supabaseAdmin.from("challenges")
            .update({ is_completed: true })
            .eq("id", task.challenge_id);
        }

        challengeProgress = {
          challengeId: task.challenge_id,
          currentCount: newCount,
          targetCount: challenge.target_count,
          completed: challengeCompleted,
        };
      }
    }

    // 8. Companion creature feeding (every 5 tasks = 1 feeding)
    let creatureUpdate: { stage: string; feedCount: number; evolved: boolean } | undefined;
    const { data: creature } = await supabaseAdmin
      .from("companion_creatures")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (creature) {
      const newFeed = creature.feed_count + 1;
      const stages = ["egg", "baby", "juvenile", "adult"] as const;
      const stageIndex = stages.indexOf(creature.stage as any);
      let newStage = creature.stage;
      let newHatch = creature.hatch_progress;
      let evolved = false;

      if (creature.stage === "egg") {
        // 3 tasks to hatch
        newHatch = Math.min(100, creature.hatch_progress + 34);
        if (newHatch >= 100) {
          newStage = "baby";
          evolved = true;
        }
      } else if (newFeed % 5 === 0 && stageIndex < 3) {
        // Check feeding thresholds: baby→juvenile: 3 feedings (15 tasks), juvenile→adult: 5 feedings (25 tasks)
        const feedingSinceStage = newFeed;
        if (creature.stage === "baby" && feedingSinceStage >= 15) {
          newStage = "juvenile";
          evolved = true;
        } else if (creature.stage === "juvenile" && feedingSinceStage >= 40) {
          newStage = "adult";
          evolved = true;
        }
      }

      await supabaseAdmin.from("companion_creatures")
        .update({ feed_count: newFeed, stage: newStage, hatch_progress: newHatch, updated_at: new Date().toISOString() })
        .eq("id", creature.id);

      creatureUpdate = { stage: newStage, feedCount: newFeed, evolved };
    }

    // 9. Check badge thresholds
    const badgesEarned: { id: string; name: string; description: string; icon: string }[] = [];
    const { data: allBadges } = await supabaseAdmin.from("badges").select("*");
    const { data: earnedBadges } = await supabaseAdmin
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    const earnedIds = new Set((earnedBadges ?? []).map(b => b.badge_id));

    if (allBadges) {
      // Count total completions
      const { count: totalCompletions } = await supabaseAdmin
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("assigned_to_user_id", userId)
        .eq("status", "completed");

      for (const badge of allBadges) {
        if (earnedIds.has(badge.id)) continue;

        let earned = false;
        if (badge.criteria_type === "tasks_completed" && (totalCompletions ?? 0) >= badge.criteria_value) {
          earned = true;
        } else if (badge.criteria_type === "streak_days" && streakCount >= badge.criteria_value) {
          earned = true;
        } else if (badge.criteria_type === "level_reached" && newLevel >= badge.criteria_value) {
          earned = true;
        }

        if (earned) {
          await supabaseAdmin.from("user_badges").insert({
            user_id: userId,
            badge_id: badge.id,
          });
          badgesEarned.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
          });
        }
      }
    }

    // Response per api-contracts.md §2 complete-task
    const response = {
      success: true,
      task,
      gamification: {
        xpAwarded: xp,
        goldAwarded: gold,
        totalXP: newXP,
        currentLevel: newLevel,
        currentLevelXP,
        nextLevelXP,
        leveledUp,
        ...(leveledUp ? { newLevel } : {}),
        streakCount,
        streakStartedToday,
        ...(dropEvent ? { dropEvent } : {}),
        ...(creatureUpdate ? { creatureUpdate } : {}),
        ...(challengeProgress ? { challengeProgress } : {}),
        ...(badgesEarned.length > 0 ? { badgesEarned } : {}),
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: error.message } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
