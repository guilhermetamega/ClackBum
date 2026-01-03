import { supabase } from "@/lib/supabaseClient"

export function useStripeConnect() {
  async function createStripeAccount() {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) throw new Error("Not authenticated")

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-connect-account`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      }
    )

    const data = await res.json()

    // salva no user
    await supabase
      .from("users")
      .update({ stripe_account_id: data.accountId })
      .eq("id", session.session.user.id)

    return data.accountId
  }

  return { createStripeAccount }
}
