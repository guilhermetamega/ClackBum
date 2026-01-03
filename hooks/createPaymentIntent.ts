import { supabase } from "@/lib/supabaseClient"

type Params = {
  amount: number
  sellerStripeAccountId: string
  photoId: string
  buyerId: string
  sellerId: string
}

export async function createPaymentIntent({
  amount,
  sellerStripeAccountId,
  photoId,
  buyerId,
  sellerId,
}: Params) {
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    throw new Error("Usuário não autenticado")
  }

  const res = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        sellerStripeAccountId,
        photoId,
        buyerId,
        sellerId,
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }

  return res.json()
}
