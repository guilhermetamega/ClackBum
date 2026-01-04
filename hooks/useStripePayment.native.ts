import { supabase } from "@/lib/supabaseClient";
import { useStripe } from "@stripe/stripe-react-native";

export function useStripePayment() {
  const stripe = useStripe();

  async function pay(photoId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoId }),
      }
    );

    const { paymentIntent, ephemeralKey, customer } = await res.json();

    const { error: initError } = await stripe.initPaymentSheet({
      merchantDisplayName: "Clackbum",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
    });

    if (initError) throw initError;

    const { error: presentError } = await stripe.presentPaymentSheet();
    if (presentError) throw presentError;
  }

  return { pay };
}
