import { serve } from "https://deno.land/std/http/server.ts"
import Stripe from "npm:stripe@14.21.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
})

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { stripeAccountId } = await req.json()

    if (!stripeAccountId) {
      return new Response("Missing stripeAccountId", { status: 400 })
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${Deno.env.get("APP_URL")}/stripe/refresh`,
      return_url: `${Deno.env.get("APP_URL")}/stripe/return`,
      type: "account_onboarding",
    })

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error(err)
    return new Response("Stripe onboarding error", { status: 500 })
  }
})
