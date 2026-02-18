import { StripeProvider } from "@stripe/stripe-react-native";

export default function StripeWrapper({ children }: any) {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY_PK!}
    >
      {children}
    </StripeProvider>
  );
}
