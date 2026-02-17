import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.21.0";
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
      detectSessionInUrl: false,
    },
  },
);
serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err);
    return new Response("Invalid signature", { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata;

    if (!metadata?.photoId || !metadata?.buyerId || !metadata?.sellerId) {
      console.error("❌ Metadata faltando", metadata);
      return new Response("Metadata faltando", { status: 400 });
    }

    await supabase.from("purchases").insert({
      photo_id: metadata.photoId,
      buyer_id: metadata.buyerId,
      seller_id: metadata.sellerId,
      amount: session.amount_total! / 100,
      stripe_payment_intent_id: session.payment_intent,
      status: "approved",
    });
  }

  /* 🔥 NOVO BLOCO PARA MOBILE */
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const metadata = paymentIntent.metadata;

    if (!metadata?.photoId || !metadata?.buyerId || !metadata?.sellerId) {
      console.error("❌ Metadata faltando (mobile)", metadata);
      return new Response("Metadata faltando", { status: 400 });
    }

    await supabase.from("purchases").insert({
      photo_id: metadata.photoId,
      buyer_id: metadata.buyerId,
      seller_id: metadata.sellerId,
      amount: paymentIntent.amount / 100,
      stripe_payment_intent_id: paymentIntent.id,
      status: "approved",
    });
  }

  return new Response("ok", { status: 200 });
});
