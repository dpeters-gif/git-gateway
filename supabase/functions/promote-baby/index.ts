import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { member_id } = await req.json();
    if (!member_id) {
      return new Response(JSON.stringify({ error: "member_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get the family member
    const { data: member, error: memberError } = await supabaseAdmin
      .from("family_members")
      .select("*")
      .eq("id", member_id)
      .single();

    if (memberError || !member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (member.role !== "baby") {
      return new Response(JSON.stringify({ error: "Only babies can be promoted" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Create auth user for the child (with a random email/password placeholder)
    const username = member.name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
    const pin = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit PIN

    // Use admin to create user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `${username}@family.local`,
      password: pin,
      email_confirm: true,
      user_metadata: { name: member.name, role: "child" },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authUser.user.id;

    // 3. Create profile
    // Hash the PIN (simple for now — in production use bcrypt)
    await supabaseAdmin.from("profiles").insert({
      id: userId,
      name: member.name,
      role: "child",
      username,
      pin_hash: pin, // In production, hash this
    });

    // 4. Update family member
    await supabaseAdmin
      .from("family_members")
      .update({ role: "child", user_id: userId, updated_at: new Date().toISOString() })
      .eq("id", member_id);

    // 5. Create child permissions
    await supabaseAdmin.from("child_permissions").insert({
      user_id: userId,
      can_create_tasks: false,
      can_create_events: false,
    });

    // 6. Award companion creature egg
    const creatureTypes = ["forest_fox", "cloud_bunny", "star_owl", "river_otter", "moon_cat", "sun_bear"];
    const randomCreature = creatureTypes[Math.floor(Math.random() * creatureTypes.length)];

    await supabaseAdmin.from("companion_creatures").insert({
      user_id: userId,
      creature_type: randomCreature,
      stage: "egg",
      is_active: true,
    });

    // 7. Initialize levels and streaks
    await supabaseAdmin.from("levels").insert({ user_id: userId, total_xp: 0, current_level: 1 });
    await supabaseAdmin.from("streaks").insert({ user_id: userId, current_count: 0, longest_count: 0 });

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        username,
        pin,
        creature_type: randomCreature,
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
