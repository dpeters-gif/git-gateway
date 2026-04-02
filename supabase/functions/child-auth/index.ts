import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const normalizeUsername = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizePin = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

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

    if (action === "create") {
      const familyId = typeof body.familyId === "string" ? body.familyId : "";
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const username = normalizeUsername(body.username);
      const pin = normalizePin(body.pin);
      const managedBy = typeof body.managedBy === "string" ? body.managedBy : null;

      if (!familyId || !name || !username || pin.length !== 4) {
        return json({ success: false, error: "Missing or invalid fields" }, 400);
      }

      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existing) {
        return json({ success: false, error: "Benutzername bereits vergeben" }, 409);
      }

      const childEmail = `${username}@familienzentrale.child`;
      const childPassword = crypto.randomUUID();

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: childEmail,
        password: childPassword,
        email_confirm: true,
        user_metadata: { name },
      });

      if (authError || !authUser?.user) {
        return json(
          { success: false, error: authError?.message || "Konto konnte nicht erstellt werden" },
          500
        );
      }

      const childId = authUser.user.id;

      await supabaseAdmin
        .from("profiles")
        .update({ role: "child", username, pin_hash: pin, name })
        .eq("id", childId);

      const color = ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][
        Math.floor(Math.random() * 5)
      ];

      await supabaseAdmin.from("family_members").insert({
        family_id: familyId,
        user_id: childId,
        name,
        role: "child",
        color,
        managed_by_user_id: managedBy,
      });

      await supabaseAdmin.from("levels").insert({
        user_id: childId,
        current_level: 1,
        total_xp: 0,
      });

      await supabaseAdmin.from("streaks").insert({
        user_id: childId,
        current_count: 0,
        longest_count: 0,
      });

      await supabaseAdmin.from("child_avatars").insert({
        user_id: childId,
        equipped_items: [],
      });

      return json({ success: true, childId, username });
    }

    const username = normalizeUsername(body.username);
    const pin = normalizePin(body.pin);

    if (!username || !pin) {
      return json(
        {
          success: false,
          error: { code: "MISSING_FIELDS", message: "Username and PIN required" },
        },
        400
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, name, username, pin_hash, role")
      .eq("username", username)
      .eq("role", "child")
      .maybeSingle();

    if (!profile || profileError || !profile.pin_hash || profile.pin_hash !== pin) {
      return json(
        {
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Ungültiger Benutzername oder PIN" },
        },
        401
      );
    }

    const { data: familyMember } = await supabaseAdmin
      .from("family_members")
      .select("family_id")
      .eq("user_id", profile.id)
      .maybeSingle();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (authError || !authData?.user?.email) {
      return json(
        {
          success: false,
          error: { code: "AUTH_ERROR", message: "Authentifizierung fehlgeschlagen" },
        },
        500
      );
    }

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: authData.user.email,
    });

    if (sessionError) {
      return json(
        {
          success: false,
          error: { code: "SESSION_ERROR", message: "Sitzung konnte nicht erstellt werden" },
        },
        500
      );
    }

    const token = sessionData.properties?.hashed_token;
    if (!token) {
      return json(
        {
          success: false,
          error: { code: "TOKEN_ERROR", message: "Token-Erstellung fehlgeschlagen" },
        },
        500
      );
    }

    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      type: "magiclink",
      token_hash: token,
    });

    if (verifyError || !verifyData?.session) {
      return json(
        {
          success: false,
          error: { code: "VERIFY_ERROR", message: "Verifizierung fehlgeschlagen" },
        },
        500
      );
    }

    return json({
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
    });
  } catch {
    return json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Interner Fehler" },
      },
      500
    );
  }
});
