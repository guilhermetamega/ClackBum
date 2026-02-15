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

    // 🔐 Cliente ADMIN (ignora RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ✅ Validar usuário corretamente com token
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { photoId } = await req.json();

    if (!photoId) {
      return new Response("Photo ID required", { status: 400 });
    }

    // 🔎 Buscar foto (ignora RLS)
    const { data: photo, error: photoError } = await supabaseAdmin
      .from("photos")
      .select("id, price, user_id, status")
      .eq("id", photoId)
      .single();

    if (photoError || !photo || photo.status !== "approved") {
      return new Response("Photo not available", { status: 404 });
    }

    if (!photo.price) {
      return new Response("Invalid photo price", { status: 400 });
    }

    const numericPrice = Number(photo.price);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return new Response("Invalid price value", { status: 400 });
    }

    // ⚠️ AJUSTE AQUI SE SEU BANCO JÁ SALVA EM CENTAVOS
    const amount = Math.round(numericPrice * 100);

    if (!amount || amount <= 0) {
      return new Response("Invalid amount", { status: 400 });
    }

    console.log("Amount final:", amount);

    // 🔎 Buscar seller Stripe account
    const { data: seller, error: sellerError } = await supabaseAdmin
      .from("users") // confirme se é 'users' mesmo
      .select("stripe_account_id")
      .eq("id", photo.user_id)
      .single();

    if (sellerError || !seller || !seller.stripe_account_id) {
      return new Response("Seller Stripe account not found", {
        status: 400,
      });
    }

    const platformFee = Math.floor(amount * 0.15);

    // 👤 Criar Customer
    const customer = await stripe.customers.create({
      metadata: {
        supabaseUserId: user.id,
      },
    });

    // 🔐 Criar Ephemeral Key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" },
    );

    // 💳 Criar PaymentIntent (Stripe Connect)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      customer: customer.id,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: seller.stripe_account_id,
      },
      metadata: {
        photoId: photo.id,
        buyerId: user.id,
        sellerId: photo.user_id,
      },
    });

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    console.error("Stripe error FULL:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
