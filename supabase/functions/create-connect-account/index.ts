// supabase/functions/create-connect-account/index.ts
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
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

serve(async (req) => {
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

    // 🔐 Usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    // 🔍 Busca usuário no banco
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    if (dbError) throw dbError;

    let stripeAccountId = dbUser?.stripe_account_id;

    // 🧾 Cria conta Stripe apenas se NÃO existir
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email ?? undefined,
        country: "BR",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: user.id,
        },
      });

      stripeAccountId = account.id;

      await supabase
        .from("users")
        .update({
          stripe_account_id: stripeAccountId,
          stripe_charges_enabled: false,
          stripe_details_submitted: false,
        })
        .eq("id", user.id);
    }

    // 🔗 Link de onboarding (continua de onde parou)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${Deno.env.get("APP_URL")}/settings`,
      return_url: `${Deno.env.get("APP_URL")}/settings`,
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("🔥 CREATE CONNECT ERROR:", err);
    return new Response(JSON.stringify({ error: "Stripe Connect error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
