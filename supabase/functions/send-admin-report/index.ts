import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "bellaviasimone22@gmail.com";

function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(data: Record<string, unknown>): string {
  const hostProfile = (data.hostProfile as Record<string, unknown>) ?? {};
  const styleConfig = (data.styleConfig as Record<string, unknown>) ?? {};
  const structuralLayout = (data.structuralLayout as Record<string, unknown>) ?? {};
  const lead = (data.lead as Record<string, unknown>) ?? {};
  const screenshot = typeof data.previewScreenshot === "string" ? data.previewScreenshot : "";
  const hexMap = (styleConfig.hexMap as Record<string, string>) ?? {};

  const section = (title: string, rows: [string, unknown][]) => `
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;">
      <tr><td style="background:#0F172A;color:#fff;padding:8px 12px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;border-radius:6px 6px 0 0;">${escapeHtml(title)}</td></tr>
      ${rows
        .map(
          ([k, v]) => `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;">
              <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.08em;">${escapeHtml(k)}</div>
              <div style="font-size:14px;color:#0F172A;margin-top:2px;">${escapeHtml(v)}</div>
            </td></tr>`,
        )
        .join("")}
    </table>`;

  const hexBlock = Object.entries(hexMap)
    .map(
      ([k, v]) =>
        `<span style="display:inline-block;margin:3px 6px 3px 0;font-size:12px;color:#0F172A;"><span style="display:inline-block;vertical-align:middle;width:14px;height:14px;border-radius:3px;border:1px solid #CBD5E1;background:${escapeHtml(v)};margin-right:6px;"></span>${escapeHtml(k)}: ${escapeHtml(v)}</span>`,
    )
    .join(" ");

  return `<!doctype html><html><body style="margin:0;padding:0;background:#F1F5F9;">
    <div style="max-width:640px;margin:0 auto;padding:28px 22px;background:#FFFFFF;font-family:Arial,Helvetica,sans-serif;color:#0F172A;">
      <h1 style="font-size:22px;margin:0 0 4px 0;">Nuovo Lead HostFreedom</h1>
      <div style="font-size:12px;color:#64748B;margin-bottom:22px;">
        ${escapeHtml(lead.structureName ?? "Struttura")} — ${escapeHtml(lead.city ?? "N/A")}
      </div>

      ${section("Contatti Lead", [
        ["Email", lead.email],
        ["Telefono", lead.phone],
        ["Nome struttura", lead.structureName],
        ["Città", lead.city],
      ])}

      ${section("Profilo Host", [
        ["Fatturato lordo annuo", `€${Number(hostProfile.grossRevenue ?? 0).toLocaleString("it-IT")}`],
        ["Strutture gestite", hostProfile.properties],
        ["Regime fiscale", hostProfile.taxTier],
      ])}

      ${section("Preferenze Estetiche", [
        ["Numero colori", styleConfig.colorCount],
        ["Palette", `${styleConfig.paletteName} (${styleConfig.paletteId ?? "-"})`],
        ["Ha seguito consiglio", styleConfig.followedRecommendation ? "Sì" : "No"],
        ["Archetipo", `${styleConfig.archetypeName ?? styleConfig.archetype} (${styleConfig.archetype})`],
        ["Layout", `${styleConfig.layoutName ?? styleConfig.layoutId ?? "-"} (${styleConfig.layoutId ?? "-"})`],
        ["Device anteprima", styleConfig.previewDevice],
      ])}

      <div style="margin:0 0 18px 0;font-size:13px;">
        <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Mappa colori</div>
        ${hexBlock}
      </div>

      ${section("Struttura Layout", Object.entries(structuralLayout))}

      ${
        screenshot
          ? `<div style="margin:18px 0;">
              <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Screenshot anteprima</div>
              <img src="${screenshot}" alt="Anteprima" style="max-width:100%;border:1px solid #E2E8F0;border-radius:8px;" />
            </div>`
          : ""
      }

      <div style="margin-top:24px;padding-top:14px;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8;">
        Inviato automaticamente dal Configurator HostFreedom
      </div>
    </div>
  </body></html>`;
}

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
    const { lead } = data;
    const subject = `HostFreedom · Nuovo Lead da ${lead?.structureName || "Struttura"} — ${lead?.city || "N/A"}`;
    const html = buildHtml(data);

    // Send via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromAddress = Deno.env.get("RESEND_FROM") || "HostFreedom <onboarding@resend.dev>";

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [ADMIN_EMAIL],
        reply_to: lead?.email || undefined,
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Failed to send email", details: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: log to admin_reports if table exists
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && serviceKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/admin_reports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            admin_email: ADMIN_EMAIL,
            lead_email: lead?.email,
            lead_phone: lead?.phone,
            structure_name: lead?.structureName,
            city: lead?.city,
            payload: data,
            subject,
          }),
        });
      } catch (e) {
        console.warn("admin_reports insert skipped:", e);
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
