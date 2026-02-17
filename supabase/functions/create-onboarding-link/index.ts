import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // 🔐 Cliente admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 🔎 Validar usuário
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 🔎 Buscar stripe_account_id do banco
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from("users")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    if (dbError || !dbUser?.stripe_account_id) {
      return new Response("Stripe account not found", { status: 400 });
    }

    const stripeAccountId = dbUser.stripe_account_id;

    // 🔥 Deep link mobile
    const mobileReturnUrl = "clackbum://stripe-return";

    // 🌐 Web return
    const webReturnUrl = `${Deno.env.get("WEB_URL")}/stripe-return`;

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: mobileReturnUrl,
      return_url: mobileReturnUrl,
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe onboarding error:", err);
    return new Response("Stripe onboarding error", { status: 500 });
  }
});
