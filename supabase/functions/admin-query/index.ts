import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabaseAdmin.auth.getUser(token);
    if (claimsErr || !claims?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminEmails = (Deno.env.get("ADMIN_EMAILS") ?? "").split(",").map((e) => e.trim().toLowerCase());
    if (!adminEmails.includes(claims.user.email.toLowerCase())) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, table, select, filters, updates, id, rpcName, rpcArgs, rawSql } = body;

    // Action: query (select)
    if (action === "query") {
      let q = supabaseAdmin.from(table).select(select || "*");
      if (filters) {
        for (const f of filters) {
          if (f.op === "eq") q = q.eq(f.column, f.value);
          else if (f.op === "gte") q = q.gte(f.column, f.value);
          else if (f.op === "lte") q = q.lte(f.column, f.value);
          else if (f.op === "ilike") q = q.ilike(f.column, f.value);
          else if (f.op === "in") q = q.in(f.column, f.value);
        }
      }
      if (body.order) q = q.order(body.order.column, { ascending: body.order.ascending ?? true });
      if (body.limit) q = q.limit(body.limit);
      const { data, error, count } = await q;
      if (error) throw error;
      return new Response(JSON.stringify({ data, count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: update
    if (action === "update") {
      const { data, error } = await supabaseAdmin.from(table).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: delete
    if (action === "delete") {
      const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: insert
    if (action === "insert") {
      const { data, error } = await supabaseAdmin.from(table).insert(body.record).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: rpc (call database function)
    if (action === "rpc") {
      const { data, error } = await supabaseAdmin.rpc(rpcName, rpcArgs || {});
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: stats (dashboard aggregates)
    if (action === "stats") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monday = new Date(today);
      monday.setDate(monday.getDate() - monday.getDay() + 1);

      const [families, adults, children, babies, subs, tasksToday, tasksWeek, totalXP, signups] = await Promise.all([
        supabaseAdmin.from("families").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "adult"),
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "child"),
        supabaseAdmin.from("family_members").select("id", { count: "exact", head: true }).eq("role", "baby"),
        supabaseAdmin.from("subscriptions").select("tier").eq("status", "active"),
        supabaseAdmin.from("tasks").select("id", { count: "exact", head: true }).eq("status", "completed").gte("completed_at", today.toISOString()),
        supabaseAdmin.from("tasks").select("id", { count: "exact", head: true }).eq("status", "completed").gte("completed_at", monday.toISOString()),
        supabaseAdmin.from("points_ledger").select("xp_awarded"),
        supabaseAdmin.from("profiles").select("id, created_at").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
      ]);

      const tierCounts: Record<string, number> = {};
      for (const s of subs.data || []) {
        tierCounts[s.tier] = (tierCounts[s.tier] || 0) + 1;
      }

      const totalXPSum = (totalXP.data || []).reduce((sum: number, r: any) => sum + (r.xp_awarded || 0), 0);

      return new Response(JSON.stringify({
        totalFamilies: families.count || 0,
        totalAdults: adults.count || 0,
        totalChildren: children.count || 0,
        totalBabies: babies.count || 0,
        tierCounts,
        tasksCompletedToday: tasksToday.count || 0,
        tasksCompletedWeek: tasksWeek.count || 0,
        totalXP: totalXPSum,
        recentSignups: signups.data?.length || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: auth-users (list auth users)
    if (action === "auth-users") {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;
      const emailMap: Record<string, string> = {};
      for (const u of data.users) {
        if (u.email) emailMap[u.id] = u.email;
      }
      return new Response(JSON.stringify({ emailMap }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
