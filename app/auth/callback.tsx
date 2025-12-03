import { useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/"); // usuário logado → vai para Home
      } else {
        router.replace("/auth"); // usuário não logado → volta para Auth
      }
    });

    return () => {
      subscription.unsubscribe(); // evita memory leak ⚠️
    };
  }, []);

  return null;
}
