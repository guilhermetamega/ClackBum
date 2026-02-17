import { useApp } from "@/components/appContext";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabaseClient";

type StripeStatus = {
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_details_submitted: boolean;
};

const FUNCTIONS_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;

export default function Settings() {
  const router = useRouter();
  const { platform } = useApp(); // 🔥 definido no boot do app

  const [loading, setLoading] = useState(true);
  const [stripe, setStripe] = useState<StripeStatus | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    syncStripeStatus();
  }, []);

  async function syncStripeStatus() {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) console.error("❌ Session error:", sessionError);

    if (!session) {
      setLoading(false);
      return;
    }

    // 🔥 Edge Function: garante sync com Stripe
    await fetch(`${FUNCTIONS_URL}/stripe-check-account-status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }).catch(() => {});

    // 🔁 Estado real vem do banco
    const { data, error } = await supabase
      .from("users")
      .select(
        "stripe_account_id, stripe_charges_enabled, stripe_details_submitted",
      )
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("❌ DB error:", error);
    }

    if (data) setStripe(data);

    setLoading(false);
  }

  async function handleStripeConnect() {
    try {
      setProcessing(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert("Erro", "Usuário não autenticado");
        return;
      }

      const res = await fetch(`${FUNCTIONS_URL}/create-connect-account`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error("Erro ao iniciar Stripe Connect");
      }

      // ✅ decisão limpa, sem Platform.OS
      if (platform === "web") {
        window.location.href = data.url;
      } else {
        await WebBrowser.openAuthSessionAsync(data.url, "clackbum://");
      }
    } catch (err) {
      console.error("🔥 Stripe connect error:", err);
      Alert.alert("Erro", "Falha ao conectar com o Stripe");
    } finally {
      setProcessing(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recebimentos</Text>

        {!stripe?.stripe_account_id && (
          <>
            <Text style={styles.text}>
              Ative os recebimentos para vender suas fotos.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStripeConnect}
              disabled={processing}
            >
              <Text style={styles.primaryText}>
                {processing ? "Abrindo Stripe..." : "Ativar recebimentos"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {stripe?.stripe_account_id && !stripe.stripe_details_submitted && (
          <>
            <Text style={styles.warning}>⚠️ Cadastro incompleto no Stripe</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStripeConnect}
            >
              <Text style={styles.primaryText}>Continuar verificação</Text>
            </TouchableOpacity>
          </>
        )}

        {stripe?.stripe_charges_enabled && (
          <Text style={styles.success}>✅ Recebimentos ativos</Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Desconectar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
  },
  cardTitle: {
    color: "#FFA500",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },
  text: {
    color: "#ccc",
    marginBottom: 14,
  },
  warning: {
    color: "#f1c40f",
    fontWeight: "700",
    marginBottom: 12,
  },
  success: {
    color: "#2ecc71",
    fontWeight: "800",
  },
  primaryButton: {
    backgroundColor: "#FFA500",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#000",
    fontWeight: "900",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    padding: 14,
    borderRadius: 12,
    marginTop: "auto",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "900",
    textAlign: "center",
  },
});
