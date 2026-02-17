import { supabase } from "@/lib/supabaseClient";
import { useStripe } from "@stripe/stripe-react-native";
import { Platform } from "react-native";

export function useStripePayment() {
  const stripe = useStripe();

  const supported = Platform.OS === "android" || Platform.OS === "ios";

  async function pay(photoId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Usuário não autenticado");
    }

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoId }),
      },
    );

    // 🔥 TRATAMENTO CORRETO DE ERRO DO BACKEND
    if (!res.ok) {
      const errorText = await res.text();
      console.log("❌ Erro retornado pela Edge Function:", errorText);
      throw new Error("Erro ao criar PaymentIntent");
    }

    // 🔥 AGORA SIM FAZ O PARSE SEGURO
    const data = await res.json();
    console.log("🟢 Resposta Edge Function:", data);

    const { paymentIntent, ephemeralKey, customer } = data;

    const { error: initError } = await stripe.initPaymentSheet({
      merchantDisplayName: "Clackbum",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
    });

    if (initError) {
      console.log("❌ Erro initPaymentSheet:", initError);
      throw initError;
    }

    const { error: presentError } = await stripe.presentPaymentSheet();

    if (presentError) {
      // 👇 Se o usuário apenas cancelou
      if (presentError.code === "Canceled") {
        console.log("🟡 Pagamento cancelado pelo usuário");
        return { canceled: true };
      }

      console.log("❌ Erro real presentPaymentSheet:", presentError);
      throw presentError;
    }

    return { success: true };
  }

  return {
    pay,
    supported,
  };
}
