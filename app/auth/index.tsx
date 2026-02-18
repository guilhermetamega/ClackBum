import { useApp } from "@/components/appContext";
import { makeRedirectUri } from "expo-auth-session";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { platform } = useApp();
  const router = useRouter();

  // 🔥 Listener de auth state - funciona em WEB e MOBILE
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth event:", event);

        if (event === "SIGNED_IN" && session) {
          console.log("✅ Login realizado:", session.user.email);
          // Redireciona para tela principal
          router.replace("/(tabs)"); // ou a rota que você quiser
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 🔥 Captura deep link no mobile após OAuth
  useEffect(() => {
    if (platform === "mobile") {
      const handleDeepLink = async (event: { url: string }) => {
        console.log("🔗 Deep link recebido:", event.url);

        // Extrai tokens da URL (pode estar em hash ou query params)
        const url = new URL(event.url);
        const access_token =
          url.hash.match(/access_token=([^&]*)/)?.[1] ||
          url.searchParams.get("access_token");
        const refresh_token =
          url.hash.match(/refresh_token=([^&]*)/)?.[1] ||
          url.searchParams.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error("❌ Erro ao setar sessão:", error);
          }
        }
      };

      const subscription = Linking.addEventListener("url", handleDeepLink);

      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
      });

      return () => {
        subscription.remove();
      };
    }
  }, [platform]);

  const signInWithGoogle = async () => {
    const redirectTo =
      platform === "web" ? "https://clack-bum.vercel.app" : makeRedirectUri();

    console.log("🔗 Redirect URL:", redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: platform !== "web",
      },
    });

    if (error) {
      console.error("❌ Erro no login Google:", error.message);
      return;
    }

    if (!data?.url) {
      console.log("⚠️ Nenhuma URL retornada");
      return;
    }

    console.log("🌐 Abrindo URL OAuth:", data.url);

    if (platform === "web") {
      window.location.href = data.url;
    } else {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      console.log("🔄 Resultado WebBrowser:", result);
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
