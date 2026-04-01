import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, amount, itemType, itemId } = await req.json();

    if (!userId || !amount || !itemType) {
      return new Response(JSON.stringify({ error: { code: "INVALID_INPUT", message: "userId, amount, and itemType required" } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Calculate gold balance
    const { data: balance } = await supabaseAdmin.rpc("get_gold_balance", { p_user_id: userId });
    const currentBalance = balance ?? 0;

    if (currentBalance < amount) {
      return new Response(JSON.stringify({ error: { code: "INSUFFICIENT_GOLD", message: `Not enough gold. Have ${currentBalance}, need ${amount}.` } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Record gold transaction
    await supabaseAdmin.from("gold_transactions").insert({
      user_id: userId,
      amount,
      item_type: itemType,
      item_id: itemId ?? null,
    });

    // 3. Award item based on type
    let itemName = itemType;

    if (itemType === "streak_freeze") {
      await supabaseAdmin.from("streak_freezes").insert({ user_id: userId });
      itemName = "Streak Freeze";
    } else if (itemType === "avatar_item" && itemId) {
      // Add to child's equipped items
      const { data: avatar } = await supabaseAdmin
        .from("child_avatars")
        .select("equipped_items")
        .eq("user_id", userId)
        .maybeSingle();

      if (avatar) {
        const items = [...(avatar.equipped_items || []), itemId];
        await supabaseAdmin.from("child_avatars")
          .update({ equipped_items: items })
          .eq("user_id", userId);
      } else {
        await supabaseAdmin.from("child_avatars").insert({
          user_id: userId,
          equipped_items: [itemId],
        });
      }

      const { data: item } = await supabaseAdmin
        .from("avatar_items")
        .select("name")
        .eq("id", itemId)
        .single();
      itemName = item?.name ?? "Avatar Item";
    }

    const newBalance = currentBalance - amount;

    return new Response(JSON.stringify({
      success: true,
      newBalance,
      item: { type: itemType, id: itemId, name: itemName },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: error.message } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
