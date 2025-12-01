import { useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange(() => {
      router.replace("/");
    });
  }, []);

  return null;
}
