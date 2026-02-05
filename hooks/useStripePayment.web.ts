import { supabase } from "@/lib/supabaseClient";

export function useStripePayment() {
  async function pay(photoId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error("SUPABASE URL não configurada");
    }

    const res = await fetch(
      `${supabaseUrl}/functions/v1/create-checkout-session`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoId }),
      },
    );

    const data = await res.json();
    console.log("🧾 Checkout response:", data);

    if (!res.ok || !data?.url) {
      throw new Error(data?.error || "Checkout não criado");
    }

    // 🔥 redirect mais confiável
    window.open(data.url, "_self");
  }

  return {
    pay,
    supported: true,
  };
}
