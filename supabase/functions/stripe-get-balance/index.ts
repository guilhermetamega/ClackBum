import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(jwt);

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("stripe_account_id, stripe_charges_enabled")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_account_id || !profile.stripe_charges_enabled) {
      return new Response(
        JSON.stringify({
          available: 0,
          pending: 0,
        }),
        { headers: corsHeaders }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const balance = await stripe.balance.retrieve({
      stripeAccount: profile.stripe_account_id,
    });

    const available =
      balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;

    const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100;

    return new Response(
      JSON.stringify({
        available,
        pending,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("🔥 BALANCE ERROR:", err);

    return new Response(JSON.stringify({ error: "Erro ao buscar saldo" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
