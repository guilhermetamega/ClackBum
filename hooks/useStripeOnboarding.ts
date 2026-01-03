import { supabase } from "@/lib/supabaseClient"
import * as Linking from "expo-linking"

export function useStripeOnboarding() {
  async function startOnboarding(stripeAccountId: string) {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) throw new Error("Not authenticated")

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-onboarding-link`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stripeAccountId }),
      }
    )

    const data = await res.json()

    if (!data.url) throw new Error("Onboarding failed")

    await Linking.openURL(data.url)
  }

  return { startOnboarding }
}
