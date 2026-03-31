import { supabase } from "@/lib/supabaseClient";
import { Linking, Platform } from "react-native";

export async function openExternalUrl(url: string) {
  if (!url) {
    throw new Error("URL inválida.");
  }

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    throw new Error("Não foi possível abrir a URL no navegador.");
  }

  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error("Não foi possível abrir o navegador.");
  }

  await Linking.openURL(url);
}

export async function deleteMyAccount() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("Sessão inválida.");
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("EXPO_PUBLIC_SUPABASE_URL não configurada.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  let payload: { error?: string } | null = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Não foi possível excluir a conta.");
  }

  await supabase.auth.signOut();
}
