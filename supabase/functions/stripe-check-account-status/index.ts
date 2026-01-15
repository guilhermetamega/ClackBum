import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // 🔥 PRE-FLIGHT (OBRIGATÓRIO NO WEB)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (error || !user) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { data: dbUser } = await supabase
      .from("users")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    if (!dbUser?.stripe_account_id) {
      return new Response(JSON.stringify({ connected: false }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // 🔥 Stripe é a fonte da verdade
    const account = await stripe.accounts.retrieve(dbUser.stripe_account_id);

    const chargesEnabled = account.charges_enabled ?? false;
    const detailsSubmitted = account.details_submitted ?? false;

    // ✅ SINCRONIZA BANCO
    await supabase
      .from("users")
      .update({
        stripe_charges_enabled: chargesEnabled,
        stripe_details_submitted: detailsSubmitted,
      })
      .eq("id", user.id);

    return new Response(
      JSON.stringify({
        stripe_account_id: account.id,
        charges_enabled: chargesEnabled,
        details_submitted: detailsSubmitted,
        payouts_enabled: account.payouts_enabled,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("🔥 STRIPE CHECK ERROR:", err);

    return new Response(JSON.stringify({ error: "Stripe check error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
