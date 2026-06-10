import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ReportSchema = z.object({
  hostProfile: z.object({
    grossRevenue: z.number(),
    properties: z.number(),
    taxTier: z.string(),
  }),
  styleConfig: z.object({
    colorCount: z.number(),
    followedRecommendation: z.boolean(),
    paletteName: z.string(),
    hexMap: z.record(z.string()),
    archetype: z.string(),
  }),
  structuralLayout: z.record(z.string()),
  lead: z.object({
    email: z.string(),
    phone: z.string(),
    structureName: z.string(),
    city: z.string(),
  }),
});

export const sendAdminReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReportSchema.parse(input))
  .handler(async ({ data }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase env vars for admin report");
      return { success: false, error: "Configuration missing" };
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-admin-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Edge function error:", text);
        return { success: false, error: text };
      }

      return { success: true };
    } catch (err) {
      console.error("Failed to send admin report:", err);
      return { success: false, error: String(err) };
    }
  });
