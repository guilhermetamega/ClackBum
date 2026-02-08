import { useApp } from "@/components/appContext";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { platform } = useApp(); // 🔥 vem do boot do app

  const signInWithGoogle = async () => {
    // ✅ redirect único, controlado
    const redirectTo = makeRedirectUri({
      scheme: "clackbum",
      path: "auth/callback",
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true, // 🔥 evita conflitos web/mobile
      },
    });

    if (error) {
      console.error("❌ Erro no login Google:", error.message);
      return;
    }

    if (!data?.url) return;

    // ✅ decisão centralizada
    if (platform === "web") {
      window.location.href = data.url;
    } else {
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ClackBum</Text>
      <Text style={styles.subtitle}>
        Entre para vender e comprar fotos da sua quebrada
      </Text>

      <TouchableOpacity style={styles.button} onPress={signInWithGoogle}>
        <Text style={styles.buttonText}>Entrar com Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
});
