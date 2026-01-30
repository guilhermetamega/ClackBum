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
        global: {
          headers: { Authorization: `Bearer ${jwt}` },
        },
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
       BODY
    ====================== */
    const { photoId } = await req.json();
    if (!photoId) {
      throw new Error("photoId missing");
    }

    /* ======================
       STRIPE
    ====================== */
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    /* ======================
       PHOTO + SELLER
    ====================== */
    const { data: photo } = await supabaseAdmin
      .from("photos")
      .select("id, title, price, user_id")
      .eq("id", photoId)
      .single();

    if (!photo) {
      throw new Error("Foto não encontrada");
    }

    // Não pode comprar própria foto
    if (photo.user_id === user.id) {
      throw new Error("Você não pode comprar sua própria foto");
    }

    const { data: seller } = await supabaseAdmin
      .from("users")
      .select("stripe_account_id, stripe_charges_enabled")
      .eq("id", photo.user_id)
      .single();

    if (!seller?.stripe_account_id || !seller.stripe_charges_enabled) {
      throw new Error("Fotógrafo não habilitado para recebimentos");
    }

    /* ======================
       BUYER CUSTOMER
    ====================== */
    const { data: buyer } = await supabaseAdmin
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    let customerId = buyer?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: buyer?.email ?? user.email ?? undefined,
        metadata: { userId: user.id },
      });

      customerId = customer.id;

      await supabaseAdmin
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    /* ======================
       SPLIT CALCULATION
    ====================== */
    const amount = Math.round(photo.price * 100);
    const platformFee = Math.round(amount * 0.15); // 15%

    /* ======================
       CHECKOUT
    ====================== */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,

      payment_intent_data: {
        application_fee_amount: platformFee,

        transfer_data: {
          destination: seller.stripe_account_id,
        },

        on_behalf_of: seller.stripe_account_id,
      },

      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { name: photo.title },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      metadata: {
        photoId: photo.id,
        buyerId: user.id,
        sellerId: photo.user_id,
      },

      success_url: `${Deno.env.get("APP_URL")}/?payment=success`,
      cancel_url: `${Deno.env.get("APP_URL")}/?payment=cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("🔥 CHECKOUT ERROR:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
