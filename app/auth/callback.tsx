// app/auth/callback.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (redirectTo) {
          router.replace(redirectTo as any);
        } else {
          router.replace("/");
        }
      } else {
        router.replace("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
