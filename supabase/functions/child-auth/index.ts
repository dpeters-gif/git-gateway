import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { username, pin } = await req.json();

    if (!username || !pin) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "MISSING_FIELDS", message: "Username and PIN required" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    // Verify PIN (simple comparison for now — in production use bcrypt)
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

    // Generate a session for the child user using admin API
    // We sign in on behalf of the child using their auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: { code: "AUTH_ERROR", message: "Authentifizierung fehlgeschlagen" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a magic link token to create a session
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

    // Verify the OTP to get a session
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
