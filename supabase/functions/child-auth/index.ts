import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── CREATE child account ──
    if (action === "create") {
      const { familyId, name, username, pin, managedBy } = body;

      if (!familyId || !name || !username || !pin || pin.length !== 4) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing or invalid fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check username uniqueness
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ success: false, error: "Benutzername bereits vergeben" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create auth user with a generated email
      const childEmail = `${username}@familienzentrale.child`;
      const childPassword = crypto.randomUUID(); // random, child uses PIN login

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: childEmail,
        password: childPassword,
        email_confirm: true,
        user_metadata: { name },
      });

      if (authError || !authUser?.user) {
        return new Response(
          JSON.stringify({ success: false, error: authError?.message || "Konto konnte nicht erstellt werden" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const childId = authUser.user.id;

      // Update profile to child role with username and pin
      await supabaseAdmin
        .from("profiles")
        .update({ role: "child", username, pin_hash: pin, name })
        .eq("id", childId);

      // Add to family
      const color = ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)];
      await supabaseAdmin.from("family_members").insert({
        family_id: familyId,
        user_id: childId,
        name,
        role: "child",
        color,
        managed_by_user_id: managedBy,
      });

      // Initialize gamification
      await supabaseAdmin.from("levels").insert({ user_id: childId, current_level: 1, total_xp: 0 });
      await supabaseAdmin.from("streaks").insert({ user_id: childId, current_count: 0, longest_count: 0 });
      await supabaseAdmin.from("child_avatars").insert({ user_id: childId, equipped_items: [] });

      return new Response(
        JSON.stringify({ success: true, childId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── LOGIN (default) ──
    const { username, pin } = body;

    if (!username || !pin) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "MISSING_FIELDS", message: "Username and PIN required" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find user by username with child role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, name, username, pin_hash, role")
      .eq("username", username)
      .eq("role", "child")
      .maybeSingle();

    if (!profile || profileError) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Ungültiger Benutzername oder PIN" } }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify PIN
    if (!profile.pin_hash || profile.pin_hash !== pin) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Ungültiger Benutzername oder PIN" } }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get family info
    const { data: familyMember } = await supabaseAdmin
      .from("family_members")
      .select("family_id")
      .eq("user_id", profile.id)
      .maybeSingle();

    // Generate session via magic link
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    if (authErr || !authData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "AUTH_ERROR", message: "Authentifizierung fehlgeschlagen" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: authData.user.email!,
    });

    if (sessionError) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "SESSION_ERROR", message: "Sitzung konnte nicht erstellt werden" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = sessionData.properties?.hashed_token;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "TOKEN_ERROR", message: "Token-Erstellung fehlgeschlagen" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      type: "magiclink",
      token_hash: token,
    });

    if (verifyError || !verifyData?.session) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "VERIFY_ERROR", message: "Verifizierung fehlgeschlagen" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          access_token: verifyData.session.access_token,
          refresh_token: verifyData.session.refresh_token,
        },
        user: {
          id: profile.id,
          name: profile.name,
          familyId: familyMember?.family_id,
          role: "child",
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: { code: "INTERNAL_ERROR", message: "Interner Fehler" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
