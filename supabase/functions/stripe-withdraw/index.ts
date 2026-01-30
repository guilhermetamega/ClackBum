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
    /* ======================
       AUTH
    ====================== */
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const jwt = authHeader.replace("Bearer ", "");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    /* ======================
       STRIPE
    ====================== */
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    /* ======================
       USER STRIPE ACCOUNT
    ====================== */
    const { data: dbUser } = await supabaseAdmin
      .from("users")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    if (!dbUser?.stripe_account_id) {
      throw new Error("Conta Stripe não encontrada");
    }

    const accountId = dbUser.stripe_account_id;

    /* ======================
       BALANCE
    ====================== */
    const balance = await stripe.balance.retrieve({ stripeAccount: accountId });

    const available =
      balance.available.find((b) => b.currency === "brl")?.amount ?? 0;

    if (available <= 0) {
      throw new Error("Saldo insuficiente para saque");
    }

    /* ======================
       PAYOUT
    ====================== */
    const payout = await stripe.payouts.create(
      {
        amount: available,
        currency: "brl",
        method: "standard",
      },
      {
        stripeAccount: accountId,
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        payoutId: payout.id,
        amount: available / 100,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("🔥 WITHDRAW ERROR:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }
});
