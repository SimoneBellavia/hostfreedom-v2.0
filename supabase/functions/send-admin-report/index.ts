import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "bellaviasimone22@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const data = await req.json();

    const { hostProfile, styleConfig, structuralLayout, lead } = data;

    const subject = encodeURIComponent(
      `HostFreedom · Nuova Configurazione da ${lead.structureName || "Struttura"} — ${lead.city || "N/A"}`
    );

    const bodyLines = [
      `=== PROFILO HOST ===`,
      `Fatturato Lordo Annuo: €${hostProfile.grossRevenue?.toLocaleString("it-IT") ?? "N/A"}`,
      `Strutture gestite: ${hostProfile.properties ?? "N/A"}`,
      `Regime fiscale: ${hostProfile.taxTier ?? "N/A"}`,
      ``,
      `=== CONFIGURAZIONE STILE ===`,
      `Numero colori: ${styleConfig.colorCount ?? "N/A"}`,
      `Palette scelta: ${styleConfig.paletteName ?? "N/A"}`,
      `Ha seguito consiglio: ${styleConfig.followedRecommendation ? "Sì" : "No"}`,
      `Archetipo: ${styleConfig.archetype ?? "N/A"}`,
      `Mappa colori: ${JSON.stringify(styleConfig.hexMap ?? {})}`,
      ``,
      `=== STRUTTURA LAYOUT ===`,
      `${Object.entries(structuralLayout ?? {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}`,
      ``,
      `=== CONTATTI LEAD ===`,
      `Email: ${lead.email ?? "N/A"}`,
      `Telefono: ${lead.phone ?? "N/A"}`,
      `Nome struttura: ${lead.structureName ?? "N/A"}`,
      `Città: ${lead.city ?? "N/A"}`,
      ``,
      `---`,
      `Inviato automaticamente dal Configurator HostFreedom`,
    ];

    const bodyText = bodyLines.join("\n");

    // We log the report and store it — in production this would use an email
    // delivery service (Resend, SendGrid, etc.). For now we persist via the
    // Supabase database so the admin can query reports at any time.
    console.log(`ADMIN REPORT for ${ADMIN_EMAIL}:\n${bodyText}`);

    // Insert the report into a dedicated table for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceKey) {
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/admin_reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          admin_email: ADMIN_EMAIL,
          lead_email: lead.email,
          lead_phone: lead.phone,
          structure_name: lead.structureName,
          city: lead.city,
          payload: data,
          subject: decodeURIComponent(subject),
        }),
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        console.error("Failed to insert admin_reports row:", errText);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error processing admin report:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
