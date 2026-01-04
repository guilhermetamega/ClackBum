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
       AUTH HEADER
    ====================== */
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const jwt = authHeader.replace("Bearer ", "");

    /* ======================
       SUPABASE CLIENTS
    ====================== */
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    /* ======================
       BODY
    ====================== */
    const { photoId } = await req.json();

    if (!photoId) {
      return new Response(JSON.stringify({ error: "photoId missing" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    /* ======================
       STRIPE
    ====================== */
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    /* ======================
       PHOTO
    ====================== */
    const { data: photo, error: photoError } = await supabaseAdmin
      .from("photos")
      .select("id, title, price, user_id")
      .eq("id", photoId)
      .single();

    if (photoError || !photo) {
      throw new Error("Foto não encontrada");
    }

    /* ======================
       BUYER (CUSTOMER)
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
       CHECKOUT SESSION
    ====================== */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,

      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: photo.title,
            },
            unit_amount: Math.round(photo.price * 100),
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
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("🔥 CHECKOUT ERROR:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
