// supabase/functions/stripe-connect-webhook/index.ts
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
    },
  }
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
      Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET")!
    );
  } catch (err) {
    console.error("❌ Invalid webhook signature", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    console.log("🔔 Stripe account updated:", {
      id: account.id,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
    });

    // 1️⃣ Atualiza status do seller no banco
    const { data: user, error } = await supabase
      .from("users")
      .update({
        stripe_charges_enabled: account.charges_enabled,
        stripe_details_submitted: account.details_submitted,
      })
      .eq("stripe_account_id", account.id)
      .select("stripe_pix_enabled")
      .single();

    if (error) {
      console.error("❌ Failed to update user:", error);
      return new Response("db error", { status: 500 });
    }

    // 2️⃣ Ativa Pix automaticamente (UMA ÚNICA VEZ)
    if (account.charges_enabled && !user?.stripe_pix_enabled) {
      try {
        await stripe.accounts.update(account.id, {
          settings: {
            payments: {
              payment_method_options: {
                pix: { enabled: true },
              },
            },
          },
        });

        await supabase
          .from("users")
          .update({ stripe_pix_enabled: true })
          .eq("stripe_account_id", account.id);

        console.log("✅ Pix ativado com sucesso para:", account.id);
      } catch (err) {
        console.error("❌ Erro ao ativar Pix:", err);
      }
    }
  }

  return new Response("ok", { status: 200 });
});
