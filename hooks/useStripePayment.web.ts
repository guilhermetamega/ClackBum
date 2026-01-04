import { supabase } from "@/lib/supabaseClient";

export function useStripePayment() {
  async function pay(photoId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoId }),
      }
    );

    const { url } = await res.json();

    if (!url) throw new Error("Checkout não criado");

    window.location.href = url;
  }

  return { pay };
}
