import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { familyId } = await req.json();
    if (!familyId) {
      return new Response(JSON.stringify({ error: "familyId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get task history for this family (anonymized - titles and dates only)
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, due_date, completed_at, xp_value, status")
      .eq("family_id", familyId)
      .order("completed_at", { ascending: false })
      .limit(100);

    const completedTasks = (tasks ?? []).filter(t => t.status === "completed");
    const hasEnoughHistory = completedTasks.length >= 5;

    if (!hasEnoughHistory) {
      // Return generic suggestions
      return new Response(JSON.stringify({
        suggestions: [
          { title: "Zimmer aufräumen", reason: "Beliebte Aufgabe", xp: 10 },
          { title: "Müll rausbringen", reason: "Beliebte Aufgabe", xp: 5 },
          { title: "Tisch abräumen", reason: "Beliebte Aufgabe", xp: 5 },
        ],
        source: "generic",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build anonymized context for AI
    const taskSummary = completedTasks.slice(0, 50).map(t => ({
      title: t.title,
      lastCompleted: t.completed_at?.split("T")[0],
      xp: t.xp_value,
    }));

    // Calculate time gaps
    const titleCounts: Record<string, { count: number; lastDate: string }> = {};
    for (const t of completedTasks) {
      if (!titleCounts[t.title]) {
        titleCounts[t.title] = { count: 0, lastDate: t.completed_at ?? "" };
      }
      titleCounts[t.title].count++;
      if ((t.completed_at ?? "") > titleCounts[t.title].lastDate) {
        titleCounts[t.title].lastDate = t.completed_at ?? "";
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const month = new Date().getMonth();
    const seasonDE = month >= 2 && month <= 4 ? "Frühling" : month >= 5 && month <= 7 ? "Sommer" : month >= 8 && month <= 10 ? "Herbst" : "Winter";

    const prompt = `Du bist ein Familienaufgaben-Assistent. Analysiere diese Aufgabenhistorie und schlage 3 relevante neue Aufgaben vor.

Aufgabenhistorie (letzte 50):
${JSON.stringify(taskSummary, null, 2)}

Aufgaben-Häufigkeit und letzte Erledigung:
${Object.entries(titleCounts).map(([title, d]) => `- "${title}": ${d.count}x, zuletzt ${d.lastDate}`).join("\n")}

Heutiges Datum: ${today}
Jahreszeit: ${seasonDE}

Antworte NUR als JSON-Array mit exakt 3 Objekten:
[
  {"title": "Aufgabenname", "reason": "Kurzer Grund (zeitlicher Abstand, saisonal, Muster)", "xp": 10}
]

Regeln:
- Vorschläge auf Deutsch
- Nur Haushaltsaufgaben
- Berücksichtige zeitliche Abstände
- Berücksichtige die Jahreszeit
- XP-Wert orientiert an ähnlichen historischen Aufgaben`;

    // Call Lovable AI
    const aiResponse = await fetch("https://lovable.dev/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content ?? "[]";

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Validate structure
    const validSuggestions = suggestions
      .filter((s: any) => s.title && typeof s.title === "string")
      .slice(0, 3)
      .map((s: any) => ({
        title: s.title,
        reason: s.reason ?? "",
        xp: Number(s.xp) || 10,
      }));

    return new Response(JSON.stringify({
      suggestions: validSuggestions,
      source: "ai",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
